/**
 * Interactive Prompts Module
 *
 * User prompts and confirmations using inquirer.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Prompt for confirmation
 */
export async function confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }
  ]);

  return confirmed;
}

/**
 * Prompt for text input
 */
export async function input(message: string, defaultValue?: string): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue
    }
  ]);

  return value;
}

/**
 * Prompt for selection from list
 */
export async function select<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T; description?: string }>
): Promise<T> {
  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message,
      choices: choices.map(c => ({
        name: c.description ? `${c.name} - ${chalk.gray(c.description)}` : c.name,
        value: c.value
      }))
    }
  ]);

  return selected;
}

/**
 * Prompt for multi-selection
 */
export async function multiSelect<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T; checked?: boolean }>
): Promise<T[]> {
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message,
      choices
    }
  ]);

  return selected;
}

/**
 * Prompt for idea selection
 */
export async function selectIdea(
  ideas: Array<{ id: string; name: string; rank: number; score: number }>
): Promise<string> {
  const choices = ideas.map(idea => ({
    name: `${idea.rank}. ${idea.name} (Score: ${idea.score})`,
    value: idea.id
  }));

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select an idea to build:',
      choices
    }
  ]);

  return selected;
}

/**
 * Prompt for dream idea text
 */
export async function promptDreamIdea(): Promise<string> {
  const { idea } = await inquirer.prompt([
    {
      type: 'input',
      name: 'idea',
      message: 'Describe your app idea:',
      validate: (value: string) => {
        if (value.trim().length < 10) {
          return 'Please provide a more detailed description (at least 10 characters)';
        }
        return true;
      }
    }
  ]);

  return idea.trim();
}

/**
 * Prompt for intake requirements
 */
export async function promptIntake(): Promise<string> {
  const { intake } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'intake',
      message: 'Enter your requirements (opens editor):',
      default: `# App Factory Intake

## Target Market
Describe your target users...

## Requirements
- Requirement 1
- Requirement 2

## Constraints
- Must support offline mode
- Must use subscription monetization
`
    }
  ]);

  return intake.trim();
}

/**
 * Prompt for API key
 */
export async function promptApiKey(): Promise<string> {
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your Anthropic API key:',
      mask: '*',
      validate: (value: string) => {
        if (!value.startsWith('sk-ant-')) {
          return 'Invalid API key format. Anthropic keys start with sk-ant-';
        }
        return true;
      }
    }
  ]);

  return apiKey;
}

/**
 * Prompt for run selection
 */
export async function selectRun(
  runs: Array<{ id: string; date: string; status: string; ideaCount: number }>
): Promise<string> {
  const choices = runs.map(run => ({
    name: `${run.id} (${run.date}) - ${run.status}, ${run.ideaCount} ideas`,
    value: run.id
  }));

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select a run:',
      choices
    }
  ]);

  return selected;
}

/**
 * Display a spinner while waiting
 */
export function showSpinner(message: string): { stop: (success?: boolean) => void } {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);

  return {
    stop: (success?: boolean) => {
      clearInterval(interval);
      const symbol = success === false ? chalk.red('✗') : chalk.green('✓');
      process.stdout.write(`\r${symbol} ${message}\n`);
    }
  };
}
