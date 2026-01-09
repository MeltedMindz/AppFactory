#!/usr/bin/env node

import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Deterministic paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FACTORY_ROOT = join(__dirname, '..');
const OUT_DIR = join(FACTORY_ROOT, 'vendor', 'expo-docs');
const OUT_FILE = join(OUT_DIR, 'llms.txt');
const META_FILE = join(OUT_DIR, 'meta.json');

// Configuration
const SOURCE_URL = 'https://docs.expo.dev/llms.txt';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const USER_AGENT = 'App-Factory-Docs-Cache/1.0 (https://github.com/anthropics/app-factory)';

async function downloadFile(url) {
  console.log(`⬇️  Downloading: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${buffer.length} bytes (max: ${MAX_FILE_SIZE})`);
  }
  
  return buffer;
}

async function writeAtomic(filePath, content) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  try {
    await writeFile(tempPath, content);
    const { rename } = await import('fs');
    rename(tempPath, filePath, (err) => {
      if (err) throw err;
    });
  } catch (error) {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Caching Expo LLM documentation...');
    console.log(`📦 Source: ${SOURCE_URL}`);
    console.log(`📁 Output: ${OUT_FILE}`);
    
    // Ensure output directory exists
    console.log('📂 Creating output directory...');
    await mkdir(OUT_DIR, { recursive: true });
    
    // Download documentation
    const content = await downloadFile(SOURCE_URL);
    console.log(`📊 Downloaded ${content.length} bytes`);
    
    // Calculate SHA256
    console.log('🔐 Calculating SHA256 hash...');
    const hash = createHash('sha256');
    hash.update(content);
    const sha256 = hash.digest('hex');
    
    // Write atomically to temporary file then rename
    console.log(`💾 Writing atomically...`);
    await writeAtomic(OUT_FILE, content);
    console.log(`✅ Written to: ${OUT_FILE}`);
    
    // Create metadata
    const metadata = {
      sourceUrl: SOURCE_URL,
      downloadedAt: new Date().toISOString(),
      bytes: content.length,
      sha256: sha256,
      nodeVersion: process.version
    };
    
    console.log('📋 Writing metadata...');
    await writeFile(META_FILE, JSON.stringify(metadata, null, 2));
    
    console.log('🎉 Expo documentation cached successfully!');
    console.log(`📈 Size: ${content.length} bytes`);
    console.log(`🔑 SHA256: ${sha256}`);
    console.log(`📅 Timestamp: ${metadata.downloadedAt}`);
    
  } catch (error) {
    console.error('❌ EXPO DOCS CACHE FAILED:');
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

main();