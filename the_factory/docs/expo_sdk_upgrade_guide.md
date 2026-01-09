# Expo SDK Upgrade Guide for App Factory

**Version**: 3.1  
**Last Updated**: January 2025  
**Status**: MANDATORY for all new builds

## Overview

App Factory has been upgraded to use **Expo SDK 54** by default for all new builds. This eliminates compatibility issues with current Expo Go installations and ensures builds work seamlessly with the latest iOS Simulator and development tools.

## What Changed

### Default SDK Version
- **Before**: Expo SDK 50
- **After**: Expo SDK 54 (latest stable)

### Core Dependencies Updated
```json
{
  "expo": "~54.0.0",
  "expo-router": "~6.0.0", 
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-purchases": "^8.0.0"
}
```

### Build System Improvements
1. **Build Metadata**: All builds now include `build_meta.json` with SDK versions
2. **Expo Doctor**: Automatic preflight validation using `expo-doctor`
3. **Deterministic Dependencies**: Uses `npx expo install` for Expo module version resolution

## For Developers

### New Build Requirements
All new App Factory builds will:
1. Use Expo SDK 54 by default
2. Include automatic dependency resolution via `npx expo install`
3. Pass expo-doctor validation before completion
4. Generate build metadata for reproducibility

### Compatibility
- ✅ **Expo Go**: Works with current Expo Go (SDK 54)
- ✅ **iOS Simulator**: Full compatibility with latest Xcode
- ✅ **Development Builds**: EAS Build ready
- ✅ **RevenueCat**: Latest SDK v8.0+ with improved performance

### Build Process Changes
The Stage 10 build process now includes:

1. **SDK Resolution**: Dynamically uses latest stable Expo SDK
2. **Dependency Management**: Expo modules use compatibility resolver
3. **Preflight Validation**: `expo-doctor` checks before build completion
4. **Metadata Generation**: Tracks SDK versions and build environment

## Testing Your Builds

### Quick Test Steps
```bash
# Navigate to build directory
cd builds/<idea_dir>/<build_id>/app/

# Install dependencies
npm install
npx expo install

# Run preflight checks  
npx expo-doctor

# Start development server
npx expo start

# Test in iOS Simulator
npx expo start --ios
```

### Expected Results
- No SDK version mismatch warnings
- Expo Go loads apps without compatibility errors
- iOS Simulator integration works seamlessly
- All RevenueCat features functional

## Backwards Compatibility

### Existing Builds
- Existing builds (SDK 50) continue to work unchanged
- No automatic upgrades of existing projects
- Dashboard shows SDK version in build metadata

### Manual Upgrade (Optional)
If you want to upgrade an existing build:
```bash
cd builds/<old_build>/app/
npx expo upgrade
```

## Troubleshooting

### Common Issues
1. **"Expo Go incompatible"**: Ensure using latest Expo Go from App Store
2. **"Missing bundle identifier"**: New builds automatically generate bundle IDs
3. **"Module resolution errors"**: Run `npx expo install --check` to fix versions

### Build Failures
If a build fails expo-doctor validation:
- Check `expo-doctor-results.json` in build directory
- Review specific validation errors
- Fix issues and retry build

## Implementation Details

### Files Updated
- `templates/app_template/package.template.json` - SDK 54 dependencies
- `templates/agents/10_app_builder.md` - Build requirements updated  
- `templates/stage10_builder.md` - Quality gates include expo-doctor
- `runbooks/10_*.md` - Updated procedures and examples

### New Templates
- `build_meta.template.json` - Build metadata tracking
- `expo-doctor-check.template.sh` - Automated validation script

## Best Practices

### For New Builds
- Always use latest templates (automatic in new builds)
- Include expo-doctor in development workflow
- Monitor build metadata for dependency tracking

### For Development
- Use `npx expo install` for Expo modules
- Avoid hardcoding Expo module versions
- Run expo-doctor before production releases

## Migration Timeline

- ✅ **Immediate**: All new builds use SDK 54
- ✅ **Complete**: Templates and documentation updated
- 📋 **Ongoing**: Monitor build success rates
- 🔄 **Optional**: Manual upgrade of existing builds as needed

This upgrade ensures App Factory stays current with the Expo ecosystem while maintaining stability and compatibility for all development workflows.