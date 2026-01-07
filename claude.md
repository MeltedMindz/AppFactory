# App Factory Control Plane

**Version**: 3.1  
**Status**: MANDATORY — CONSTITUTION FOR ALL CLAUDE OPERATIONS  
**Applies to**: All pipeline stages, agents, and Claude interactions

## 🔒 EXECUTION SCOPE & EDITING MODE (MANDATORY)

This document defines behavior.  
Editing this file MUST NOT trigger execution.

Claude MUST treat all instructions in this file as specification and enforcement rules, not as commands to run immediately.

Execution only occurs when the user explicitly types a supported command listed below.  

---

## ARCHITECTURE: CLAUDE IS THE BUILDER (AGENT-NATIVE)

App Factory is an end-to-end system that researches markets, generates validated app ideas, designs UX/monetization/brand, produces launch-ready specs, and builds real React Native apps. Claude executes all stages directly within this repository without subprocess calls or hand-holding.

### Core Execution Model
- **Claude reads** stage templates from `templates/agents/`
- **Claude reads** prior stage outputs from runs directories
- **Claude writes** JSON stage artifacts to disk with strict validation
- **Claude validates** against schemas with hard-fail on mismatch
- **Claude renders** markdown specifications automatically
- **Claude logs** execution details with binding proof
- **Claude never outputs** raw JSON in chat - only disk artifacts

### Truth Enforcement
- **Filesystem is source of truth**: If artifacts aren't on disk, it didn't happen
- **No stubs, no placeholders, no false success claims**
- **Fail fast**: Schema validation failures stop execution immediately
- **Isolation enforcement**: Each idea pack has strict boundary controls

---

## COMMAND INTERFACE

Claude supports exactly these commands when opened in this repository:

## COMMANDS (THE ONLY SUPPORTED UX)

### Command: `run app factory`
Runs the default end-to-end batch specification workflow.

**Behavior (MANDATORY)**:
- Executes Stage 01 once and generates EXACTLY 10 ranked app ideas
- Automatically executes Stages 02–09 for EACH of the 10 ideas in the same run
- Produces a complete idea pack per idea, including:
  - validated JSON artifacts
  - rendered markdown specifications
  - execution logs
  - boundary metadata

**AUTO-CONTINUE is mandatory**:
- Once started, Claude MUST proceed stage-by-stage and idea-by-idea
- Claude MUST NOT stop after any stage to ask the user to type "continue"
- Stop conditions are ONLY:
  - Explicit user interruption, or
  - Hard failure (must write failure artifact(s) to disk and stop)

### Command: `build <IDEA_ID_OR_NAME>`
Builds ONE selected idea into a runnable Expo / React Native app using Stage 10.

**Behavior (MANDATORY)**:
- Resolves `<IDEA_ID_OR_NAME>` using `runs/.../meta/idea_index.json`
- Reads and applies ONLY that idea pack's Stage 02–09 JSON outputs as binding constraints
- Enforces NO CROSS-CONTAMINATION:
  - Hard-fail if run_id, idea_id, or boundary paths do not match
- Writes build output to: `builds/<idea_dir>/`
  - ❌ Never write builds to a fixed `/mobile` directory

### Command: `validate run`
Validates the most recent run (or current run if active):
- Confirms Stage JSON artifacts exist on disk and validate against schemas
- Confirms Stage 01 produced exactly 10 ideas
- Confirms each idea pack contains:
  - boundary metadata
  - correct meta.* fields for every stage
- No generation. Validation only.

### Command: `show status`
Prints the current run status using run manifests and per-idea stage_status.json files.
- No generation. No mutation.

### Command Execution Semantics

## 🌐 GLOBAL LEADERBOARD (CROSS-RUN, APPEND-ONLY)

### Purpose
App Factory MUST maintain a global, cross-run leaderboard that aggregates all app ideas generated across all runs, using Stage 01 ranking signals.

This leaderboard exists for:
- long-term idea quality tracking
- analytics
- external tools (e.g. App Miner)
- dashboards

It MUST NOT affect downstream stages.

### Canonical Files (MANDATORY)
```
leaderboards/
  app_factory_all_time.json   # authoritative
  app_factory_all_time.csv    # derived mirror
```

