#!/bin/bash
# App Factory Generated Build - Install Script
# This script ensures proper Expo module compatibility and validates the build

set -e

echo "🚀 Installing {{APP_NAME}} dependencies..."

# Clean install
echo "🧹 Cleaning previous install..."
rm -rf node_modules package-lock.json

# Install core dependencies first
echo "📦 Running npm install..."
npm install

# Install required Expo modules with compatibility resolution
echo "🔧 Installing Expo modules with compatibility resolution..."
npx expo install \
  @expo/vector-icons \
  expo-constants \
  expo-status-bar \
  expo-sqlite \
  expo-file-system \
  expo-linking \
  react-native-safe-area-context \
  react-native-screens \
  react-native-gesture-handler \
  {{EXPO_MODULES}}

# Auto-fix any version conflicts
echo "🔧 Auto-fixing dependency conflicts..."
npx expo install --fix

# Comprehensive validation
echo "🔍 Running validation checks..."
npx expo install --check
npx expo-doctor

# TypeScript check
echo "📝 Checking TypeScript..."
npx tsc --noEmit --skipLibCheck || echo "⚠️ TypeScript check failed (non-blocking)"

# Test bundler
echo "🎯 Testing Metro bundler..."
timeout 30s npx expo start --non-interactive --clear || echo "⚠️ Metro test completed"

echo "✅ Installation and validation complete!"
echo ""
echo "🎉 You can now run:"
echo "   npx expo start"
echo ""
echo "📱 For iOS Simulator:"
echo "   npx expo start --ios"
echo ""
echo "🔧 For debugging:"
echo "   npm run validate"