# App Factory Leaderboard Dashboard

A read-only web dashboard that visualizes App Factory's global leaderboard with a clean, modern interface.

## 🚀 Quick Start

```bash
# Install dependencies
cd dashboard
npm install

# Sync latest leaderboard data
npm run sync

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## 📊 Features

### Leaderboard View
- **Real-time filtering**: Search by idea name, target user, or evidence
- **Multi-dimensional sorting**: Sort by score, rank, date, or idea name
- **Run filtering**: Filter by specific App Factory runs
- **Market filtering**: Filter by market category
- **Statistics overview**: Total entries, runs, unique ideas, and average scores
- **Responsive design**: Works on desktop and mobile devices
- **Dark theme**: Modern, easy-on-the-eyes interface

### Builds View
- **Build discovery**: Browse all completed React Native apps from pipeline and dream modes
- **Preview instructions**: Copy-friendly commands for running builds locally
- **Build metadata**: Status, creation date, origin mode, and build paths
- **Filtering & search**: Filter by mode, status, and search by name or build ID
- **Build statistics**: Success rates, mode distribution, and total build counts

## 🔄 Data Synchronization

The dashboard reads data from the main App Factory repository. To get the latest data:

```bash
npm run sync
```

This command syncs two data sources:
- **leaderboard.json**: Ideas ranked by performance (from `../leaderboards/app_factory_global.json`)
- **builds.json**: Completed React Native apps ready for preview (from `../builds/build_index.json`)

**Important**: Run this command whenever new ideas are generated or apps are built to see the latest results.

## 🔒 Isolation Guarantees

This dashboard is completely isolated from the main App Factory pipeline:

- **Read-only access**: Only reads leaderboard data, never modifies it
- **No coupling**: Does not import or depend on App Factory modules
- **Separate dependencies**: Has its own package.json and node_modules
- **Isolated directory**: Lives entirely within `dashboard/` folder
- **No pipeline integration**: Cannot trigger or interfere with App Factory commands

## 🏗️ Architecture

### Tech Stack
- **Vite**: Fast development server and build tool
- **React**: User interface framework
- **TypeScript**: Type safety and better developer experience
- **Lucide React**: Modern icon library
- **CSS3**: Custom styling with flexbox and grid

### Data Flow
1. **App Factory generates leaderboard data**: `leaderboards/app_factory_global.json`
2. **Stage 10 builds register themselves**: `builds/build_index.json` (via build registry)
3. **Sync script copies data**: `npm run sync` → `public/leaderboard.json` & `public/builds.json`  
4. **Dashboard fetches data**: React components load both data sources via HTTP
5. **User navigation**: Toggle between leaderboard (ideas) and builds (previewable apps)

### Components Structure
```
src/
├── App.tsx                      # Main app with navigation
├── lib/
│   ├── leaderboard.ts           # Leaderboard data processing
│   └── builds.ts                # Builds data processing  
├── components/
│   ├── LeaderboardPage.tsx      # Ideas leaderboard view
│   ├── BuildsPage.tsx           # Builds browser view
│   ├── BuildPreviewModal.tsx    # Build preview with copy commands
│   ├── BuildRedirectSection.tsx # Improved idea→build linking
│   ├── StatsCards.tsx           # Statistics summary cards
│   ├── FilterControls.tsx       # Search and filter controls
│   ├── LeaderboardTable.tsx     # Main leaderboard table
│   └── DetailModal.tsx          # Idea details modal
└── styles.css                   # Global styles and theme
```

## 🎨 UI/UX Design

The dashboard follows modern leaderboard design patterns:

- **Clean hierarchy**: Clear visual distinction between elements
- **Scannable layout**: Easy to quickly find and compare entries
- **Color coding**: Score badges and rank indicators for quick assessment
- **Responsive tables**: Horizontal scrolling on mobile devices
- **Contextual information**: Evidence quotes and core loops for insight

## 📋 Available Scripts

- `npm run dev` - Start development server with both frontend and backend
- `npm run dev:frontend` - Start only the frontend (Vite) server
- `npm run dev:backend` - Start only the backend (Express) server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run sync` - Sync leaderboard and builds data from main repository

## 🚀 Local Preview Execution

The dashboard includes a local execution system for previewing builds directly from the interface:

### Setup
```bash
# Enable local execution (localhost only for security)
export DASHBOARD_ENABLE_LOCAL_EXEC=1

# Start development with both frontend and backend
npm run dev
```

### Architecture
- **Separate Backend**: Express server on port 5174 handles local execution
- **Frontend**: React app on port 5173 communicates with backend
- **Security**: Localhost-only access with path validation and environment gating
- **Process Management**: Automated npm install, Expo setup, and dev server lifecycle

