# Stage 01: Market Research

## AGENT-NATIVE EXECUTION
You are Claude executing Stage 01 directly for BATCH SPECS MODE. After completing Stage 01, you MUST automatically continue with Stages 02-09 for ALL 10 ideas without pausing.

## INPUTS
- Read: `runs/.../inputs/00_intake.md` (user requirements)

## OUTPUTS
- Write: `runs/.../stage01/stages/stage01.json` (validated JSON with EXACTLY 10 ideas)
- Write: `runs/.../stage01/outputs/stage01_execution.md` (execution log)  
- Render: `runs/.../stage01/spec/01_market_research.md` (specification)
- Create: `runs/.../meta/idea_index.json` (idea ID to directory mapping)
- Create: 10 idea pack directories with isolation boundaries

## JSON SCHEMA

```json
{
  "market_research": {
    "trends": [
      {
        "name": "string",
        "description": "string",
        "evidence": "string", 
        "opportunity_level": "High|Medium|Low"
      }
    ],
    "competition_landscape": {
      "oversaturated": ["string"],
      "underexplored": ["string"]
    },
    "monetization_trends": "string"
  },
  "app_ideas": [
    {
      "id": "string",
      "name": "string", 
      "validation_score": "number (1-10)",
      "signal_source": "string",
      "description": "string",
      "target_user": "string",
      "pain_point_evidence": "string",
      "core_loop": ["string"],
      "differentiation": "string",
      "subscription_fit": "string",
      "mvp_complexity": "S|M|L",
      "pricing": {
        "monthly_range": "string",
        "annual_range": "string", 
        "trial_strategy": "string"
      }
    }
  ]
}
```

## RESEARCH REQUIREMENTS

Generate exactly 10 subscription-based mobile app ideas based on:

### Signal Sources
- Reddit complaints and feature requests
- App Store negative reviews
- TikTok/social media workflow frustrations  
- IndieHackers validated discussions

### Constraints
- Subscription-viable business models only
- Avoid: medical, gambling, crypto/trading
- Target: low/medium competition markets
- MVP scope: buildable in single stage

### Validation Scoring (1-10)
- Signal Strength (40%): Evidence of real demand
- Competition Gap (30%): Market saturation level  
- Subscription Fit (20%): Monthly payment viability
- MVP Feasibility (10%): Development complexity

## EXECUTION STEPS (BATCH MODE)

### Phase 1: Market Research
1. Read user requirements from `runs/.../inputs/00_intake.md`
2. Generate market research and EXACTLY 10 app ideas conforming to JSON schema
3. Write JSON to `runs/.../stage01/stages/stage01.json`
4. Validate: Hard-fail if idea count != 10 or missing unique idea_ids
5. Document execution in `runs/.../stage01/outputs/stage01_execution.md`
6. Render specification: `runs/.../stage01/spec/01_market_research.md`

### Phase 2: Idea Pack Setup
7. Create `runs/.../meta/idea_index.json` with rank/slug/directory mapping
8. For each of the 10 ideas, create directory: `runs/.../ideas/<rank>_<slug>__<idea_id>/`
9. For each idea pack, create:
   - `meta/idea.json` (canonical frozen idea definition)
   - `meta/boundary.json` (isolation enforcement)
   - `meta/name.alias` (human-readable name)
   - `meta/stage_status.json` (progress tracking)

### Phase 3: Global Leaderboard Update (MANDATORY)
10. **Update Global Leaderboard**:
    - Read current: `leaderboards/app_factory_all_time.json`
    - For each of the 10 ideas from stage01.json:
      - Create leaderboard entry with:
        - run_id, run_date, rank (1-10), score (if available)
        - idea_id, idea_name, idea_slug
        - market, target_user, core_loop
        - evidence_summary (brief justification)
        - source_stage01_path
    - Append entries to JSON file (never rewrite existing)
    - Update derived CSV file with same data
    - If append fails: write `leaderboards/leaderboard_failure.md` and STOP

### Phase 4: Batch Execution (AUTOMATIC - NO PAUSES)
11. Execute Stages 02-09 for idea #1 (complete all stages)
12. Execute Stages 02-09 for idea #2 (complete all stages)
13. Continue for all 10 ideas automatically
14. Only stop on hard failure or user interruption

## SUCCESS CRITERIA

BATCH SPECS MODE is complete when:
- [ ] `stage01.json` exists with EXACTLY 10 ideas (validated)
- [ ] `idea_index.json` created with all mappings
- [ ] 10 idea pack directories created with proper naming
- [ ] All 10 idea packs have Stages 02-09 completed
- [ ] All 90 stage JSONs (9 per idea) validate against schemas
- [ ] No execution logs show errors

## HARD FAILURE CONDITIONS
- Idea count != 10 → Write failure report and stop
- Duplicate idea_ids → Write failure report and stop  
- Schema validation failure → Write failure report and stop

DO NOT output JSON in chat. Write to disk only. Continue automatically through all stages and ideas.