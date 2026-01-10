/**
 * Interactive CLI Runner
 *
 * Main interactive interface for the App Factory CLI.
 * Provides a menu-driven experience with clear instructions.
 */

import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { printBanner, printHeader, printSuccess, printError, printInfo, printWarning, printDivider, printCompletionBanner, printFailureBanner } from './ui/banner.js';
import { showMainMenu, clearScreen, pressEnterToContinue, confirmAction, getTextInput, selectFromList, showHelp, showSection, showTip } from './ui/menu.js';
import { formatTable, formatNextSteps } from './ui/format.js';
import { executeRun, executeBuild, executeDream, loadRunManifest, loadIdeaIndex } from './core/pipeline.js';
import { listRecentRuns, listBuilds, validateFactoryStructure } from './core/paths.js';
import { getModTime, fileExists } from './core/io.js';
import path from 'path';

/**
 * Run the interactive CLI
 */
export async function runInteractive(): Promise<void> {
  // Show banner on startup
  clearScreen();
  printBanner();

  console.log(chalk.gray('  Welcome to App Factory! Generate store-ready mobile apps with AI.\n'));

  // Quick environment check
  const envCheck = validateFactoryStructure();
  if (!envCheck.valid) {
    printWarning('Some configuration issues detected. Run "System Check" for details.');
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    printError('ANTHROPIC_API_KEY not set in .env file');
    printInfo('Copy .env.example to .env and add your API key');
    console.log();
  }

  // Main loop
  let running = true;

  while (running) {
    try {
      const choice = await showMainMenu();

      switch (choice) {
        case 'run':
          await handleRun();
          break;
        case 'build':
          await handleBuild();
          break;
        case 'dream':
          await handleDream();
          break;
        case 'list':
          await handleList();
          break;
        case 'resume':
          await handleResume();
          break;
        case 'doctor':
          await handleDoctor();
          break;
        case 'help':
          showHelp();
          await pressEnterToContinue();
          clearScreen();
          printBanner();
          break;
        case 'exit':
          running = false;
          break;
      }
    } catch (err) {
      if ((err as Error).message?.includes('User force closed')) {
        // Ctrl+C pressed
        running = false;
      } else {
        printError(`Error: ${(err as Error).message}`);
        await pressEnterToContinue();
        clearScreen();
        printBanner();
      }
    }
  }

  console.log(chalk.gray('\n  Goodbye! Happy building.\n'));
  process.exit(0);
}

/**
 * Handle the Run command
 */
async function handleRun(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('Run App Factory - Generate Ideas');

  console.log(chalk.gray('  This will execute Stage 01 to generate 10 ranked app ideas'));
  console.log(chalk.gray('  based on current market research and trends.\n'));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    printError('Cannot run without ANTHROPIC_API_KEY set in .env');
    await pressEnterToContinue();
    clearScreen();
    printBanner();
    return;
  }

  // Ask for custom intake or use default
  const { intakeType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'intakeType',
      message: 'How would you like to generate ideas?',
      choices: [
        { name: 'Use default market research (recommended)', value: 'default' },
        { name: 'Provide custom requirements', value: 'custom' }
      ]
    }
  ]);

  let intakeContent: string | undefined;

  if (intakeType === 'custom') {
    intakeContent = await getTextInput(
      'Describe your requirements or focus areas:',
      'Generate innovative mobile app ideas focused on productivity and wellness'
    );
  }

  // Confirm
  console.log();
  if (!await confirmAction('Start generating ideas? (This will use API credits)')) {
    clearScreen();
    printBanner();
    return;
  }

  // Execute
  console.log();
  const spinner = ora({
    text: 'Generating ideas... This may take a few minutes',
    color: 'cyan'
  }).start();

  const startTime = Date.now();

  try {
    const result = await executeRun({ intake: intakeContent });

    spinner.stop();

    if (!result.success) {
      printFailureBanner('Run', result.error || 'Unknown error');
      showTip('Check your API key and try again');
    } else {
      const duration = Date.now() - startTime;
      printCompletionBanner('Run', duration);

      // Show ideas
      showSection('Generated Ideas');

      const headers = ['#', 'Name', 'Score', 'ID'];
      const rows = result.ideas.map(idea => [
        String(idea.rank),
        idea.name,
        String(idea.validation_score),
        idea.id
      ]);

      console.log(formatTable(headers, rows));
      console.log();

      printSuccess(`${result.ideas.length} ideas generated!`);
      console.log();

      console.log(formatNextSteps([
        'Select "Build an Idea" from the main menu to build one',
        `Run path: ${result.runPath}`
      ]));
    }
  } catch (err) {
    spinner.stop();
    printError(`Failed: ${(err as Error).message}`);
  }

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}

