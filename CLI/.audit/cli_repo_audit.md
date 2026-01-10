# CLI Repository Audit Summary

**Date**: 2026-01-10
**Auditor**: Claude Code (Opus 4.5)
**Purpose**: Document the_factory pipeline for CLI implementation

---

## Executive Summary

The App Factory pipeline consists of 20 stage templates that transform market research into store-ready Expo React Native applications. The CLI must orchestrate this same pipeline using the Anthropic API, reusing existing templates, schemas, and enforcement scripts.

---

## 1. Pipeline Stage Ordering

### Stage Execution Sequence

| Stage | Template File | Purpose | Command Mode |
|-------|--------------|---------|--------------|
| 01 | `01_dream.md` | Market Research + 10 Ranked Ideas | `run` |
| 01_dream | `01_dream.md` (variant) | Single Idea Validation | `dream` |
| 02 | `02_product_spec.md` | Product Specification | `build` |
| 02.5 | `02.5_product_reality.md` | Core Loop & Domain Model | `build` |
| 02.7 | `02.7_dependency_resolution.md` | Dependency Planning | `build` |
| 03 | `03_ux.md` | UX Design | `build` |
| 04 | `04_monetization.md` | Monetization Strategy | `build` |
| 05 | `05_architecture.md` | Technical Architecture | `build` |
| 06 | `06_builder_handoff.md` | Implementation Handoff | `build` |
| 07 | `07_polish.md` | Quality Standards | `build` |
| 08 | `08_brand.md` | Brand Identity | `build` |
| 08.5 | `08.5_visual_identity_assets.md` | Visual Identity Assets | `build` |
| 09 | `09_release_planning.md` | Release Planning + ASO | `build` |
| 09.1 | `09.1_app_naming.md` | App Naming | `build` |
| 09.2 | `09.2_policy_pages.md` | Privacy/Terms | `build` |
| 09.5 | `09.5_runtime_sanity_harness.md` | Runtime Verification | `build` |
| 09.7 | `09.7_build_contract_synthesis.md` | Build Contract | `build` |
| 10.1 | `10.1_design_authenticity_check.md` | Design Authenticity | `build` |
| 10 | `10_app_builder.md` | Expo React Native Build | `build/dream` |

---

## 2. Key Paths (Reuse vs Reimplement)

### REUSE DIRECTLY (Reference via Path Resolution)

| Asset Type | Path | CLI Usage |
|-----------|------|-----------|
| Stage Templates | `the_factory/templates/agents/*.md` | Read and render as prompts |
| JSON Schemas | `the_factory/schemas/*.json` | Validate stage outputs |
| Enforcement Scripts | `the_factory/scripts/*.sh` | Execute via child_process |
| Standards Document | `the_factory/standards/mobile_app_best_practices_2026.md` | Include in prompts |
| Vendor Docs | `the_factory/vendor/` | Reference for stages |
| Runbooks | `the_factory/runbooks/*.md` | Execution reference |

### REIMPLEMENT (CLI-Specific)

| Component | Reason |
|-----------|--------|
| Run manifest creation | CLI must write run_manifest.json |
| Stage execution loop | CLI orchestrates API calls |
| Idea index management | CLI manages idea_index.json |
| Progress tracking | CLI tracks stage_status.json |
| Leaderboard updates | CLI appends to leaderboard files |

---

## 3. Schema Validation Flow

**Location**: `the_factory/schemas/`

### Validation Rules

1. After each stage JSON is generated, validate against corresponding schema
2. Schema validation is **HARD-FAIL** - no stubs or placeholders
3. Maximum 3 validation attempts before permanent failure
4. Use AJV or similar JSON Schema validator in TypeScript

### Schema Files

```
stage01.json           - 10 ranked ideas (minItems: 10, maxItems: 10)
stage01_dream.json     - Single dream idea
stage02.json           - Product spec
stage02.5_schema.json  - Product reality
stage02.7_schema.json  - Dependency resolution
stage03.json           - UX design
stage04.json           - Monetization
stage05.json           - Architecture
stage06.json           - Builder handoff
stage07.json           - Polish
stage08.json           - Brand
stage09.json           - Release planning
stage09.5_schema.json  - Runtime sanity
stage10.1_schema.json  - Design authenticity
stage10.json           - Build plan
```

---

## 4. Output Directory Structure

### Run Directory

```
runs/YYYY-MM-DD/<run_id>/
├── inputs/
│   └── 00_intake.md
├── stage01/
│   ├── stages/stage01.json
│   ├── outputs/stage01_execution.md
│   └── spec/01_market_research.md
├── ideas/
│   └── 01_<slug>__<idea_id>/
│       ├── stages/stage02.json ... stage10.json
│       ├── outputs/
│       ├── spec/
│       ├── app/_contract/
│       └── meta/
└── meta/
    ├── run_manifest.json
    ├── idea_index.json
    └── batch_status.json
```

### Build Directory

```
builds/<idea_dir>/<build_id>/
├── app/
│   ├── package.json
│   ├── app.json
│   ├── src/
│   └── assets/
├── build_log.md
└── sources.md
```

---

## 5. Enforcement Scripts (Stage 10 Gates)

### Mandatory Gates (CLI Must Execute)

