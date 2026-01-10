/**
 * Build Command
 *
 * Executes Stages 02-10 to build a selected idea into a complete app.
 */

import { Command } from 'commander';
import ora from 'ora';
import { executeBuild, findIdea } from '../core/pipeline.js';
import { logger } from '../core/logging.js';
import { printBanner, printHeader, printCompletionBanner, printFailureBanner, printInfo } from '../ui/banner.js';
import { formatKeyValue, formatNextSteps } from '../ui/format.js';
import { confirm, selectIdea } from '../ui/prompts.js';
import { loadIdeaIndex } from '../core/pipeline.js';
import { listRecentRuns } from '../core/paths.js';

export function createBuildCommand(): Command {
  const command = new Command('build')
    .description('Build a selected idea through Stages 02-10')
    .argument('[idea]', 'Idea ID, name, or slug to build')
    .option('-m, --model <model>', 'Claude model to use')
    .option('--json', 'Output results as JSON')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (ideaArg, options) => {
      const startTime = Date.now();

      if (!options.json) {
        printBanner();
        printHeader('Build App - Stages 02-10');
      }

      // Resolve idea
      let ideaQuery = ideaArg;

      if (!ideaQuery) {
        // Interactive selection
        const runs = listRecentRuns(5);

        if (runs.length === 0) {
          logger.error('No runs found. Run "appfactory run" first to generate ideas.');
          process.exit(1);
        }

        // Find all ideas across recent runs
        const allIdeas: Array<{ id: string; name: string; rank: number; score: number }> = [];

        for (const runPath of runs) {
          const index = loadIdeaIndex(runPath);
          for (const idea of index) {
            allIdeas.push({
              id: idea.id,
              name: idea.name,
              rank: idea.rank,
              score: idea.validation_score
            });
          }
        }

        if (allIdeas.length === 0) {
          logger.error('No ideas found in recent runs.');
          process.exit(1);
        }

        ideaQuery = await selectIdea(allIdeas);
      }

      // Find the idea
      const found = findIdea(ideaQuery);

      if (!found) {
        logger.error(`Idea not found: ${ideaQuery}`);
        logger.info('Use "appfactory list" to see available ideas');
        process.exit(1);
      }

      if (!options.json) {
        printInfo(`Building: ${found.idea.name} (${found.idea.id})`);
        console.log(formatKeyValue([
          { key: 'Run', value: found.runPath },
          { key: 'Idea Directory', value: found.ideaDir },
          { key: 'Score', value: String(found.idea.validation_score) }
        ]));
        console.log();
      }

      // Confirm execution
      if (!options.yes && !options.json) {
        const proceed = await confirm('Start build?', true);
        if (!proceed) {
          logger.info('Cancelled');
          process.exit(0);
        }
      }

      // Execute build
      const spinner = ora('Building app (Stages 02-10)...').start();

      try {
        const result = await executeBuild(ideaQuery, {
          model: options.model
        });

        spinner.stop();

        if (!result.success) {
          if (options.json) {
            console.log(JSON.stringify({ success: false, error: result.error }, null, 2));
          } else {
            printFailureBanner('build', result.error || 'Unknown error');
          }
          process.exit(2);
        }

        // Output results
        if (options.json) {
          console.log(JSON.stringify({
            success: true,
            buildPath: result.buildPath,
            duration: Date.now() - startTime
          }, null, 2));
        } else {
          const duration = Date.now() - startTime;

          printCompletionBanner('build', duration);

          console.log(formatKeyValue([
            { key: 'App Name', value: found.idea.name },
            { key: 'Build Path', value: result.buildPath || 'N/A' }
          ]));
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
        spinner.stop();
        const error = err instanceof Error ? err.message : String(err);

        if (options.json) {
          console.log(JSON.stringify({ success: false, error }, null, 2));
        } else {
          printFailureBanner('build', error);
        }

        process.exit(2);
      }
    });

  return command;
}
