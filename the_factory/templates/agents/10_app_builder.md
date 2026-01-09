# Stage 10: Mobile App Generation (Direct Build)

## AGENT-NATIVE EXECUTION
You are Claude executing Stage 10 for a SPECIFIC IDEA PACK. Build a complete, production-ready Expo React Native app directly from the idea's specifications with strict isolation.

## BUILD MODE VERIFICATION (CRITICAL)
Stage 10 can be executed via `build <IDEA_ID_OR_NAME>` command OR `dream <IDEA_TEXT>` command:
- For build mode: Verify invocation came from build mode, not `run app factory`
- For dream mode: Verify complete end-to-end execution from dream stage 01
- Require Stage 01-09 artifacts exist (hard-fail if missing)
- Assert this stage is building ONE SPECIFIC IDEA only
- NO looping, NO batch processing, SINGLE IDEA CONTEXT ONLY

## STANDARDS CONTRACT (MANDATORY)
Read and comply with `standards/mobile_app_best_practices_2026.md`. Your implementation must demonstrate complete adherence to all subscription, accessibility, security, and technical requirements.

## SPEC EXHAUSTION RULE (MANDATORY)

Before generating ANY code, Stage 10 MUST:

1) **Load and parse ALL available artifacts** for the selected idea:
   - Stage 02: Product spec
   - Stage 03: UX flows and IA
   - Stage 04: Monetization
   - Stage 05: Architecture
   - Stage 06: Builder handoff
   - Stage 07: Polish
   - Stage 08: Brand
   - Stage 09: Launch/Store readiness (if present)

2) **Construct an internal "Build Plan"** that maps:
   - Each feature → source stage(s)
   - Each screen → Stage 03 UX definition
   - Each monetization rule → Stage 04
   - Each architectural choice → Stage 05
   - Each non-functional requirement → Stage 06/07
   - Each visual decision → Stage 08

This plan does NOT need to be output, but MUST be followed.

**BINDING SPECIFICATION PRINCIPLE**: 
The entire purpose of running Stages 01–09 is to maximize the information available to Stage 10.
Stage 10 MUST treat Stages 01–09 artifacts as binding constraints and MUST implement them.
If a field is present in Stages 02–09, Stage 10 must either (a) implement it, or (b) write a short 'implementation_exception.md' into the build explaining why it was not implemented.
No silent skipping.

**FORBIDDEN BEHAVIORS**:
- Using generic Expo starter patterns
- Using default navigation layouts if Stage 03 defines screens
- Inventing features already specified upstream
- Omitting features "for simplicity" if they are defined in prior stages

If Stage 10 cannot implement something as specified, it MUST:
- Fail the build
- Write a clear explanation of what could not be implemented and why

## DIRECT SPECIFICATION CONSUMPTION (MANDATORY INPUT)
**MUST read ONLY from this idea pack's stage artifacts:**
- Read: `runs/.../ideas/<idea_dir>/meta/idea.json` (canonical idea definition)
- Read: `runs/.../ideas/<idea_dir>/meta/boundary.json` (verify isolation)
- Read: `runs/.../ideas/<idea_dir>/stages/stage02.json` (product specifications)
- Read: `runs/.../ideas/<idea_dir>/stages/stage03.json` (UX design and wireframes)
- Read: `runs/.../ideas/<idea_dir>/stages/stage04.json` (monetization and RevenueCat)
- Read: `runs/.../ideas/<idea_dir>/stages/stage05.json` (technical architecture)
- Read: `runs/.../ideas/<idea_dir>/stages/stage06.json` (builder handoff priorities)
- Read: `runs/.../ideas/<idea_dir>/stages/stage07.json` (quality and polish requirements)
- Read: `runs/.../ideas/<idea_dir>/stages/stage08.json` (brand identity and visual design)
- Read: `runs/.../ideas/<idea_dir>/stages/stage09.json` (ASO package and launch planning)

**For Dream Mode executions:**
- Also read: `runs/.../stage01_dream/stages/stage01_dream.json` (original validated idea)
- Also read: `runs/.../inputs/dream_intake.md` (raw user idea for context)

**BOUNDARY VALIDATION**: 
- Verify all stage JSONs have identical run_id, idea_id, and idea_dir
- Verify all input_stage_paths are within the correct idea pack directory
- **If boundary violations detected**: write `stage10_failure.md` and stop immediately

## OUTPUTS
- Write: `runs/.../ideas/<idea_dir>/stages/stage10.json` (build plan with mapping proof)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage10_build.log` (complete binding proof)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage10_research.md` (sources consulted)
- Render: `runs/.../ideas/<idea_dir>/spec/10_mobile_app.md` (app specification)
- **Create: Complete Expo App** (MANDATORY):
  - `builds/<idea_dir>/<build_id>/app/` (complete Expo React Native app)
  - `builds/<idea_dir>/<build_id>/build_log.md` (execution log)
  - `builds/<idea_dir>/<build_id>/sources.md` (research citations)

