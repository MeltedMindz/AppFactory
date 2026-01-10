/**
 * Run Command
 *
 * Executes Stage 01 to generate 10 ranked app ideas.
 */

import { Command } from 'commander';
import ora from 'ora';
import { executeRun } from '../core/pipeline.js';
import { logger } from '../core/logging.js';
import { printBanner, printHeader, printCompletionBanner, printFailureBanner, printSuccess } from '../ui/banner.js';
import { formatTable, formatNextSteps } from '../ui/format.js';
import { confirm, promptIntake } from '../ui/prompts.js';

export function createRunCommand(): Command {
  const command = new Command('run')
    .description('Run Stage 01 to generate 10 ranked app ideas')
    .option('-i, --interactive', 'Prompt for custom intake requirements')
    .option('-f, --intake-file <file>', 'Path to intake requirements file')
    .option('-m, --model <model>', 'Claude model to use')
    .option('--json', 'Output results as JSON')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (options) => {
      const startTime = Date.now();

      if (!options.json) {
        printBanner();
        printHeader('Run App Factory - Stage 01');
      }

      // Get intake content
      let intakeContent: string | undefined;

      if (options.intakeFile) {
        const { readFile } = await import('../core/io.js');
        try {
          intakeContent = readFile(options.intakeFile);
          logger.info(`Loaded intake from ${options.intakeFile}`);
        } catch (err) {
          logger.error(`Failed to read intake file: ${err}`);
          process.exit(1);
        }
      } else if (options.interactive) {
        intakeContent = await promptIntake();
      }

      // Confirm execution
      if (!options.yes && !options.json) {
        const proceed = await confirm('Start idea generation?', true);
        if (!proceed) {
          logger.info('Cancelled');
          process.exit(0);
        }
      }

      // Execute
      const spinner = ora('Executing Stage 01: Market Research & Idea Generation...').start();

      try {
        const result = await executeRun({
          model: options.model,
          intake: intakeContent
        });

        spinner.stop();

        if (!result.success) {
          if (options.json) {
            console.log(JSON.stringify({ success: false, error: result.error }, null, 2));
          } else {
            printFailureBanner('run', result.error || 'Unknown error');
          }
          process.exit(2);
        }

        // Output results
        if (options.json) {
          console.log(JSON.stringify({
            success: true,
            runId: result.runId,
            runPath: result.runPath,
            ideas: result.ideas,
            duration: Date.now() - startTime
          }, null, 2));
        } else {
          const duration = Date.now() - startTime;

          printSuccess(`Generated ${result.ideas.length} app ideas`);
          console.log();

          // Display ideas table
          const headers = ['Rank', 'Name', 'ID', 'Score'];
          const rows = result.ideas.map(idea => [
            String(idea.rank),
            idea.name,
            idea.id,
            String(idea.validation_score)
          ]);

          console.log(formatTable(headers, rows));
          console.log();

          printCompletionBanner('run', duration);

          // Next steps
          console.log(formatNextSteps([
            `Build an idea: appfactory build <idea_id>`,
            `List ideas: appfactory list`,
            `Run path: ${result.runPath}`
          ]));
        }

        process.exit(0);
      } catch (err) {
        spinner.stop();
        const error = err instanceof Error ? err.message : String(err);

        if (options.json) {
          console.log(JSON.stringify({ success: false, error }, null, 2));
        } else {
          printFailureBanner('run', error);
        }

        process.exit(2);
      }
    });

  return command;
}
