/**
 * Pipeline Orchestration Module
 *
 * Orchestrates the execution of pipeline stages deterministically.
 */

import path from 'path';
import crypto from 'crypto';
import { readJson, writeJson, fileExists, ensureDir } from './io.js';
import { createRunPath, getIdeaPath, getBuildPath, getScriptsDir, getLeaderboardsDir } from './paths.js';
import {
  executeStage,
  executeScript,
  getRunStages,
  getBuildStages,
  getDreamStages,
  StageInputs
} from './stages.js';
import { logger } from './logging.js';
import { acquireLock, releaseLock } from './locks.js';

// Run manifest structure
export interface RunManifest {
  run_id: string;
  run_name: string;
  date: string;
  command_invoked: 'run' | 'build' | 'dream';
  expected_idea_count: number;
  expected_stages_run_factory: string[];
  expected_stages_build_idea: string[];
  expected_stages_dream: string[];
  idea_index_path: string;
  builds_root: string;
  per_idea: Record<string, IdeaStatus>;
  run_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  failure: { stage: string; error: string } | null;
  stages_completed: string[];
  inputs_hash: string;
  model: string;
}

export interface IdeaStatus {
  idea_dir: string;
  status: 'unbuilt' | 'in_progress' | 'completed' | 'failed';
  stages_completed: string[];
  missing_artifacts: string[];
  build_id: string | null;
}

// Idea index entry
export interface IdeaIndexEntry {
  id: string;
  name: string;
  slug: string;
  directory: string;
  rank: number;
  validation_score: number;
}

// Pipeline configuration
export interface PipelineConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  outputRoot?: string;
  intake?: string;
}

// Generate a unique run ID
export function generateRunId(command: string): string {
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '_')
    .replace(/\..+/, '');

  const suffix = command === 'dream' ? 'dream' : 'app_factory_run';

  return `${timestamp}_${suffix}`;
}

