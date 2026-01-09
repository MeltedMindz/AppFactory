# App Factory

**AI-Native Mobile App Development Pipeline**

App Factory is an end-to-end system that researches markets, generates validated app ideas, designs UX/monetization/brand, produces launch-ready specifications, and builds complete React Native mobile apps. Claude executes all stages directly within this repository without subprocess calls or hand-holding.

## 🚀 Quick Start

### Generate 10 Ranked App Ideas
```bash
run app factory
```

This executes Stage 01 market research and generates 10 ranked mobile app ideas in the "idea bin" for selective building.

### Build a Selected App
```bash
build <IDEA_ID_OR_NAME>
```

This builds ONE selected idea from the idea bin into a complete, store-ready Expo React Native app.

### Transform Raw Idea to Store-Ready App
```bash
dream <IDEA_TEXT>
```

This transforms a raw app idea into a complete, store-ready Expo React Native app via end-to-end pipeline execution (Stages 01-10).

## 📱 What App Factory Builds

App Factory creates **subscription-based React Native mobile apps** with:

- **Expo framework** for cross-platform iOS/Android deployment
- **RevenueCat integration** for subscription management
- **Production-ready screens** including onboarding, paywall, settings
- **Store submission ready** with ASO metadata and launch planning
- **Offline-first architecture** with minimal backend dependencies

## 🏗️ Pipeline Architecture

### Core Stages

1. **Stage 01: Market Research** - Generates 10 ranked app ideas
2. **Stages 02-09: Specification** - Product spec, UX, monetization, architecture, handoff, polish, brand, release planning  
3. **Stage 10: Mobile App Generation** - Complete Expo React Native app

### Execution Modes

- **Idea Generation** (`run app factory`) - Stage 01 only, creates idea bin
- **Selective Building** (`build <idea>`) - Stages 02-10 for chosen idea
- **End-to-End** (`dream <idea>`) - Stages 01-10 in single execution

## 📊 Global Leaderboard

App Factory maintains a cross-run leaderboard of all generated app ideas for:
- Long-term idea quality tracking
- Analytics and trend analysis  
- External tool integration
- Discovery surface for promising concepts

## 🎯 App Complexity Bias

App Factory favors **simple, profitable mobile apps**:

✅ **Prioritized Apps**:
- Client-side or offline-first
- Minimal backend dependencies
- Low ongoing operational costs
- Clear subscription value proposition
- Simple data models

❌ **Deprioritized Apps**:
- Heavy backend infrastructure
- Complex AI/ML requirements
- High operational costs
- Unclear monetization

## 📂 Directory Structure

```
the_factory/
├── CLAUDE.md                     # App Factory control plane
├── README.md                     # This file
├── templates/                    # Stage execution templates
├── schemas/                      # JSON validation schemas
├── runs/                         # Generated pipeline outputs
├── builds/                       # Built React Native apps
├── leaderboards/                 # Global idea rankings
├── standards/                    # Quality guidelines
├── scripts/                      # Utility scripts
└── appfactory/                   # Core Python modules
```

## ⚡ Technology Stack

- **Mobile Framework**: React Native with Expo SDK 54+
- **Language**: TypeScript for type safety
- **Monetization**: RevenueCat for subscriptions
- **Navigation**: Expo Router file-based navigation
- **Storage**: AsyncStorage for local data
- **Deployment**: App Store + Google Play submission ready

## 🔒 Isolation

App Factory operates in complete isolation from Web3 Factory:
- Separate directory structure (`/the_factory/` vs `/web3-factory/`)
- Separate technology stacks (React Native vs Web Apps)  
- Separate monetization models (subscriptions vs tokens)
- No shared execution state or data

## 📱 Hardened Live Preview System

App Factory includes a **production-ready, hardened preview system** for reliable, seamless, and Expo-best-practices compliant local app testing.

### 🎯 **System Overview**

The hardened preview system provides:
- **Reliable Build Discovery**: Automatic detection and comprehensive validation of Expo apps
- **Enhanced UI**: Improved build selection with real-time health status and validation warnings
- **iOS Simulator Integration**: Full macOS simulator support with device detection and management
- **Environment Management**: Complete .env support with proper EXPO_PUBLIC_ prefix handling
- **Health Monitoring**: Security, performance, and configuration validation
- **API Integration**: RESTful endpoints for programmatic access and CI/CD integration

### 🚀 **Quick Start**

#### Start Preview Server
```bash
cd preview
npm install
npm start
```

#### Access Enhanced Dashboard
```
http://localhost:3000
```

