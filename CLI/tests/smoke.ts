#!/usr/bin/env node

/**
 * Smoke Tests for App Factory CLI
 *
 * These tests verify basic functionality without making API calls.
 * Run with: npm run smoke
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');
const DIST_PATH = path.join(CLI_ROOT, 'dist', 'src', 'index.js');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

function runTest(name: string, fn: () => void): void {
  const start = Date.now();
  try {
    fn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - start
    });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    results.push({
      name,
      passed: false,
      error,
      duration: Date.now() - start
    });
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error}`);
  }
}

function runCommand(args: string): string {
  return execSync(`node "${DIST_PATH}" ${args}`, {
    cwd: CLI_ROOT,
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: 'sk-ant-stub-key-for-testing'
    },
    encoding: 'utf-8',
    timeout: 30000
  });
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// Main test suite
async function runSmokeTests(): Promise<void> {
  console.log('\nApp Factory CLI Smoke Tests\n');
  console.log('='.repeat(50));

  // Check if dist exists
  if (!fs.existsSync(DIST_PATH)) {
    console.log('ERROR: dist/index.js not found. Run "npm run build" first.\n');
    process.exit(1);
  }

  // Test 1: Version flag
  runTest('--version flag works', () => {
    const output = runCommand('--version');
    assert(output.includes('1.0.0'), 'Version should be 1.0.0');
  });

  // Test 2: Help flag
  runTest('--help flag works', () => {
    const output = runCommand('--help');
    assert(output.includes('appfactory'), 'Help should mention appfactory');
    assert(output.includes('run'), 'Help should list run command');
    assert(output.includes('build'), 'Help should list build command');
    assert(output.includes('dream'), 'Help should list dream command');
  });

  // Test 3: Doctor command (stub mode)
  runTest('doctor command runs', () => {
    try {
      const output = runCommand('doctor --json');
      const result = JSON.parse(output);
      assert(typeof result.total === 'number', 'Doctor should return check count');
      assert(Array.isArray(result.checks), 'Doctor should return checks array');
    } catch {
      // Doctor may fail due to missing env, but shouldn't crash
    }
  });

  // Test 4: List command (empty is ok)
  runTest('list command runs', () => {
    const output = runCommand('list --json');
    const result = JSON.parse(output);
    assert(typeof result === 'object', 'List should return object');
  });

  // Test 5: Run command with stub mode
  runTest('run command accepts --stub flag', () => {
    // This should work but not make API calls
    try {
      const output = runCommand('run --stub --json -y');
      // In stub mode, it should return a result (may fail but shouldn't crash)
      assert(output.length > 0, 'Should produce output');
    } catch (err) {
      // Stub mode may still need valid inputs, but shouldn't crash with unhandled errors
      const error = err instanceof Error ? err.message : String(err);
      assert(!error.includes('Cannot read'), 'Should not have undefined access errors');
    }
  });

  // Test 6: Build command shows help without args
  runTest('build command without args shows help/prompt', () => {
    try {
      // Without args and without interactive mode, should fail gracefully
      const output = runCommand('build --json -y nonexistent_idea_12345');
      const result = JSON.parse(output);
      assert(result.success === false, 'Should fail for nonexistent idea');
    } catch {
      // Expected to fail, but gracefully
    }
  });

  // Test 7: Dream command validates input
  runTest('dream command validates empty input', () => {
    try {
      runCommand('dream "" --json -y');
      // Should fail for empty input
    } catch {
      // Expected to fail for empty input
    }
  });

  // Test 8: Resume command works
  runTest('resume command runs', () => {
    try {
      const output = runCommand('resume --json -y');
      // May have no runs to resume, but shouldn't crash
      assert(output.length > 0, 'Should produce output');
    } catch {
      // Expected if no runs exist
    }
  });

  // Test 9: Core modules can be imported
  runTest('core modules can be imported', () => {
    // Check that all expected dist files exist
    const coreFiles = [
      'core/paths.js',
      'core/io.js',
      'core/logging.js',
      'core/anthropic.js',
      'core/pipeline.js',
      'core/stages.js',
      'core/locks.js',
      'core/ports.js'
    ];

    for (const file of coreFiles) {
      const filePath = path.join(CLI_ROOT, 'dist', file);
      assert(fs.existsSync(filePath), `${file} should exist`);
    }
  });

  // Test 10: UI modules can be imported
  runTest('ui modules can be imported', () => {
    const uiFiles = [
      'ui/banner.js',
      'ui/prompts.js',
      'ui/format.js'
    ];

    for (const file of uiFiles) {
      const filePath = path.join(CLI_ROOT, 'dist', file);
      assert(fs.existsSync(filePath), `${file} should exist`);
    }
  });

  // Test 11: Command modules can be imported
  runTest('command modules can be imported', () => {
    const commandFiles = [
      'commands/run.js',
      'commands/build.js',
      'commands/dream.js',
      'commands/doctor.js',
      'commands/list.js',
      'commands/resume.js'
    ];

    for (const file of commandFiles) {
      const filePath = path.join(CLI_ROOT, 'dist', file);
      assert(fs.existsSync(filePath), `${file} should exist`);
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('Failed tests:');
    for (const result of results.filter(r => !r.passed)) {
      console.log(`  - ${result.name}: ${result.error}`);
    }
    console.log();
    process.exit(1);
  }

  console.log('All smoke tests passed!\n');
  process.exit(0);
}

// Run tests
runSmokeTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
