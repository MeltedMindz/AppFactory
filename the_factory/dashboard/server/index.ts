#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { spawn, ChildProcess } from 'node:child_process';
import { readFile, writeFile, mkdir, access, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import * as QRCode from 'qrcode';

interface BuildEntry {
  buildId: string;
  name: string;
  slug: string;
  buildPath: string;
  status: string;
  origin: {
    mode: 'pipeline' | 'dream';
    runId: string | null;
    ideaSlug: string | null;
    dreamPromptHash: string | null;
  };
}

interface BuildsIndex {
  builds: BuildEntry[];
}

interface PreviewSession {
  sessionId: string;
  buildId: string;
  buildPath: string;
  startedAt: string;
  port: number;
  expoUrl: string | null;
  platformHints: {
    iosReady: boolean;
    androidReady: boolean;
  };
  fixupsApplied: string[];
  processes: ChildProcess[];
  iosLaunched?: boolean;
  metroReady?: boolean;
}

interface PreviewLog {
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  source: 'system' | 'npm' | 'expo';
}

class PreviewBackend {
  private app: express.Application;
  private currentSession: PreviewSession | null = null;
  private logs: PreviewLog[] = [];
  private maxLogs = 1000;
  private repoRoot: string;
  private previewDir: string;
  private logCallbacks: Set<(log: PreviewLog) => void> = new Set();

  constructor() {
    this.app = express();
    
    // Get repo root (dashboard parent directory)
    this.repoRoot = resolve(process.cwd(), '..');
    this.previewDir = join(process.cwd(), '.preview');
    
    this.setupMiddleware();
    this.setupRoutes();
    this.ensurePreviewDir();
  }

  private async ensurePreviewDir() {
    try {
      await mkdir(this.previewDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create preview directory:', error);
    }
  }

  private setupMiddleware() {
    // Security: Only allow localhost
    this.app.use((req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
      
      if (clientIP && !allowedIPs.includes(clientIP.replace(/^::ffff:/, ''))) {
        res.status(403).json({ error: 'Forbidden: Local access only' });
        return;
      }
      
      next();
    });

    // CORS for local development
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true
    }));
    
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Status endpoint
    this.app.get('/api/preview/status', (req, res) => {
      const enabled = process.env.DASHBOARD_ENABLE_LOCAL_EXEC === '1';
      
      res.json({
        enabled,
        running: !!this.currentSession,
        session: this.currentSession
      });
    });

    // Start preview endpoint
    this.app.post('/api/preview/start', async (req, res) => {
      const enabled = process.env.DASHBOARD_ENABLE_LOCAL_EXEC === '1';
      
      if (!enabled) {
        res.status(403).json({ 
          success: false, 
          message: 'Local execution is disabled' 
        });
        return;
      }

      const { buildId } = req.body;
      
      if (!buildId || typeof buildId !== 'string') {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid buildId' 
        });
        return;
      }

      try {
        await this.startPreview(buildId);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    // Stop preview endpoint
    this.app.post('/api/preview/stop', async (req, res) => {
      try {
        await this.stopPreview();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    // iOS simulator endpoint
    this.app.post('/api/preview/open/ios', async (req, res) => {
      try {
        await this.openIOS();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    // Watchman reset endpoint
    this.app.post('/api/preview/reset-watchman', async (req, res) => {
      try {
        await this.resetWatchman();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    // Server-Sent Events for logs
    this.app.get('/api/preview/logs', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true'
      });

      // Send recent logs
      const recentLogs = this.getRecentLogs();
      recentLogs.forEach(log => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
      });

      // Listen for new logs
      const removeListener = this.addLogListener((log) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
      });

      req.on('close', removeListener);
      req.on('aborted', removeListener);
    });
  }

  private async loadBuildsIndex(): Promise<BuildsIndex> {
    try {
      const indexPath = join(this.repoRoot, 'builds', 'build_index.json');
      const content = await readFile(indexPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.addLog('error', `Failed to load builds index: ${error}`);
      throw new Error('Failed to load builds index');
    }
  }

  private async validateBuildPath(buildPath: string): Promise<string> {
    const buildsDir = join(this.repoRoot, 'builds');
    
    // buildPath already includes 'builds/' prefix, so resolve relative to repoRoot
    let fullPath = resolve(this.repoRoot, buildPath);
    
    // Fix common /build suffix bug - remove invalid /build suffix if present
    if (fullPath.endsWith('/build')) {
      this.addLog('warn', `Removing invalid /build suffix from path: ${fullPath}`);
      fullPath = fullPath.replace(/\/build$/, '');
    }
    
    // Ensure the path exists and is a valid Expo project
    const packageJsonPath = join(fullPath, 'package.json');
    const appConfigPaths = [
      join(fullPath, 'app.json'),
      join(fullPath, 'app.config.js'),
      join(fullPath, 'app.config.ts')
    ];
    
    if (!existsSync(packageJsonPath)) {
      throw new Error(`Invalid project root: ${fullPath} - missing package.json`);
    }
    
    const hasAppConfig = appConfigPaths.some(path => existsSync(path));
    if (!hasAppConfig) {
      throw new Error(`Invalid project root: ${fullPath} - missing app.json or app.config.*`);
    }
    
    this.addLog('info', `Validated project root: ${fullPath}`);
    
    // Security: ensure path is under builds directory
    const realPath = await realpath(fullPath);
    const realBuildsDir = await realpath(buildsDir);

    if (!realPath.startsWith(realBuildsDir)) {
      throw new Error('Build path is outside allowed directory');
    }

    return realPath;
  }

  private async applyPreflightFixups(buildPath: string, buildEntry: BuildEntry): Promise<string[]> {
    const fixupsApplied: string[] = [];
    
    try {
      const { config, configFile } = await this.readExpoConfig(buildPath);
      
      // Generate deterministic bundle identifier
      const bundleId = this.generateBundleIdentifier(buildEntry.slug);
      this.addLog('info', `Generated bundle identifier: ${bundleId}`);
      
      let currentConfig = { ...config };
      
      // For dynamic configs, try to read the computed config
      if (configFile && (configFile === 'app.config.js' || configFile === 'app.config.ts')) {
        try {
          const dynamicConfig = await this.runExpoConfig(buildPath);
          // Merge dynamic config with static config, preferring dynamic values
          currentConfig = { ...currentConfig, ...dynamicConfig };
        } catch (error) {
          this.addLog('warn', `Could not read dynamic config, using static fallback: ${error}`);
        }
      }

      // Ensure expo object exists
      if (!currentConfig.expo) {
        currentConfig.expo = {};
        fixupsApplied.push('Added expo configuration object');
      }
      
      // Always set/update bundle identifiers for consistency
      if (!currentConfig.expo.ios) currentConfig.expo.ios = {};
      if (!currentConfig.expo.ios.bundleIdentifier || currentConfig.expo.ios.bundleIdentifier !== bundleId) {
        currentConfig.expo.ios.bundleIdentifier = bundleId;
        fixupsApplied.push(`Set iOS bundle identifier: ${bundleId}`);
      }

      if (!currentConfig.expo.android) currentConfig.expo.android = {};
      if (!currentConfig.expo.android.package || currentConfig.expo.android.package !== bundleId) {
        currentConfig.expo.android.package = bundleId;
        fixupsApplied.push(`Set Android package: ${bundleId}`);
      }

      // Ensure required fields are present
      if (!currentConfig.expo.name) {
        currentConfig.expo.name = buildEntry.name;
        fixupsApplied.push(`Set app name: ${buildEntry.name}`);
      }
      
      if (!currentConfig.expo.slug) {
        currentConfig.expo.slug = buildEntry.slug;
        fixupsApplied.push(`Set app slug: ${buildEntry.slug}`);
      }

      // Ensure version is set
      if (!currentConfig.expo.version) {
        currentConfig.expo.version = '1.0.0';
        fixupsApplied.push('Set app version: 1.0.0');
      }

      // Update SDK version to latest for compatibility with current Expo Go
      if (!currentConfig.expo.sdkVersion || currentConfig.expo.sdkVersion !== '54.0.0') {
        currentConfig.expo.sdkVersion = '54.0.0';
        fixupsApplied.push('Updated Expo SDK to version 54.0.0');
      }

      // Write updated config (always to app.json for consistency)
      const configPath = join(buildPath, 'app.json');
      await writeFile(configPath, JSON.stringify(currentConfig, null, 2));
      
      // Update package.json for SDK compatibility
      await this.updatePackageJsonForSDK(buildPath, fixupsApplied);
      
      if (fixupsApplied.length > 0) {
        this.addLog('info', `Applied ${fixupsApplied.length} configuration fixups to ${configPath}`);
        fixupsApplied.forEach(fixup => this.addLog('info', `  ✓ ${fixup}`));
      } else {
        this.addLog('info', 'No configuration fixups needed');
      }
    } catch (error) {
      this.addLog('error', `Failed to apply preflight fixups: ${error}`);
      throw error; // Re-throw to fail the preview startup
    }

    return fixupsApplied;
  }

  private async readExpoConfig(buildPath: string): Promise<{ config: any; configFile: string | null }> {
    const configFiles = ['app.config.js', 'app.config.ts', 'app.json'];
    
    for (const file of configFiles) {
      const configPath = join(buildPath, file);
      if (existsSync(configPath)) {
        if (file === 'app.json') {
          const content = await readFile(configPath, 'utf-8');
          return { config: JSON.parse(content), configFile: file };
        } else {
          // For .js/.ts config files, we need to run expo config
          return { config: {}, configFile: file };
        }
      }
    }
    
    return { config: {}, configFile: null };
  }

  private async runExpoConfig(buildPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const process = spawn('npx', ['expo', 'config', '--json'], {
        cwd: buildPath,
        stdio: 'pipe'
      });
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output));
          } catch (error) {
            reject(new Error('Failed to parse expo config output'));
          }
        } else {
          reject(new Error(`expo config exited with code ${code}`));
        }
      });
    });
  }

  private generateBundleIdentifier(slug: string): string {
    // Clean and normalize slug for bundle identifier
    let cleanSlug = slug.toLowerCase();
    
    // Replace invalid characters with dots, then clean up
    cleanSlug = cleanSlug.replace(/[_\-\s]+/g, '.');
    cleanSlug = cleanSlug.replace(/[^a-z0-9.]/g, '');
    cleanSlug = cleanSlug.replace(/\.+/g, '.'); // Remove multiple consecutive dots
    cleanSlug = cleanSlug.replace(/^\.|\.$/, ''); // Remove leading/trailing dots
    
    // Ensure it doesn't start with a number
    if (/^\d/.test(cleanSlug)) {
      cleanSlug = `app.${cleanSlug}`;
    }
    
    const bundleId = `com.appfactory.${cleanSlug}`;
    
    // Apple has a 255 character limit, but keep it reasonable
    const maxLength = 100;
    if (bundleId.length <= maxLength) {
      return bundleId;
    }
    
    // If too long, use hash but keep it readable
    const hash = createHash('sha256').update(slug).digest('hex').substring(0, 8);
    return `com.appfactory.${hash}`;
  }

  private async updatePackageJsonForSDK(buildPath: string, fixupsApplied: string[]): Promise<void> {
    try {
      const packageJsonPath = join(buildPath, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

      let updated = false;

      // Update Expo CLI version
      if (!packageJson.dependencies) packageJson.dependencies = {};
      
      // Update key Expo dependencies to SDK 54 compatible versions
      const sdkDependencies = {
        'expo': '~54.0.0',
        '@expo/vector-icons': '^14.0.0',
        'expo-status-bar': '~2.0.0'
      };

      for (const [dep, version] of Object.entries(sdkDependencies)) {
        if (packageJson.dependencies[dep] && packageJson.dependencies[dep] !== version) {
          packageJson.dependencies[dep] = version;
          fixupsApplied.push(`Updated ${dep} to ${version}`);
          updated = true;
        } else if (!packageJson.dependencies[dep]) {
          packageJson.dependencies[dep] = version;
          fixupsApplied.push(`Added ${dep}: ${version}`);
          updated = true;
        }
      }

      if (updated) {
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.addLog('info', 'Updated package.json for SDK 54 compatibility');
      }

    } catch (error) {
      this.addLog('warn', `Failed to update package.json: ${error}`);
    }
  }

  private async startPreview(buildId: string): Promise<void> {
    // Stop any existing session
    if (this.currentSession) {
      await this.stopPreview();
    }

    this.addLog('info', `Starting preview for build ${buildId}`);

    // Load builds index
    const buildsIndex = await this.loadBuildsIndex();
    const buildEntry = buildsIndex.builds.find(b => b.buildId === buildId);
    
    if (!buildEntry) {
      throw new Error(`Build ${buildId} not found`);
    }

    // Validate build path
    const buildPath = await this.validateBuildPath(buildEntry.buildPath);
    
    // Find available port
    const port = await this.findAvailablePort();
    
    // Kill any existing processes on this port to avoid conflicts
    if (!(await this.isPortAvailable(port))) {
      this.addLog('info', `Port ${port} is in use, killing existing processes...`);
      await this.killProcessOnPort(port);
      // Wait a moment for processes to be killed
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const sessionId = createHash('sha256')
      .update(buildId + Date.now())
      .digest('hex')
      .substring(0, 16);

    // Create session
    this.currentSession = {
      sessionId,
      buildId,
      buildPath,
      startedAt: new Date().toISOString(),
      port,
      expoUrl: null,
      platformHints: {
        iosReady: false,
        androidReady: false
      },
      fixupsApplied: [],
      processes: []
    };

    try {
      // Apply preflight fixups
      const fixupsApplied = await this.applyPreflightFixups(buildPath, buildEntry);
      this.currentSession.fixupsApplied = fixupsApplied;

      // Install dependencies if needed
      await this.installDependencies(buildPath);

      // Start Expo server
      const expoProcess = await this.startExpoServer(buildPath, port);
      this.currentSession.processes.push(expoProcess);

      // Save session state
      await this.saveSessionState();

      this.addLog('info', `Preview started successfully on port ${port}`);
    } catch (error) {
      // Clean up on failure
      await this.stopPreview();
      throw error;
    }
  }

  private async installDependencies(buildPath: string): Promise<void> {
    const nodeModulesPath = join(buildPath, 'node_modules');
    const packageLockPath = join(buildPath, 'package-lock.json');

    // Check if we need to install
    const hasNodeModules = existsSync(nodeModulesPath);
    const hasPackageLock = existsSync(packageLockPath);

    if (hasNodeModules && hasPackageLock) {
      this.addLog('info', 'Dependencies already installed');
      return;
    }

    this.addLog('info', 'Installing dependencies...');

    return new Promise((resolve, reject) => {
      const npmProcess = spawn('npm', ['install'], {
        cwd: buildPath,
        stdio: 'pipe'
      });

      npmProcess.stdout.on('data', (data) => {
        this.addLog('info', data.toString().trim(), 'npm');
      });

      npmProcess.stderr.on('data', (data) => {
        this.addLog('warn', data.toString().trim(), 'npm');
      });

      npmProcess.on('close', (code) => {
        if (code === 0) {
          this.addLog('info', 'Dependencies installed successfully');
          // Try expo install for compatibility
          this.tryExpoInstallRepair(buildPath).then(resolve).catch(resolve);
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }

  private async tryExpoInstallRepair(buildPath: string): Promise<void> {
    this.addLog('info', 'Running expo install for compatibility...');
    
    return new Promise((resolve) => {
      const expoProcess = spawn('npx', ['expo', 'install', '--check'], {
        cwd: buildPath,
        stdio: 'pipe'
      });

      expoProcess.stdout.on('data', (data) => {
        this.addLog('info', data.toString().trim(), 'expo');
      });

      expoProcess.stderr.on('data', (data) => {
        this.addLog('warn', data.toString().trim(), 'expo');
      });

      expoProcess.on('close', () => {
        this.addLog('info', 'Expo compatibility check completed');
        resolve();
      });
    });
  }

  private async startExpoServer(buildPath: string, port: number): Promise<ChildProcess> {
    this.addLog('info', `Starting Expo dev server on port ${port} (non-interactive)...`);

    // Use non-interactive flags to prevent prompts
    const expoArgs = [
      'expo', 'start',
      '--port', port.toString(),
      '--clear',
      '--non-interactive',
      '--dev-client',
      '--lan' // Enable LAN access for better network connectivity
    ];

    const expoProcess = spawn('npx', expoArgs, {
      cwd: buildPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        EXPO_NO_TELEMETRY: '1',
        CI: '1', // Force non-interactive mode
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0' // Listen on all interfaces
      }
    });

    this.addLog('info', `Expo command: npx ${expoArgs.join(' ')}`);

    expoProcess.stdout.on('data', (data) => {
      const output = data.toString();
      this.addLog('info', output.trim(), 'expo');
      this.parseExpoOutput(output);
    });

    expoProcess.stderr.on('data', (data) => {
      const output = data.toString();
      this.addLog('warn', output.trim(), 'expo');
      this.parseExpoOutput(output);
    });

    expoProcess.on('close', (code) => {
      this.addLog('info', `Expo process exited with code ${code}`);
      if (this.currentSession) {
        this.currentSession.processes = this.currentSession.processes.filter(p => p !== expoProcess);
      }
    });

    return expoProcess;
  }

  private parseExpoOutput(output: string) {
    if (!this.currentSession) return;

    // Parse Expo URL
    const urlMatch = output.match(/exp:\/\/[\d.]+:\d+/);
    if (urlMatch) {
      this.currentSession.expoUrl = urlMatch[0];
    }

    // Parse platform readiness
    if (output.includes('iOS') && output.includes('Simulator')) {
      this.currentSession.platformHints.iosReady = true;
    }
    if (output.includes('Android') && output.includes('device')) {
      this.currentSession.platformHints.androidReady = true;
    }
  }

  private async findAvailablePort(startPort: number = 8081): Promise<number> {
    // Try to find an available port using Node.js net module for reliability
    const net = await import('node:net');
    
    for (let port = startPort; port <= startPort + 20; port++) {
      if (await this.isPortAvailableNet(port)) {
        this.addLog('info', `Found available port: ${port}`);
        return port;
      }
    }
    
    // Fallback to Expo's default port range 19000-19999
    for (let port = 19000; port <= 19020; port++) {
      if (await this.isPortAvailableNet(port)) {
        this.addLog('info', `Found available port in Expo range: ${port}`);
        return port;
      }
    }
    
    throw new Error('No available ports found in range 8081-8101 or 19000-19020');
  }

  private async isPortAvailableNet(port: number): Promise<boolean> {
    const net = await import('node:net');
    
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, '127.0.0.1', () => {
        server.close(() => {
          resolve(true); // Port is available
        });
      });
      
      server.on('error', () => {
        resolve(false); // Port is in use
      });
    });
  }

  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const checkProcess = spawn('lsof', ['-i', `:${port}`], { stdio: 'pipe' });
      
      checkProcess.on('close', (code) => {
        // If lsof returns 0, port is in use; if 1, port is free
        resolve(code !== 0);
      });
      
      checkProcess.on('error', () => {
        // If lsof command fails, assume port is available
        resolve(true);
      });
    });
  }

  private async killProcessOnPort(port: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        const killProcess = spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });
        let pidsToKill: string[] = [];
        
        killProcess.stdout.on('data', (data) => {
          const pids = data.toString().trim().split('\n').filter(pid => pid);
          pidsToKill = pids;
          
          pids.forEach(pid => {
            this.addLog('info', `Killing process ${pid} on port ${port}`);
            spawn('kill', ['-9', pid], { stdio: 'ignore' });
          });
        });

        killProcess.on('close', async () => {
          if (pidsToKill.length > 0) {
            // Wait a bit more for processes to be fully killed
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.addLog('info', `Killed ${pidsToKill.length} process(es) on port ${port}`);
          } else {
            this.addLog('info', `No processes found on port ${port}`);
          }
          resolve();
        });

        killProcess.on('error', () => {
          this.addLog('info', `No processes found on port ${port} (lsof failed)`);
          resolve();
        });
      } catch (error) {
        this.addLog('warn', `Failed to kill processes on port ${port}: ${error}`);
        resolve();
      }
    });
  }

  private async stopPreview(): Promise<void> {
    if (!this.currentSession) {
      this.addLog('warn', 'No active session to stop');
      return;
    }

    this.addLog('info', `Stopping preview session ${this.currentSession.sessionId}`);

    // Kill all processes
    for (const process of this.currentSession.processes) {
      try {
        process.kill('SIGTERM');
      } catch (error) {
        this.addLog('warn', `Failed to kill process: ${error}`);
      }
    }

    // Clear session
    this.currentSession = null;
    
    // Clear session state file
    await this.clearSessionState();

    this.addLog('info', 'Preview session stopped');
  }

  private async openIOS(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    // Use network IP for better iOS Simulator connectivity
    const networkIP = await this.getNetworkIP();
    const expoUrl = `exp://${networkIP}:${this.currentSession.port}`;
    const localhostUrl = `exp://127.0.0.1:${this.currentSession.port}`;

    this.addLog('info', '🚀 openIOS() called - MANUAL SETUP ONLY');
    this.addLog('info', '📱 Manual iOS connection steps:');
    this.addLog('info', '1. Open iOS Simulator manually (run: open -a Simulator)');
    this.addLog('info', '2. Install/open Expo Go app in iOS Simulator');  
    this.addLog('info', `3. Enter this URL: ${expoUrl}`);
    this.addLog('info', `   Fallback URL: ${localhostUrl}`);
    
    // Generate and display QR code with network IP
    await this.displayQRCode(expoUrl);
    
    this.addLog('info', '💡 Manual connection prevents automatic process spawning');
    
    // Update session status
    if (this.currentSession) {
      this.currentSession.iosLaunched = true;
      this.currentSession.expoUrl = expoUrl;
      await this.saveSessionState();
    }
    
    this.addLog('info', '✅ iOS setup instructions provided');
  }

  private async displayQRCode(url: string): Promise<void> {
    try {
      // Generate QR code as base64 data URL for web display
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      this.addLog('info', '📱 QR CODE - Scan with Expo Go:');
      this.addLog('info', `QR_CODE_DATA:${qrDataURL}`);
      this.addLog('info', `📱 URL: ${url}`);
      
    } catch (error) {
      this.addLog('warn', `Failed to generate QR code: ${error}`);
      this.addLog('info', `📱 Manual URL: ${url}`);
    }
  }

  private async getNetworkIP(): Promise<string> {
    try {
      // Get the local network IP address
      const { spawn } = await import('node:child_process');
      
      return new Promise((resolve) => {
        const process = spawn('ifconfig', ['en0'], { stdio: 'pipe' });
        let output = '';
        
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('close', () => {
          const ipMatch = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch && ipMatch[1] && ipMatch[1] !== '127.0.0.1') {
            resolve(ipMatch[1]);
          } else {
            // Fallback to localhost if network IP not found
            resolve('127.0.0.1');
          }
        });
        
        process.on('error', () => {
          resolve('127.0.0.1');
        });
      });
    } catch (error) {
      return '127.0.0.1';
    }
  }

  private async waitForMetroReady(): Promise<void> {
    if (!this.currentSession) return;

    this.addLog('info', 'Waiting for Metro bundler to be ready...');

    // Wait up to 10 seconds for Metro to become ready
    for (let i = 0; i < 20; i++) {
      try {
        const response = await fetch(`http://localhost:${this.currentSession.port}/status`);
        if (response.ok) {
          // Metro is ready, update session status
          if (this.currentSession) {
            this.currentSession.metroReady = true;
            await this.saveSessionState();
          }
          
          this.addLog('info', `✅ Metro bundler is ready on port ${this.currentSession.port}`);
          return;
        }
      } catch (error) {
        // Metro not ready yet, wait more
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.addLog('warn', '⚠️  Metro bundler not responding after 10 seconds');
    throw new Error('Metro bundler not ready after 10 seconds');
  }


  private provideManualInstructions(): void {
    if (!this.currentSession) return;

    this.addLog('info', '📱 iOS Simulator Setup Instructions:', 'system');
    this.addLog('info', '1. iOS Simulator should be opening automatically', 'system');
    this.addLog('info', '2. Install Expo Go from App Store (if not installed)', 'system');
    this.addLog('info', '3. Open Expo Go app in iOS Simulator', 'system');
    this.addLog('info', `4. Enter this URL: exp://127.0.0.1:${this.currentSession.port}`, 'system');
    this.addLog('info', '5. Or use the QR code from Metro output above', 'system');
    this.addLog('info', '💡 Manual connection prevents port conflicts!', 'system');
  }


  private async resetWatchman(): Promise<void> {
    this.addLog('info', 'Resetting Watchman...');

    try {
      // Use the exact command from the warning message
      const watchmanResetCommand = `watchman watch-del '${this.repoRoot}' ; watchman watch-project '${this.repoRoot}'`;
      
      const resetProcess = spawn('bash', ['-c', watchmanResetCommand], {
        stdio: 'pipe'
      });

      resetProcess.stdout.on('data', (data) => {
        this.addLog('info', data.toString().trim(), 'system');
      });

      resetProcess.stderr.on('data', (data) => {
        this.addLog('warn', data.toString().trim(), 'system');
      });

      resetProcess.on('close', (code) => {
        if (code === 0) {
          this.addLog('info', 'Watchman reset completed successfully');
        } else {
          this.addLog('warn', `Watchman reset completed with code ${code}`);
        }
      });
    } catch (error) {
      this.addLog('warn', `Watchman reset failed: ${error}`);
    }
  }

  private async saveSessionState(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const sessionFile = join(this.previewDir, 'session.json');
      await writeFile(sessionFile, JSON.stringify(this.currentSession, null, 2));
    } catch (error) {
      this.addLog('warn', `Failed to save session state: ${error}`);
    }
  }

  private async clearSessionState(): Promise<void> {
    try {
      const sessionFile = join(this.previewDir, 'session.json');
      if (existsSync(sessionFile)) {
        await writeFile(sessionFile, '{}');
      }
    } catch (error) {
      this.addLog('warn', `Failed to clear session state: ${error}`);
    }
  }

  private addLog(level: 'info' | 'error' | 'warn', message: string, source: 'system' | 'npm' | 'expo' = 'system') {
    const log: PreviewLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    };

    this.logs.push(log);
    
    // Trim logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.logCallbacks.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Log callback error:', error);
      }
    });

    // Console output
    console.log(`[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`);
  }

  getRecentLogs(count: number = 100): PreviewLog[] {
    return this.logs.slice(-count);
  }

  addLogListener(callback: (log: PreviewLog) => void): () => void {
    this.logCallbacks.add(callback);
    return () => this.logCallbacks.delete(callback);
  }

  listen(port: number = 5174) {
    const server = this.app.listen(port, '127.0.0.1', () => {
      console.log(`🚀 Preview backend running on http://127.0.0.1:${port}`);
      console.log(`💡 Local execution: ${process.env.DASHBOARD_ENABLE_LOCAL_EXEC === '1' ? 'ENABLED' : 'DISABLED'}`);
      console.log('Press Ctrl+C to stop server');
    });

    // Keep the server alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down preview backend...');
      server.close(() => {
        console.log('✅ Preview backend stopped');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down...');
      server.close(() => {
        process.exit(0);
      });
    });

    return server;
  }
}

// Start server if run directly
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server/index.ts') || 
  process.argv[1].includes('server/index.ts')
);

if (isMainModule || process.argv[1]?.includes('index.ts')) {
  console.log('🚀 Starting preview backend...');
  const backend = new PreviewBackend();
  backend.listen();
} else {
  console.log('📦 Module loaded for import');
}

export { PreviewBackend };