## VENDOR DOCS FIRST (MANDATORY)
Use vendor/ cached llms.txt as the primary source before any web searching.

### Required Research Sources (IN ORDER)
**Primary Sources** (Use FIRST):
1. **Expo Documentation**: Read `the_factory/vendor/expo-docs/llms.txt`
   - Use cached docs for Expo Router v4 navigation patterns and file-based routing
   - Reference latest Expo SDK features, configuration, and best practices
   - Reference React Native integration patterns and development workflow
   - Only web search docs.expo.dev if cached docs are insufficient

2. **RevenueCat Documentation**: Read `the_factory/vendor/revenuecat-docs/llms.txt`
   - Use cached docs for React Native/Expo integration and subscription flows
   - Reference entitlements, offerings, purchase flow, and restore patterns
   - Reference configuration, error handling, and testing approaches
   - Only web search revenuecat.com if cached docs are insufficient

**Secondary Sources** (After vendor docs):
3. **SQLite/Expo SQLite docs** - local database setup and migrations
4. **Category-specific patterns** - search for relevant open-source Expo app examples

Do not perform exploratory web searches until vendor docs are consulted.
If web search is required, restrict to official domains (docs.expo.dev, revenuecat.com).

Research constraints:
- Use official documentation as authoritative source
- Translate patterns into implementation decisions, don't copy code directly
- Document how research influenced specific architectural choices
- Cite all sources with URLs, dates accessed, and brief relevance notes

## UI/UX DESIGN CONTRACT GENERATION (MANDATORY)

### Visual Personality Analysis
Before generating any code, Stage 10 MUST analyze the app's specifications to determine its visual personality:

1. **Domain Analysis**: Read Stage 02 product spec to understand app category:
   - Paranormal tools → forensic, eerie, instrument-like
   - Productivity → clean, focused, efficient
   - Health/fitness → energetic, motivating, data-driven
   - Creative tools → expressive, flexible, inspiring
   - Education → approachable, clear, encouraging

2. **User Context Analysis**: Read Stage 03 UX flows to understand user mindset:
   - Professional use → utilitarian, trustworthy, detailed
   - Casual use → friendly, accessible, forgiving
   - Emergency/crisis use → urgent, clear, minimal cognitive load

3. **Mood Inference**: Combine domain + user context to choose design archetype:
   - "Forensic Instrument Panel" (EVP/paranormal tools)
   - "Calm Productivity Hub" (focus/task apps)
   - "Energetic Tracker" (fitness/habit apps)
   - "Creative Canvas" (design/creative tools)

### UI/UX Prompt Generation (MANDATORY OUTPUT)
Stage 10 MUST generate app-specific design contract:

**Required Files**:
- `builds/<idea_dir>/<build_id>/uiux/uiux_prompt.md`
- `builds/<idea_dir>/<build_id>/uiux/style_brief.json`

**uiux_prompt.md Structure** (MUST match exactly):
```markdown
<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate a design system into an existing codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack (React Native + Expo, and whether Expo Router is used).
- Understand existing design tokens (colors, spacing, typography, radii, shadows), global styles, and utility patterns.
- Review component architecture and naming conventions.
- Note constraints (performance, bundle size, Expo SDK limitations, accessibility).

Do NOT ask the user questions. Use the provided app spec to infer the best UI direction.

Then do the following:
- Propose a concise implementation plan:
  - centralize design tokens,
  - reusable components,
  - avoid one-off styles,
  - maintainability and clear naming.
- When writing code, match existing patterns (folder structure, naming, styling approach).
- Explain reasoning briefly inline in comments only (no long essays).

Always aim to:
- Preserve or improve accessibility.
- Maintain strong visual consistency.
- Ensure layouts are responsive.
- Make deliberate design choices that fit the app's personality (not generic UI).
</role>

<design-system>
# Design Philosophy
[CUSTOM to app domain - e.g. "Professional forensic instrument interface with atmospheric dark theming"]

# Design Token System
## Colors
[FULL PALETTE: background/foreground/primary/secondary/muted/accent/error/border]
[MUST MATCH APP: e.g. EVP app = eerie, forensic, night-ops colors]

## Typography
[React Native/Expo compatible fonts; define sizes and usage rules]

## Radius & Borders
[define border radius values and usage patterns]

## Shadows & Effects
[define shadow values and when to use]

# Component Stylings
## Buttons
[define button variants and styling rules]

## Cards
[define card elevation and content patterns]

## Inputs
[define input styling and states]

## Navigation
[define navigation styling and behavior]

# Layout Strategy
[define grid system and spacing patterns]

# Non-Genericness
[what makes this design specific to this app's domain]

# Effects & Animation
[purposeful motion design rules]

# Iconography
[icon style and usage guidelines]

# Responsive Strategy
[mobile-first responsive behavior]

# Accessibility
[minimum contrast, touch target, and focus management standards]
</design-system>
```

