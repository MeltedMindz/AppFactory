# Batch Mode Execution Runbook

## Purpose
This runbook defines the execution algorithm for `run app factory (batch specs)` command, which generates complete specifications for 10 app ideas automatically without pausing.

## Command: `run app factory (batch specs)`

### Execution Algorithm (MANDATORY - NO DEVIATIONS)

#### Stage 01: Market Research (Shared)
1. **Execute Stage 01**:
   - Read `runs/.../inputs/00_intake.md`
   - Generate market research + EXACTLY 10 app ideas
   - Write `runs/.../stage01/stages/stage01.json`
   - **HARD VALIDATION**: Fail if idea count != 10 or duplicate idea_ids
   - Write execution log and render spec

2. **Create Idea Index**:
   - Extract 10 ideas from stage01.json in rank order
   - For each idea, compute:
     - `rank`: 01-10 based on position in array
     - `idea_slug`: sanitized lowercase name (alphanumeric + underscores only)
     - `idea_dir`: `<rank>_<idea_slug>__<idea_id>`
   - Write `runs/.../meta/idea_index.json`:
     ```json
     {
       "run_id": "string",
       "total_ideas": 10,
       "ideas": [
         {
           "rank": 1,
           "idea_id": "focus_ai_001",
           "idea_name": "FocusFlow AI",
           "idea_slug": "focusflow_ai", 
           "idea_dir": "01_focusflow_ai__focus_ai_001"
         }
       ]
     }
     ```

#### Idea Pack Creation (For Each of 10 Ideas)
3. **Create Idea Pack Directories**:
   - Create `runs/.../ideas/<idea_dir>/`
   - Create subdirectories: `meta/`, `stages/`, `outputs/`, `spec/`

4. **Create Isolation Boundaries**:
   - Write `runs/.../ideas/<idea_dir>/meta/idea.json` (canonical frozen idea definition)
   - Write `runs/.../ideas/<idea_dir>/meta/boundary.json`:
     ```json
     {
       "idea_id": "string",
       "idea_dir": "string", 
       "allowed_roots": ["runs/.../ideas/<idea_dir>/"],
       "allowed_shared_paths": [
         "runs/.../stage01/stages/stage01.json",
         "runs/.../meta/idea_index.json"
       ],
       "forbidden_roots": [
         "runs/.../ideas/", 
         "any other runs directories"
       ]
     }
     ```
   - Write `runs/.../ideas/<idea_dir>/meta/name.alias` (plain text app name)
   - Initialize `runs/.../ideas/<idea_dir>/meta/stage_status.json`

#### Batch Execution Loop (AUTOMATIC - NO PAUSES)
5. **For each idea (1-10) execute Stages 02-09 in sequence**:
   - **NO PAUSES** between stages or ideas
   - **NO "Stage N complete - type continue" behavior**
   - Only stop on: (a) hard failure with written report, (b) user interruption

6. **Per-Stage Execution** (Stages 02-09):
   ```
   FOR idea_rank = 1 TO 10:
     FOR stage_num = 02 TO 09:
       - Read: runs/.../ideas/<idea_dir>/meta/idea.json (canonical idea)
       - Read: Prior stage JSONs from SAME idea pack only  
       - Execute: Stage template with boundary enforcement
       - Generate: JSON with required meta fields:
         {
           "meta": {
             "run_id": "string",
             "idea_id": "string",
             "idea_name": "string", 
             "idea_dir": "string",
             "source_root": "runs/.../ideas/<idea_dir>/",
             "input_stage_paths": ["explicit list of files read"],
             "boundary_path": "runs/.../ideas/<idea_dir>/meta/boundary.json"
           }
         }
       - Write: runs/.../ideas/<idea_dir>/stages/stageNN.json
       - Validate: Against schema (hard-fail if invalid)
       - Log: runs/.../ideas/<idea_dir>/outputs/stageNN_execution.md
       - Render: runs/.../ideas/<idea_dir>/spec/NN_*.md
       - Update: runs/.../ideas/<idea_dir>/meta/stage_status.json
   ```

#### Completion Verification
7. **Verify All Artifacts Created**:
   - 10 idea pack directories with correct naming
   - Each has stages/stage02.json through stage09.json (80 total files)
   - Each has corresponding execution logs and spec markdown
   - All JSONs validate against schemas
   - All JSONs have proper meta fields with matching idea_id

### Auto-Continuation Rules (ENFORCED)

**MUST CONTINUE automatically until:**
- All 10 idea packs have completed Stage 09, OR
- Hard failure occurs with written failure report, OR  
- User explicitly interrupts execution

**FORBIDDEN behaviors:**
- ❌ Stopping after Stage 01 to wait for user input
- ❌ Stopping after completing one idea pack to wait for user input
- ❌ Any "Stage N complete - type continue" messages
- ❌ Requesting user choice between ideas
- ❌ Pausing for confirmation between stages

### Hard Failure Conditions

**Immediate stop with failure report if:**
- Stage 01 generates != 10 ideas
- Duplicate idea_ids detected
- Schema validation failure
- Boundary violation (reading from wrong idea pack)
- File write permission errors
- Missing required dependencies

**Failure Report Format**:
Write `runs/.../outputs/batch_failure.md`:
```markdown
# Batch Mode Execution Failure

## Failure Details
- **Failed at**: Stage NN, Idea: <idea_name> (<idea_id>)
- **Error**: [Specific error message]
- **Timestamp**: [ISO timestamp]

## Artifacts Status
- Ideas completed: N/10
- Total stage JSONs created: N/80
- Last successful stage: NN

## Recovery Instructions
[Specific steps to resolve and resume]
```

### Success Criteria

Batch mode is complete when:
- [ ] 10 idea pack directories created with proper naming
- [ ] Each idea pack has 8 stage JSONs (stage02.json through stage09.json) 
- [ ] All 80 stage JSONs validate against schemas
- [ ] All stage JSONs have proper meta fields
- [ ] All execution logs exist and show no errors
- [ ] All spec markdown files rendered successfully
- [ ] runs/.../meta/batch_status.json shows "completed"

**Output**: 10 complete idea packs ready for build mode selection.