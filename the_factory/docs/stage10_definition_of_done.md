# Stage 10 Definition of Done - Production-Ready App Factory

**Version**: 3.2  
**Status**: MANDATORY QUALITY GATES FOR APP FACTORY STAGE 10  
**Last Updated**: January 2026

## Executive Summary

This document defines the complete Definition of Done for Stage 10 app generation. All criteria MUST be met before claiming a successful build. These requirements ensure ship-ready React Native apps that boot reliably and provide professional user experiences.

## Core Quality Standards

### 1. Build Reliability
- ✅ **App starts without crashes** - No React Native red screen errors
- ✅ **TypeScript compilation succeeds** - Zero TypeScript errors with strict mode
- ✅ **Dependency compatibility verified** - All packages compatible with Expo SDK version
- ✅ **Navigation works correctly** - Expo Router v4 file-based navigation without NavigationContainer conflicts
- ✅ **Bundle identifiers configured** - iOS bundleIdentifier and Android package properly set

### 2. Error Handling & Recovery
- ✅ **ErrorBoundary hardened** - Safe theme fallbacks, never relies on external systems
- ✅ **Graceful degradation** - App handles missing data, network failures, permission denials
- ✅ **User-friendly error messages** - Domain-appropriate error recovery UX
- ✅ **Crash prevention** - No theme access errors, safe imports, proper null checks

### 3. User Experience Standards
- ✅ **Professional UI/UX** - Domain-appropriate design patterns and visual polish
- ✅ **Accessibility compliance** - Touch targets ≥44pt, proper labels, contrast ratios
- ✅ **Loading & empty states** - Professional handling of all async operations
- ✅ **Responsive design** - Works properly on iOS and Android screen sizes

### 4. UI/UX Design Contract Requirements
- ✅ **Design contract generated** - uiux/uiux_prompt.md with <role> and <design-system> sections complete
- ✅ **Style brief created** - uiux/style_brief.json with app-specific design archetype and palette
- ✅ **Design system implemented** - src/ui/tokens.ts and src/ui/components/ follow design contract
- ✅ **Non-generic UI** - Home screen reflects app domain, not placeholder/generic landing page
- ✅ **Design archetype consistency** - UI matches chosen archetype (e.g. "Forensic Instrument Panel")
- ✅ **Domain-appropriate aesthetics** - Visual design fits app category and user context
- ✅ **Complete user flow** - At least one end-to-end user flow works without placeholders

### 5. Business Logic Requirements
- ✅ **RevenueCat integration** - Environment-based configuration, no hardcoded keys
- ✅ **Subscription flow works** - Purchase, restore, and manage subscription links functional
- ✅ **Premium feature gates** - isPro entitlement properly enforced
- ✅ **Paywall rendering** - Real offerings displayed with correct pricing

### 6. Production Readiness
- ✅ **No development artifacts** - Remove debug code, console.logs gated by __DEV__
- ✅ **Asset optimization** - Proper app icons, splash screens with brand colors
- ✅ **Privacy compliance** - Functional privacy policy and terms of service links
- ✅ **Store metadata ready** - App store listings match Stage 09 ASO package

## Technical Validation Checklist

### Pre-Generation Validation
```bash
# Verify stage dependencies exist
ls runs/*/ideas/*/stages/stage0{2..9}.json

# Confirm template availability  
ls templates/app_template/*.template.*

# Check boundary enforcement
grep -q "idea_id.*<target_idea>" runs/*/ideas/*/stages/stage*.json
```

### Post-Generation Validation Scripts
```bash
# UI/UX Design Contract validation (MUST pass)
ls -la uiux/uiux_prompt.md && ls -la uiux/style_brief.json     # Design contract files exist
ls -la app/src/ui/tokens.ts && ls -la app/src/ui/components/  # Design system implemented
grep -L "welcome\|hello world\|getting started" app/src/screens/HomeScreen.*  # Non-generic UI

# Core validation pipeline (MUST pass)  
npm run validate:deps          # Dependency compatibility
npm run validate:typescript    # TypeScript compilation
npm run validate:build        # Expo export test build

# Quality gate checks
npx expo-doctor               # Expo environment validation
npm install --dry-run         # Dependency resolution check
expo start --check           # Configuration validation
```

### Manual Testing Requirements
1. **Boot Test**: App starts to home screen within 5 seconds
2. **UI/UX Design Test**: Home screen reflects app domain (not generic placeholder content)
3. **Design Archetype Test**: Visual design matches chosen archetype consistently
4. **Complete Flow Test**: At least one end-to-end user flow works without placeholders
5. **Navigation Test**: All primary user flows navigable without errors
6. **Subscription Test**: Can open paywall, view offerings, handle purchase simulation
7. **Error Recovery**: Can recover from network errors, permission denials
8. **Accessibility**: Screen reader navigation works, touch targets properly sized

## Failure Prevention Measures

### UI/UX Design Contract System
- **MANDATORY**: Generate uiux_prompt.md and style_brief.json before any app code
- **FORBIDDEN**: Generic landing pages, "Hello World" placeholder screens
- **ARCHETYPE ENFORCEMENT**: UI must match chosen design archetype (e.g. "Forensic Instrument Panel")
- **VALIDATION**: Home screen must contain domain-specific content, not generic welcomes