**style_brief.json Structure**:
```json
{
  "appName": "[from Stage 08 brand]",
  "slug": "[from Stage 08 brand]",
  "genre": "[app category - e.g. paranormal tooling, micro-productivity, journaling]",
  "moodKeywords": ["[domain-specific]", "[atmosphere]", "[style keywords]"],
  "designArchetype": "[e.g. 'Forensic Instrument Panel', 'Calm Productivity Hub']",
  "palette": {
    "bg": "[hex color]",
    "fg": "[hex color]", 
    "primary": "[hex color]",
    "accent": "[hex color]",
    "error": "[hex color]"
  },
  "typography": {
    "primary": "[font family]",
    "fallbacks": ["[fallback fonts]"]
  },
  "components": {
    "buttonStyle": "[style approach]",
    "cardStyle": "[style approach]",
    "inputStyle": "[style approach]",
    "navigationStyle": "[style approach]"
  },
  "references": [
    {
      "name": "[source name]",
      "notes": "[what was learned/copied stylistically]"
    }
  ]
}
```

### UI/UX Research Policy
Stage 10 MAY use web search for UI/UX inspiration and pattern guidance:
- **Scope**: UI/UX inspiration and pattern guidance only
- **Preference**: Official design guidelines (Apple HIG, Material Design, platform docs)
- **Sources**: Reputable UI galleries, design system documentation
- **Forbidden**: Direct code copying from random repositories
- **Usage**: Extract style direction and interaction patterns to inform design tokens

### Design Contract Enforcement
After generating the design contract, Stage 10 MUST:
1. **Load and Apply**: Treat uiux_prompt.md as binding authority for all UI decisions
2. **Implement Tokens**: Create src/ui/tokens.ts with colors, spacing, typography from design contract
3. **Build Components**: Create src/ui/components/ with Button, Card, Input, ScreenShell following design system
4. **Prevent Generic UI**: Ensure home screen reflects app domain (not generic landing page)
5. **Quality Gate**: Verify final UI matches design archetype and personality

## BUILD OUTPUT STRUCTURE (MANDATORY)

Generate deterministic `build_id` from hash of:
- run_id + idea_id + concatenated hashes of stage02-09 JSON files

Create complete app structure at `builds/<idea_dir>/<build_id>/app/`:

```
builds/<idea_dir>/<build_id>/
├── uiux/                     # UI/UX design contract (MANDATORY)
│   ├── uiux_prompt.md       # Complete design system prompt with role + design-system
│   └── style_brief.json     # Structured design data and references
└── app/                      # Complete Expo React Native app
    ├── package.json              # Complete dependencies from stage05 + RevenueCat + Expo + SQLite
    ├── app.json                  # Expo config with ASO metadata from stage09
    ├── babel.config.js           # Standard Expo Babel configuration
    ├── metro.config.js           # Metro bundler configuration
    ├── .env.example             # RevenueCat environment variables template
    ├── App.js                    # Main entry point with RevenueCat init and navigation
    ├── src/
    │   ├── ui/                   # Design system implementation (MANDATORY)
    │   │   ├── tokens.ts         # Colors, spacing, typography from design contract
    │   │   ├── components/       # Reusable components following design system
    │   │   │   ├── Button.tsx    # Button variants per design contract
    │   │   │   ├── Card.tsx      # Card styling per design contract
    │   │   │   ├── Input.tsx     # Input styling per design contract
    │   │   │   ├── ScreenShell.tsx # Screen layout wrapper
    │   │   │   └── [other core components]
    │   │   └── theme.ts          # Theme provider and context
    │   ├── screens/              # All screens from stage03 wireframes
    │   │   ├── OnboardingScreen.tsx
    │   │   ├── HomeScreen.tsx    # MUST reflect app domain (not generic)
    │   │   ├── PaywallScreen.tsx
    │   │   ├── SettingsScreen.tsx
    │   │   └── [domain-specific screens from stage02 features]
    │   ├── components/           # Feature-specific components
    │   │   ├── feature/          # Business logic components
    │   │   └── paywall/          # RevenueCat paywall components
    │   ├── navigation/
    │   │   └── AppNavigator.tsx  # Expo Router navigation structure from stage03
    │   ├── services/
    │   │   ├── purchases.ts      # Full RevenueCat integration from stage04
    │   │   ├── database.ts       # SQLite setup, migrations, repositories
    │   │   ├── analytics.ts      # Analytics setup for monitoring
    │   │   └── api.ts           # API service layer if needed
    │   ├── database/
    │   │   ├── schema.ts        # SQLite table definitions
    │   │   ├── migrations.ts    # Database migration scripts
    │   │   └── repositories/    # Data access layer
    │   ├── hooks/
    │   │   ├── usePurchases.ts  # RevenueCat subscription state
    │   │   └── useDatabase.ts   # SQLite data hooks
    │   ├── utils/
    │   │   ├── storage.ts       # AsyncStorage for preferences only
    │   │   └── helpers.ts       # General utility functions
    │   └── constants/
    │       ├── config.ts        # App configuration with env vars
    │       ├── strings.ts       # Text content and copy
    │       └── entitlements.ts  # RevenueCat entitlement constants
    ├── assets/
    │   ├── images/              # App icons and imagery (placeholders generated)
    │   │   ├── icon.png        # App icon placeholder
    │   │   ├── splash.png      # Splash screen placeholder
    │   │   └── adaptive-icon.png # Android adaptive icon
    │   └── fonts/               # Custom fonts if specified
    ├── app.config.js            # Dynamic Expo configuration with env
    ├── spec_map.md              # Evidence of stage02-09 consumption
    └── README.md                # Setup instructions and RevenueCat configuration
```

