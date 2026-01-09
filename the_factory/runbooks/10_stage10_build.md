# Stage 10: Mobile App Builder Rules

Stage 10 generates a complete Expo React Native application based on specifications from stages 01-09.

## Prerequisites

Before Stage 10 can execute:
- [ ] Stages 01-09 completed successfully
- [ ] All stage JSON files validate against schemas
- [ ] Stage status shows stages 01-09 as "completed"
- [ ] Write permissions to repository root (for /mobile directory)

## Stage 10 Execution Rules

### 1. Read Complete Specification
```
Read: runs/.../stages/stage01.json (market research & ideas)
Read: runs/.../stages/stage02.json (product specification)
Read: runs/.../stages/stage03.json (UX design)
Read: runs/.../stages/stage04.json (monetization)
Read: runs/.../stages/stage05.json (architecture)
Read: runs/.../stages/stage06.json (builder handoff)
Read: runs/.../stages/stage07.json (polish)
Read: runs/.../stages/stage08.json (brand)
Read: runs/.../stages/stage09.json (release)
```

### 2. Generate Stage 10 Plan
```
Create: runs/.../stages/stage10.json
Content: Small build plan (not file contents)
Schema: Plan schema with app structure, dependencies, build steps
Validate: Against stage10 plan schema
```

### 3. Create Mobile App Directory
```
Create: /mobile/ 
Create: /mobile/src/
Create: /mobile/src/screens/
Create: /mobile/src/components/  
Create: /mobile/src/services/
Create: /mobile/assets/
```

### 4. Generate Core Configuration
```
Write: /mobile/package.json (Expo dependencies)
Write: /mobile/app.json (Expo configuration)
Write: /mobile/babel.config.js (Babel setup)
Write: /mobile/App.js (Entry point)
```

### 5. Generate Source Code
```
Generate screens from UX specification (stage03.json)
Generate components from architecture (stage05.json)
Generate services (RevenueCat, storage, etc.)
Generate navigation setup
Generate styling and theme
```

### 6. Generate Documentation
```
Write: /mobile/README.md (Setup and run instructions)
Write: /mobile/.env.example (Environment template)
Include: RevenueCat configuration placeholders
Include: Build and deployment instructions
```

### 7. Validate Mobile App Structure
```
Verify: /mobile/package.json exists with required deps
Verify: /mobile/src/ contains substantial code
Verify: All screens from UX spec implemented
Verify: RevenueCat service integration exists
Verify: Navigation matches architecture
```

## Required Dependencies

package.json must include:
```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0", 
    "react-native": "0.81.5",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-elements": "^3.4.3",
    "react-native-purchases": "^7.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

## Required File Structure

```
/mobile/
├── package.json              # Expo project configuration
├── app.json                  # Expo app manifest
├── App.js                    # Main entry point
├── babel.config.js           # Babel configuration  
├── README.md                 # Setup instructions
├── .env.example              # Environment template
├── assets/                   # App assets
└── src/                      # Application source
    ├── screens/              # Screen components (from UX)
    │   ├── HomeScreen.js
    │   ├── PaywallScreen.js
    │   └── [other screens]
    ├── components/           # Reusable components
    │   ├── Button.js
    │   ├── Header.js
    │   └── [other components]
    ├── services/             # Business logic
    │   ├── purchases.js      # RevenueCat integration
    │   └── api.js
    ├── navigation/           # Navigation setup
    │   └── AppNavigator.js
    ├── utils/                # Utilities
    │   └── storage.js
    ├── styles/               # Styling
    │   └── theme.js
    └── types/                # TypeScript definitions
```

## Implementation Requirements

### RevenueCat Integration
```javascript
// src/services/purchases.js must exist with:
- Subscription product configuration
- Purchase flow implementation  
- Restore purchases functionality
- Subscription status checking
```

### Navigation Implementation
```javascript  
// src/navigation/AppNavigator.js must:
- Implement all screens from UX specification
- Handle authentication flows
- Include paywall integration
- Match architecture from stage05.json
```

### Screen Implementation
```javascript
// All screens from stage03.json UX specification must:
- Be implemented as React Native components
- Include proper styling and layout
- Handle user interactions
- Integrate with services and state management
```

## Stage 10 Success Criteria

Mark Stage 10 complete only when:

### JSON Plan Created
- [ ] `runs/.../stages/stage10.json` exists and validates
- [ ] Plan contains app structure, dependencies, build steps
- [ ] Execution log documents build process

### Mobile App Generated  
- [ ] `/mobile/` directory exists and is substantial
- [ ] `package.json` contains all required Expo dependencies
- [ ] `app.json` is valid Expo configuration
- [ ] `App.js` entry point exists and is functional

### Source Code Complete
- [ ] All screens from UX specification implemented
- [ ] RevenueCat service integration exists  
- [ ] Navigation setup matches architecture
- [ ] Components and utilities exist

### Documentation Complete
- [ ] `README.md` has clear setup instructions
- [ ] `.env.example` has RevenueCat placeholders
- [ ] Instructions for building and running app

### Validation Passes
- [ ] `npx expo install --check` would succeed (basic validation)
- [ ] No critical files missing
- [ ] Code structure follows React Native best practices

## Stage 10 Failure Modes

Common failures and recovery:

### Missing Prior Stages
```
Error: stage03.json not found (UX specification)
Fix: Run stages 01-09 first
Recovery: Cannot proceed without complete specifications
```

### Write Permission Issues
```
Error: Cannot create /mobile directory  
Fix: Check repository write permissions
Recovery: Ensure Claude has filesystem access
```

### Invalid Specifications
```
Error: UX specification missing screen definitions
Fix: Re-run stage 03 with proper screen specifications
Recovery: Validate all prior stage outputs
```

### Incomplete App Generation
```
Error: Generated app missing required screens
Fix: Review UX spec and regenerate missing components
Recovery: Verify all screens from stage03.json implemented
```

## Stage 10 JSON Schema

stage10.json is a PLAN only, not file contents:

```json
{
  "build_plan": {
    "app_name": "string",
    "expo_version": "string", 
    "dependencies": ["string"],
    "screens_to_implement": ["string"],
    "services_to_create": ["string"],
    "navigation_structure": {},
    "build_steps": ["string"]
  },
  "validation": {
    "all_screens_planned": "boolean",
    "revenuecat_integrated": "boolean", 
    "expo_configured": "boolean"
  }
}
```

**Critical**: stage10.json contains planning data only, not actual file contents.