### Features
- **One-click preview**: Launch Expo dev server directly from build modal
- **Real-time logs**: Live streaming of npm and Expo output via Server-Sent Events
- **Intelligent fixups**: Automatic bundle identifier generation for incomplete builds
- **Platform hints**: iOS/Android readiness detection and simulator integration
- **Session management**: Track active preview sessions with proper cleanup

### iOS Simulator Integration

The system includes advanced iOS Simulator integration for seamless development:

#### How It Works  
1. **"Setup iOS Connection"** ensures Metro is ready + provides manual connection instructions
2. **Automatic Configuration**: Bundle identifiers are generated deterministically  
3. **Manual Connection**: Prevents port conflicts by avoiding ALL automatic behaviors
4. **Process Management**: Single Metro instance with no automated process spawning

#### Connection Method
- **Manual URL Entry**: `exp://127.0.0.1:{port}` (entered in Expo Go app)
- **Prevents Conflicts**: Avoids automatic deep link launching that triggers multiple Metro processes

#### Requirements
- **Xcode**: Must be installed with iOS Simulator
- **Expo CLI**: Automatically uses latest `@expo/cli` via npx
- **Dev Environment**: Works with both development builds and Expo Go

### Troubleshooting

#### Local Execution Issues
- **"Local execution is disabled"**: Set `DASHBOARD_ENABLE_LOCAL_EXEC=1`
- **Backend connection errors**: Ensure both frontend (5173) and backend (5174) are running  
- **Node.js module errors**: Use the separate backend architecture to avoid Vite bundling issues

#### iOS Simulator Issues  
- **"iOS Simulator boot failed"**: Ensure Xcode and iOS Simulator are properly installed
- **"Bundle identifier required"**: The system auto-generates bundle IDs, check logs for details
- **Connection issues**: Follow the manual connection steps provided in the live logs
- **Metro connection timeout**: Check that port is not blocked by firewall

#### Build Path Issues
- **"Invalid project root"**: System automatically fixes `/build` suffix errors
- **"Missing package.json"**: Ensure the build completed successfully in pipeline/dream mode
- **Path validation errors**: All builds must be under `builds/` directory for security

#### Port Conflicts
- **"Port already in use"**: System automatically finds available ports in range 8081-8101 or 19000-19020
- **Interactive prompts**: All Expo commands use `--non-interactive` flag to prevent blocking prompts

## 🏗️ Build Registry System

Dream-mode apps can be launched from the dashboard even if they never appear in the leaderboard.

### Registry Structure
- **Source of Truth**: `../builds/build_index.json` - deterministic registry independent of leaderboard
- **Dashboard Copy**: `public/builds.json` - synced automatically by `npm run sync`
- **Registration**: Stage 10 auto-registers builds upon completion (both success and failure)

### Build Discovery
- **Separate Page**: `/builds` route distinct from leaderboard 
- **"View Builds" Button**: Top-level navigation from leaderboard header
- **Preview Modal**: Copyable terminal commands (no shell execution from browser)
- **Mode Support**: Both pipeline and dream builds appear in builds list

### Build vs Idea Relationship
- **leaderboard.json**: App ideas ranked by market research and evidence
- **builds.json**: Previewable builds (apps that were actually generated)
- **Independence**: Dream builds bypass leaderboard but are fully discoverable in builds view

## 🔧 Configuration

The dashboard is pre-configured for optimal performance:

- **Hot reload**: Instant updates during development
- **TypeScript**: Strict type checking enabled
- **Source maps**: For debugging in production
- **Modern target**: Optimized for current browsers

## 🐛 Troubleshooting

### "Failed to load leaderboard" Error
1. Make sure you've run `npm run sync` to copy the data
2. Verify that `../leaderboards/app_factory_all_time.json` exists
3. Check that you're running the command from the `dashboard/` directory

### No Data Showing
1. Ensure the main App Factory has been run at least once
2. Check browser dev tools network tab for fetch errors
3. Verify the JSON format matches the expected schema

### Development Server Issues
1. Make sure you're using Node.js 20+ or 22+
2. Delete `node_modules` and run `npm install` again
3. Check that port 5173 isn't being used by another process

## 🎯 Inspiration & References

This dashboard design was inspired by:

- **GitHub Topics**: Modern leaderboard patterns and ranking systems
- **Dribbble/Behance**: Clean dashboard layouts and dark theme aesthetics  
- **Open Source Projects**: CTF scoreboards, gaming leaderboards, and ML evaluation dashboards
- **Modern Web Design**: Material Design principles and contemporary UI patterns

The implementation prioritizes clarity, performance, and user experience while maintaining complete isolation from the main App Factory system.