## MOBILE APP REQUIREMENTS (PRODUCTION-READY)

### Core Configuration
- **Framework**: Expo SDK 52+ with React Native 0.76+
- **Navigation**: Expo Router v4 file-based routing from stage03 wireframes
- **Monetization**: RevenueCat React Native SDK fully integrated with offerings, entitlements
- **Data Storage**: SQLite as primary data store, AsyncStorage for preferences only
- **State Management**: Context API or Zustand (based on stage05 architecture)
- **Styling**: Custom UI/UX design system generated per app (NOT generic themes)

### Required Dependencies
```json
{
  "expo": "~54.0.0",
  "react": "18.3.1", 
  "react-native": "0.76.5",
  "expo-router": "~4.0.0",
  "react-native-purchases": "^8.0.0",
  "expo-sqlite": "~14.0.0",
  "react-native-elements": "^3.4.3",
  "@react-navigation/native": "^6.1.0",
  "expo-dev-client": "~4.0.0",
  "react-native-async-storage": "^1.19.0",
  "expo-linear-gradient": "~13.0.0",
  "expo-constants": "~16.0.0",
  "expo-linking": "~7.0.0",
  "expo-status-bar": "~2.0.0"
}
```

### RevenueCat Integration Requirements (MANDATORY)
1. **Environment Configuration**:
   - No hardcoded API keys in source code
   - Support EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
   - Include .env.example with placeholder keys
   - Graceful failure with dev-only warning if keys missing

2. **SDK Setup**:
   - Configure Purchases at app start with platform-specific keys
   - Anonymous user identification with stable app-scoped ID
   - Support for safe user aliasing when upgrading to accounts

3. **Offerings & Entitlements**:
   - Fetch current offerings and display packages in paywall
   - Drive premium features from customerInfo.entitlements.active
   - Include restore purchases functionality
   - Include manage subscriptions deep link

4. **Error Handling & Offline**:
   - Handle empty offerings, network errors, store unavailability
   - Provide loading, empty, and retry states
   - Fallback to free mode with clear UX if RevenueCat fails

5. **Subscription Compliance**:
   - Paywall includes price, billing period, trial messaging, auto-renew disclosure
   - Cancel-anytime instructions and terms/privacy links
   - Restore purchases and manage subscription entry points

### Dependency Management Policy (MANDATORY)
**CRITICAL**: Expo module versions MUST NOT be hardcoded in package.json to avoid ETARGET errors.

1. **Core Dependencies (Latest Stable SDK)**:
   - `expo`: Latest stable SDK version (e.g., "~54.0.0")
   - `react`: React version compatible with Expo SDK
   - `react-native`: RN version compatible with Expo SDK  
   - `expo-router`: Latest stable version compatible with SDK
   - `react-native-purchases`: Latest RevenueCat version

2. **Expo Modules (Compatibility Resolved)**:
   - DO NOT hardcode versions for: expo-sqlite, expo-constants, expo-status-bar, expo-haptics, expo-linking, expo-file-system, expo-av, etc.
   - Include them in install.sh script: `npx expo install <module-list>`
   - Let Expo's compatibility resolver determine correct versions

3. **Installation Strategy**:
   - Generate install.sh with: `npm install && npx expo install <expo-modules>`
   - Include postinstall script: `"postinstall": "npx expo install --check"`
   - Document exact modules needed in README

### Bundle Identifier Policy (MANDATORY)
**CRITICAL**: All apps MUST have deterministic bundle identifiers to avoid launch errors.

1. **Format**: `com.appfactory.<normalized-slug>`
2. **Normalization**: Convert dashes to dots, remove special characters, max 50 chars
3. **Same for iOS and Android**: No `.ios` or `.android` suffixes
4. **Scheme**: Use original slug for deep linking

Example: "evp-analyzer-pro" → "com.appfactory.evp.analyzer.pro"

### SQLite Data Architecture (MANDATORY)
- Replace AsyncStorage as primary data store with expo-sqlite
- Include schema definitions and migration system
- Repository/data access layer for clean separation
- Keep AsyncStorage only for user preferences (theme, onboarding completed)