### When the Leaderboard Is Updated
- The leaderboard MUST be updated immediately after Stage 01 completes successfully
- It MUST NOT wait for Stages 02–09
- If Stage 01 fails, the leaderboard MUST NOT be modified

### Leaderboard Entry Rules
- One entry per idea per run (10 entries per successful Stage 01)
- Append-only. Never rewrite or re-rank historical entries
- Identity key: idea_id + run_id
- Each entry MUST include:
  - run_id
  - run_date
  - rank (1–10, local to the run)
  - score (if available)
  - idea_id
  - idea_name
  - idea_slug
  - market
  - target_user
  - core_loop
  - evidence_summary
  - source paths to the originating run + stage01.json

### Sorting Semantics (GLOBAL VIEW)
Global ordering is defined as:
1. score (descending, if present)
2. run_date (descending)
3. rank (ascending)

### Isolation Rule (CRITICAL)
- Stages 02–10 MUST NOT read from the leaderboard
- The leaderboard is write-only at Stage 01 and read-only for humans and external tools
- Idea packs remain fully isolated

### Failure Handling
If leaderboard append fails:
- Write `leaderboards/leaderboard_failure.md` with:
  - run_id
  - missing/invalid fields
  - remediation steps
- Stop execution immediately

**Output Structure**:
```
runs/YYYY-MM-DD/<run_name>/
  stage01/stages/stage01.json (10 ideas)
  ideas/01_focusflow_ai__focus_ai_001/stages/stage02.json...stage09.json
  ideas/02_deepwork_zones__deep_work_002/stages/stage02.json...stage09.json
  ...10 complete idea packs
  meta/idea_index.json
```

## 📘 README ENFORCEMENT (UX CONSISTENCY)

README.md MUST present only these two user-facing commands:
- `run app factory`
- `build <IDEA_NAME>`

Any mention of:
- `run app factory (batch specs)`
- or other variants

MUST be removed or treated as internal aliases only.

### IMPLEMENTATION NOTE (NON-NEGOTIABLE)
Internally, "batch specs mode" may still exist as a concept, but it MUST be implicit and default.

Concretely:
- `run app factory` == batch workflow
- No other modes are user-visible
- CLAUDE.md and README.md must agree

---

## RUN DIRECTORY CONTRACT

### Batch Specs Mode Structure
`run app factory (batch specs)` creates this structure:

```
runs/YYYY-MM-DD/<run_name>/
├── inputs/
│   └── 00_intake.md                    # User requirements input
├── stage01/                           # Market research (shared)
│   ├── stages/stage01.json            # 10 validated app ideas  
│   ├── outputs/stage01_execution.md
│   └── spec/01_market_research.md
├── ideas/                             # Idea packs (isolated)
│   ├── 01_focusflow_ai__focus_ai_001/
│   │   ├── meta/
│   │   │   ├── idea.json              # Canonical idea definition
│   │   │   ├── boundary.json          # Isolation enforcement
│   │   │   ├── name.alias             # Human-readable name
│   │   │   └── stage_status.json      # Progress for this idea
│   │   ├── stages/
│   │   │   ├── stage02.json...stage09.json
│   │   ├── outputs/
│   │   │   ├── stage02_execution.md...stage09_execution.md
│   │   └── spec/
│   │       └── 02_product_spec.md...09_release_planning.md
│   ├── 02_deepwork_zones__deep_work_002/
│   │   └── [same structure for idea 2]
│   └── ...10 complete idea packs
└── meta/
    ├── idea_index.json                # ID->name->directory mapping
    ├── run_manifest.json              # Run metadata
    └── batch_status.json              # Overall progress
```

### Build Mode Structure  
`build app <IDEA_ID_OR_NAME>` adds:

```
builds/
└── <idea_dir>/                        # Clean build output
    ├── package.json                   # Complete Expo app
    ├── app.json
    ├── App.js
    ├── src/screens/...
    └── README.md

runs/.../ideas/<idea_dir>/
├── stages/stage10.json                # Build plan (plan-only)
├── outputs/stage10_build.log          # Binding proof
└── outputs/stage10_research.md        # Sources consulted
```

