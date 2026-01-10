/**
 * Path Resolution Module
 *
 * Resolves paths to the_factory assets and CLI directories.
 * All paths are relative to the repository root.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find repository root by looking for the_factory directory
function findRepoRoot(): string {
  let current = __dirname;

  // Walk up until we find the_factory directory
  for (let i = 0; i < 10; i++) {
    const factoryPath = path.join(current, 'the_factory');
    if (fs.existsSync(factoryPath)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error('Could not find repository root (the_factory directory not found)');
}

// Lazy initialization of repo root
let _repoRoot: string | null = null;

export function getRepoRoot(): string {
  if (!_repoRoot) {
    _repoRoot = findRepoRoot();
  }
  return _repoRoot;
}

// Factory paths
export function getFactoryRoot(): string {
  return path.join(getRepoRoot(), 'the_factory');
}

export function getTemplatesDir(): string {
  return path.join(getFactoryRoot(), 'templates', 'agents');
}

export function getSchemasDir(): string {
  return path.join(getFactoryRoot(), 'schemas');
}

export function getScriptsDir(): string {
  return path.join(getFactoryRoot(), 'scripts');
}

export function getRunsDir(): string {
  return path.join(getFactoryRoot(), 'runs');
}

export function getBuildsDir(): string {
  return path.join(getFactoryRoot(), 'builds');
}

export function getLeaderboardsDir(): string {
  return path.join(getFactoryRoot(), 'leaderboards');
}

export function getStandardsPath(): string {
  return path.join(getFactoryRoot(), 'standards', 'mobile_app_best_practices_2026.md');
}

export function getVendorDir(): string {
  return path.join(getFactoryRoot(), 'vendor');
}

export function getRunbooksDir(): string {
  return path.join(getFactoryRoot(), 'runbooks');
}

// Template paths
export function getTemplatePath(stageName: string): string {
  return path.join(getTemplatesDir(), `${stageName}.md`);
}

export function getSchemaPath(stageName: string): string {
  // Handle different schema naming conventions
  const variants = [
    `${stageName}.json`,
    `${stageName}_schema.json`,
    `stage${stageName}.json`,
    `stage${stageName}_schema.json`
  ];

  for (const variant of variants) {
    const fullPath = path.join(getSchemasDir(), variant);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Return default path
  return path.join(getSchemasDir(), `stage${stageName}.json`);
}

// Run paths
export function getRunPath(runId: string): string | null {
  const runsDir = getRunsDir();

  // Check all date directories
  if (!fs.existsSync(runsDir)) return null;

  const dateDirs = fs.readdirSync(runsDir).filter(d => {
    const fullPath = path.join(runsDir, d);
    return fs.statSync(fullPath).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(d);
  });

  // Sort by date descending (most recent first)
  dateDirs.sort().reverse();

  for (const dateDir of dateDirs) {
    const runPath = path.join(runsDir, dateDir, runId);
    if (fs.existsSync(runPath)) {
      return runPath;
    }
  }

  return null;
}

export function createRunPath(runId: string): string {
  const today = new Date().toISOString().split('T')[0];
  const runPath = path.join(getRunsDir(), today, runId);
  return runPath;
}

export function getIdeaPath(runPath: string, ideaDir: string): string {
  return path.join(runPath, 'ideas', ideaDir);
}

export function getBuildPath(ideaDir: string, buildId: string): string {
  return path.join(getBuildsDir(), ideaDir, buildId);
}

// Validation
export function validateFactoryStructure(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredPaths = [
    { path: getFactoryRoot(), name: 'the_factory' },
    { path: getTemplatesDir(), name: 'templates/agents' },
    { path: getSchemasDir(), name: 'schemas' },
    { path: getScriptsDir(), name: 'scripts' },
    { path: getStandardsPath(), name: 'standards/mobile_app_best_practices_2026.md' }
  ];

  for (const { path: p, name } of requiredPaths) {
    if (!fs.existsSync(p)) {
      errors.push(`Missing: ${name} at ${p}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// List recent runs
export function listRecentRuns(limit: number = 10): string[] {
  const runsDir = getRunsDir();
  if (!fs.existsSync(runsDir)) return [];

  const runs: { path: string; mtime: Date }[] = [];

  const dateDirs = fs.readdirSync(runsDir).filter(d => {
    const fullPath = path.join(runsDir, d);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const dateDir of dateDirs) {
    const datePath = path.join(runsDir, dateDir);
    const runDirs = fs.readdirSync(datePath).filter(d => {
      const fullPath = path.join(datePath, d);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const runDir of runDirs) {
      const runPath = path.join(datePath, runDir);
      const stat = fs.statSync(runPath);
      runs.push({ path: runPath, mtime: stat.mtime });
    }
  }

  // Sort by modification time descending
  runs.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  return runs.slice(0, limit).map(r => r.path);
}

// List builds
export function listBuilds(): string[] {
  const buildsDir = getBuildsDir();
  if (!fs.existsSync(buildsDir)) return [];

  const builds: string[] = [];

  const ideaDirs = fs.readdirSync(buildsDir).filter(d => {
    const fullPath = path.join(buildsDir, d);
    return fs.statSync(fullPath).isDirectory() && !d.startsWith('.');
  });

  for (const ideaDir of ideaDirs) {
    builds.push(path.join(buildsDir, ideaDir));
  }

  return builds;
}