### Feature Implementation (MAP FROM STAGES)
- **Stage02 → App Screens**: Each core feature becomes a screen with navigation
- **Stage03 → UI Implementation**: Wireframes become actual component layouts with onboarding flow
- **Stage04 → Subscription Logic**: RevenueCat products, paywalls, and subscription gates
- **Stage05 → Architecture**: State management, SQLite data persistence, and service layers
- **Stage06 → Quality Gates**: Error handling, loading states, and accessibility
- **Stage07 → Polish**: Animations, micro-interactions, and performance optimization
- **Stage08 → Brand Application**: Theme, colors, typography, and visual identity
- **Stage09 → App Store Setup**: Bundle ID, app name, description, and icon

### Ship-Ready UX Requirements (MANDATORY)
- **Onboarding Flow**: 2-4 screens matching Stage 03 UX and Stage 02 product spec
- **Paywall Screen**: Full-screen paywall (not alert dialogs) with RevenueCat offerings and subscription messaging per Stage 04
- **Settings Screen**: Manage subscription, restore purchases, privacy/terms links, support contact, app version
- **Empty States**: All primary screens have appropriate empty state UX with helpful guidance
- **Loading States**: Loading indicators and optimistic UI where appropriate, especially for subscription states
- **Error Boundary**: Safe error surfaces with recovery options for crashes and subscription errors
- **Accessibility**: WCAG 2.1 AA compliant with labels, hit targets 44pt minimum, color contrast, Dynamic Type support
- **Asset Placeholders**: App icon (1024x1024), splash screen, adaptive icon generated with brand colors from Stage 08
- **Production Toggles**: Development-only logging gated by __DEV__, lint/format scripts in package.json
- **Subscription Compliance**: Auto-renew disclosure, cancel instructions, trial terms clear throughout paywall and subscription UI
- **Offline Capability**: App functions when offline with cached data and graceful degradation when network unavailable

## JSON SCHEMA (Build Plan with Mapping Proof)

```json
{
  "$ref": "schemas/_shared/meta.schema.json",
  "type": "object",
  "properties": {
    "build_execution": {
      "type": "object",
      "properties": {
        "build_id": {"type": "string"},
        "output_path": {"type": "string"},
        "consumed_stages": {"type": "array", "items": {"type": "string"}},
        "boundary_verification": {"type": "string", "enum": ["passed", "failed"]},
        "research_completed": {"type": "boolean"}
      },
      "required": ["build_id", "output_path", "consumed_stages", "boundary_verification", "research_completed"]
    },
    "app_specification": {
      "type": "object", 
      "properties": {
        "app_name": {"type": "string"},
        "bundle_id": {"type": "string"},
        "expo_version": {"type": "string"},
        "main_dependencies": {"type": "array", "items": {"type": "string"}},
        "screens_implemented": {"type": "array", "items": {"type": "string"}},
        "navigation_structure": {"type": "object"},
        "revenuecat_configuration": {"type": "object"},
        "theme_system": {"type": "object"}
      },
      "required": ["app_name", "bundle_id", "expo_version", "main_dependencies", "screens_implemented"]
    },
    "constraints_mapping": {
      "type": "object",
      "properties": {
        "stage02_to_screens": {"type": "object"},
        "stage03_to_ui": {"type": "object"},
        "stage04_to_subscriptions": {"type": "object"},
        "stage05_to_architecture": {"type": "object"},
        "stage08_to_branding": {"type": "object"},
        "stage09_to_metadata": {"type": "object"}
      },
      "required": ["stage02_to_screens", "stage03_to_ui", "stage04_to_subscriptions", "stage05_to_architecture", "stage08_to_branding", "stage09_to_metadata"]
    },
    "verification_proof": {
      "type": "object",
      "properties": {
        "all_features_implemented": {"type": "boolean"},
        "revenuecat_integrated": {"type": "boolean"},
        "brand_applied": {"type": "boolean"},
        "navigation_complete": {"type": "boolean"},
        "app_runnable": {"type": "boolean"}
      },
      "required": ["all_features_implemented", "revenuecat_integrated", "brand_applied", "navigation_complete", "app_runnable"]
    }
  },
  "required": ["build_execution", "app_specification", "constraints_mapping", "verification_proof"]
}
```

## STAGE COVERAGE CHECKLIST (MANDATORY)

Before code generation begins, Stage 10 MUST verify:

- [ ] Stage 02 features are fully represented in planned components/screens
- [ ] Stage 03 UX flows map to navigation structure
- [ ] Stage 04 monetization rules map to RevenueCat config and UI
- [ ] Stage 05 architecture choices are reflected in storage, state, and structure
- [ ] Stage 06 constraints are respected (platforms, frameworks, limits)
- [ ] Stage 07 polish requirements are addressed (copy, empty states, loading, errors)
- [ ] Stage 08 brand rules are applied consistently (colors, typography, tone)

**If ANY box cannot be checked, Stage 10 MUST NOT proceed.**

**Output Fidelity Requirement**: The generated app MUST feel like a deliberate implementation of a detailed spec, not a demo, scaffold, or MVP shortcut.

**Mental Model**: "Stages 01–09 wrote the app in English. Stage 10 translates it into code."