The dashboard now provides:
- **Smart Build Selection**: Dropdown with auto-detection of matching builds for current idea
- **Validation Warnings**: Real-time display of build health issues
- **Build Path Display**: Clear indication of selected build location
- **Enhanced Status**: Improved session monitoring with detailed error reporting

### 🔧 **Hardening Improvements**

#### **Reliability & Correctness**
- ✅ **Comprehensive Build Validation**: Validates package.json, app.json, dependencies, and Expo configuration
- ✅ **Automatic Port Management**: Detects and resolves port conflicts automatically
- ✅ **Enhanced Error Handling**: Clear error messages with specific troubleshooting guidance
- ✅ **Build Structure Verification**: Supports nested builds and complex directory structures

#### **Expo Best Practices Compliance**
- ✅ **Modern Expo CLI**: Uses `npx expo` instead of global CLI for consistency
- ✅ **Monorepo Support**: Proper `EXPO_USE_METRO_WORKSPACE_ROOT` configuration
- ✅ **Environment Variables**: Correct `EXPO_PUBLIC_` prefix handling for client-side variables
- ✅ **Platform-Specific Targeting**: Proper iOS/Android/web platform argument handling

#### **Enhanced User Experience**
- ✅ **Smart Build Discovery**: Automatic detection with real-time validation status
- ✅ **Improved UI**: Enhanced build selection with dropdowns and health indicators
- ✅ **Clear Status Display**: Real-time session monitoring with detailed progress
- ✅ **Comprehensive Documentation**: Step-by-step guides with troubleshooting

### 📱 **iOS Simulator Integration** (macOS only)

#### Automatic Detection & Setup
```bash
# System automatically detects available simulators
node scripts/preview/launch_preview.js builds/myapp --platform ios

# View available iOS simulators
xcrun simctl list devices iOS available

# Boot specific simulator
xcrun simctl boot "iPhone 16 Pro"
```

#### Environment-Driven Configuration
```bash
# Set preferred simulator device
export EXPO_IOS_SIMULATOR_DEVICE_NAME="iPhone 16 Pro"

# Launch with iOS-specific settings
EXPO_IOS_SIMULATOR_DEPLOYMENT_TARGET="13.0" node scripts/preview/launch_preview.js builds/myapp --platform ios
```

### 🛡️ **Comprehensive Health Checks**

#### Security Validation
- **Sensitive File Detection**: Scans for .env files, secrets, and credentials
- **Hardcoded Secret Detection**: Identifies API keys and tokens in source code
- **npm Audit Integration**: Automatic vulnerability scanning when available

#### Performance Analysis
- **Bundle Size Monitoring**: Dependency count analysis and size recommendations
- **Code Pattern Detection**: Identifies performance anti-patterns (console.log, debuggers)
- **Optimization Suggestions**: Actionable recommendations for improved performance

#### Configuration Validation
- **Expo Setup Verification**: SDK version, platform support, and plugin configuration
- **Dependency Compatibility**: Required vs recommended package validation
- **Build Requirements**: File structure and script validation

### 🔌 **API Integration**

#### RESTful Endpoints
```bash
# Build discovery and validation
GET    /builds                    # List all discovered builds with validation status
POST   /builds/validate          # Quick Expo build validation
POST   /builds/health-check       # Comprehensive health analysis
POST   /builds/batch-health       # Health check multiple builds

# Preview session management  
GET    /sessions                  # Get current session status
POST   /sessions/start           # Launch preview session
POST   /sessions/stop            # Stop current session
GET    /health                   # Server health check
```

#### CI/CD Integration
```bash
# Automated build validation in CI
node scripts/preview/validate_build.js builds/myapp --json --quiet

# Exit codes:
# 0 = Build is valid and ready for deployment
# 1 = Build has errors that must be fixed
# 2 = Validation process failed
```

### 🛠️ **Advanced Usage**

#### Environment Configuration
```bash
# Copy and customize environment template
cp preview/.env.example preview/.env

# App-specific variables
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_REVENUECAT_API_KEY=your_key_here

# iOS-specific settings
EXPO_IOS_SIMULATOR_DEVICE_NAME="iPhone 16 Pro"
EXPO_IOS_SIMULATOR_DEPLOYMENT_TARGET="13.0"

# Preview server configuration
PREVIEW_PORT=3456
BUILDS_DIRECTORY=builds
MAX_BUILD_SCAN_DEPTH=3
```

