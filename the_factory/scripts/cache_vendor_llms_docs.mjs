#!/usr/bin/env node

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit', // Pass through stdout/stderr
      cwd: dirname(scriptPath)
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function main() {
  try {
    console.log('🚀 Caching all vendor LLM documentation...\n');
    
    // Run Expo docs cache
    console.log('📦 STEP 1: Caching Expo documentation');
    console.log('=' .repeat(50));
    const expoScript = join(__dirname, 'cache_expo_llms_docs.mjs');
    await runScript(expoScript);
    
    console.log('\n📦 STEP 2: Caching RevenueCat documentation');
    console.log('=' .repeat(50));
    const revenueCatScript = join(__dirname, 'cache_revenuecat_llms_docs.mjs');
    await runScript(revenueCatScript);
    
    console.log('\n🎉 ALL VENDOR DOCS CACHED SUCCESSFULLY!');
    
    // Read metadata to show final summary
    const { readFile } = await import('fs/promises');
    const factoryRoot = join(__dirname, '..');
    
    try {
      const expoMeta = JSON.parse(await readFile(join(factoryRoot, 'vendor', 'expo-docs', 'meta.json'), 'utf-8'));
      const revenueCatMeta = JSON.parse(await readFile(join(factoryRoot, 'vendor', 'revenuecat-docs', 'meta.json'), 'utf-8'));
      
      console.log('\n📋 FINAL SUMMARY');
      console.log('=' .repeat(50));
      console.log(`📦 Expo Docs: ${expoMeta.bytes} bytes (SHA256: ${expoMeta.sha256})`);
      console.log(`📦 RevenueCat Docs: ${revenueCatMeta.bytes} bytes (SHA256: ${revenueCatMeta.sha256})`);
      console.log(`📅 Completed: ${new Date().toISOString()}`);
      
    } catch (metaError) {
      console.log('\n⚠️  Could not read metadata for final summary');
    }
    
  } catch (error) {
    console.error('\n❌ VENDOR DOCS CACHE FAILED:');
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

main();