## EXECUTION STEPS (BUILD THE COMPLETE APP)

### Phase 1: Boundary Validation and Research
1. **Load and Validate All Stage Artifacts**:
   - Read stages 02-09 JSON files from idea pack directory
   - Verify meta field consistency (run_id, idea_id, boundary paths)
   - Document input sources in stage10.json

2. **Conduct Required Research**:
   - Research Expo Router patterns for navigation from stage03
   - Research RevenueCat integration: installation, configuration, entitlements, purchases, restore
   - Research Expo SQLite setup, migrations, and best practices
   - Research accessibility patterns and production hardening
   - Document all sources in stage10_research.md

### Phase 2: Build Planning and Directory Setup
3. **Generate Build Plan**:
   - Create deterministic build_id from stage content hashes
   - Map each stage constraint to specific implementation approach
   - Plan complete app structure and file organization

4. **Prepare Build Directory**:
   - Create `builds/<idea_dir>/<build_id>/app/` directory structure
   - Initialize as fresh Expo React Native project

### Phase 3: Core App Implementation
5. **Implement App Configuration**:
   - Generate package.json with latest Expo SDK 54+ dependencies using app template
   - Create dynamic app.config.js ONLY (no static app.json) with deterministic bundle identifiers: `com.appfactory.<normalized-slug>`
   - Set up Expo configuration files (babel.config.js, metro.config.js)
   - Create .env.example with RevenueCat key placeholders
   - Generate build_meta.json with SDK versions and build tracking

6. **Set Up Data Layer**:
   - Implement SQLite schema and migration system
   - Create repository/data access layer
   - Set up database initialization and seeding

7. **Create Navigation and Screens**:
   - Implement navigation structure from stage03 wireframes
   - Create onboarding flow (2-4 screens) from stage03
   - Create all screens specified in stage02 core features
   - Apply UX patterns and layouts from stage03 specifications

8. **Integrate RevenueCat Subscriptions**:
   - Set up RevenueCat SDK with environment-based configuration
   - Implement offerings fetching and entitlement checking
   - Create full-screen paywall with subscription messaging
   - Add restore purchases and manage subscriptions functionality
   - Create subscription gating logic throughout app

### Phase 4: Styling and Polish
9. **Apply Brand Identity**:
   - Create theme system from stage08 brand specifications
   - Implement color palette and typography from stage08
   - Apply brand voice and messaging throughout interface

10. **Implement Quality Requirements**:
    - Add accessibility features from stage07 requirements
    - Implement error handling, loading states, and empty states
    - Add error boundary and safe error surfaces
    - Generate app icon, splash screen, and asset placeholders
    - Add performance optimizations from stage07

### Phase 5: Production Hardening
11. **Complete Production Features**:
    - Create Settings screen with subscription management
    - Add terms/privacy links and support contact
    - Implement production toggles and development-only logging
    - Add lint/format scripts to package.json
    - Set up analytics service if specified in stage05

12. **Generate Documentation**:
    - Create spec_map.md showing stage02-09 consumption mapping
    - Write comprehensive README with RevenueCat setup instructions
    - Document exact mapping from each stage constraint to implementation
    - Write complete build log with constraint verification

### Phase 6: UI/UX Design Contract Validation (MANDATORY)
12.5. **Verify UI/UX Design Implementation**:
    Following the generated UI/UX design contract:
    
    a) **Design Contract Verification**:
    ```bash
    # Verify design files exist
    ls -la builds/<idea_dir>/<build_id>/uiux/uiux_prompt.md
    ls -la builds/<idea_dir>/<build_id>/uiux/style_brief.json
    # Verify design files are complete (not placeholder content)
    ```
    
    b) **Design System Implementation Check**:
    ```bash
    # Verify UI system exists
    ls -la builds/<idea_dir>/<build_id>/app/src/ui/tokens.ts
    ls -la builds/<idea_dir>/<build_id>/app/src/ui/components/
    # Verify theme provider is implemented
    grep -r "ThemeProvider" builds/<idea_dir>/<build_id>/app/src/
    ```
    
    c) **Non-Generic UI Validation**:
    ```bash
    # Verify home screen is domain-specific (not generic placeholder)
    grep -i "welcome\|hello world\|getting started" builds/<idea_dir>/<build_id>/app/src/screens/HomeScreen.tsx
    # This should return NO matches for generic content
    ```
    
    d) **Design Archetype Consistency Check**:
    - Manually verify that implemented UI matches chosen design archetype
    - For EVP apps: Check for instrument-like UI elements, dark themes, technical aesthetics
    - For productivity apps: Check for clean, focused layouts and clear CTAs
    - For creative apps: Check for expressive interfaces and flexible layouts
    
    e) **Complete User Flow Verification**:
    - Test that at least one complete user flow works end-to-end
    - Verify navigation between screens works without errors
    - Check that domain-specific functionality is implemented (not just placeholders)

