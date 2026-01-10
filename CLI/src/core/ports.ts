/**
 * Port Collision Utilities
 *
 * Provides advice about port usage for Metro bundler and development servers.
 * Does NOT run Metro automatically - only provides information.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logging.js';

const execAsync = promisify(exec);

// Common development server ports
const COMMON_PORTS = {
  metro: 8081,
  expo: 19000,
  expoDevTools: 19002,
  webpack: 8080,
  vite: 5173,
  nextjs: 3000
};

interface PortInfo {
  port: number;
  name: string;
  pid?: number;
  process?: string;
}

/**
 * Check if a port is in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
  try {
    // Use lsof on macOS/Linux
    const { stdout } = await execAsync(`lsof -i :${port} -P -n | grep LISTEN`, {
      timeout: 5000
    });
    return stdout.trim().length > 0;
  } catch {
    // Command failed or no process found
    return false;
  }
}

/**
 * Get process info for a port
 */
export async function getPortProcess(port: number): Promise<{ pid: number; name: string } | null> {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -P -n | grep LISTEN | head -1`, {
      timeout: 5000
    });

    const parts = stdout.trim().split(/\s+/);
    if (parts.length >= 2) {
      return {
        name: parts[0],
        pid: parseInt(parts[1], 10)
      };
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Check all common development ports
 */
export async function checkCommonPorts(): Promise<PortInfo[]> {
  const results: PortInfo[] = [];

  for (const [name, port] of Object.entries(COMMON_PORTS)) {
    const inUse = await isPortInUse(port);

    if (inUse) {
      const processInfo = await getPortProcess(port);
      results.push({
        port,
        name,
        pid: processInfo?.pid,
        process: processInfo?.name
      });
    }
  }

  return results;
}

/**
 * Find an available port starting from a base port
 */
export async function findAvailablePort(basePort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    const inUse = await isPortInUse(port);

    if (!inUse) {
      return port;
    }
  }

  throw new Error(`No available port found starting from ${basePort}`);
}

/**
 * Print port status for development
 */
export async function printPortStatus(): Promise<void> {
  logger.info('Checking development ports...');

  const inUse = await checkCommonPorts();

  if (inUse.length === 0) {
    logger.success('All common development ports are available');
    return;
  }

  logger.warn('The following ports are in use:');

  for (const info of inUse) {
    const processStr = info.process ? ` (${info.process}, PID: ${info.pid})` : '';
    console.log(`  - Port ${info.port} (${info.name})${processStr}`);
  }

  if (inUse.some(p => p.port === COMMON_PORTS.metro)) {
    logger.warn('Metro bundler port (8081) is in use.');
    logger.info('To run Metro on a different port, use: npx expo start --port 8082');
  }
}

/**
 * Get Metro startup advice
 */
export function getMetroAdvice(): string {
  return `
To start the Metro bundler manually:

  cd <build-path>/app
  npx expo start

Metro typically runs on port 8081. If that port is in use:

  npx expo start --port 8082

For production builds:

  npx expo export
  eas build --platform ios  # or android

Note: The CLI does NOT automatically start Metro to keep operations deterministic.
`;
}