| Script | Purpose | Exit Code |
|--------|---------|-----------|
| `verify_build_contract_present.sh` | Contract exists | 0=pass |
| `verify_build_contract_sections.sh` | 14 sections present | 0=pass |
| `verify_build_prompt_is_comprehensive.sh` | Contract quality | 0=pass |
| `validate_dependencies.sh` | npm packages valid | 0=pass |
| `build_proof_gate.sh` | npm install + expo check | 0=pass |
| `verify_uiux_implementation.sh` | UI quality | 0=pass |
| `generate_assets.sh` | Asset generation | 0=pass |
| `verify_assets_present.sh` | Assets exist | 0=pass |
| `aggregate_market_research.sh` | Research bundling | 0=pass |

### Execution Order

1. Verify build contract (3 validators)
2. Write package.json
3. Validate dependencies
4. npm install
5. Build proof gate (expo checks)
6. UI/UX verification
7. Asset generation + verification
8. Research aggregation
9. Final success marking

---

## 6. Command Behavior Mapping

### `appfactory run`

Maps to: `run app factory` in claude.md

1. Execute Stage 01 only
2. Generate exactly 10 ranked ideas
3. Create idea directories with metadata
4. Update leaderboard
5. Stop (no auto-continue)

### `appfactory build <ideaId>`

Maps to: `build <IDEA_ID_OR_NAME>` in claude.md

1. Resolve idea from idea_index.json
2. Execute missing stages 02-09 in order
3. Execute Stage 09.7 (build contract)
4. Execute Stage 10 (app generation)
5. Run all enforcement gates
6. Write to builds/

### `appfactory dream "<prompt>"`

Maps to: `dream <IDEA_TEXT>` in claude.md

1. Create dream run directory
2. Execute Stage 01 (dream variant - single idea)
3. Execute Stages 02-09 automatically
4. Execute Stage 10
5. Produce complete app

### `appfactory doctor`

New CLI-specific command:

1. Validate .env exists with ANTHROPIC_API_KEY
2. Validate the_factory/ exists with expected structure
3. Check Node.js version
4. Verify required scripts executable

### `appfactory list`

New CLI-specific command:

1. Read runs/ directory structure
2. Read builds/ directory structure
3. Display recent runs and builds

### `appfactory resume <runId>`

New CLI-specific command:

1. Load run_manifest.json for run
2. Determine incomplete stages
3. Resume from last complete stage

---

## 7. Run Manifest Contract

### Required Fields

```json
{
  "run_id": "string",
  "run_name": "string",
  "date": "ISO8601",
  "command_invoked": "run|build|dream",
  "expected_idea_count": 10,
  "expected_stages_run_factory": ["01"],
  "expected_stages_build_idea": ["02", "02.5", "02.7", ...],
  "idea_index_path": "meta/idea_index.json",
  "per_idea": {
    "<idea_id>": {
      "idea_dir": "string",
      "status": "unbuilt|in_progress|completed|failed",
      "stages_completed": [],
      "build_id": null
    }
  },
  "run_status": "pending|in_progress|completed|failed",
  "failure": null
}
```

---

## 8. API Integration Requirements

### Model Selection

- Default: claude-sonnet-4-20250514 (cost-effective)
- Override via ANTHROPIC_MODEL env var
- Stage 10 may benefit from opus for complex generation

### Prompt Construction

1. Read stage template from `the_factory/templates/agents/`
2. Inject stage inputs (prior stage JSONs, idea.json)
3. Include standards document reference
4. Include relevant runbook sections
5. Request JSON output matching schema

### Output Handling

1. Parse JSON from Claude response
2. Validate against schema
3. Write to appropriate file path
4. Update stage_status.json
5. Log execution to outputs/

---

## 9. Critical Constraints (CLI Must Enforce)

1. **Exactly 10 ideas from Stage 01** - Schema enforces minItems/maxItems
2. **Single-idea-only build mode** - Never modify other ideas during build
3. **Boundary isolation** - Strict path boundaries per idea
4. **Build contract mandatory** - Stage 10 requires Stage 09.7 output
5. **Contract-only code generation** - Stage 10 reads only build_prompt.md
6. **Enforcement scripts non-negotiable** - All gates must pass
7. **Schema validation hard-fail** - No stubs or false success
8. **Leaderboard isolation** - Only updated during run, not build/dream

---

## 10. Implementation Recommendations

### Path Resolution Strategy

```typescript
// Core paths relative to the_factory
const FACTORY_ROOT = path.join(__dirname, '../../the_factory');
const TEMPLATES = path.join(FACTORY_ROOT, 'templates/agents');
const SCHEMAS = path.join(FACTORY_ROOT, 'schemas');
const SCRIPTS = path.join(FACTORY_ROOT, 'scripts');
const RUNS = path.join(FACTORY_ROOT, 'runs');
const BUILDS = path.join(FACTORY_ROOT, 'builds');
```

### Stage Execution Model

```typescript
interface StageResult {
  stageId: string;
  success: boolean;
  outputPath: string;
  schemaValidated: boolean;
  executionLogPath: string;
}

async function executeStage(
  stageId: string,
  inputs: StageInputs,
  config: PipelineConfig
): Promise<StageResult>;
```

### Error Handling

- Exit code 0: Success
- Exit code 1: User error (bad input)
- Exit code 2: Pipeline error (stage failed)
- Exit code 3: Configuration error (missing key, wrong repo)

---

## Conclusion

The CLI implementation must:

1. **Reuse** all existing templates, schemas, and scripts
2. **Replicate** the exact execution model from claude.md
3. **Enforce** all validation gates and constraints
4. **Write** artifacts to canonical locations
5. **Never** bypass or weaken any enforcement

The CLI is a faithful executor of the same pipeline, using the Anthropic API instead of Claude Code modes.

---

*Audit completed: 2026-01-10*
