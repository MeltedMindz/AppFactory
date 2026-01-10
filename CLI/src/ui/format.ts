/**
 * Output Formatting Module
 *
 * Consistent formatting for tables, lists, and structured output.
 */

import chalk from 'chalk';

/**
 * Format a table with columns
 */
export function formatTable(
  headers: string[],
  rows: string[][],
  options: { padding?: number; color?: boolean } = {}
): string {
  const { padding = 2, color = true } = options;

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map(r => (r[i] || '').length));
    return Math.max(h.length, maxRowWidth);
  });

  // Format header
  const headerRow = headers.map((h, i) =>
    h.padEnd(widths[i])
  ).join(' '.repeat(padding));

  const separator = widths.map(w => '─'.repeat(w)).join('─'.repeat(padding));

  // Format rows
  const formattedRows = rows.map(row =>
    row.map((cell, i) =>
      (cell || '').padEnd(widths[i])
    ).join(' '.repeat(padding))
  );

  // Build table
  const lines = [
    color ? chalk.bold(headerRow) : headerRow,
    color ? chalk.gray(separator) : separator,
    ...formattedRows
  ];

  return lines.join('\n');
}

/**
 * Format a key-value list
 */
export function formatKeyValue(
  items: Array<{ key: string; value: string; color?: string }>,
  options: { keyWidth?: number; separator?: string } = {}
): string {
  const { keyWidth, separator = ':' } = options;

  const maxKeyLen = keyWidth || Math.max(...items.map(i => i.key.length));

  return items.map(item => {
    const key = item.key.padEnd(maxKeyLen);
    const colorFn = item.color ? (chalk as unknown as Record<string, (s: string) => string>)[item.color] || ((s: string) => s) : (s: string) => s;
    return `${chalk.gray(key)} ${separator} ${colorFn(item.value)}`;
  }).join('\n');
}

/**
 * Format a numbered list
 */
export function formatNumberedList(items: string[]): string {
  return items.map((item, i) =>
    `${chalk.cyan((i + 1).toString().padStart(2))}. ${item}`
  ).join('\n');
}

/**
 * Format a bulleted list
 */
export function formatBulletList(items: string[], bullet: string = '•'): string {
  return items.map(item =>
    `  ${chalk.cyan(bullet)} ${item}`
  ).join('\n');
}

/**
 * Format an idea summary
 */
export function formatIdeaSummary(idea: {
  id: string;
  name: string;
  rank: number;
  score: number;
  description?: string;
}): string {
  const lines = [
    `${chalk.bold(idea.name)} ${chalk.gray(`(${idea.id})`)}`,
    `  Rank: ${chalk.cyan(String(idea.rank))}  Score: ${chalk.green(String(idea.score))}`
  ];

  if (idea.description) {
    lines.push(`  ${chalk.gray(idea.description.substring(0, 80))}...`);
  }

  return lines.join('\n');
}

/**
 * Format a run summary
 */
export function formatRunSummary(run: {
  id: string;
  date: string;
  status: string;
  command: string;
  ideaCount: number;
  stagesCompleted: number;
}): string {
  const statusColor = run.status === 'completed' ? 'green' :
    run.status === 'failed' ? 'red' : 'yellow';

  return formatKeyValue([
    { key: 'Run ID', value: run.id },
    { key: 'Date', value: run.date },
    { key: 'Status', value: run.status, color: statusColor },
    { key: 'Command', value: run.command },
    { key: 'Ideas', value: String(run.ideaCount) },
    { key: 'Stages', value: String(run.stagesCompleted) }
  ]);
}

/**
 * Format a build summary
 */
export function formatBuildSummary(build: {
  id: string;
  ideaName: string;
  path: string;
  timestamp: string;
}): string {
  return formatKeyValue([
    { key: 'Build ID', value: build.id },
    { key: 'App', value: build.ideaName },
    { key: 'Path', value: build.path },
    { key: 'Created', value: build.timestamp }
  ]);
}

/**
 * Format duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Format file size
 */
export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format a progress bar
 */
export function formatProgressBar(
  current: number,
  total: number,
  width: number = 30
): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;

  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));

  return `${bar} ${percentage}% (${current}/${total})`;
}

/**
 * Format a box around text
 */
export function formatBox(
  text: string,
  options: { title?: string; padding?: number; color?: string } = {}
): string {
  const { title, padding = 1, color = 'cyan' } = options;
  const colorFn = (chalk as unknown as Record<string, (s: string) => string>)[color] || ((s: string) => s);

  const lines = text.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length), (title?.length || 0) + 4);
  const innerWidth = maxLen + (padding * 2);

  const topBorder = title ?
    `┌─ ${title} ${'─'.repeat(innerWidth - title.length - 3)}┐` :
    `┌${'─'.repeat(innerWidth)}┐`;

  const bottomBorder = `└${'─'.repeat(innerWidth)}┘`;

  const formattedLines = lines.map(line =>
    `│${' '.repeat(padding)}${line.padEnd(maxLen)}${' '.repeat(padding)}│`
  );

  return colorFn([
    topBorder,
    ...formattedLines,
    bottomBorder
  ].join('\n'));
}

/**
 * Format next steps
 */
export function formatNextSteps(steps: string[]): string {
  const header = chalk.bold('\nNext Steps:');
  const formatted = steps.map((step, i) =>
    `  ${chalk.cyan((i + 1) + '.')} ${step}`
  ).join('\n');

  return `${header}\n${formatted}`;
}
