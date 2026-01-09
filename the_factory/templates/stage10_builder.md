# Stage 10 Ship-Ready App Builder

## MANDATORY GENERATION PROCESS

This document defines the complete Stage 10 app generation process that MUST be followed to produce ship-ready Expo React Native apps.

### Pre-Generation Quality Gate

Before starting app generation, verify ALL input requirements:

1. **Stage Dependencies**: Confirm stages 02-09 JSON files exist and validate
2. **Boundary Enforcement**: Verify all input files belong to single idea pack
3. **Template Availability**: Confirm app_template/ directory contains all required templates

### App Generation Algorithm

#### Step 1: Initialize Build Environment
```
1. Clean/create builds/<idea_dir>/ directory
2. Copy base structure from templates/app_template/
3. Initialize template variable substitution system
```

#### Step 2: Extract Stage Data
```
Read and parse all stage JSON files (02-09):
- Stage 02: Product features, user personas
- Stage 03: UX design, color palette, interactions
- Stage 04: Monetization, pricing, RevenueCat products
- Stage 05: Technology stack, dependencies
- Stage 06: Implementation priorities
- Stage 07: Quality requirements
- Stage 08: Brand identity, app name, colors
- Stage 09: ASO package, app store metadata
```

#### Step 3: Generate App Configuration Files

**package.json**:
- Use package.template.json as base with Expo SDK 52 compatibility
- Substitute {{APP_NAME_SLUG}} with sanitized app name
- Add dependencies from Stage 05 architecture
- Include mandatory validation scripts (validate, validate:deps, validate:typescript)
- Configure postinstall script with "npx expo install --fix" for dependency management
- Include prettier configuration for production hygiene
- Use React Native 0.76 and React 18.3.1 for latest compatibility

**app.json**:
- Use app.template.json as base
- Substitute brand variables from Stage 08:
  - {{APP_NAME}} → brand_identity.app_name
  - {{APP_SLUG}} → sanitized version
  - {{BUNDLE_IDENTIFIER}} → reverse domain format
  - {{SPLASH_BACKGROUND_COLOR}} → brand colors
- Include ASO metadata from Stage 09

**.env.example**:
- Copy .env.example template
- Update placeholder URLs with app-specific domains if available

#### Step 4: Generate Core App Structure

**App Layout (_layout.tsx)**:
- Use app/_layout.template.tsx with Expo Router v4 file-based navigation
- MANDATORY: Use pure Expo Router architecture (NO React Navigation components)
- Configure Stack navigation with proper screen options and animations
- Initialize providers (SafeAreaProvider, ThemeProvider) and error boundaries
- NO hardcoded RevenueCat keys (env-based only)
- Structure: app/_layout.tsx → app/(tabs)/_layout.tsx → individual screen routes

**Paywall Screen**:
- Use app/paywall.template.tsx
- Substitute {{APP_NAME}} and {{PREMIUM_FEATURES}}
- Generate premium features list from Stage 02 core features
- Include subscription disclosure with Stage 04 pricing

**Onboarding Flow**:
- Generate 2-4 onboarding screens based on Stage 02 user personas
- Extract core value propositions from product specification
- Create {{ONBOARDING_WELCOME_MESSAGE}} from Stage 02 value proposition

#### Step 5: Generate Data Layer

**Database Setup**:
- Use src/data/database.template.ts
- Generate schema based on Stage 02 core features
- Create repository functions for app's core objects
- Include migration system for schema versioning

**Data Models**:
- Extract data requirements from Stage 02 product specification
- Generate TypeScript interfaces for core entities
- Create CRUD operations for each entity type

#### Step 6: Generate UI Components

**Theme System**:
- Use src/ui/theme.ts template
- Substitute colors from Stage 08 brand identity:
  - {{PRIMARY_COLOR}} → visual_identity.color_scheme.primary
  - {{SECONDARY_COLOR}} → visual_identity.color_scheme.secondary
- Apply typography from Stage 03 design system

**Main App Screens**:
- Generate screens based on Stage 03 wireframes
- Apply Stage 03 interaction patterns (swipe, tap, etc.)
- Implement domain-appropriate UI/UX patterns:
  - Professional investigation tools: atmospheric headers, data visualization, status indicators
  - Productivity apps: clean metrics, progress tracking, goal visualization  
  - Health/fitness: biometric displays, progress charts, achievement systems
  - Creative tools: media galleries, editing interfaces, export options
- Include empty states, loading states, error states with domain-appropriate messaging
- Ensure accessibility compliance (touch targets, labels, contrast)
- Use cutting-edge visual elements: shadows, gradients, animations for professional feel