### Finder-Friendly Naming (MANDATORY)
Idea directories use deterministic naming: `<rank>_<idea_slug>__<idea_id>`
- `rank`: 01-10 from Stage 01 ranking  
- `idea_slug`: sanitized name (lowercase, underscores, alphanumeric only)
- `idea_id`: canonical ID from Stage 01
- Example: `01_focusflow_ai__focus_ai_001`

---

## ISOLATION AND BOUNDARY ENFORCEMENT

### Idea Pack Boundaries (MANDATORY)
Each idea pack in `runs/.../ideas/<idea_dir>/` has strict isolation:

**Allowed Paths** (per idea pack):
- `runs/.../ideas/<idea_dir>/` - ONLY this specific idea directory  
- `runs/.../stage01/stages/stage01.json` - lookup/confirmation only
- `runs/.../meta/idea_index.json` - lookup only

**Forbidden Paths**:
- `runs/.../ideas/` (other idea directories)
- Any other runs directories
- Any stage JSON files outside the idea pack's boundary

**Enforcement**:
- Every Stage 02-10 JSON MUST include meta fields:
  ```json
  "meta": {
    "run_id": "string",
    "idea_id": "string", 
    "idea_name": "string",
    "idea_dir": "string",
    "source_root": "runs/.../ideas/<idea_dir>/",
    "input_stage_paths": ["explicit list of files read"],
    "boundary_path": "runs/.../ideas/<idea_dir>/meta/boundary.json"
  }
  ```

**Cross-Contamination Prevention**:
- Stage 10 MUST verify all consumed Stage 02-09 JSONs have identical run_id and idea_id
- Stage 10 MUST verify all paths reside under the correct idea pack directory
- If mismatch detected: write `stage10_failure.md` and stop without building

### Stage Execution Contract

#### Stage 01 (Market Research) 
- Generates EXACTLY 10 ideas with unique idea_ids
- Validation fails if count != 10
- Creates shared stage01 directory structure
- Creates idea_index.json mapping

#### Stages 02-09 (Per Idea Pack)
**For each idea (automatic batch execution):**
- Read: `runs/.../ideas/<idea_dir>/meta/idea.json` (canonical idea)
- Read: Prior stage JSONs from same idea pack only
- Write: `runs/.../ideas/<idea_dir>/stages/stageNN.json` 
- Validate: Against schema with boundary enforcement
- Log: `runs/.../ideas/<idea_dir>/outputs/stageNN_execution.md`
- Render: `runs/.../ideas/<idea_dir>/spec/NN_*.md`

#### Stage 10 (Build Mode)
- Triggered by: `build app <IDEA_ID_OR_NAME>`
- Reads: Selected idea pack's Stage 02-09 JSONs only
- Validates: All inputs have matching meta.idea_id and meta.run_id
- Researches: Official Expo/RevenueCat docs + category UI patterns
- Writes: Complete Expo app to `builds/<idea_dir>/`
- Proves: Binding constraints from specs to implementation

---

## DEFINITION OF DONE

### Batch Specs Mode (`run app factory (batch specs)`)
**MUST verify ALL of these before claiming completion:**

**Stage 01 Complete**:
- [ ] `runs/.../stage01/stages/stage01.json` exists with EXACTLY 10 ideas
- [ ] Each idea has unique idea_id
- [ ] `runs/.../meta/idea_index.json` created with rank/slug/directory mapping

**All 10 Idea Packs Complete** (Stages 02-09):
- [ ] 10 directories: `runs/.../ideas/01_*__*/ ... 10_*__*/`
- [ ] Each has `meta/idea.json`, `meta/boundary.json`, `meta/stage_status.json`
- [ ] Each has `stages/stage02.json...stage09.json` (all validated)
- [ ] Each has `outputs/stage02_execution.md...stage09_execution.md`
- [ ] Each has `spec/02_*.md...09_*.md` 
- [ ] All stage JSONs have proper meta fields with matching idea_id

**Auto-Continuation Rules**:
- NO PAUSES between stages or ideas
- Continues until all 10 idea packs have Stage 09 complete
- Only stops on: hard failure OR user interruption

