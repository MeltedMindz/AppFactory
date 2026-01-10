/**
 * Resume Command
 *
 * Resumes an interrupted run from the last completed stage.
 */

import { Command } from 'commander';
import ora from 'ora';
import { loadRunManifest, executeBuild } from '../core/pipeline.js';
import { getRunPath, listRecentRuns } from '../core/paths.js';
import { logger } from '../core/logging.js';
import { printBanner, printHeader, printCompletionBanner, printFailureBanner, printInfo, printWarning } from '../ui/banner.js';
import { formatKeyValue, formatNextSteps } from '../ui/format.js';
import { confirm, selectRun } from '../ui/prompts.js';

export function createResumeCommand(): Command {
  const command = new Command('resume')
    .description('Resume an interrupted run from the last completed stage')
    .argument('[runId]', 'Run ID to resume')
    .option('-m, --model <model>', 'Claude model to use')
    .option('--json', 'Output results as JSON')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (runIdArg, options) => {
      const startTime = Date.now();

      if (!options.json) {
        printBanner();
        printHeader('Resume Run');
      }

      // Resolve run ID
      let runId = runIdArg;
      let runPath: string | null = null;

      if (!runId) {
        // Interactive selection
        const runs = listRecentRuns(10);

        if (runs.length === 0) {
          logger.error('No runs found.');
          process.exit(1);
        }

        // Filter to runs that can be resumed (not completed)
        const resumableRuns: Array<{ id: string; date: string; status: string; ideaCount: number }> = [];

        for (const rp of runs) {
          const manifest = loadRunManifest(rp);
          if (manifest && (manifest.run_status === 'in_progress' || manifest.run_status === 'failed')) {
            resumableRuns.push({
              id: manifest.run_id,
              date: manifest.date.split('T')[0],
              status: manifest.run_status,
              ideaCount: Object.keys(manifest.per_idea).length
            });
          }
        }

        if (resumableRuns.length === 0) {
          logger.info('No runs available to resume.');
          logger.info('Use "appfactory run" to start a new run.');
          process.exit(0);
        }

        runId = await selectRun(resumableRuns);
        runPath = getRunPath(runId);
      } else {
        runPath = getRunPath(runId);
      }

      if (!runPath) {
        logger.error(`Run not found: ${runId}`);
        process.exit(1);
      }

      // Load manifest
      const manifest = loadRunManifest(runPath);

      if (!manifest) {
        logger.error('Run manifest not found');
        process.exit(1);
      }

      if (!options.json) {
        console.log(formatKeyValue([
          { key: 'Run ID', value: manifest.run_id },
          { key: 'Date', value: manifest.date.split('T')[0] },
          { key: 'Command', value: manifest.command_invoked },
          { key: 'Status', value: manifest.run_status },
          { key: 'Stages Completed', value: manifest.stages_completed.join(', ') || 'none' }
        ]));
        console.log();
      }

      // Check if run can be resumed
      if (manifest.run_status === 'completed') {
        logger.info('This run has already completed successfully.');

        // Check if there are unbuilt ideas
        const unbuiltIdeas = Object.entries(manifest.per_idea)
          .filter(([_, status]) => status.status === 'unbuilt')
          .map(([id, _]) => id);

        if (unbuiltIdeas.length > 0) {
          printInfo(`There are ${unbuiltIdeas.length} unbuilt ideas.`);
          printInfo('Use "appfactory build <idea_id>" to build an idea.');
        }

        process.exit(0);
      }

      // Determine what needs to be resumed
      let resumeAction: 'stage01' | 'build' | 'none' = 'none';
      let resumeTarget: string | null = null;

      if (manifest.command_invoked === 'run') {
        if (!manifest.stages_completed.includes('01')) {
          resumeAction = 'stage01';
        } else {
          // Stage 01 complete, check for in-progress builds
          const inProgress = Object.entries(manifest.per_idea)
            .find(([_, status]) => status.status === 'in_progress');

          if (inProgress) {
            resumeAction = 'build';
            resumeTarget = inProgress[0];
          } else {
            resumeAction = 'none';
          }
        }
      } else if (manifest.command_invoked === 'build' || manifest.command_invoked === 'dream') {
        const inProgress = Object.entries(manifest.per_idea)
          .find(([_, status]) => status.status === 'in_progress');

        if (inProgress) {
          resumeAction = 'build';
          resumeTarget = inProgress[0];
        }
      }

      if (resumeAction === 'none') {
        if (manifest.failure) {
          printWarning(`Run failed at stage ${manifest.failure.stage}: ${manifest.failure.error}`);
          printInfo('The issue may need to be resolved before resuming.');
        } else {
          printInfo('No actions to resume.');
        }
        process.exit(0);
      }

      if (!options.json) {
        if (resumeAction === 'stage01') {
          printInfo('Will resume Stage 01 (Market Research & Idea Generation)');
        } else if (resumeAction === 'build' && resumeTarget) {
          printInfo(`Will resume building idea: ${resumeTarget}`);
        }
        console.log();
      }

      // Confirm
      if (!options.yes && !options.json) {
        const proceed = await confirm('Resume this run?', true);
        if (!proceed) {
          logger.info('Cancelled');
          process.exit(0);
        }
      }

      // Execute resume
      const spinner = ora('Resuming...').start();

      try {
        if (resumeAction === 'build' && resumeTarget) {
          spinner.text = `Resuming build for ${resumeTarget}...`;

          const result = await executeBuild(resumeTarget, {
            model: options.model
          });

          spinner.stop();

          if (!result.success) {
            if (options.json) {
              console.log(JSON.stringify({ success: false, error: result.error }, null, 2));
            } else {
              printFailureBanner('resume', result.error || 'Unknown error');
            }
            process.exit(2);
          }

          if (options.json) {
            console.log(JSON.stringify({
              success: true,
              action: 'build',
              target: resumeTarget,
              buildPath: result.buildPath,
              duration: Date.now() - startTime
            }, null, 2));
          } else {
            const duration = Date.now() - startTime;
            printCompletionBanner('resume', duration);

            console.log(formatNextSteps([
              `Build path: ${result.buildPath}`,
              `Navigate: cd "${result.buildPath}/app"`,
              `Start dev: npx expo start`
            ]));
          }
        } else {
          // Stage 01 resume - re-run the run command
          spinner.stop();
          printInfo('Stage 01 resume not yet implemented. Please start a new run.');
          process.exit(1);
        }

        process.exit(0);
      } catch (err) {
        spinner.stop();
        const error = err instanceof Error ? err.message : String(err);

        if (options.json) {
          console.log(JSON.stringify({ success: false, error }, null, 2));
        } else {
          printFailureBanner('resume', error);
        }

        process.exit(2);
      }
    });

  return command;
}
