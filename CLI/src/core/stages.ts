/**
 * Stage Execution Module
 *
 * Models individual pipeline stages and their execution.
 */

import path from 'path';
import Ajv from 'ajv';
import { readFile, readJson, writeFile, writeJson, fileExists } from './io.js';
import { getTemplatePath, getSchemaPath, getStandardsPath } from './paths.js';
import { extractJson, callClaude } from './anthropic.js';
import { logger } from './logging.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Stage definition
export interface StageDefinition {
  id: string;
  name: string;
  templateFile: string;
  schemaFile?: string;
  requiresWebResearch: boolean;
  order: number;
}

// Stage execution result
export interface StageResult {
  stageId: string;
  success: boolean;
  outputPath: string | null;
  schemaValidated: boolean;
  executionLogPath: string | null;
  error?: string;
  duration: number;
}

// Stage inputs
export interface StageInputs {
  runId: string;
  runPath: string;
  ideaDir?: string;
  ideaPath?: string;
  priorStages: Record<string, unknown>;
  intakeContent?: string;
}

// All pipeline stages in order
export const PIPELINE_STAGES: StageDefinition[] = [
  { id: '01', name: 'Market Research', templateFile: '01_dream.md', schemaFile: 'stage01.json', requiresWebResearch: true, order: 1 },
  { id: '01_dream', name: 'Dream Validation', templateFile: '01_dream.md', schemaFile: 'stage01_dream.json', requiresWebResearch: true, order: 1 },
  { id: '02', name: 'Product Spec', templateFile: '02_product_spec.md', schemaFile: 'stage02.json', requiresWebResearch: true, order: 2 },
  { id: '02.5', name: 'Product Reality', templateFile: '02.5_product_reality.md', schemaFile: 'stage02.5_schema.json', requiresWebResearch: false, order: 3 },
  { id: '02.7', name: 'Dependency Resolution', templateFile: '02.7_dependency_resolution.md', schemaFile: 'stage02.7_schema.json', requiresWebResearch: false, order: 4 },
  { id: '03', name: 'UX Design', templateFile: '03_ux.md', schemaFile: 'stage03.json', requiresWebResearch: true, order: 5 },
  { id: '04', name: 'Monetization', templateFile: '04_monetization.md', schemaFile: 'stage04.json', requiresWebResearch: true, order: 6 },
  { id: '05', name: 'Architecture', templateFile: '05_architecture.md', schemaFile: 'stage05.json', requiresWebResearch: false, order: 7 },
  { id: '06', name: 'Builder Handoff', templateFile: '06_builder_handoff.md', schemaFile: 'stage06.json', requiresWebResearch: true, order: 8 },
  { id: '07', name: 'Polish', templateFile: '07_polish.md', schemaFile: 'stage07.json', requiresWebResearch: true, order: 9 },
  { id: '08', name: 'Brand', templateFile: '08_brand.md', schemaFile: 'stage08.json', requiresWebResearch: false, order: 10 },
  { id: '08.5', name: 'Visual Identity Assets', templateFile: '08.5_visual_identity_assets.md', schemaFile: undefined, requiresWebResearch: false, order: 11 },
  { id: '09', name: 'Release Planning', templateFile: '09_release_planning.md', schemaFile: 'stage09.json', requiresWebResearch: true, order: 12 },
  { id: '09.1', name: 'App Naming', templateFile: '09.1_app_naming.md', schemaFile: undefined, requiresWebResearch: false, order: 13 },
  { id: '09.2', name: 'Policy Pages', templateFile: '09.2_policy_pages.md', schemaFile: undefined, requiresWebResearch: false, order: 14 },
  { id: '09.5', name: 'Runtime Sanity', templateFile: '09.5_runtime_sanity_harness.md', schemaFile: 'stage09.5_schema.json', requiresWebResearch: false, order: 15 },
  { id: '09.7', name: 'Build Contract', templateFile: '09.7_build_contract_synthesis.md', schemaFile: undefined, requiresWebResearch: false, order: 16 },
  { id: '10.1', name: 'Design Authenticity', templateFile: '10.1_design_authenticity_check.md', schemaFile: 'stage10.1_schema.json', requiresWebResearch: false, order: 17 },
  { id: '10', name: 'App Builder', templateFile: '10_app_builder.md', schemaFile: 'stage10.json', requiresWebResearch: false, order: 18 }
];

