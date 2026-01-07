# Stage 10: React Native App Builder (Build Mode)

## AGENT-NATIVE EXECUTION
You are Claude executing Stage 10 for a SPECIFIC IDEA PACK. Build a complete Expo React Native app using ONLY the selected idea's specifications with strict isolation.

## BOUNDARY ENFORCEMENT (CRITICAL)
**MUST read ONLY from selected idea pack:**
- Read: `runs/.../ideas/<idea_dir>/meta/idea.json` (canonical idea definition)
- Read: `runs/.../ideas/<idea_dir>/meta/boundary.json` (verify isolation)
- Read: `runs/.../ideas/<idea_dir>/stages/stage02.json...stage09.json` (ALL specs for THIS idea only)
- Read: `runs/.../stage01/stages/stage01.json` (lookup/confirmation only)
- Read: `runs/.../meta/idea_index.json` (lookup only)

**HARD VALIDATION**: All stage02-09 JSONs MUST have identical meta.idea_id and meta.run_id. If mismatch found, write `stage10_failure.md` and stop immediately.

## OUTPUTS
- Write: `runs/.../ideas/<idea_dir>/stages/stage10.json` (plan-only JSON, small)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage10_build.log` (binding proof + verification)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage10_research.md` (sources consulted)  
- Create: `builds/<idea_dir>/` (complete Expo React Native app)

## REQUIRED RESEARCH (ONLINE)
MUST consult these sources and cite in stage10_research.md:
1. **Official Expo Router docs** - navigation patterns and layout conventions
2. **Official RevenueCat docs** - Expo integration and paywall implementation
3. **Category-specific UI patterns** - search for open-source Expo templates and component libraries relevant to the app category (productivity, wellness, etc.)

Research constraints:
- Do NOT copy UI designs directly
- Do NOT use copyrighted assets
- Translate insights into implementation decisions
- Cite all sources with URLs and brief notes

## JSON SCHEMA (Build Plan Only)

```json
{
  "meta": {
    "run_id": "string",
    "idea_id": "string", 
    "idea_name": "string",
    "idea_dir": "string",
    "source_root": "string",
    "input_stage_paths": ["array of stage02-09 paths"],
    "boundary_path": "string"
  },
  "build_plan": {
    "app_name": "string",
    "expo_version": "string",
    "bundle_id": "string",
    "dependencies": ["string"],
    "screens_to_implement": ["string"],
    "services_to_create": ["string"],
    "navigation_structure": {},
    "build_output_dir": "builds/<idea_dir>/"
  },
  "constraints_mapping": {
    "stage02_product_features": ["how product features map to screens/components"],
    "stage03_ux_wireframes": ["how wireframes map to screen implementations"],
    "stage04_monetization": ["RevenueCat products and gating rules"], 
    "stage05_architecture": ["tech stack decisions applied"],
    "stage06_handoff": ["development priorities implemented"],
    "stage07_quality": ["testing and accessibility features"],
    "stage08_brand": ["visual design and theme application"],
    "stage09_aso": ["app store metadata applied"]
  },
  "file_manifest": [
    {"path": "string", "description": "string", "constraint_source": "stageNN field"}
  ]
}
```

## MOBILE APP REQUIREMENTS

Generate complete Expo React Native application with:

### Core Configuration
- `package.json` with Expo and React Native dependencies
- `app.json` with proper Expo configuration
- `babel.config.js` for Babel setup
- `App.js` as main entry point

### Required Dependencies
```json
{
  "expo": "~50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "react-native-elements": "^3.4.3",
  "react-native-purchases": "^7.0.0",
  "@react-native-async-storage/async-storage": "^1.19.0"
}
```

### Source Code Structure (builds/<idea_dir>/)
```
builds/<idea_dir>/src/
├── screens/              # All screens from Stage 03 UX specification  
├── components/           # Reusable UI components
├── navigation/           # Navigation setup
├── services/             # Business logic
│   └── purchases.js      # RevenueCat integration from Stage 04
├── utils/               # Utility functions
│   └── storage.js       # Local storage
└── styles/              # Styling and themes
    └── theme.js         # App theme from Stage 08 brand identity
```

## EXECUTION STEPS (BUILD MODE)

### Phase 1: Boundary Validation
1. Read `runs/.../ideas/<idea_dir>/meta/boundary.json` and verify isolation
2. Load `runs/.../ideas/<idea_dir>/stages/stage02.json...stage09.json` 
3. HARD CHECK: Verify all stage JSONs have identical meta.idea_id and meta.run_id
4. If boundary violation detected: write `stage10_failure.md` and STOP

### Phase 2: Research (Required)
5. Consult official Expo Router documentation for navigation patterns
6. Consult official RevenueCat documentation for Expo integration
7. Research category-specific UI patterns (productivity/wellness/etc.)
8. Document all sources in `runs/.../ideas/<idea_dir>/outputs/stage10_research.md`

### Phase 3: Build Plan Generation
9. Generate build plan JSON conforming to schema with constraints mapping
10. Write to `runs/.../ideas/<idea_dir>/stages/stage10.json`
11. Validate against schema (hard-fail if invalid)

### Phase 4: App Generation
12. Clean/create `builds/<idea_dir>/` directory
13. Generate complete Expo React Native app using ONLY this idea pack's constraints
14. Apply Stage 02 features → screens/components
15. Apply Stage 03 UX flows → navigation structure  
16. Apply Stage 04 monetization → RevenueCat integration
17. Apply Stage 05 architecture → tech stack choices
18. Apply Stage 06 handoff → development structure
19. Apply Stage 07 quality → testing/accessibility
20. Apply Stage 08 brand → visual design/theme
21. Apply Stage 09 ASO → app.json metadata

### Phase 5: Binding Verification
22. Write detailed binding proof to `runs/.../ideas/<idea_dir>/outputs/stage10_build.log`
23. For each constraint, document exactly where/how it was implemented
24. Verify app structure is complete and runnable

## SUCCESS CRITERIA

Stage 10 is complete when:
- [ ] `stage10.json` build plan exists and validates
- [ ] `builds/<idea_dir>/` directory exists with complete Expo app
- [ ] `package.json` contains all required dependencies
- [ ] All screens from UX spec implemented in `src/screens/`
- [ ] RevenueCat service exists in `src/services/purchases.js`
- [ ] Navigation setup complete in `src/navigation/`
- [ ] `README.md` has setup instructions
- [ ] `.env.example` has RevenueCat placeholders
- [ ] Execution log documents app generation process

**CRITICAL**: NEVER write to `/mobile/` directory. Always use `builds/<idea_dir>/`.

## VERIFICATION

Before marking complete, verify:
```bash
# Check build structure
test -d builds/<idea_dir> && echo "✓ Build directory exists"
test -f builds/<idea_dir>/package.json && echo "✓ Package config exists"
test -d builds/<idea_dir>/src/screens && echo "✓ Screens directory exists"
test -f builds/<idea_dir>/src/services/purchases.js && echo "✓ RevenueCat service exists"
test -f builds/<idea_dir>/README.md && echo "✓ README exists"

# Verify Expo dependencies
grep '"expo"' builds/<idea_dir>/package.json && echo "✓ Expo dependency found"
grep 'react-native-purchases' builds/<idea_dir>/package.json && echo "✓ RevenueCat dependency found"
```

**OUTPUT LOCATION ENFORCEMENT**: Stage 10 MUST write to `builds/<idea_dir>/` where `<idea_dir>` matches the idea pack directory name exactly. This allows verification that the correct app was built for the selected idea.

DO NOT output JSON in chat. Write build plan to disk and generate complete mobile app.