#### Command Line Usage
```bash
# Basic preview launch
node scripts/preview/launch_preview.js builds/myapp

# iOS-specific with custom simulator
EXPO_IOS_SIMULATOR_DEVICE_NAME="iPhone 16 Pro" \
node scripts/preview/launch_preview.js builds/myapp --platform ios --clear

# Comprehensive health check with JSON output
node scripts/preview/validate_build.js builds/myapp --json > health_report.json

# Batch validation for multiple builds
find builds/ -name "app.json" -exec dirname {} \; | \
xargs -I {} node scripts/preview/validate_build.js {} --quiet
```

### 🚨 **Troubleshooting**

#### Build Discovery Issues
```bash
# Build not found or invalid
✅ Ensure app is in builds/ directory
✅ Verify package.json and app.json exist
✅ Check Expo dependencies are installed
✅ Run: node scripts/preview/validate_build.js builds/myapp
```

#### iOS Simulator Issues
```bash
# Simulator not detected
✅ Install Xcode from App Store
✅ Install iOS simulators: Xcode > Preferences > Components
✅ Verify installation: xcrun simctl list devices iOS available
✅ Boot simulator: xcrun simctl boot "iPhone 16 Pro"
```

#### Environment & Configuration
```bash
# Environment variables not working
✅ Use EXPO_PUBLIC_ prefix for client-side variables
✅ Restart Metro bundler after .env changes
✅ Check .env file syntax and quotes
✅ Verify file permissions on .env files
```

#### Performance Issues
```bash
# Slow preview or high resource usage
✅ Clear Metro cache: --clear flag
✅ Check bundle size: validate_build.js for analysis
✅ Monitor system resources during preview
✅ Use --offline flag for network-independent testing
```

### 📚 **Documentation**

- **Complete iOS Setup**: [`docs/ios_simulator_guide.md`](docs/ios_simulator_guide.md)
- **Build Validation Reference**: `scripts/preview/validate_build.js --help`
- **Preview Launch Options**: `scripts/preview/launch_preview.js --help`
- **Environment Variables**: `preview/.env.example`

## 📋 Validation & Status

### Check Pipeline Status
```bash
show status
```

### Validate Run Integrity  
```bash
validate run
```

### Validate Built App
```bash
node scripts/preview/validate_build.js builds/myapp
```

## 🎪 Examples

### Generate Ideas for Productivity Apps
```bash
run app factory
# Creates 10 ranked productivity app ideas in idea bin
```

### Build Top-Ranked Idea
```bash
build focus_flow_ai
# Builds complete FocusFlow AI app with subscription paywall
```

### One-Shot App Creation
```bash
dream "A habit tracker that uses AI to suggest personalized habit stacks based on your goals and past behavior"
# Creates complete habit tracking app from raw idea
```

## 🚦 Success Criteria

A successful App Factory execution produces:
- ✅ Validated mobile app concept with market evidence
- ✅ Complete React Native Expo project
- ✅ RevenueCat subscription integration
- ✅ Production-ready screens and navigation
- ✅ Store submission package (metadata, screenshots, descriptions)
- ✅ Launch planning and go-to-market strategy

## 📖 Learn More

- Read `CLAUDE.md` for complete pipeline specifications
- Explore `templates/agents/` for stage execution details
- Check `schemas/` for JSON validation requirements
- Review `standards/` for quality guidelines

## 🏆 **System Status**

### **Preview System: Production Ready ✅**

The App Factory Build Preview System has been **fully hardened** and is production-ready with:

- ✅ **Comprehensive Validation** - Security, performance, and configuration checks
- ✅ **Expo Best Practices** - Modern CLI usage, monorepo support, proper environment handling
- ✅ **Enhanced Reliability** - Automatic error recovery, port management, build discovery
- ✅ **iOS Integration** - Full simulator support with device detection and management
- ✅ **Developer Experience** - Improved UI, clear documentation, troubleshooting guides
- ✅ **API Ready** - RESTful endpoints for automation and CI/CD integration

## 🖥️ Local Execution System

App Factory now includes an **integrated local execution system** within the dashboard for seamless one-click build previews.

### 🎯 **Overview**

The local execution system provides:
- **One-Click Launch**: Start Expo dev server directly from dashboard build preview modal
- **Real-Time Logs**: Live streaming of npm install, Expo setup, and bundler output
- **Automatic Fixups**: Intelligent preflight repairs for missing bundle identifiers and configuration
- **Security-First**: Localhost-only execution with comprehensive validation and sandboxing
- **Status Monitoring**: Live session tracking with platform readiness indicators

### 🚀 **Quick Start**

#### Enable Local Execution
```bash
# Enable local execution (localhost-only for security)
export DASHBOARD_ENABLE_LOCAL_EXEC=1

cd dashboard
npm run dev
```

