# Stage 10: Build Validation Procedure

**Version**: 3.1  
**Status**: MANDATORY for all Stage 10 executions  
**Applies to**: Both pipeline and dream mode builds

## Overview

This document defines the comprehensive validation procedure that Stage 10 MUST execute after generating any Expo React Native app. These checks ensure every build is production-ready and compatible with current development tools.

## Pre-Validation Setup

### 1. Generate Build Structure
```bash
# Create build in correct location
builds/<idea_dir>/<build_id>/app/

# Generate core files
package.json (with SDK 54+ dependencies)
app.config.js (dynamic configuration)
build_meta.json (SDK tracking)
```

### 2. Initial File Structure Validation
```bash
# Verify required files exist
- package.json
- app.config.js (NOT app.json)
- .env.example
- App.js or app/_layout.tsx
- src/ directory structure
- assets/ directory
```

## Dependency Resolution Validation (CRITICAL)

### Step 1: Clean Install
```bash
cd builds/<idea_dir>/<build_id>/app/
rm -rf node_modules package-lock.json
npm install
```

**Success Criteria**: 
- Exit code 0
- No ERESOLVE dependency conflicts
- No missing peer dependency errors

**Common Failures & Auto-Fixes**:
- **ERESOLVE conflicts**: Use `npm install --legacy-peer-deps` 
- **Plugin errors**: Remove unsupported plugins from app.config.js
- **TypeScript version conflicts**: Use compatible versions (eslint@8.x with @typescript-eslint@6.x)

### Step 2: Expo Module Compatibility
```bash
npx expo install --check
```

**Success Criteria**:
- "Dependencies are up to date" message
- No module version warnings

**Auto-Fix on Failure**:
```bash
npx expo install --fix
```

### Step 3: Missing Peer Dependencies
```bash
# Common missing peers that MUST be auto-installed:
npx expo install react-native-safe-area-context react-native-screens
```

## Configuration Validation

### Step 4: App Configuration Check
**Requirements**:
- Use dynamic `app.config.js` ONLY (remove static `app.json`)
- Include all required Expo SDK 54+ configuration
- Proper bundle identifier format: `com.appfactory.<normalized-slug>`
- Valid plugin configuration (avoid unsupported plugins)

**Auto-Fixes**:
```javascript
// Remove problematic plugins
plugins: [
  "expo-router"  // Keep only supported plugins
]

// Ensure complete expo config
{
  expo: {
    name: "App Name",
    slug: "app-slug", 
    version: "1.0.0",
    ios: { bundleIdentifier: "com.appfactory.slug" },
    android: { package: "com.appfactory.slug" }
  }
}
```

## Comprehensive Health Check

### Step 5: Expo Doctor Validation
```bash
npx expo-doctor
```

**Success Criteria**: 
- "17/17 checks passed. No issues detected!"
- Exit code 0

**Auto-Fix Common Issues**:
- Remove `@types/react-native` package (deprecated)
- Install missing peer dependencies
- Fix app.json vs app.config.js conflicts
- Remove invalid plugin configurations

### Step 6: Build Metadata Generation
```json
{
  "expoSdkVersion": "54.0.0",
  "nodeVersion": "v22.x",
  "createdAt": "ISO timestamp",
  "buildId": "unique_hash",
  "validation": {
    "npmInstall": "passed",
    "expoCheck": "passed", 
    "expoDoctor": "passed",
    "peerDeps": "resolved"
  }
}
```

## TypeScript & Code Quality

### Step 7: TypeScript Compilation
```bash
npx tsc --noEmit
```

**Success Criteria**: No compilation errors

### Step 8: Basic Linting
```bash
npm run lint --if-present
```

**Success Criteria**: No critical linting errors

## Integration Testing

### Step 9: Expo Start Validation
```bash
# Test that expo can start without immediate crashes
timeout 30s npx expo start --non-interactive || true
```

**Success Criteria**: 
- Expo dev server starts
- No immediate crashes
- Metro bundler initializes

### Step 10: Bundle Analysis
```bash
# Verify app can be bundled
npx expo export --platform ios --clear --dev
```

**Success Criteria**: Bundle generation succeeds

## Failure Handling Protocol

### On Any Validation Failure:

1. **Document Failure**:
   ```markdown
   # Stage 10 Validation Failure
   
   **Build**: builds/<idea_dir>/<build_id>/app/
   **Failed Step**: [Step Name]
   **Error**: [Exact error message]
   **Exit Code**: [Number]
   **Timestamp**: [ISO date]
   
   ## Auto-Fix Attempts
   - [List all auto-fix attempts made]
   
   ## Manual Resolution Required
   - [Specific steps needed]
   ```

2. **Write Failure Files**:
   - `validation_failure.md` (detailed failure report)
   - `validation_results.json` (machine-readable status)
   - `build_incomplete.flag` (prevents false success claims)

3. **Stop Execution**:
   - DO NOT create `stage10.json`
   - DO NOT mark build as "completed"
   - Return clear error message with remediation steps

## Auto-Fix Library

### Common Dependency Issues
```bash
# SDK version mismatches
npx expo install --fix

# Missing peer dependencies  
npx expo install react-native-safe-area-context react-native-screens

# Plugin configuration errors
# Remove unsupported plugins from app.config.js

# TypeScript conflicts
# Use eslint@8.x with @typescript-eslint@6.x
```

### Configuration Fixes
```bash
# Remove conflicting static config
rm -f app.json

# Fix package.json issues
# Remove @types/react-native
# Use compatible dependency versions
```

## Success Criteria Summary

Stage 10 validation succeeds ONLY when ALL checks pass:

✅ **npm install** - No dependency conflicts  
✅ **expo install --check** - All modules compatible  
✅ **expo-doctor** - 17/17 checks passed  
✅ **TypeScript** - No compilation errors  
✅ **Configuration** - Valid app.config.js  
✅ **Bundle Test** - App can be bundled  
✅ **Metadata** - Build tracking generated  

## Implementation Notes

### Integration with Stage 10
- Run validation procedure AFTER app generation
- Include validation results in `stage10_build.log`
- Update `build_meta.json` with validation status
- Only proceed to stage completion if ALL validations pass

### Performance Optimization
- Cache npm installs when possible
- Run checks in parallel where safe
- Use timeouts for long-running operations
- Provide progress indicators for long validations

This comprehensive validation ensures every Stage 10 output is immediately usable and production-ready.