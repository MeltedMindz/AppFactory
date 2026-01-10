/**
 * Run Locks Module
 *
 * Prevents concurrent pipeline executions that could corrupt state.
 */

import fs from 'fs';
import path from 'path';
import { getRunsDir } from './paths.js';
import { logger } from './logging.js';

interface LockInfo {
  pid: number;
  runId: string;
  startTime: string;
  command: string;
}

const LOCK_FILE_NAME = '.appfactory.lock';

function getLockPath(): string {
  return path.join(getRunsDir(), LOCK_FILE_NAME);
}

/**
 * Check if a process is still running
 */
function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Acquire a lock for pipeline execution
 */
export function acquireLock(runId: string, command: string): boolean {
  const lockPath = getLockPath();

  // Check for existing lock
  if (fs.existsSync(lockPath)) {
    try {
      const lockContent = fs.readFileSync(lockPath, 'utf-8');
      const lockInfo: LockInfo = JSON.parse(lockContent);

      // Check if the locking process is still running
      if (isProcessRunning(lockInfo.pid)) {
        logger.error(`Another pipeline is running: ${lockInfo.runId} (PID: ${lockInfo.pid})`);
        logger.error(`Started at: ${lockInfo.startTime}`);
        logger.error(`Command: ${lockInfo.command}`);
        return false;
      }

      // Stale lock - process is dead, remove it
      logger.warn(`Removing stale lock from dead process ${lockInfo.pid}`);
      fs.unlinkSync(lockPath);
    } catch (err) {
      // Corrupted lock file, remove it
      logger.warn('Removing corrupted lock file');
      try {
        fs.unlinkSync(lockPath);
      } catch {
        // Ignore
      }
    }
  }

  // Create new lock
  const lockInfo: LockInfo = {
    pid: process.pid,
    runId,
    startTime: new Date().toISOString(),
    command
  };

  try {
    // Ensure runs directory exists
    const runsDir = getRunsDir();
    if (!fs.existsSync(runsDir)) {
      fs.mkdirSync(runsDir, { recursive: true });
    }

    // Write lock file atomically
    const tempPath = `${lockPath}.${process.pid}`;
    fs.writeFileSync(tempPath, JSON.stringify(lockInfo, null, 2));
    fs.renameSync(tempPath, lockPath);

    logger.debug(`Lock acquired for ${runId}`);
    return true;
  } catch (err) {
    logger.error(`Failed to acquire lock: ${err}`);
    return false;
  }
}

/**
 * Release the lock
 */
export function releaseLock(): void {
  const lockPath = getLockPath();

  try {
    if (fs.existsSync(lockPath)) {
      const lockContent = fs.readFileSync(lockPath, 'utf-8');
      const lockInfo: LockInfo = JSON.parse(lockContent);

      // Only release if we own the lock
      if (lockInfo.pid === process.pid) {
        fs.unlinkSync(lockPath);
        logger.debug('Lock released');
      }
    }
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Get current lock info if any
 */
export function getLockInfo(): LockInfo | null {
  const lockPath = getLockPath();

  try {
    if (fs.existsSync(lockPath)) {
      const lockContent = fs.readFileSync(lockPath, 'utf-8');
      return JSON.parse(lockContent) as LockInfo;
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Force release lock (use with caution)
 */
export function forceReleaseLock(): boolean {
  const lockPath = getLockPath();

  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      logger.warn('Lock force-released');
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`Failed to force-release lock: ${err}`);
    return false;
  }
}

// Cleanup lock on process exit
process.on('exit', () => {
  releaseLock();
});

process.on('SIGINT', () => {
  releaseLock();
  process.exit(130);
});

process.on('SIGTERM', () => {
  releaseLock();
  process.exit(143);
});
