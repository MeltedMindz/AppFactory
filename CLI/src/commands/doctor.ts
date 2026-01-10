/**
 * Doctor Command
 *
 * Validates environment, dependencies, and repository integrity.
 */

import { Command } from 'commander';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateFactoryStructure, getScriptsDir, getTemplatesDir, getSchemasDir } from '../core/paths.js';
import { printBanner, printHeader, printSuccess, printError, printWarning, printInfo } from '../ui/banner.js';
import { fileExists, listFiles } from '../core/io.js';

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
}

export function createDoctorCommand(): Command {
  const command = new Command('doctor')
    .description('Check environment, dependencies, and repository integrity')
    .option('--json', 'Output results as JSON')
    .option('--fix', 'Attempt to fix common issues')
    .action(async (options) => {
      if (!options.json) {
        printBanner();
        printHeader('System Health Check');
      }

      const checks: CheckResult[] = [];

      // Check 1: .env file exists
      const envPath = path.join(process.cwd(), '.env');
      const hasEnv = fileExists(envPath);
      checks.push({
        name: '.env file',
        passed: hasEnv,
        message: hasEnv ? '.env file found' : '.env file not found',
        fix: hasEnv ? undefined : 'cp .env.example .env'
      });

      // Check 2: ANTHROPIC_API_KEY is set
      const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
      checks.push({
        name: 'ANTHROPIC_API_KEY',
        passed: hasApiKey,
        message: hasApiKey ? 'API key is set' : 'API key is not set',
        fix: hasApiKey ? undefined : 'Add ANTHROPIC_API_KEY=sk-ant-... to .env'
      });

      // Check 3: API key format
      const apiKeyValid = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') ?? false;
      if (hasApiKey) {
        checks.push({
          name: 'API key format',
          passed: apiKeyValid,
          message: apiKeyValid ? 'API key format valid' : 'API key format invalid',
          fix: apiKeyValid ? undefined : 'API key should start with sk-ant-'
        });
      }

      // Check 4: Node.js version
      let nodeVersion = '';
      try {
        const { stdout } = await execAsync('node --version');
        nodeVersion = stdout.trim().replace('v', '');
        const majorVersion = parseInt(nodeVersion.split('.')[0], 10);
        const nodeOk = majorVersion >= 18;
        checks.push({
          name: 'Node.js version',
          passed: nodeOk,
          message: nodeOk ? `Node.js ${nodeVersion} (>= 18 required)` : `Node.js ${nodeVersion} (requires >= 18)`,
          fix: nodeOk ? undefined : 'Install Node.js 18 or higher'
        });
      } catch {
        checks.push({
          name: 'Node.js version',
          passed: false,
          message: 'Node.js not found',
          fix: 'Install Node.js 18 or higher'
        });
      }

      // Check 5: the_factory directory structure
      const factoryCheck = validateFactoryStructure();
      checks.push({
        name: 'Factory structure',
        passed: factoryCheck.valid,
        message: factoryCheck.valid ? 'Repository structure valid' : `Missing: ${factoryCheck.errors.join(', ')}`,
        fix: factoryCheck.valid ? undefined : 'Ensure you are in the correct repository'
      });

      // Check 6: Templates exist
      const templatesDir = getTemplatesDir();
      if (fileExists(templatesDir)) {
        const templates = listFiles(templatesDir, /\.md$/);
        const hasTemplates = templates.length >= 15;
        checks.push({
          name: 'Stage templates',
          passed: hasTemplates,
          message: hasTemplates ? `${templates.length} templates found` : `Only ${templates.length} templates (expected 15+)`,
          fix: hasTemplates ? undefined : 'Repository may be incomplete'
        });
      }

      // Check 7: Schemas exist
      const schemasDir = getSchemasDir();
      if (fileExists(schemasDir)) {
        const schemas = listFiles(schemasDir, /\.json$/);
        const hasSchemas = schemas.length >= 10;
        checks.push({
          name: 'JSON schemas',
          passed: hasSchemas,
          message: hasSchemas ? `${schemas.length} schemas found` : `Only ${schemas.length} schemas (expected 10+)`,
          fix: hasSchemas ? undefined : 'Repository may be incomplete'
        });
      }

      // Check 8: Scripts exist and are executable
      const scriptsDir = getScriptsDir();
      if (fileExists(scriptsDir)) {
        const scripts = listFiles(scriptsDir, /\.sh$/);
        const hasScripts = scripts.length >= 20;
        checks.push({
          name: 'Enforcement scripts',
          passed: hasScripts,
          message: hasScripts ? `${scripts.length} scripts found` : `Only ${scripts.length} scripts (expected 20+)`,
          fix: hasScripts ? undefined : 'Repository may be incomplete'
        });
      }

      // Check 9: npm/pnpm available
      let hasNpm = false;
      try {
        await execAsync('npm --version');
        hasNpm = true;
      } catch {
        // npm not available
      }
      checks.push({
        name: 'npm',
        passed: hasNpm,
        message: hasNpm ? 'npm available' : 'npm not found',
        fix: hasNpm ? undefined : 'Install npm (comes with Node.js)'
      });

      // Check 10: expo-cli available
      let hasExpo = false;
      try {
        await execAsync('npx expo --version');
        hasExpo = true;
      } catch {
        // expo not available
      }
      checks.push({
        name: 'Expo CLI',
        passed: hasExpo,
        message: hasExpo ? 'Expo CLI available' : 'Expo CLI not found',
        fix: hasExpo ? undefined : 'npm install -g expo-cli'
      });

      // Output results
      if (options.json) {
        const passed = checks.filter(c => c.passed).length;
        const failed = checks.filter(c => !c.passed).length;

        console.log(JSON.stringify({
          passed,
          failed,
          total: checks.length,
          checks: checks.map(c => ({
            name: c.name,
            passed: c.passed,
            message: c.message,
            ...(c.fix && { fix: c.fix })
          }))
        }, null, 2));

        process.exit(failed > 0 ? 3 : 0);
      }

      // Human-readable output
      console.log();

      for (const check of checks) {
        if (check.passed) {
          printSuccess(`${check.name}: ${check.message}`);
        } else {
          printError(`${check.name}: ${check.message}`);
          if (check.fix) {
            printInfo(`  Fix: ${check.fix}`);
          }
        }
      }

      console.log();

      const passed = checks.filter(c => c.passed).length;
      const failed = checks.filter(c => !c.passed).length;

      if (failed === 0) {
        printSuccess(`All ${passed} checks passed!`);
        console.log('\nYour environment is ready to use App Factory.');
        process.exit(0);
      } else {
        printWarning(`${passed}/${checks.length} checks passed, ${failed} failed`);
        console.log('\nPlease fix the issues above before using App Factory.');
        process.exit(3);
      }
    });

  return command;
}
