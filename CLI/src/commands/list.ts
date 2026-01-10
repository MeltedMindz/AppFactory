/**
 * List Command
 *
 * Lists recent runs, builds, and ideas.
 */

import { Command } from 'commander';
import path from 'path';
import { listRecentRuns, listBuilds } from '../core/paths.js';
import { loadRunManifest, loadIdeaIndex } from '../core/pipeline.js';
import { printBanner, printHeader, printInfo } from '../ui/banner.js';
import { formatTable } from '../ui/format.js';
import { getModTime } from '../core/io.js';

export function createListCommand(): Command {
  const command = new Command('list')
    .description('List recent runs, builds, and ideas')
    .option('-r, --runs', 'List runs only')
    .option('-b, --builds', 'List builds only')
    .option('-i, --ideas', 'List all ideas')
    .option('-n, --limit <number>', 'Limit results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const limit = parseInt(options.limit, 10);
      const showAll = !options.runs && !options.builds && !options.ideas;

      if (!options.json) {
        printBanner(true);
      }

      const output: {
        runs?: Array<Record<string, unknown>>;
        builds?: Array<Record<string, unknown>>;
        ideas?: Array<Record<string, unknown>>;
      } = {};

      // List runs
      if (showAll || options.runs) {
        if (!options.json) {
          printHeader('Recent Runs');
        }

        const runPaths = listRecentRuns(limit);
        const runs: Array<{
          id: string;
          date: string;
          command: string;
          status: string;
          ideaCount: number;
          path: string;
        }> = [];

        for (const runPath of runPaths) {
          const manifest = loadRunManifest(runPath);
          const modTime = getModTime(runPath);

          if (manifest) {
            runs.push({
              id: manifest.run_id,
              date: manifest.date.split('T')[0],
              command: manifest.command_invoked,
              status: manifest.run_status,
              ideaCount: Object.keys(manifest.per_idea).length,
              path: runPath
            });
          } else {
            runs.push({
              id: path.basename(runPath),
              date: modTime?.toISOString().split('T')[0] || 'unknown',
              command: 'unknown',
              status: 'unknown',
              ideaCount: 0,
              path: runPath
            });
          }
        }

        if (options.json) {
          output.runs = runs;
        } else if (runs.length === 0) {
          printInfo('No runs found. Use "appfactory run" to generate ideas.');
        } else {
          const headers = ['Run ID', 'Date', 'Command', 'Status', 'Ideas'];
          const rows = runs.map(r => [
            r.id.substring(0, 30),
            r.date,
            r.command,
            r.status,
            String(r.ideaCount)
          ]);
          console.log(formatTable(headers, rows));
        }
      }

      // List builds
      if (showAll || options.builds) {
        if (!options.json) {
          console.log();
          printHeader('Builds');
        }

        const buildPaths = listBuilds();
        const builds: Array<{
          name: string;
          path: string;
          date: string;
        }> = [];

        for (const buildPath of buildPaths.slice(0, limit)) {
          const modTime = getModTime(buildPath);
          builds.push({
            name: path.basename(buildPath),
            path: buildPath,
            date: modTime?.toISOString().split('T')[0] || 'unknown'
          });
        }

        if (options.json) {
          output.builds = builds;
        } else if (builds.length === 0) {
          printInfo('No builds found. Use "appfactory build <idea>" to build an app.');
        } else {
          const headers = ['App', 'Date', 'Path'];
          const rows = builds.map(b => [
            b.name.substring(0, 40),
            b.date,
            b.path.substring(0, 50)
          ]);
          console.log(formatTable(headers, rows));
        }
      }

      // List ideas
      if (showAll || options.ideas) {
        if (!options.json) {
          console.log();
          printHeader('Ideas');
        }

        const runPaths = listRecentRuns(5);
        const allIdeas: Array<{
          id: string;
          name: string;
          rank: number;
          score: number;
          runId: string;
          status: string;
        }> = [];

        for (const runPath of runPaths) {
          const manifest = loadRunManifest(runPath);
          const index = loadIdeaIndex(runPath);

          // Skip if index is not an array
          if (!Array.isArray(index)) {
            continue;
          }

          for (const idea of index) {
            if (!idea || typeof idea !== 'object') continue;
            const ideaStatus = manifest?.per_idea[idea.id];
            allIdeas.push({
              id: idea.id || 'unknown',
              name: idea.name || 'Unknown',
              rank: idea.rank || 0,
              score: idea.validation_score || 0,
              runId: manifest?.run_id || path.basename(runPath),
              status: ideaStatus?.status || 'unknown'
            });
          }
        }

        // Sort by score descending
        allIdeas.sort((a, b) => b.score - a.score);
        const limitedIdeas = allIdeas.slice(0, limit);

        if (options.json) {
          output.ideas = limitedIdeas;
        } else if (limitedIdeas.length === 0) {
          printInfo('No ideas found. Use "appfactory run" to generate ideas.');
        } else {
          const headers = ['Rank', 'Name', 'ID', 'Score', 'Status'];
          const rows = limitedIdeas.map(i => [
            String(i.rank),
            i.name.substring(0, 25),
            i.id,
            String(i.score),
            i.status
          ]);
          console.log(formatTable(headers, rows));
        }
      }

      // Output JSON
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        console.log();
        printInfo(`Use "appfactory build <idea_id>" to build an idea`);
      }

      process.exit(0);
    });

  return command;
}