/**
 * Handle the Build command
 */
async function handleBuild(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('Build an Idea');

  console.log(chalk.gray('  Select an idea from a previous run to build into a complete app.\n'));

  // Get recent runs with ideas
  const runs = listRecentRuns(10);
  const allIdeas: Array<{
    id: string;
    name: string;
    rank: number;
    score: number;
    runId: string;
    directory: string;
  }> = [];

  for (const runPath of runs) {
    const manifest = loadRunManifest(runPath);
    const index = loadIdeaIndex(runPath);

    if (Array.isArray(index)) {
      for (const idea of index) {
        if (idea && typeof idea === 'object') {
          allIdeas.push({
            id: idea.id,
            name: idea.name,
            rank: idea.rank,
            score: idea.validation_score,
            runId: manifest?.run_id || path.basename(runPath),
            directory: idea.directory
          });
        }
      }
    }
  }

  if (allIdeas.length === 0) {
    printWarning('No ideas found from previous runs.');
    showTip('Run "Run App Factory" first to generate ideas');
    await pressEnterToContinue();
    clearScreen();
    printBanner();
    return;
  }

  // Sort by score
  allIdeas.sort((a, b) => b.score - a.score);

  // Let user select an idea
  showSection('Available Ideas (sorted by score)');

  const choices = allIdeas.slice(0, 20).map(idea => ({
    name: `${idea.name.padEnd(30)} Score: ${String(idea.score).padEnd(5)} ID: ${idea.id}`,
    value: idea.id
  }));

  choices.push({ name: chalk.gray('← Back to main menu'), value: 'back' });

  const selectedId = await selectFromList('Select an idea to build:', choices);

  if (selectedId === 'back') {
    clearScreen();
    printBanner();
    return;
  }

  const selectedIdea = allIdeas.find(i => i.id === selectedId);

  console.log();
  printInfo(`Selected: ${selectedIdea?.name}`);
  console.log();

  if (!await confirmAction('Start building this app? (This will use API credits)')) {
    clearScreen();
    printBanner();
    return;
  }

  // Execute build
  console.log();
  const spinner = ora({
    text: 'Building app... This may take several minutes',
    color: 'cyan'
  }).start();

  // Update spinner with stage progress
  const stages = ['02', '02.5', '02.7', '03', '04', '05', '06', '07', '08', '09', '10'];
  let stageIndex = 0;

  const stageInterval = setInterval(() => {
    if (stageIndex < stages.length) {
      spinner.text = `Building app... Stage ${stages[stageIndex]}`;
      stageIndex++;
    }
  }, 20000);

  const startTime = Date.now();

  try {
    const result = await executeBuild(selectedId);

    clearInterval(stageInterval);
    spinner.stop();

    if (!result.success) {
      printFailureBanner('Build', result.error || 'Unknown error');
    } else {
      const duration = Date.now() - startTime;
      printCompletionBanner('Build', duration);

      printSuccess(`App "${selectedIdea?.name}" built successfully!`);
      console.log();

      console.log(formatNextSteps([
        `Navigate to: cd "${result.buildPath}/app"`,
        'Install dependencies: npm install',
        'Start development: npx expo start',
        'Build for stores: eas build --platform all'
      ]));
    }
  } catch (err) {
    clearInterval(stageInterval);
    spinner.stop();
    printError(`Build failed: ${(err as Error).message}`);
  }

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}

