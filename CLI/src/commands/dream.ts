/**
 * Dream Command
 *
 * End-to-end execution: transforms a raw idea into a complete app.
 */

import { Command } from 'commander';
import ora from 'ora';
import { executeDream } from '../core/pipeline.js';
import { logger } from '../core/logging.js';
import { printBanner, printHeader, printCompletionBanner, printFailureBanner, printSuccess } from '../ui/banner.js';
import { formatKeyValue, formatNextSteps } from '../ui/format.js';
import { confirm, promptDreamIdea } from '../ui/prompts.js';

export function createDreamCommand(): Command {
  const command = new Command('dream')
    .description('Transform a raw app idea into a complete store-ready app')
    .argument('[idea]', 'Your app idea description')
    .option('-m, --model <model>', 'Claude model to use')
    .option('--json', 'Output results as JSON')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (ideaArg, options) => {
      const startTime = Date.now();

      if (!options.json) {
        printBanner();
        printHeader('Dream Mode - End-to-End App Generation');
      }

      // Get idea description
      let ideaPrompt = ideaArg;

      if (!ideaPrompt) {
        ideaPrompt = await promptDreamIdea();
      }

      // Validate idea
      if (!ideaPrompt || ideaPrompt.trim().length < 10) {
        logger.error('Please provide a more detailed app idea description');
        process.exit(1);
      }

      if (!options.json) {
        console.log();
        console.log(formatKeyValue([
          { key: 'App Idea', value: ideaPrompt.substring(0, 100) + (ideaPrompt.length > 100 ? '...' : '') }
        ]));
        console.log();
      }

      // Confirm execution
      if (!options.yes && !options.json) {
        logger.info('Dream mode will execute all stages (01 through 10) automatically.');
        logger.info('This may take several minutes and consume API credits.');
        console.log();

        const proceed = await confirm('Start dream mode?', true);
        if (!proceed) {
          logger.info('Cancelled');
          process.exit(0);
        }
      }

      // Execute dream
      const spinner = ora('Dreaming... (Stage 01: Idea Validation)').start();

      const stages = [
        '01_dream', '02', '02.5', '02.7', '03', '04', '05',
        '06', '07', '08', '08.5', '09', '09.1', '09.2',
        '09.5', '09.7', '10.1', '10'
      ];

      let currentStage = 0;

      // Update spinner periodically (simulated progress)
      const stageInterval = setInterval(() => {
        if (currentStage < stages.length - 1) {
          currentStage++;
          spinner.text = `Dreaming... (Stage ${stages[currentStage]})`;
        }
      }, 15000);

      try {
        const result = await executeDream(ideaPrompt, {
          model: options.model
        });

        clearInterval(stageInterval);
        spinner.stop();

        if (!result.success) {
          if (options.json) {
            console.log(JSON.stringify({ success: false, error: result.error }, null, 2));
          } else {
            printFailureBanner('dream', result.error || 'Unknown error');
          }
          process.exit(2);
        }

        // Output results
        if (options.json) {
          console.log(JSON.stringify({
            success: true,
            runPath: result.runPath,
            buildPath: result.buildPath,
            duration: Date.now() - startTime
          }, null, 2));
        } else {
          const duration = Date.now() - startTime;

          printCompletionBanner('dream', duration);

          console.log(formatKeyValue([
            { key: 'Run Path', value: result.runPath },
            { key: 'Build Path', value: result.buildPath || 'N/A' }
          ]));
          console.log();

          printSuccess('Your app has been generated!');
          console.log();

          console.log(formatNextSteps([
            `Navigate to build: cd "${result.buildPath}/app"`,
            `Install dependencies: npm install`,
            `Start development: npx expo start`,
            `Build for production: eas build --platform ios`
          ]));
        }

        process.exit(0);
      } catch (err) {
        clearInterval(stageInterval);
        spinner.stop();
        const error = err instanceof Error ? err.message : String(err);

        if (options.json) {
          console.log(JSON.stringify({ success: false, error }, null, 2));
        } else {
          printFailureBanner('dream', error);
        }

        process.exit(2);
      }
    });

  return command;
}
