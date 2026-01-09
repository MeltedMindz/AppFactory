# Stage 10: Expo App Builder Procedure

Stage 10 generates a complete, runnable React Native Expo application based on specifications from stages 01-09. This stage is agent-native - Claude executes it directly without subprocess calls.

## Prerequisites

Before executing Stage 10, verify:
1. ✅ Stages 01-09 completed successfully  
2. ✅ All stage JSON files exist: `runs/.../stages/stage01.json` through `stage09.json`
3. ✅ Stage status shows all prior stages "completed"
4. ✅ Write permissions to repository root (for `/mobile` directory)

## Stage 10 Execution Steps

### 1. Read Complete App Specification
```
app_context = {
    market_research: read_json("runs/.../stages/stage01.json"),
    product_spec: read_json("runs/.../stages/stage02.json"), 
    ux_design: read_json("runs/.../stages/stage03.json"),
    monetization: read_json("runs/.../stages/stage04.json"),
    architecture: read_json("runs/.../stages/stage05.json"),
    builder_handoff: read_json("runs/.../stages/stage06.json"),
    polish: read_json("runs/.../stages/stage07.json"),
    brand: read_json("runs/.../stages/stage08.json"),
    release: read_json("runs/.../stages/stage09.json")
}
```

### 2. Generate Stage 10 Build Plan
```
stage10_plan = {
    app_name: extract_from(product_spec.name),
    bundle_id: generate_bundle_id(app_name),
    screens: extract_from(ux_design.screens),
    components: extract_from(architecture.components),
    navigation: extract_from(architecture.navigation),
    state_management: extract_from(architecture.state),
    monetization_config: extract_from(monetization.revenuecat),
    dependencies: compile_dependencies(all_stages),
    build_steps: define_build_sequence()
}

# Write the build plan
write("runs/.../stages/stage10.json", stage10_plan)
```

### 3. Create Mobile App Directory Structure
```
mobile_root = "/mobile"
create_directory(mobile_root)

subdirectories = [
    "/src",
    "/src/screens", 
    "/src/components",
    "/src/navigation",
    "/src/services",
    "/src/utils",
    "/src/styles",
    "/src/types",
    "/assets",
    "/assets/images",
    "/assets/icons"
]

FOR each dir in subdirectories:
    create_directory(mobile_root + dir)
```

### 4. Generate Core Configuration Files

#### package.json
```json
{
  "name": "{app_name}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android", 
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0", 
    "react-native-elements": "^3.4.3",
    "react-native-purchases": "^7.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-sqlite-storage": "^6.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  }
}
```

#### app.json
```json
{
  "expo": {
    "name": "{app_name}",
    "slug": "{app_slug}",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "{bundle_id}"
    },
    "android": {
      "package": "{bundle_id}"
    },
    "privacy": "public"
  }
}
```

### 5. Generate Source Code Files

#### App.js (Main Entry Point)
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from 'react-native-elements';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/styles/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

#### Navigation (AppNavigator.js)
```javascript
// Generate based on ux_design.screens and architecture.navigation
import { createStackNavigator } from '@react-navigation/stack';
// Import all screens from stage03 UX design
// Configure navigation flow per stage05 architecture
```

#### Screens
```
FOR each screen in ux_design.screens:
    generate_screen_component(
        name=screen.name,
        layout=screen.layout,
        functionality=screen.interactions,
        styling=brand.styles
    )
    write("/mobile/src/screens/" + screen.name + ".js", screen_content)
```

#### Components  
```
FOR each component in architecture.components:
    generate_reusable_component(
        name=component.name,
        props=component.interface,
        styling=brand.styles
    )
    write("/mobile/src/components/" + component.name + ".js", component_content)
```

#### Services
```
# RevenueCat Integration
generate_purchases_service(monetization.revenuecat_config)
write("/mobile/src/services/purchases.js", purchases_service)

# Storage Service  
generate_storage_service(architecture.data_persistence)
write("/mobile/src/utils/storage.js", storage_service)
```

### 6. Generate Documentation

#### README.md
```markdown
# {app_name}

{product_spec.description}

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Add your RevenueCat API keys
   ```

3. Start development server:
   ```bash
   npx expo start
   ```

## Features

{list features from product_spec}

## Monetization

This app uses RevenueCat for subscription management.
Configure your RevenueCat project and update the API keys in `.env`.

## Architecture

