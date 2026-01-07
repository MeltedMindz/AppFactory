# App Factory Global Leaderboard

## Purpose

The global leaderboard aggregates all app ideas generated across all App Factory runs, providing long-term tracking of idea quality and analytics.

## Files

- **`app_factory_all_time.json`** - Authoritative leaderboard (structured data)
- **`app_factory_all_time.csv`** - Derived mirror (analytics-friendly format)
- **`leaderboard_failure.md`** - Written if leaderboard append fails

## Update Rules

### When Updated
- Immediately after Stage 01 completes successfully
- NOT updated if Stage 01 fails
- NEVER updated by downstream stages

### Entry Rules
- One entry per idea per run (10 entries per successful Stage 01)
- Append-only: Never rewrite or re-rank historical entries
- Identity key: idea_id + run_id (must be unique)

### Required Fields
Each entry must include:
- `run_id` - Unique run identifier
- `run_date` - ISO date when run was created
- `rank` - 1-10 local rank within the run
- `score` - Quality score if available
- `idea_id` - Unique idea identifier
- `idea_name` - Human-readable app name
- `idea_slug` - URL-safe slug
- `market` - Target market/category
- `target_user` - Primary user persona
- `core_loop` - Main user interaction pattern
- `evidence_summary` - Brief evidence justification
- `source_stage01_path` - Path to originating stage01.json

## Global Sorting

Entries are sorted by:
1. score (descending, if present)
2. run_date (descending) 
3. rank (ascending)

## Isolation

- Stages 02-10 MUST NOT read from the leaderboard
- Leaderboard is write-only at Stage 01
- Read-only for humans and external tools
- Idea packs remain fully isolated

## Failure Handling

If leaderboard append fails:
1. Write `leaderboards/leaderboard_failure.md` with:
   - run_id that failed
   - missing/invalid fields
   - remediation steps
2. Stop execution immediately

## External Access

External tools can read:
- JSON file for structured queries
- CSV file for analytics and reporting
- This README for documentation

Never modify files directly - only Stage 01 appends entries.