// Get stage by ID
export function getStage(stageId: string): StageDefinition | undefined {
  return PIPELINE_STAGES.find(s => s.id === stageId);
}

// Get stages for run command (Stage 01 only)
export function getRunStages(): StageDefinition[] {
  return PIPELINE_STAGES.filter(s => s.id === '01');
}

// Get stages for build command (02 through 10)
export function getBuildStages(): StageDefinition[] {
  return PIPELINE_STAGES.filter(s =>
    s.id !== '01' && s.id !== '01_dream'
  ).sort((a, b) => a.order - b.order);
}

// Get stages for dream command
export function getDreamStages(): StageDefinition[] {
  return [
    PIPELINE_STAGES.find(s => s.id === '01_dream')!,
    ...getBuildStages()
  ];
}

// Schema validation
const ajv = new Ajv.default({ allErrors: true, strict: false });

export function validateAgainstSchema(data: unknown, schemaPath: string): { valid: boolean; errors: string[] } {
  try {
    const schema = readJson<object>(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid && validate.errors) {
      const errors = validate.errors.map((e: { instancePath?: string; message?: string }) =>
        `${e.instancePath || 'root'}: ${e.message}`
      );
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  } catch (err) {
    return { valid: false, errors: [`Schema validation error: ${err}`] };
  }
}

// Load stage template
export function loadTemplate(stageId: string): string {
  const stage = getStage(stageId);
  if (!stage) {
    throw new Error(`Unknown stage: ${stageId}`);
  }

  const templatePath = getTemplatePath(stage.templateFile.replace('.md', ''));

  // Try exact match first
  if (fileExists(templatePath)) {
    return readFile(templatePath);
  }

  // Try with stage prefix variations
  const variations = [
    getTemplatePath(stage.templateFile),
    getTemplatePath(`${stageId}_${stage.templateFile}`),
    path.join(path.dirname(templatePath), stage.templateFile)
  ];

  for (const variant of variations) {
    if (fileExists(variant)) {
      return readFile(variant);
    }
  }

  throw new Error(`Template not found for stage ${stageId}: ${templatePath}`);
}

// Build stage prompt
export function buildStagePrompt(
  stageId: string,
  inputs: StageInputs
): string {
  const template = loadTemplate(stageId);
  const standards = fileExists(getStandardsPath()) ? readFile(getStandardsPath()) : '';

  // Build context section
  let context = `\n\n## EXECUTION CONTEXT\n\n`;
  context += `Run ID: ${inputs.runId}\n`;
  context += `Run Path: ${inputs.runPath}\n`;

  if (inputs.ideaDir) {
    context += `Idea Directory: ${inputs.ideaDir}\n`;
  }

  if (inputs.ideaPath) {
    context += `Idea Path: ${inputs.ideaPath}\n`;
  }

  // Add intake if present
  if (inputs.intakeContent) {
    context += `\n### INTAKE\n\n${inputs.intakeContent}\n`;
  }

  // Add prior stage outputs
  if (Object.keys(inputs.priorStages).length > 0) {
    context += `\n### PRIOR STAGE OUTPUTS\n\n`;
    for (const [stage, data] of Object.entries(inputs.priorStages)) {
      context += `#### Stage ${stage}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`;
    }
  }

  // Add standards reference
  if (standards) {
    context += `\n### STANDARDS CONTRACT\n\n${standards}\n`;
  }

  // Combine template with context
  const prompt = template + context;

  // Add JSON output instruction
  const jsonInstruction = `\n\n## OUTPUT REQUIREMENTS\n\nRespond with a valid JSON object that conforms to the schema for stage ${stageId}. Do not include any text before or after the JSON.`;

  return prompt + jsonInstruction;
}

// Execute a single stage
export async function executeStage(
  stageId: string,
  inputs: StageInputs
): Promise<StageResult> {
  const startTime = Date.now();
  const stage = getStage(stageId);

  if (!stage) {
    return {
      stageId,
      success: false,
      outputPath: null,
      schemaValidated: false,
      executionLogPath: null,
      error: `Unknown stage: ${stageId}`,
      duration: Date.now() - startTime
    };
  }

  logger.stageStart(stageId);

  try {
    // Build prompt
    const prompt = buildStagePrompt(stageId, inputs);

    // Call Claude API
    const systemPrompt = `You are executing stage ${stageId} (${stage.name}) of the App Factory pipeline. Follow the template instructions precisely and output valid JSON.`;

    const response = await callClaude(prompt, systemPrompt);
    const jsonStr = extractJson(response);

    // Parse JSON
    let outputData: unknown;
    try {
      outputData = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Invalid JSON in response: ${jsonStr.substring(0, 200)}...`);
    }

    // Validate against schema if available
    let schemaValidated = true;
    if (stage.schemaFile) {
      const schemaPath = getSchemaPath(stageId);
      if (fileExists(schemaPath)) {
        logger.validationStart(stage.schemaFile);
        const validation = validateAgainstSchema(outputData, schemaPath);

        if (!validation.valid) {
          logger.validationFailed(stage.schemaFile, validation.errors);
          throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
        }

        logger.validationSuccess(stage.schemaFile);
      }
    }

    // Determine output paths
    let stageDir: string;
    if (inputs.ideaPath) {
      stageDir = inputs.ideaPath;
    } else {
      stageDir = path.join(inputs.runPath, `stage${stageId.replace('.', '_')}`);
    }

    const outputPath = path.join(stageDir, 'stages', `stage${stageId.replace('.', '_')}.json`);
    const logPath = path.join(stageDir, 'outputs', `stage${stageId.replace('.', '_')}_execution.md`);

    // Write outputs
    writeJson(outputPath, outputData);

    // Write execution log
    const executionLog = `# Stage ${stageId} Execution Log

**Timestamp**: ${new Date().toISOString()}
**Run ID**: ${inputs.runId}
**Duration**: ${((Date.now() - startTime) / 1000).toFixed(1)}s

## Prompt Summary

Stage template: ${stage.templateFile}
Prior stages: ${Object.keys(inputs.priorStages).join(', ') || 'none'}

## Output

\`\`\`json
${JSON.stringify(outputData, null, 2)}
\`\`\`
`;

    writeFile(logPath, executionLog);

    const duration = Date.now() - startTime;
    logger.stageComplete(stageId, duration);

    return {
      stageId,
      success: true,
      outputPath,
      schemaValidated,
      executionLogPath: logPath,
      duration
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.stageFailed(stageId, error);

    return {
      stageId,
      success: false,
      outputPath: null,
      schemaValidated: false,
      executionLogPath: null,
      error,
      duration: Date.now() - startTime
    };
  }
}

// Execute enforcement script
export async function executeScript(
  scriptPath: string,
  args: string[] = [],
  cwd?: string
): Promise<{ success: boolean; output: string; exitCode: number }> {
  const scriptName = path.basename(scriptPath);
  logger.scriptStart(scriptName);

  try {
    const command = `bash "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`;
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 120000 // 2 minute timeout
    });

    const output = stdout + (stderr ? '\n' + stderr : '');
    logger.scriptSuccess(scriptName);

    return { success: true, output, exitCode: 0 };
  } catch (err) {
    const execError = err as { code?: number; stdout?: string; stderr?: string };
    const exitCode = execError.code || 1;
    const output = (execError.stdout || '') + '\n' + (execError.stderr || '');

    logger.scriptFailed(scriptName, exitCode);

    return { success: false, output, exitCode };
  }
}