/**
 * Handle the Dream command
 */
async function handleDream(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('Dream Mode - Your Idea → Complete App');

  console.log(chalk.gray('  Describe your app idea and watch it transform into a complete,'));
  console.log(chalk.gray('  store-ready Expo React Native application.\n'));

  console.log(chalk.yellow('  Note: This runs the full pipeline and may take 10-20 minutes.\n'));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    printError('Cannot run without ANTHROPIC_API_KEY set in .env');
    await pressEnterToContinue();
    clearScreen();
    printBanner();
    return;
  }

  // Get idea description
  const ideaPrompt = await getTextInput(
    'Describe your app idea in detail:',
    'A minimalist habit tracking app with streak counters and daily reminders'
  );

  if (ideaPrompt.length < 10) {
    printWarning('Please provide a more detailed description');
    await pressEnterToContinue();
    clearScreen();
    printBanner();
    return;
  }

  console.log();
  console.log(chalk.cyan('  Your idea:'));
  console.log(chalk.white(`  "${ideaPrompt}"\n`));

  if (!await confirmAction('Start building your dream app? (This will use significant API credits)')) {
    clearScreen();
    printBanner();
    return;
  }

  // Execute dream
  console.log();
  const spinner = ora({
    text: 'Dreaming... Stage 01 (Idea Validation)',
    color: 'cyan'
  }).start();

  const stages = ['01', '02', '02.5', '02.7', '03', '04', '05', '06', '07', '08', '09', '10'];
  let stageIndex = 0;

  const stageInterval = setInterval(() => {
    if (stageIndex < stages.length) {
      spinner.text = `Dreaming... Stage ${stages[stageIndex]}`;
      stageIndex++;
    }
  }, 30000);

  const startTime = Date.now();

  try {
    const result = await executeDream(ideaPrompt);

    clearInterval(stageInterval);
    spinner.stop();

    if (!result.success) {
      printFailureBanner('Dream', result.error || 'Unknown error');
    } else {
      const duration = Date.now() - startTime;
      printCompletionBanner('Dream', duration);

      printSuccess('Your dream app has been created!');
      console.log();

      console.log(formatNextSteps([
        `Navigate to: cd "${result.buildPath}/app"`,
        'Install dependencies: npm install',
        'Start development: npx expo start',
        'Build for stores: eas build --platform all'
      ]));
    }
  } catch (err) {
    clearInterval(stageInterval);
    spinner.stop();
    printError(`Dream failed: ${(err as Error).message}`);
  }

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}

/**
 * Handle the List command
 */
async function handleList(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('Runs, Builds & Ideas');

  // Show runs
  showSection('Recent Runs');

  const runPaths = listRecentRuns(10);
  const runs: Array<{ id: string; date: string; command: string; status: string; ideas: number }> = [];

  for (const runPath of runPaths) {
    const manifest = loadRunManifest(runPath);
    const modTime = getModTime(runPath);

    runs.push({
      id: manifest?.run_id || path.basename(runPath),
      date: manifest?.date?.split('T')[0] || modTime?.toISOString().split('T')[0] || 'unknown',
      command: manifest?.command_invoked || 'unknown',
      status: manifest?.run_status || 'unknown',
      ideas: Object.keys(manifest?.per_idea || {}).length
    });
  }

  if (runs.length === 0) {
    printInfo('No runs found yet.');
  } else {
    const headers = ['Run ID', 'Date', 'Type', 'Status', 'Ideas'];
    const rows = runs.map(r => [
      r.id.substring(0, 25),
      r.date,
      r.command,
      r.status,
      String(r.ideas)
    ]);
    console.log(formatTable(headers, rows));
  }

  // Show builds
  showSection('Completed Builds');

  const buildPaths = listBuilds();

  if (buildPaths.length === 0) {
    printInfo('No builds found yet.');
  } else {
    const headers = ['App Name', 'Date'];
    const rows = buildPaths.slice(0, 10).map(bp => {
      const modTime = getModTime(bp);
      return [
        path.basename(bp).substring(0, 40),
        modTime?.toISOString().split('T')[0] || 'unknown'
      ];
    });
    console.log(formatTable(headers, rows));
  }

  console.log();

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}

