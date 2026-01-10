/**
 * Interactive Menu Module
 *
 * Provides the main interactive CLI menu interface.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { printBanner, printHeader, printDivider, printSuccess, printError } from './banner.js';

export interface MenuChoice {
  name: string;
  value: string;
  description: string;
}

const MAIN_MENU_CHOICES: MenuChoice[] = [
  {
    name: '1. Run App Factory',
    value: 'run',
    description: 'Generate 10 ranked app ideas based on market research'
  },
  {
    name: '2. Build an Idea',
    value: 'build',
    description: 'Build a selected idea into a complete Expo app'
  },
  {
    name: '3. Dream Mode',
    value: 'dream',
    description: 'Transform your own app idea into a complete app (end-to-end)'
  },
  {
    name: '4. List Runs & Builds',
    value: 'list',
    description: 'View recent runs, builds, and generated ideas'
  },
  {
    name: '5. Resume Run',
    value: 'resume',
    description: 'Resume an interrupted pipeline run'
  },
  {
    name: '6. System Check',
    value: 'doctor',
    description: 'Verify your environment and dependencies'
  },
  {
    name: '7. Help',
    value: 'help',
    description: 'Show detailed help and documentation'
  },
  {
    name: '8. Exit',
    value: 'exit',
    description: 'Exit the App Factory CLI'
  }
];

/**
 * Clear the console
 */
export function clearScreen(): void {
  console.clear();
}

/**
 * Show the main menu and get user selection
 */
export async function showMainMenu(): Promise<string> {
  console.log();
  printDivider();
  console.log(chalk.bold.cyan('  MAIN MENU'));
  console.log(chalk.gray('  Use arrow keys to navigate, Enter to select\n'));

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: MAIN_MENU_CHOICES.map(c => ({
        name: `${c.name.padEnd(25)} ${chalk.gray(c.description)}`,
        value: c.value
      })),
      pageSize: 10
    }
  ]);

  return choice;
}

/**
 * Show help information
 */
export function showHelp(): void {
  clearScreen();
  printBanner();
  printHeader('Help & Documentation');

  console.log(chalk.bold('COMMANDS\n'));

  console.log(chalk.cyan('  Run App Factory'));
  console.log('    Executes Stage 01 of the pipeline to generate 10 ranked mobile app');
  console.log('    ideas based on current market research and trends.\n');

  console.log(chalk.cyan('  Build an Idea'));
  console.log('    Takes a generated idea and builds it through Stages 02-10,');
  console.log('    producing a complete, store-ready Expo React Native application.\n');

  console.log(chalk.cyan('  Dream Mode'));
  console.log('    Enter your own app idea and watch it transform into a complete app.');
  console.log('    This runs the entire pipeline end-to-end in one go.\n');

  console.log(chalk.cyan('  List Runs & Builds'));
  console.log('    View your recent pipeline runs, completed builds, and generated ideas.');
  console.log('    Useful for finding idea IDs to build.\n');

  console.log(chalk.cyan('  Resume Run'));
  console.log('    If a pipeline run was interrupted, resume from where it left off.\n');

  console.log(chalk.cyan('  System Check'));
  console.log('    Verify that your environment is set up correctly:\n');
  console.log('    - Anthropic API key configured');
  console.log('    - Node.js version compatible');
  console.log('    - Required dependencies available\n');

  printDivider();

  console.log(chalk.bold('\nOUTPUT LOCATIONS\n'));
  console.log(`  Runs:   ${chalk.gray('the_factory/runs/YYYY-MM-DD/<run_id>/')}`);
  console.log(`  Builds: ${chalk.gray('the_factory/builds/<idea_dir>/')}`);

  console.log(chalk.bold('\n\nKEYBOARD SHORTCUTS\n'));
  console.log('  Up/Down arrows  - Navigate menu options');
  console.log('  Enter           - Select option');
  console.log('  Ctrl+C          - Exit at any time');

  console.log();
}

/**
 * Wait for user to press Enter
 */
export async function pressEnterToContinue(): Promise<void> {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: chalk.gray('Press Enter to return to main menu...'),
    }
  ]);
}

/**
 * Confirm an action
 */
export async function confirmAction(message: string): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: true
    }
  ]);
  return confirmed;
}

/**
 * Get text input from user
 */
export async function getTextInput(message: string, placeholder?: string): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: placeholder,
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Please enter a value';
        }
        return true;
      }
    }
  ]);
  return value.trim();
}

/**
 * Select from a list of options
 */
export async function selectFromList<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T }>
): Promise<T> {
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message,
      choices,
      pageSize: 15
    }
  ]);
  return selected;
}

/**
 * Show a loading message
 */
export function showLoading(message: string): void {
  console.log(chalk.cyan(`\n  ${message}...\n`));
}

/**
 * Show operation result
 */
export function showResult(success: boolean, message: string): void {
  console.log();
  if (success) {
    printSuccess(message);
  } else {
    printError(message);
  }
  console.log();
}

/**
 * Show a tip or hint
 */
export function showTip(message: string): void {
  console.log(chalk.yellow(`\n  TIP: ${message}\n`));
}

/**
 * Show section header in menu context
 */
export function showSection(title: string): void {
  console.log();
  console.log(chalk.bold.cyan(`  ${title}`));
  console.log(chalk.gray('  ' + '─'.repeat(title.length + 2)));
  console.log();
}