### Build Mode (`build app <IDEA_ID_OR_NAME>`)
**MUST verify ALL of these:**
- [ ] `builds/<idea_dir>/` exists with complete Expo app
- [ ] `builds/<idea_dir>/package.json` has required dependencies  
- [ ] `builds/<idea_dir>/src/` contains screens, components, services
- [ ] `runs/.../ideas/<idea_dir>/stages/stage10.json` (plan-only JSON)
- [ ] `runs/.../ideas/<idea_dir>/outputs/stage10_build.log` (binding proof)
- [ ] `runs/.../ideas/<idea_dir>/outputs/stage10_research.md` (sources cited)
- [ ] Boundary verification: all inputs from correct idea pack only

**CRITICAL**: If ANY artifact is missing, Claude MUST write failure report and stop.

---

## ERROR HANDLING

### Schema Validation Failures
1. Read validation error from `python -m appfactory.schema_validate`
2. Fix JSON output to conform to schema
3. Re-validate (maximum 3 attempts)
4. If still failing, write detailed error to execution log and stop

### File Write Failures  
1. Check directory permissions
2. Verify disk space
3. Try alternative file path if needed
4. Log failure details and stop if unrecoverable

### Missing Dependencies
1. Check that previous stages completed successfully
2. Verify required input files exist
3. Log missing dependencies and stop

---

## STAGE TEMPLATES CONTRACT

All templates in `templates/agents/` must be agent-native compatible:

### Required Template Structure
```markdown
# Stage NN: [Name]

## AGENT-NATIVE EXECUTION
You are Claude executing this stage directly. Write artifacts to disk.

## INPUTS
- Read: runs/.../stages/stage*.json (previous stages)
- Read: runs/.../inputs/00_intake.md

## OUTPUTS
- Write: runs/.../stages/stageNN.json
- Write: runs/.../outputs/stageNN_execution.md  
- Render: runs/.../spec/NN_*.md

## JSON SCHEMA
[Schema definition]

## EXECUTION STEPS
1. Read inputs from run directory
2. Generate JSON conforming to schema  
3. Write and validate JSON file
4. Log execution details
5. Render specification markdown

DO NOT output JSON in chat. Write to disk only.
```

### Forbidden Template Patterns
- ❌ "Respond with ONLY JSON"
- ❌ "Output raw JSON"
- ❌ References to subprocess execution
- ❌ Instructions to print JSON to stdout

---

## VALIDATION AND UTILITIES

### Schema Validation
```bash
python -m appfactory.schema_validate <schema_path> <json_path>
```
Returns exit code 0 on success, non-zero on failure.

### Markdown Rendering  
```bash
python -m appfactory.render_markdown <stage_num> <stage_json_path>
```
Renders templates to specification markdown.

### Status Checking
```bash
python -m appfactory.paths current_run
python -m appfactory.paths validate_structure <run_path>
```

---

## GLOBAL CONSTRAINTS

### Technology Stack (Stage 10)
- React Native with Expo (latest stable)
- TypeScript for type safety
- RevenueCat for subscriptions
- React Navigation for navigation
- AsyncStorage for persistence

### Business Requirements
- Subscription-only monetization
- Guest-first authentication
- iOS + Android support
- Store submission ready
- GDPR/CCPA compliant

### File Naming Conventions
- Stage files: `stageNN.json` (zero-padded)
- Execution logs: `stageNN_execution.md`
- Validation files: `stageNN_validation.json`
- Specs: `NN_descriptive_name.md`

---

## GENERATED ARTIFACTS & CLEANUP

### Generated Directories (Non-Source)
- **`runs/`** - All pipeline execution outputs, logs, and specifications
- **`builds/`** - Complete React Native apps built from selected ideas  

These directories contain generated artifacts and are ignored by git.

### Mode-Specific Behavior
- **EDIT MODE**: Claude may delete `runs/` and `builds/` as part of cleanup requests
- **RUN MODE**: These are the ONLY places new artifacts should be written
- **Build output**: MUST go to `builds/<idea_dir>/` (never `/mobile`)

### Repository Hygiene
Generated artifacts are cleaned via `scripts/clean_repo.sh` and ship-readiness verified via `scripts/ship_check.sh`. Source code directories (`templates/`, `schemas/`, `standards/`, `runbooks/`, `scripts/`) are never modified during cleanup.

---

**CONSTITUTION END**: This document defines the complete agent-native execution framework. Claude must follow these specifications exactly. When in doubt, prioritize file evidence over claims.