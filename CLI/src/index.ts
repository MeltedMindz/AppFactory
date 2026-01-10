#!/usr/bin/env node

/**
 * App Factory CLI
 *
 * A standalone CLI for generating store-ready Expo React Native apps using Claude AI.
 * This CLI executes the same pipeline as the_factory/, but uses the Anthropic API directly.
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { createRunCommand } from './commands/run.js';
import { createBuildCommand } from './commands/build.js';
import { createDreamCommand } from './commands/dream.js';
import { createDoctorCommand } from './commands/doctor.js';
import { createListCommand } from './commands/list.js';
import { createResumeCommand } from './commands/resume.js';
import { runInteractive } from './interactive.js';
import { logger } from './core/logging.js';
import { setStubMode } from './core/anthropic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// First try CLI directory, then current working directory
const cliEnvPath = path.join(__dirname, '..', '.env');
const cwdEnvPath = path.join(process.cwd(), '.env');

dotenv.config({ path: cliEnvPath });
dotenv.config({ path: cwdEnvPath });

// Also try parent directory (repo root)
const repoEnvPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: repoEnvPath });

// Create the main program
const program = new Command();

program
  .name('appfactory')
  .description('Generate store-ready Expo React Native apps using Claude AI')
  .version('1.0.0')
  .option('--json', 'Output all results as JSON (for CI/scripting)')
  .option('--debug', 'Enable debug logging')
  .option('--stub', 'Enable stub mode for testing (no API calls)')
  .hook('preAction', (thisCommand) => {
    // Apply global options
    const opts = thisCommand.opts();

    if (opts.json) {
      logger.setJsonMode(true);
    }

    if (opts.debug) {
      logger.setDebugMode(true);
    }

    if (opts.stub) {
      setStubMode(true);
      logger.info('Stub mode enabled - no API calls will be made');
    }
  });

// Add commands
program.addCommand(createRunCommand());
program.addCommand(createBuildCommand());
program.addCommand(createDreamCommand());
program.addCommand(createDoctorCommand());
program.addCommand(createListCommand());
program.addCommand(createResumeCommand());

// Default action (no command) - launch interactive mode
program.action(async () => {
  // Launch interactive menu
  await runInteractive();
});

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  logger.error(err.message);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  if (process.env.DEBUG) {
    console.error(err.stack);
  }
  process.exit(2);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  process.exit(2);
});

// Parse arguments - use async parsing for interactive mode
program.parseAsync().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
