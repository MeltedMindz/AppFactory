/**
 * File I/O Utilities
 *
 * Safe file reading and writing with error handling.
 */

import fs from 'fs';
import path from 'path';

/**
 * Read a file as string
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Read a JSON file
 */
export function readJson<T>(filePath: string): T {
  const content = readFile(filePath);
  return JSON.parse(content) as T;
}

/**
 * Write content to a file, creating directories if needed
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write JSON to a file with pretty formatting
 */
export function writeJson(filePath: string, data: unknown): void {
  const content = JSON.stringify(data, null, 2);
  writeFile(filePath, content);
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if a directory exists
 */
export function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Create a directory recursively
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * List files in a directory matching a pattern
 */
export function listFiles(dirPath: string, pattern?: RegExp): string[] {
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath);

  if (pattern) {
    return files.filter(f => pattern.test(f));
  }

  return files;
}

/**
 * Copy a file
 */
export function copyFile(src: string, dest: string): void {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

/**
 * Read directory recursively
 */
export function readDirRecursive(dirPath: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dirPath)) return results;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...readDirRecursive(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Get file modification time
 */
export function getModTime(filePath: string): Date | null {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime;
  } catch {
    return null;
  }
}

/**
 * Append to a file
 */
export function appendFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.appendFileSync(filePath, content, 'utf-8');
}

/**
 * Delete a file if it exists
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