### Phase 7: Comprehensive Build Validation (MANDATORY)
13. **Execute Automated Validation Pipeline**:
    Following `templates/stage10_validation_procedure.md`:
    
    a) **Dependency Resolution Validation**:
    ```bash
    cd builds/<idea_dir>/<build_id>/app/
    rm -rf node_modules package-lock.json
    npm install  # Must complete without ERESOLVE conflicts
    ```
    
    b) **Expo Module Compatibility**:
    ```bash
    npx expo install --check  # Must show "Dependencies are up to date"
    npx expo install --fix   # Auto-fix any version issues
    ```
    
    c) **Missing Peer Dependencies**:
    ```bash
    npx expo install react-native-safe-area-context react-native-screens
    ```
    
    d) **Configuration Validation**:
    ```bash
    rm -f app.json  # Ensure only dynamic app.config.js
    # Validate bundle identifier format
    # Check plugin configuration
    ```
    
    e) **Health Checks**:
    ```bash
    npx expo-doctor  # Must show "17/17 checks passed"
    npx tsc --noEmit  # TypeScript validation
    ```

14. **Auto-Fix Common Issues**:
    - Remove deprecated packages (@types/react-native)
    - Fix ESLint version conflicts (use eslint@8.x with @typescript-eslint@6.x)
    - Remove unsupported plugin configurations
    - Install missing peer dependencies
    - Resolve package.json dependency conflicts

15. **Generate Build Validation Report**:
    ```json
    {
      "timestamp": "ISO date",
      "buildId": "hash",
      "validation": {
        "npmInstall": "passed|failed",
        "expoCheck": "passed|failed", 
        "expoDoctor": "passed|failed",
        "typescript": "passed|failed",
        "bundleTest": "passed|failed"
      },
      "autoFixes": ["list of fixes applied"],
      "expoSdkVersion": "54.0.0",
      "nodeVersion": "v22.x"
    }
    ```

16. **Write Final Artifacts**:
    - Complete stage10.json with full mapping proof and validation results
    - Write stage10_build.log with binding verification and validation details
    - Render stage10 specification markdown

### Phase 7: Build Registry Registration  
17. **Register Build in Global Registry**:
    - Import: `from appfactory.build_registry import register_pipeline_build, register_dream_build`
    - Extract app name and slug from stage08/stage09 specifications
    - Determine build mode from run metadata (pipeline vs dream)
    - For pipeline builds: `register_pipeline_build(name, slug, build_path, "success", run_id, idea_slug)`
    - For dream builds: `register_dream_build(name, slug, build_path, "success", run_id, dream_prompt_hash)`
    - Log registration success/failure in stage10_build.log
    - MUST happen after successful app generation AND validation, before stage10.json completion

## CRITICAL FAILURE HANDLING

**Stage 10 MUST NOT complete if ANY validation step fails.**

### Validation Failure Protocol:
1. **Document All Failures**:
   ```markdown
   # Stage 10 Validation Failure Report
   Build: builds/<idea_dir>/<build_id>/app/
   Failed At: [Specific validation step]
   Error: [Exact error message and exit code]
   Auto-Fix Attempts: [List all attempted fixes]
   Manual Resolution Required: [Specific steps]
   ```

2. **Write Failure Artifacts**:
   - `validation_failure.md` (detailed report)
   - `validation_results.json` (machine-readable status)
   - `build_incomplete.flag` (prevents false success claims)

3. **Stop Execution**:
   - DO NOT create stage10.json
   - DO NOT mark build as completed
   - DO NOT register build in global registry
   - Return clear error message with remediation steps

### Success Criteria for Stage 10 Completion:
✅ **UI/UX Design Contract Generated**: uiux_prompt.md and style_brief.json exist and are complete  
✅ **Design System Implemented**: src/ui/tokens.ts and src/ui/components/ follow design contract  
✅ **Non-Generic UI**: Home screen reflects app domain (not placeholder/generic landing page)  
✅ **Design Archetype Match**: Final UI matches chosen design archetype (e.g. "Forensic Instrument Panel")  
✅ **Complete User Flow**: At least one end-to-end flow works (e.g. create → list → detail → edit/delete)  
✅ All spec constraints implemented and mapped  
✅ npm install completes without conflicts  
✅ expo install --check shows "Dependencies are up to date"  
✅ expo-doctor shows "17/17 checks passed" (or documented workarounds)  
✅ TypeScript compilation succeeds  
✅ Build metadata generated  
✅ App can be bundled successfully  
✅ All validation artifacts written

## MANDATORY EXECUTION SEQUENCE

Stage 10 MUST follow this exact sequence (no reordering):

### Phase 1: UI/UX Design Contract Creation
1. **Analyze App Specifications**: Read Stage 02 (product spec) and Stage 03 (UX flows)
2. **Determine Visual Personality**: Infer app domain, user context, and mood
3. **Choose Design Archetype**: Select appropriate archetype (e.g. "Forensic Instrument Panel")
4. **Generate UI/UX Design Contract**:
   - Write `uiux/uiux_prompt.md` with <role> and <design-system> sections
   - Write `uiux/style_brief.json` with structured design data