### Design System Implementation
```typescript
// REQUIRED: Centralized design tokens
export const tokens = {
  colors: {
    background: '#0D0D0D',    // From design contract
    primary: '#1A237E',       // From design contract
    // ... domain-appropriate palette
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { /* React Native compatible fonts */ }
};
```

### Navigation Architecture
- **MANDATORY**: Use pure Expo Router v4 file-based navigation
- **FORBIDDEN**: React Navigation components (@react-navigation/*)
- **STRUCTURE**: app/_layout.tsx → app/(tabs)/_layout.tsx → screen routes
- **VALIDATION**: Check for NavigationContainer imports and remove

### Error Boundary Implementation
```typescript
// REQUIRED: Safe theme fallbacks in ErrorBoundary
const colors = {
  background: safeTheme.colors.background || '#0D0D0D',
  primary: safeTheme.colors.primary || '#1A237E',
  text: {
    primary: safeTheme.colors.text?.primary || '#FFFFFF',
    secondary: safeTheme.colors.text?.secondary || '#B0B0B0',
  },
};
```

### Dependency Management
- **AUTOMATIC**: postinstall script runs `npx expo install --fix`
- **VALIDATION**: All dependencies match Expo SDK version requirements
- **COMPATIBILITY**: React Native 0.76.x + React 18.3.x + Expo SDK 52

### Configuration Standards
- **App Config**: Clean structure without nested expo object warnings
- **Bundle IDs**: Use com.appfactory.* pattern with deterministic naming
- **Environment**: RevenueCat keys from environment variables only
- **TypeScript**: tsconfig.json with Expo base configuration

## Domain-Specific Quality Standards

### Professional Investigation Apps (EVP, Research Tools)
- Atmospheric dark themes with scientific color palettes
- Data visualization components (waveforms, meters, status indicators)
- Professional headers with equipment-style status displays
- High-contrast text for data readability

### Productivity & Task Management Apps  
- Clean metrics displays and progress tracking
- Goal visualization and achievement systems
- Intuitive workflow navigation patterns
- Empty state messaging that encourages engagement

### Health & Fitness Apps
- Biometric displays with proper data visualization
- Progress charts and trend analysis components
- Achievement systems and milestone celebrations
- Privacy-conscious data handling messaging

### Creative & Media Apps
- Gallery interfaces with proper image/video handling
- Editing tool interfaces with touch-optimized controls
- Export options and sharing functionality
- Portfolio/showcase presentation modes

## Failure Response Protocol

### Quality Gate Failure Handling
If ANY quality gate check fails:

1. **Document Failure**:
   ```bash
   # Create failure report
   echo "STAGE 10 QUALITY GATE FAILURE" > meta/stage10_failure.md
   echo "Failed Check: [specific check]" >> meta/stage10_failure.md
   echo "Expected: [expected behavior]" >> meta/stage10_failure.md  
   echo "Actual: [actual behavior]" >> meta/stage10_failure.md
   echo "Remediation: [required fixes]" >> meta/stage10_failure.md
   ```

2. **Stop Execution**:
   - DO NOT create stage10.json success artifact
   - DO NOT claim build completion
   - DO NOT proceed to next stage

3. **Investigation Steps**:
   - Check dependency version conflicts
   - Verify template substitution completeness
   - Confirm stage data availability and format
   - Test navigation structure manually

### Common Failure Patterns & Solutions

**UI/UX Design Contract Failures**:
- Missing or incomplete uiux_prompt.md and style_brief.json files
- Generic home screen content (welcome messages, "Hello World")
- Design system not implemented (missing src/ui/tokens.ts)
- Visual design doesn't match chosen archetype

**Navigation Errors**:
- Remove React Navigation dependencies
- Verify Expo Router file structure 
- Check for NavigationContainer usage

**Theme Errors**:
- Implement safe fallbacks in all theme consumers
- Verify theme provider initialization order
- Check for undefined theme property access

**Dependency Issues**:
- Run `npx expo install --fix` to resolve version conflicts
- Check for deprecated packages in package.json
- Verify SDK compatibility with `expo doctor`

**Build Configuration**:
- Remove nested expo object from app.config.js
- Verify bundle identifier format compliance
- Check asset paths and placeholder content

## Success Metrics

A Stage 10 build is considered successful when:
- ✅ **UI/UX Design Contract Complete**: uiux_prompt.md and style_brief.json files generated and complete
- ✅ **Design System Implemented**: src/ui/tokens.ts and src/ui/components/ follow design contract
- ✅ **Non-Generic UI**: Home screen reflects app domain, no placeholder content
- ✅ **Design Archetype Consistency**: Visual design matches chosen archetype throughout app
- ✅ **Complete User Flow**: At least one end-to-end flow works without placeholders
- ✅ All functional quality gate checks pass (technical + UI/UX)
- ✅ All standards compliance checks pass
- ✅ Manual boot test completes in <5 seconds
- ✅ Primary user flows navigable without errors
- ✅ RevenueCat integration functional with test environment
- ✅ No console errors or React Native red screens
- ✅ App store readiness confirmed (assets, metadata, privacy links)

## Quality Gate Evolution

This Definition of Done evolves based on:
- Production app feedback and user reports
- New Expo SDK releases and breaking changes
- App store policy updates and review feedback
- Performance monitoring and crash analytics
- User accessibility testing and compliance audits

**Quality Gate Owners**: App Factory Team  
**Review Cycle**: Monthly or after major Expo SDK releases  
**Escalation**: Stage 10 quality failures block pipeline until resolved