// Generate hash of inputs for determinism tracking
function hashInputs(inputs: Record<string, unknown>): string {
  const content = JSON.stringify(inputs, Object.keys(inputs).sort());
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// Create initial run manifest
export function createRunManifest(
  runId: string,
  command: 'run' | 'build' | 'dream',
  model: string,
  inputsHash: string
): RunManifest {
  return {
    run_id: runId,
    run_name: runId,
    date: new Date().toISOString(),
    command_invoked: command,
    expected_idea_count: command === 'dream' ? 1 : 10,
    expected_stages_run_factory: ['01'],
    expected_stages_build_idea: ['02', '02.5', '02.7', '03', '04', '05', '06', '07', '08', '08.5', '09', '09.1', '09.2', '09.5', '09.7', '10.1', '10'],
    expected_stages_dream: ['01_dream', '02', '02.5', '02.7', '03', '04', '05', '06', '07', '08', '08.5', '09', '09.1', '09.2', '09.5', '09.7', '10.1', '10'],
    idea_index_path: 'meta/idea_index.json',
    builds_root: 'builds/',
    per_idea: {},
    run_status: 'pending',
    failure: null,
    stages_completed: [],
    inputs_hash: inputsHash,
    model
  };
}

// Load existing run manifest
export function loadRunManifest(runPath: string): RunManifest | null {
  const manifestPath = path.join(runPath, 'meta', 'run_manifest.json');

  if (!fileExists(manifestPath)) {
    return null;
  }

  return readJson<RunManifest>(manifestPath);
}

// Save run manifest
export function saveRunManifest(runPath: string, manifest: RunManifest): void {
  const manifestPath = path.join(runPath, 'meta', 'run_manifest.json');
  ensureDir(path.dirname(manifestPath));
  writeJson(manifestPath, manifest);
}

// Load idea index
export function loadIdeaIndex(runPath: string): IdeaIndexEntry[] {
  const indexPath = path.join(runPath, 'meta', 'idea_index.json');

  if (!fileExists(indexPath)) {
    return [];
  }

  return readJson<IdeaIndexEntry[]>(indexPath);
}

// Save idea index
export function saveIdeaIndex(runPath: string, index: IdeaIndexEntry[]): void {
  const indexPath = path.join(runPath, 'meta', 'idea_index.json');
  ensureDir(path.dirname(indexPath));
  writeJson(indexPath, index);
}

// Find idea by ID or name
export function findIdea(
  ideaQuery: string
): { runPath: string; ideaDir: string; idea: IdeaIndexEntry } | null {
  // Try to find by ID, slug, or name in recent runs
  const { listRecentRuns } = require('./paths.js');
  const runs = listRecentRuns(50);

  for (const runPath of runs) {
    const index = loadIdeaIndex(runPath);

    for (const idea of index) {
      if (
        idea.id === ideaQuery ||
        idea.slug === ideaQuery ||
        idea.directory === ideaQuery ||
        idea.name.toLowerCase() === ideaQuery.toLowerCase() ||
        idea.directory.includes(ideaQuery)
      ) {
        return { runPath, ideaDir: idea.directory, idea };
      }
    }
  }

  return null;
}

// Execute the run command (Stage 01 only)
export async function executeRun(config: PipelineConfig = {}): Promise<{
  success: boolean;
  runPath: string;
  runId: string;
  ideas: IdeaIndexEntry[];
  error?: string;
}> {
  const runId = generateRunId('run');
  const runPath = createRunPath(runId);

  logger.pipelineStart('run');

  // Acquire lock
  if (!acquireLock(runId, 'run')) {
    return {
      success: false,
      runPath,
      runId,
      ideas: [],
      error: 'Failed to acquire lock'
    };
  }

  const startTime = Date.now();

  try {
    // Create run directory structure
    ensureDir(path.join(runPath, 'inputs'));
    ensureDir(path.join(runPath, 'stage01', 'stages'));
    ensureDir(path.join(runPath, 'stage01', 'outputs'));
    ensureDir(path.join(runPath, 'stage01', 'spec'));
    ensureDir(path.join(runPath, 'ideas'));
    ensureDir(path.join(runPath, 'meta'));

    // Create intake
    const intakeContent = config.intake ||
      'Generate 10 innovative mobile app ideas based on current market trends and user needs. Focus on subscription-based monetization and offline-first functionality.';

    const intakePath = path.join(runPath, 'inputs', '00_intake.md');
    writeJson(intakePath.replace('.md', '.json'), { intake: intakeContent });

    // Create manifest
    const inputsHash = hashInputs({ intake: intakeContent });
    const manifest = createRunManifest(runId, 'run', config.model || 'claude-sonnet-4-20250514', inputsHash);
    manifest.run_status = 'in_progress';
    saveRunManifest(runPath, manifest);

    // Execute Stage 01
    const stages = getRunStages();
    const inputs: StageInputs = {
      runId,
      runPath,
      priorStages: {},
      intakeContent
    };

    const result = await executeStage(stages[0].id, inputs);

    if (!result.success) {
      manifest.run_status = 'failed';
      manifest.failure = { stage: stages[0].id, error: result.error || 'Unknown error' };
      saveRunManifest(runPath, manifest);

      return {
        success: false,
        runPath,
        runId,
        ideas: [],
        error: result.error
      };
    }

    manifest.stages_completed.push(stages[0].id);

    // Parse Stage 01 output to create idea index
    const stage01Output = readJson<{ app_ideas: Array<{
      id: string;
      name: string;
      validation_score: number;
    }> }>(result.outputPath!);

    const ideas: IdeaIndexEntry[] = stage01Output.app_ideas.map((idea, index) => {
      const slug = idea.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 20);
      const directory = `${String(index + 1).padStart(2, '0')}_${slug}__${idea.id}`;

      return {
        id: idea.id,
        name: idea.name,
        slug,
        directory,
        rank: index + 1,
        validation_score: idea.validation_score
      };
    });

    // Create idea directories
    for (const idea of ideas) {
      const ideaPath = path.join(runPath, 'ideas', idea.directory);
      ensureDir(path.join(ideaPath, 'meta'));

      // Write idea metadata
      writeJson(path.join(ideaPath, 'meta', 'idea.json'), {
        id: idea.id,
        name: idea.name,
        slug: idea.slug,
        rank: idea.rank,
        validation_score: idea.validation_score
      });

      writeJson(path.join(ideaPath, 'meta', 'boundary.json'), {
        idea_dir: idea.directory,
        run_id: runId,
        created: new Date().toISOString()
      });

      writeJson(path.join(ideaPath, 'meta', 'stage_status.json'), {
        status: 'unbuilt',
        stages_completed: [],
        current_stage: null
      });

      manifest.per_idea[idea.id] = {
        idea_dir: idea.directory,
        status: 'unbuilt',
        stages_completed: [],
        missing_artifacts: [],
        build_id: null
      };
    }

    // Save idea index
    saveIdeaIndex(runPath, ideas);

    // Update manifest
    manifest.run_status = 'completed';
    saveRunManifest(runPath, manifest);

    // Update leaderboard
    await updateLeaderboard(runPath, ideas);

    const duration = Date.now() - startTime;
    logger.pipelineComplete(duration);

    return {
      success: true,
      runPath,
      runId,
      ideas
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.pipelineFailed(error);

    return {
      success: false,
      runPath,
      runId,
      ideas: [],
      error
    };
  } finally {
    releaseLock();
  }
}

// Execute the build command
export async function executeBuild(
  ideaQuery: string,
  _config: PipelineConfig = {}
): Promise<{
  success: boolean;
  buildPath: string | null;
  error?: string;
}> {
  logger.pipelineStart(`build ${ideaQuery}`);

  // Find the idea
  const found = findIdea(ideaQuery);

  if (!found) {
    return {
      success: false,
      buildPath: null,
      error: `Idea not found: ${ideaQuery}`
    };
  }

  const { runPath, ideaDir, idea } = found;
  const ideaPath = getIdeaPath(runPath, ideaDir);

  // Load run manifest
  const manifest = loadRunManifest(runPath);
  if (!manifest) {
    return {
      success: false,
      buildPath: null,
      error: 'Run manifest not found'
    };
  }

  // Acquire lock
  if (!acquireLock(manifest.run_id, `build ${ideaDir}`)) {
    return {
      success: false,
      buildPath: null,
      error: 'Failed to acquire lock'
    };
  }

  const startTime = Date.now();

  try {
    // Create idea directory structure
    ensureDir(path.join(ideaPath, 'stages'));
    ensureDir(path.join(ideaPath, 'outputs'));
    ensureDir(path.join(ideaPath, 'spec'));
    ensureDir(path.join(ideaPath, 'app', '_contract'));
    ensureDir(path.join(ideaPath, 'meta'));

    // Update idea status
    const ideaStatus = manifest.per_idea[idea.id];
    if (ideaStatus) {
      ideaStatus.status = 'in_progress';
      saveRunManifest(runPath, manifest);
    }

    // Load intake
    const intakePath = path.join(runPath, 'inputs', '00_intake.json');
    const intakeContent = fileExists(intakePath) ?
      readJson<{ intake: string }>(intakePath).intake : '';

    // Load Stage 01 output
    const stage01Path = path.join(runPath, 'stage01', 'stages', 'stage01.json');
    const stage01Data = fileExists(stage01Path) ? readJson(stage01Path) : {};

    // Get build stages
    const stages = getBuildStages();
    const priorStages: Record<string, unknown> = { '01': stage01Data };

    // Execute each stage
    for (const stage of stages) {
      const stageOutputPath = path.join(ideaPath, 'stages', `stage${stage.id.replace('.', '_')}.json`);

      // Skip if already completed
      if (fileExists(stageOutputPath)) {
        logger.info(`Stage ${stage.id} already complete, skipping`);
        priorStages[stage.id] = readJson(stageOutputPath);
        continue;
      }

      const inputs: StageInputs = {
        runId: manifest.run_id,
        runPath,
        ideaDir,
        ideaPath,
        priorStages,
        intakeContent
      };

      const result = await executeStage(stage.id, inputs);

      if (!result.success) {
        if (ideaStatus) {
          ideaStatus.status = 'failed';
          saveRunManifest(runPath, manifest);
        }

        return {
          success: false,
          buildPath: null,
          error: `Stage ${stage.id} failed: ${result.error}`
        };
      }

      // Load output for next stage
      priorStages[stage.id] = readJson(result.outputPath!);

      // Update status
      if (ideaStatus) {
        ideaStatus.stages_completed.push(stage.id);
        saveRunManifest(runPath, manifest);
      }
    }

    // Execute enforcement scripts
    const scriptsDir = getScriptsDir();

    // Build contract verification
    const contractScripts = [
      'verify_build_contract_present.sh',
      'verify_build_contract_sections.sh',
      'verify_build_prompt_is_comprehensive.sh'
    ];

    for (const script of contractScripts) {
      const scriptPath = path.join(scriptsDir, script);
      if (fileExists(scriptPath)) {
        const result = await executeScript(scriptPath, [ideaDir], runPath);
        if (!result.success) {
          return {
            success: false,
            buildPath: null,
            error: `Enforcement script failed: ${script}`
          };
        }
      }
    }

    // Create build directory
    const buildId = `build_${Date.now()}`;
    const buildPath = getBuildPath(ideaDir, buildId);
    ensureDir(path.join(buildPath, 'app'));

    // Dependency validation
    const depValidateScript = path.join(scriptsDir, 'validate_dependencies.sh');
    if (fileExists(depValidateScript)) {
      const result = await executeScript(depValidateScript, [path.join(buildPath, 'app', 'package.json')], buildPath);
      if (!result.success) {
        return {
          success: false,
          buildPath,
          error: 'Dependency validation failed'
        };
      }
    }

    // Update manifest
    if (ideaStatus) {
      ideaStatus.status = 'completed';
      ideaStatus.build_id = buildId;
      saveRunManifest(runPath, manifest);
    }

    const duration = Date.now() - startTime;
    logger.pipelineComplete(duration);

    return {
      success: true,
      buildPath
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.pipelineFailed(error);

    return {
      success: false,
      buildPath: null,
      error
    };
  } finally {
    releaseLock();
  }
}

// Execute the dream command
export async function executeDream(
  ideaPrompt: string,
  config: PipelineConfig = {}
): Promise<{
  success: boolean;
  runPath: string;
  buildPath: string | null;
  error?: string;
}> {
  const hash = crypto.createHash('sha256')
    .update(ideaPrompt)
    .digest('hex')
    .substring(0, 8);

  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '-')
    .replace(/\..+/, '')
    .substring(0, 13);

  const runId = `dream-${timestamp}-${hash}`;
  const runPath = createRunPath(runId);

  logger.pipelineStart(`dream "${ideaPrompt.substring(0, 50)}..."`);

  // Acquire lock
  if (!acquireLock(runId, 'dream')) {
    return {
      success: false,
      runPath,
      buildPath: null,
      error: 'Failed to acquire lock'
    };
  }

  const startTime = Date.now();

  try {
    // Create run directory structure
    ensureDir(path.join(runPath, 'inputs'));
    ensureDir(path.join(runPath, 'stage01_dream', 'stages'));
    ensureDir(path.join(runPath, 'stage01_dream', 'outputs'));
    ensureDir(path.join(runPath, 'ideas'));
    ensureDir(path.join(runPath, 'meta'));

    // Write dream intake
    const intakePath = path.join(runPath, 'inputs', 'dream_intake.md');
    const { writeFile: writeFileUtil } = await import('./io.js');
    writeFileUtil(intakePath, ideaPrompt);

    // Create manifest
    const inputsHash = hashInputs({ dream: ideaPrompt });
    const manifest = createRunManifest(runId, 'dream', config.model || 'claude-sonnet-4-20250514', inputsHash);
    manifest.run_status = 'in_progress';
    saveRunManifest(runPath, manifest);

    // Execute dream stages
    const stages = getDreamStages();
    const priorStages: Record<string, unknown> = {};
    let ideaDir = '';
    let ideaPath = '';

    for (const stage of stages) {
      if (stage.id === '01_dream') {
        // Execute Stage 01 (dream variant)
        const inputs: StageInputs = {
          runId,
          runPath,
          priorStages: {},
          intakeContent: ideaPrompt
        };

        const result = await executeStage('01_dream', inputs);

        if (!result.success) {
          manifest.run_status = 'failed';
          manifest.failure = { stage: '01_dream', error: result.error || 'Unknown error' };
          saveRunManifest(runPath, manifest);

          return {
            success: false,
            runPath,
            buildPath: null,
            error: result.error
          };
        }

        // Parse output to create idea directory
        const dreamOutput = readJson<{ idea: { id: string; name: string } }>(result.outputPath!);
        const slug = dreamOutput.idea.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 20);
        ideaDir = `01_${slug}__${dreamOutput.idea.id}`;
        ideaPath = path.join(runPath, 'ideas', ideaDir);

        // Create idea directory
        ensureDir(path.join(ideaPath, 'stages'));
        ensureDir(path.join(ideaPath, 'outputs'));
        ensureDir(path.join(ideaPath, 'spec'));
        ensureDir(path.join(ideaPath, 'app', '_contract'));
        ensureDir(path.join(ideaPath, 'meta'));

        priorStages['01_dream'] = dreamOutput;
        manifest.stages_completed.push('01_dream');

      } else {
        // Execute build stages
        const inputs: StageInputs = {
          runId,
          runPath,
          ideaDir,
          ideaPath,
          priorStages,
          intakeContent: ideaPrompt
        };

        const result = await executeStage(stage.id, inputs);

        if (!result.success) {
          manifest.run_status = 'failed';
          manifest.failure = { stage: stage.id, error: result.error || 'Unknown error' };
          saveRunManifest(runPath, manifest);

          return {
            success: false,
            runPath,
            buildPath: null,
            error: result.error
          };
        }

        priorStages[stage.id] = readJson(result.outputPath!);
        manifest.stages_completed.push(stage.id);
        saveRunManifest(runPath, manifest);
      }
    }

    // Create build output
    const buildId = `build_${Date.now()}`;
    const buildPath = getBuildPath(ideaDir, buildId);
    ensureDir(path.join(buildPath, 'app'));

    manifest.run_status = 'completed';
    saveRunManifest(runPath, manifest);

    const duration = Date.now() - startTime;
    logger.pipelineComplete(duration);

    return {
      success: true,
      runPath,
      buildPath
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.pipelineFailed(error);

    return {
      success: false,
      runPath,
      buildPath: null,
      error
    };
  } finally {
    releaseLock();
  }
}

// Update leaderboard after run
async function updateLeaderboard(
  runPath: string,
  ideas: IdeaIndexEntry[],
  _config?: PipelineConfig
): Promise<void> {
  const leaderboardsDir = getLeaderboardsDir();
  ensureDir(leaderboardsDir);

  const allTimePath = path.join(leaderboardsDir, 'app_factory_all_time.json');

  // Load existing entries
  let entries: Array<Record<string, unknown>> = [];
  if (fileExists(allTimePath)) {
    entries = readJson<Array<Record<string, unknown>>>(allTimePath);
  }

  // Add new entries
  const runId = path.basename(runPath);
  const runDate = new Date().toISOString().split('T')[0];

  for (const idea of ideas) {
    entries.push({
      run_id: runId,
      run_date: runDate,
      rank: idea.rank,
      score: idea.validation_score,
      idea_id: idea.id,
      idea_name: idea.name,
      idea_slug: idea.slug,
      source_path: path.join(runPath, 'stage01', 'stages', 'stage01.json')
    });
  }

  // Save updated leaderboard
  writeJson(allTimePath, entries);

  logger.info('Leaderboard updated');
}