5. **Conduct UI/UX Research** (optional): Search for design inspiration within app domain

### Phase 2: App Implementation Using Design Contract
6. **Load Design Contract**: Read generated uiux_prompt.md as binding authority
7. **Implement Design System**: Create src/ui/tokens.ts and src/ui/components/
8. **Build App Structure**: Create screens, navigation, and features per specifications
9. **Apply Design System**: Use tokens and components consistently throughout app
10. **Ensure Domain-Specific UI**: Make home screen reflect app personality (not generic)

### Phase 3: Validation and Quality Gates
11. **UI/UX Validation**: Verify design contract compliance and non-generic implementation
12. **Technical Validation**: Run dependency, TypeScript, and Expo validation pipeline
13. **Build Registry Registration**: Register successful build in global registry
14. **Final Documentation**: Complete stage10.json and binding proof artifacts

**CRITICAL**: Phases must execute in order. Do NOT implement app before generating design contract.

## CONSTRAINT BINDING REQUIREMENTS (MANDATORY)

**NO GENERIC FALLBACKS**: Stage 10 is FORBIDDEN from using generic Expo starter patterns when upstream stages provide specifications.

For every specification from stages 02-09, you MUST:

1. **Identify the Constraint**: Extract specific requirement from stage JSON
2. **Map to Implementation**: Document exactly how constraint becomes code
3. **Verify Implementation**: Confirm constraint is correctly applied
4. **Document Proof**: Write mapping in stage10_build.log

**Exhaustive Implementation Rule**: If upstream stages define:
- Onboarding → it MUST exist as specified
- Paywall → it MUST be implemented per Stage 04 monetization
- Settings → it MUST include all defined items from Stage 03
- Storage rules → they MUST be respected per Stage 05
- Monetization language → it MUST be used verbatim where applicable
- Brand elements → they MUST be applied per Stage 08

Example constraint binding:
```
Stage02.product_specification.core_features[0]: "Smart Focus Sessions with AI recommendations"
→ Mapped to: src/screens/FocusSessionScreen.js + src/services/recommendations.js
→ Implementation: AI suggestion logic with user preference learning
→ Verification: ✓ Feature fully implemented with UI and backend logic
```

**Implementation Verification**: The generated app MUST demonstrate that Stages 01–09 provided the maximum possible information and Stage 10 used ALL of it.

## FAILURE CONDITIONS (HARD STOPS)

Stage 10 MUST fail and stop execution if:
- Any stage02-09 JSON has boundary violations (wrong run_id/idea_id)
- Required research cannot be completed (official docs inaccessible)
- RevenueCat integration cannot be properly configured
- Any core feature from stage02 cannot be implemented
- App structure is incomplete or non-functional
- **Stage Coverage Checklist cannot be completed** (any checkbox remains unchecked)
- **Upstream specification cannot be fully implemented** as defined in prior stages
- **Generic fallback patterns would be required** due to insufficient upstream detail

**Spec Compliance Failure Examples**:
- Stage 03 defines specific onboarding flow but cannot implement due to technical limitations
- Stage 04 monetization rules conflict with RevenueCat capabilities
- Stage 08 brand requirements cannot be applied consistently throughout app
- Stage 05 architecture choices are incompatible with Expo framework

Write detailed failure report to `stage10_failure.md` with:
- Exact failure reason and stage constraint that could not be satisfied
- Missing dependencies or implementation blockers
- Specific upstream specification that failed to implement
- Remediation steps required to resolve the issue

**Failed Build Registration**: On build failure, MUST still register the build with status="failed":
- Import: `from appfactory.build_registry import register_pipeline_build, register_dream_build`
- Register with status="failed" and include failure reason in notes
- This ensures dashboard can show failed builds for debugging

## STANDARDS COMPLIANCE MAPPING

### Subscription & Store Compliance (MANDATORY)
- **Requirement**: RevenueCat integration with proper subscription lifecycle
- **Implementation**: Full RevenueCat SDK integration with dev build configuration, subscription products from stage04, paywall UI from stage03, restore purchases functionality

### Accessibility & Design (MANDATORY)  
- **Requirement**: WCAG 2.1 AA compliance with platform design guidelines
- **Implementation**: Accessibility labels on all interactive elements, proper color contrast from stage08 theme, text scaling support, VoiceOver/TalkBack compatibility

### Privacy & Analytics (MANDATORY)
- **Requirement**: Privacy-compliant analytics and data handling
- **Implementation**: Firebase Analytics setup with opt-out controls, minimal data collection approach, privacy policy links from stage09

### App Store Readiness (MANDATORY)
- **Requirement**: Production-ready app structure and metadata
- **Implementation**: Complete app.json with stage09 ASO package, proper bundle configuration, app icon and assets, README with setup instructions

DO NOT output JSON in chat. Write complete Expo app to disk with full constraint binding proof.