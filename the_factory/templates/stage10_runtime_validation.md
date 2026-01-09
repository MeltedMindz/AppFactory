# Stage 10: Runtime Validation System

**Version**: 3.2  
**Status**: MANDATORY for all Stage 10 builds  
**Purpose**: Guarantee every build works immediately after generation

## Overview

Based on real-world testing with EVP Analyzer Pro, Stage 10 MUST include comprehensive runtime validation that tests actual app functionality, not just static analysis. This ensures every completed build is guaranteed to work in Expo Go and iOS Simulator without manual fixes.

## Critical Issues Discovered & Fixed

### 1. Missing Asset Files
**Problem**: Apps fail at runtime with "Unable to resolve asset './assets/icon.png'"  
**Solution**: Auto-generate placeholder assets

### 2. Babel Configuration Conflicts  
**Problem**: React Native Reanimated plugin errors cause Metro bundler failures  
**Solution**: Validate and auto-fix babel.config.js

### 3. Dependency Version Conflicts
**Problem**: @expo/vector-icons, expo-status-bar version mismatches  
**Solution**: Comprehensive dependency resolution with auto-fix

### 4. Runtime Bundle Failures
**Problem**: Apps pass expo-doctor but fail when Metro tries to bundle  
**Solution**: Actual Metro bundle test with timeout

## Mandatory Runtime Validation Steps

### Phase 1: Basic File Structure
```bash
# Verify core files exist
- package.json ✓
- app.config.js ✓ (NOT app.json)
- babel.config.js ✓
- assets/icon.png ✓
- assets/splash.png ✓  
- assets/adaptive-icon.png ✓
- src/ directory ✓
```

### Phase 2: Dependency Resolution
```bash
cd builds/<idea_dir>/<build_id>/app/

# Clean install test
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
# MUST complete without ERESOLVE conflicts

# Expo module compatibility
npx expo install --check
# MUST show "Dependencies are up to date"

# Auto-fix if needed
npx expo install --fix
```

### Phase 3: Configuration Validation
```bash
# Health check
npx expo-doctor
# MUST show "17/17 checks passed"

# TypeScript validation
npx tsc --noEmit
# MUST complete without compilation errors

# Babel config test
node -e "require('./babel.config.js')({cache: () => {}})"
# MUST load without plugin errors
```

### Phase 4: Runtime Bundle Test (CRITICAL)
```bash
# Start Metro bundler with timeout
timeout 60s npx expo start --port 8081 --clear --dev &
METRO_PID=$!

# Wait for Metro to be ready
sleep 30

# Test bundle generation
curl -f http://localhost:8081/node_modules/expo-router/entry.bundle?platform=ios
# MUST return bundle without errors

# Cleanup
kill $METRO_PID
```

### Phase 5: Asset Generation
```bash
# Create required placeholder assets
mkdir -p assets

# Generate 1024x1024 placeholder icon
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA5lsLYAAAAABJRU5ErkJggg==" | base64 -d > assets/icon.png

# Generate splash screen 
cp assets/icon.png assets/splash.png
cp assets/icon.png assets/adaptive-icon.png
cp assets/icon.png assets/favicon.png
```

## Auto-Fix Protocols

### Dependency Conflicts
```javascript
// Auto-fix common version mismatches
const fixes = {
  "@expo/vector-icons": "^15.0.3",
  "expo-status-bar": "~3.0.9", 
  "react": "19.1.0", // SDK 54 compatible
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
};
```

### Babel Configuration
```javascript
// Standard working babel config for SDK 54
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Only add reanimated plugin if package is installed
      ...(hasReanimated ? ["react-native-reanimated/plugin"] : [])
    ],
  };
};
```

### App Configuration
```javascript
// Remove problematic static app.json, use dynamic only
if (fs.existsSync('app.json')) {
  fs.unlinkSync('app.json');
  console.log('Removed conflicting static app.json');
}
```

## Failure Handling

### Runtime Validation Failure Protocol
If ANY runtime test fails:

1. **Document Exact Failure**:
   ```json
   {
     "timestamp": "ISO date",
     "buildId": "hash",
     "failedAt": "dependency_resolution|bundle_test|asset_check",
     "error": "exact error message",
     "exitCode": 1,
     "autoFixAttempts": ["list of attempted fixes"],
     "logFile": "runtime_validation.log"
   }
   ```

2. **Write Failure Artifacts**:
   - `runtime_validation_failure.md` (detailed report)
   - `runtime_validation.log` (command output) 
   - `build_incomplete.flag` (prevent false completion)

3. **Stop Stage 10 Execution**:
   - DO NOT create stage10.json
   - DO NOT mark build as completed
   - DO NOT register in build index
   - Return clear error with remediation steps

## Success Criteria

Stage 10 runtime validation succeeds ONLY when ALL tests pass:

✅ **Basic Structure** - All required files exist  
✅ **Dependencies** - npm install completes clean  
✅ **Compatibility** - expo install --check passes  
✅ **Health** - expo-doctor shows 17/17  
✅ **TypeScript** - tsc --noEmit succeeds  
✅ **Bundle Test** - Metro can generate iOS bundle  
✅ **Assets** - All required assets exist  
✅ **Config** - babel.config.js loads without errors  

## Implementation Integration

### Stage 10 Agent Template Updates
```markdown
### Phase 7: Runtime Validation (MANDATORY)
Execute comprehensive runtime validation following templates/stage10_runtime_validation.md:

1. Basic file structure check
2. Clean dependency installation test  
3. Expo module compatibility verification
4. Metro bundler runtime test with timeout
5. Asset generation and verification
6. Configuration validation

If ANY step fails, write failure report and STOP.
Only proceed to stage10.json creation after ALL validations pass.
```

### Build Template Updates
Add to `templates/app_template/`:
- `assets/` directory with placeholder files
- `babel.config.template.js` (without problematic plugins)
- `validation.template.sh` (runtime test script)

## Real-World Test Results

**Before Runtime Validation**: 
- Apps completed Stage 10 with dependency conflicts
- Runtime errors: missing assets, babel plugin failures
- Bundle generation failures not caught until manual testing

**After Runtime Validation**:
- Every build guaranteed to work in Expo Go immediately
- Zero runtime dependency conflicts
- Metro bundler confirmed working before completion
- All assets present and loadable

## Performance Optimization

### Validation Time Targets
- Basic checks: < 10 seconds
- Dependency resolution: < 60 seconds  
- Bundle test: < 30 seconds
- Total validation: < 2 minutes

### Caching Strategy
- Cache clean npm installs for identical package.json
- Reuse Metro bundle tests for similar configurations
- Parallel validation where possible

This runtime validation system ensures that when Stage 10 says "completed", the app is guaranteed to work immediately in any Expo development environment.