/**
 * ASCII Banner Module
 *
 * Displays the App Factory ASCII art banner.
 */

import chalk from 'chalk';

const BANNER = `
 █████╗ ██████╗ ██████╗     ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
██╔══██╗██╔══██╗██╔══██╗    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
███████║██████╔╝██████╔╝    █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝
██╔══██║██╔═══╝ ██╔═══╝     ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝
██║  ██║██║     ██║         ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║
╚═╝  ╚═╝╚═╝     ╚═╝         ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝
`;

const BANNER_SIMPLE = `
    _                ______         _
   / \\   _ __  _ __ |  ____|_ _  __| |_ ___  _ __ _   _
  / _ \\ | '_ \\| '_ \\| |__ / _\` |/ _\` | __/ _ \\| '__| | | |
 / ___ \\| |_) | |_) |  __| (_| | (_| | || (_) | |  | |_| |
/_/   \\_\\ .__/| .__/|_|   \\__,_|\\__,_|\\__\\___/|_|   \\__, |
        |_|   |_|                                    |___/
`;

const TAGLINE = 'Generate store-ready Expo React Native apps with Claude AI';
const VERSION = '1.0.0';

/**
 * Print the banner
 */
export function printBanner(simple: boolean = false): void {
  const banner = simple ? BANNER_SIMPLE : BANNER;

  console.log(chalk.cyan(banner));
  console.log(chalk.gray(`  ${TAGLINE}`));
  console.log(chalk.gray(`  Version ${VERSION}\n`));
}

/**
 * Print a section header
 */
export function printHeader(text: string): void {
  const line = '─'.repeat(text.length + 4);
  console.log();
  console.log(chalk.cyan(line));
  console.log(chalk.cyan(`  ${text}  `));
  console.log(chalk.cyan(line));
  console.log();
}

/**
 * Print a stage header
 */
export function printStageHeader(stageId: string, stageName: string): void {
  console.log();
  console.log(chalk.cyan(`┌─ Stage ${stageId}: ${stageName} ${'─'.repeat(40)}`));
}

/**
 * Print stage completion
 */
export function printStageComplete(stageId: string, duration: number): void {
  console.log(chalk.green(`└─ Stage ${stageId} complete (${(duration / 1000).toFixed(1)}s)`));
}

/**
 * Print stage failure
 */
export function printStageFailed(stageId: string, error: string): void {
  console.log(chalk.red(`└─ Stage ${stageId} FAILED`));
  console.log(chalk.red(`   Error: ${error}`));
}

/**
 * Print a divider
 */
export function printDivider(): void {
  console.log(chalk.gray('─'.repeat(60)));
}

/**
 * Print success message with checkmark
 */
export function printSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Print error message with X
 */
export function printError(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

/**
 * Print info message
 */
export function printInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

/**
 * Print completion banner
 */
export function printCompletionBanner(command: string, duration: number): void {
  console.log();
  console.log(chalk.green('═'.repeat(60)));
  console.log(chalk.green(`  ✓ ${command.toUpperCase()} COMPLETED SUCCESSFULLY`));
  console.log(chalk.green(`    Duration: ${(duration / 1000).toFixed(1)}s`));
  console.log(chalk.green('═'.repeat(60)));
  console.log();
}

/**
 * Print failure banner
 */
export function printFailureBanner(command: string, error: string): void {
  console.log();
  console.log(chalk.red('═'.repeat(60)));
  console.log(chalk.red(`  ✗ ${command.toUpperCase()} FAILED`));
  console.log(chalk.red(`    Error: ${error}`));
  console.log(chalk.red('═'.repeat(60)));
  console.log();
}