/**
 * Handle the Resume command
 */
async function handleResume(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('Resume Interrupted Run');

  console.log(chalk.gray('  Resume a pipeline run that was interrupted.\n'));

  // Find runs that can be resumed
  const runs = listRecentRuns(10);
  const resumable: Array<{ id: string; status: string; runPath: string }> = [];

  for (const runPath of runs) {
    const manifest = loadRunManifest(runPath);
    if (manifest && (manifest.run_status === 'in_progress' || manifest.run_status === 'failed')) {
      resumable.push({
        id: manifest.run_id,
        status: manifest.run_status,
        runPath
      });
    }
  }

  if (resumable.length === 0) {
    printInfo('No interrupted runs found.');
    showTip('All your runs have completed successfully!');
    await pressEnterToContinue();
    clearScreen();
    printBanner();
    return;
  }

  showSection('Resumable Runs');

  const choices = resumable.map(r => ({
    name: `${r.id.padEnd(35)} Status: ${r.status}`,
    value: r.id
  }));

  choices.push({ name: chalk.gray('← Back to main menu'), value: 'back' });

  const selectedId = await selectFromList('Select a run to resume:', choices);

  if (selectedId === 'back') {
    clearScreen();
    printBanner();
    return;
  }

  printInfo(`Resuming run: ${selectedId}`);
  printWarning('Resume functionality is limited. You may need to re-run the build command.');

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}

/**
 * Handle the Doctor command
 */
async function handleDoctor(): Promise<void> {
  clearScreen();
  printBanner();
  printHeader('System Health Check');

  console.log(chalk.gray('  Checking your environment...\n'));

  const checks: Array<{ name: string; passed: boolean; message: string; fix?: string }> = [];

  // Check .env
  const hasEnv = fileExists(path.join(process.cwd(), '.env'));
  checks.push({
    name: '.env file',
    passed: hasEnv,
    message: hasEnv ? 'Found' : 'Not found',
    fix: 'cp .env.example .env'
  });

  // Check API key
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  checks.push({
    name: 'API Key',
    passed: hasKey,
    message: hasKey ? 'Set' : 'Not set',
    fix: 'Add ANTHROPIC_API_KEY to .env'
  });

  // Check API key format
  if (hasKey) {
    const validFormat = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-');
    checks.push({
      name: 'API Key Format',
      passed: !!validFormat,
      message: validFormat ? 'Valid' : 'Invalid format',
      fix: 'Key should start with sk-ant-'
    });
  }

  // Check factory structure
  const structure = validateFactoryStructure();
  checks.push({
    name: 'Repository',
    passed: structure.valid,
    message: structure.valid ? 'Valid' : structure.errors[0],
    fix: 'Ensure you are in the correct repository'
  });

  // Display results
  console.log();

  for (const check of checks) {
    if (check.passed) {
      console.log(`  ${chalk.green('✓')} ${check.name.padEnd(20)} ${chalk.gray(check.message)}`);
    } else {
      console.log(`  ${chalk.red('✗')} ${check.name.padEnd(20)} ${chalk.red(check.message)}`);
      if (check.fix) {
        console.log(`    ${chalk.yellow('→')} ${chalk.gray(check.fix)}`);
      }
    }
  }

  console.log();
  printDivider();

  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;

  if (passed === total) {
    printSuccess(`All ${total} checks passed! You're ready to go.`);
  } else {
    printWarning(`${passed}/${total} checks passed. Please fix the issues above.`);
  }

  console.log();

  await pressEnterToContinue();
  clearScreen();
  printBanner();
}