#### Step 7: RevenueCat Integration

**Environment Configuration**:
- Generate proper env-based RevenueCat setup
- Create configuration helpers that read from process.env
- NO hardcoded API keys in source code

**Premium State Management**:
- Use src/store/premiumStore.ts template
- Configure entitlement checking (default: "pro")
- Implement purchase, restore, and manage subscription flows

**Subscription Products**:
- Configure products based on Stage 04 monetization strategy
- Map pricing from Stage 04 to RevenueCat product identifiers
- Generate paywall UI with correct pricing display

#### Step 8: App Store Readiness

**Assets Generation**:
- Create placeholder icons and splash screens
- Use brand colors from Stage 08
- Include proper asset references in app.json

**Privacy & Terms**:
- Generate Settings screen with working placeholder links
- Include subscription disclosure copy
- Add app version display and contact information

**Permissions**:
- Only include iOS permission strings if app actually uses permissions
- Based on Stage 02 feature requirements

#### Step 9: Production Hygiene

**Enhanced Error Handling**:
- Include hardened error boundaries with safe theme fallbacks on all main screens
- ErrorBoundary MUST NOT rely on external theme system (use hardcoded fallbacks)
- Implement domain-appropriate error recovery UX
- Use centralized error handling utilities
- Implement user-friendly error messages with restart/report capabilities

**Logging**:
- All logging gated by __DEV__ flag
- Use structured logging utilities
- NO verbose production logging

**Code Quality**:
- Apply consistent formatting conventions
- Include TypeScript strict mode
- Use proper async/await error handling patterns

### Post-Generation Quality Gate (MANDATORY)

After app generation, run ALL quality gate checks:

#### Functional Checks
- [ ] App builds without TypeScript errors (npm run validate:typescript)
- [ ] All dependencies compatible with Expo SDK version (npm run validate:deps)
- [ ] SQLite database initializes correctly  
- [ ] RevenueCat configuration loads from env (no hardcoded keys)
- [ ] Paywall screen renders with real offerings
- [ ] Premium state management works (isPro entitlement)
- [ ] Restore purchases and manage subscription links work
- [ ] Onboarding flow completes successfully
- [ ] Main app screens handle empty/loading/error states
- [ ] Expo Router navigation structure works without NavigationContainer conflicts
- [ ] ErrorBoundary has safe theme fallbacks and doesn't crash on theme errors
- [ ] expo-doctor preflight check passes (or documented workarounds)
- [ ] Build metadata file generated with SDK versions
- [ ] npm install completes without dependency conflicts
- [ ] npx expo install --check validates all modules (or --fix applied automatically)
- [ ] All required peer dependencies installed via postinstall script
- [ ] Bundle identifiers properly configured (iOS bundleIdentifier, Android package)
- [ ] App config uses proper structure (no nested expo object warnings)
- [ ] tsconfig.json exists with proper Expo TypeScript configuration

#### Standards Compliance Checks
- [ ] Design system applied consistently across all screens
- [ ] Accessibility touch targets meet 44pt minimum
- [ ] Error boundaries protect all main user flows
- [ ] Privacy Policy and Terms links are functional (placeholder URLs)
- [ ] Subscription disclosure copy present and accurate
- [ ] App store metadata matches Stage 09 ASO package

### Failure Handling

If ANY quality gate check fails:

1. **Document Failure**:
   ```
   Write: runs/.../ideas/<idea_dir>/meta/stage10_quality_gate_failure.md
   Include:
   - Specific failed check
   - Expected vs actual behavior
   - Required remediation steps
   - Blocking dependencies (if any)
   ```

2. **Stop Execution**: 
   - DO NOT create stage10.json
   - DO NOT claim build success
   - Return clear error message to user

### Success Criteria

Stage 10 is complete ONLY when:
- [ ] All generation steps completed successfully
- [ ] ALL quality gate checks pass
- [ ] Complete app exists in builds/<idea_dir>/
- [ ] stage10.json documents constraint mapping
- [ ] stage10_build.log proves all bindings
- [ ] stage10_research.md documents sources

The generated app MUST be immediately runnable with `expo start` after:
1. Running `npm install` (must complete without ERESOLVE conflicts)
2. Running `npx expo install --check` (must show "Dependencies are up to date")
3. Running `npx expo-doctor` (must show "17/17 checks passed")
4. Configuring RevenueCat API keys in .env
5. Setting up basic RevenueCat products (if testing subscriptions)

**CRITICAL**: Stage 10 execution includes automated validation of these steps and MUST NOT complete until all pass.

This ensures every Stage 10 output is truly ship-ready and professional quality.