#### Launch Build Previews
1. Open dashboard at `http://localhost:5173`
2. Navigate to builds page
3. Click "Preview Build" on any build
4. Click "Launch Preview" in the modal
5. iOS simulator launches automatically when ready

### 🔧 **Features**

#### **Intelligent Build Automation**
- ✅ **Automatic Dependency Resolution**: Uses `npx expo install` for compatibility
- ✅ **Bundle Identifier Fixups**: Generates deterministic IDs for missing configurations  
- ✅ **Port Management**: Intelligent port selection and conflict resolution
- ✅ **Platform Detection**: iOS/Android readiness monitoring

#### **Real-Time Experience**
- ✅ **Live Log Streaming**: See npm install, Metro bundler, and Expo CLI output
- ✅ **Status Indicators**: Running/stopped states with session management
- ✅ **Progress Tracking**: Visual feedback for all execution phases
- ✅ **Error Handling**: Clear error messages with actionable troubleshooting

#### **Security & Isolation**
- ✅ **Localhost-Only**: IP validation prevents external access
- ✅ **Path Sandboxing**: Execution limited to builds/ directory
- ✅ **Environment Flag**: Explicit opt-in via `DASHBOARD_ENABLE_LOCAL_EXEC=1`
- ✅ **Process Management**: Automatic cleanup and resource monitoring

### 🛡️ **Security Model**

#### Execution Constraints
```javascript
// Localhost-only validation
const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

// Path sandboxing
const buildsDir = resolve(repoRoot, 'builds');
const buildPath = validateBuildPath(requestedPath, buildsDir);

// Explicit enable check  
if (process.env.DASHBOARD_ENABLE_LOCAL_EXEC !== '1') {
  throw new Error('Local execution disabled');
}
```

#### Process Safety
- **Working Directory**: Restricted to specific build directories
- **Command Whitelist**: Only approved Expo/npm commands executed
- **Timeout Protection**: Automatic termination of long-running processes
- **Resource Monitoring**: Memory and CPU usage tracking

### 🔌 **API Endpoints**

#### Local Execution API
```bash
# Get preview status
GET    /api/preview/status

# Start build preview  
POST   /api/preview/start
Body:  { "buildId": "dream_abc123_def456" }

# Stop current preview
POST   /api/preview/stop

# iOS simulator launch
POST   /api/preview/open/ios

# Reset Metro bundler
POST   /api/preview/reset-watchman

# Live log streaming
GET    /api/preview/logs  (Server-Sent Events)
```

### 📱 **iOS Integration**

#### Automatic Simulator Launch
```bash
# Automatic detection and launch when iOS platform is ready
# Uses xcrun simctl for device management
# Supports environment-based device selection

export EXPO_IOS_SIMULATOR_DEVICE_NAME="iPhone 16 Pro"
```

### 🚨 **Troubleshooting**

#### Local Execution Issues
```bash
# Local execution not available
✅ Set DASHBOARD_ENABLE_LOCAL_EXEC=1 in environment
✅ Ensure dashboard is running on localhost
✅ Check build exists in builds/ directory
✅ Verify Expo CLI is available: npx expo --version
```

#### Build Launch Failures
```bash
# Build fails to start
✅ Check build directory has package.json and app.json
✅ Run npm install manually in build directory
✅ Verify bundle identifier in app.json is valid
✅ Reset Metro cache with "Reset Watchman" button
```

### **Key Files Added/Updated**
- 📄 `docs/ios_simulator_guide.md` - Comprehensive iOS setup guide
- 📄 `scripts/preview/validate_build.js` - Build health validation
- 📄 `scripts/preview/launch_preview.js` - Enhanced with iOS support
- 📄 `preview/src/server.js` - Added health check endpoints
- 📄 `dashboard/src/components/LivePreview.tsx` - Enhanced UI
- 📄 `dashboard/server/previewService.ts` - Local execution backend
- 📄 `dashboard/src/lib/previewAPI.ts` - Client API integration
- 📄 `dashboard/src/components/BuildPreviewModal.tsx` - Local execution UI
- 📄 `dashboard/vite.config.ts` - API middleware integration
- 📄 `preview/.env.example` - Environment configuration template

### **Testing Status**
- ✅ All scripts syntax validated
- ✅ Build discovery functioning correctly (3 builds detected)
- ✅ Validation system working (detected issues in test build)
- ✅ iOS simulator detection operational (11 simulators found)
- ✅ API endpoints integrated successfully
- ✅ Documentation comprehensive and up-to-date

---

**App Factory**: Transform ideas into store-ready mobile apps through AI-native development.

*Preview System: Hardened, reliable, and production-ready for seamless local app testing.*