{architecture.overview}
```

#### .env.example
```
# RevenueCat Configuration
REVENUECAT_API_KEY_IOS=your_ios_api_key_here
REVENUECAT_API_KEY_ANDROID=your_android_api_key_here

# App Configuration
APP_VERSION=1.0.0
ENVIRONMENT=development
```

### 7. Write Build Execution Log
```
build_log = {
    timestamp: current_time(),
    stage: 10,
    app_name: stage10_plan.app_name,
    files_created: count_files_in("/mobile"),
    directory_structure: list_directory_tree("/mobile"),
    dependencies_count: count(stage10_plan.dependencies),
    screens_generated: count(stage10_plan.screens),
    components_generated: count(stage10_plan.components),
    validation_status: "pending"
}

write("runs/.../outputs/stage10_app_build.log", build_log)
```

### 8. Validate Generated App

#### Basic Structure Validation
```
required_files = [
    "/mobile/package.json",
    "/mobile/app.json",
    "/mobile/App.js", 
    "/mobile/src/navigation/AppNavigator.js",
    "/mobile/README.md",
    "/mobile/.env.example"
]

missing_files = []
FOR each file in required_files:
    IF NOT exists(file):
        missing_files.append(file)

IF missing_files.length > 0:
    FAIL with "Missing required files: " + missing_files
    STOP
```

#### Content Validation
```
package_json = read_json("/mobile/package.json")
IF NOT package_json.dependencies.expo:
    FAIL with "Missing Expo dependency in package.json"
    STOP

IF NOT package_json.dependencies["react-native-purchases"]:
    FAIL with "Missing RevenueCat dependency" 
    STOP
```

### 9. Update Stage Status
```
status = {
    stage: 10,
    status: "completed",
    completed_at: current_timestamp(),
    artifacts: [
        "runs/.../stages/stage10.json",
        "runs/.../outputs/stage10_app_build.log", 
        "/mobile (complete directory)"
    ],
    validation: {
        structure_check: "passed",
        dependency_check: "passed", 
        file_count: count_files_in("/mobile")
    }
}

update_stage_status(10, status)
```

## Verification Commands

After Stage 10 completion, these commands should work:

```bash
# Navigate to mobile app
cd /mobile

# Check Expo configuration
npx expo install --check

# Verify dependencies
npm list --depth=0

# Start development server
npx expo start

# Test iOS simulator (requires Xcode)
npx expo start --ios

# Test Android emulator (requires Android Studio)
npx expo start --android
```

## Success Criteria

Stage 10 is complete when:
- ✅ `stages/stage10.json` contains detailed build plan
- ✅ `/mobile` directory exists with complete Expo project
- ✅ `package.json` includes all required dependencies
- ✅ All screens from UX design are implemented  
- ✅ Navigation matches architecture specification
- ✅ RevenueCat integration is configured (keys in .env.example)
- ✅ `README.md` provides clear setup instructions
- ✅ `npx expo start` command would work (basic validation)
- ✅ Build log documents all created artifacts

## Failure Recovery

If Stage 10 fails:

1. **Check build log**: `runs/.../outputs/stage10_app_build.log`
2. **Verify dependencies**: Ensure stages 01-09 completed successfully
3. **Check permissions**: Verify write access to repository root
4. **Validate inputs**: Ensure all prior stage JSON files are valid
5. **Manual cleanup**: Remove partial `/mobile` directory if needed
6. **Retry**: Re-run Stage 10 after fixing issues

## Output File Structure

After successful Stage 10 execution:

```
/mobile/
├── package.json              # Expo project configuration
├── app.json                  # Expo app manifest
├── App.js                    # Main app entry point
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler config
├── README.md                 # Setup and run instructions
├── .env.example              # Environment variables template
├── assets/                   # App assets and images
│   ├── images/
│   └── icons/
└── src/                      # Application source code
    ├── screens/              # Screen components (from UX design)
    ├── components/           # Reusable UI components
    ├── navigation/           # Navigation configuration
    ├── services/             # Business logic services
    │   └── purchases.js      # RevenueCat integration
    ├── utils/                # Utility functions
    │   └── storage.js        # Local storage utilities
    ├── styles/               # Styling and themes
    │   └── theme.js          # App theme configuration
    └── types/                # TypeScript type definitions
```

This completes the Stage 10 Expo builder procedure with full agent-native execution by Claude.