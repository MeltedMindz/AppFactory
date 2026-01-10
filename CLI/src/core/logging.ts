/**
 * Logging Module
 *
 * Structured logging with human-friendly output and JSON mode for CI.
 */

import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

class Logger {
  private jsonMode: boolean = false;
  private debugMode: boolean = false;
  private redactPatterns: RegExp[] = [
    /sk-ant-[a-zA-Z0-9-]+/g,
    /ANTHROPIC_API_KEY=[^\s]+/g
  ];

  setJsonMode(enabled: boolean): void {
    this.jsonMode = enabled;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private redact(message: string): string {
    let result = message;
    for (const pattern of this.redactPatterns) {
      result = result.replace(pattern, '[REDACTED]');
    }
    return result;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const redactedMessage = this.redact(message);
    const redactedData = data ? JSON.parse(this.redact(JSON.stringify(data))) : undefined;

    if (this.jsonMode) {
      const entry: LogEntry = {
        level,
        message: redactedMessage,
        timestamp: this.formatTimestamp(),
        ...(redactedData && { data: redactedData })
      };
      console.log(JSON.stringify(entry));
      return;
    }

    const prefix = this.getPrefix(level);
    const formattedMessage = `${prefix} ${redactedMessage}`;

    if (data && this.debugMode) {
      console.log(formattedMessage);
      console.log(chalk.gray(JSON.stringify(redactedData, null, 2)));
    } else {
      console.log(formattedMessage);
    }
  }

  private getPrefix(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return chalk.gray('[DEBUG]');
      case 'info':
        return chalk.blue('[INFO]');
      case 'warn':
        return chalk.yellow('[WARN]');
      case 'error':
        return chalk.red('[ERROR]');
      case 'success':
        return chalk.green('[OK]');
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (this.debugMode) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  success(message: string, data?: Record<string, unknown>): void {
    this.log('success', message, data);
  }

  // Stage-specific logging
  stageStart(stageId: string): void {
    this.info(`Starting stage ${stageId}...`);
  }

  stageComplete(stageId: string, duration?: number): void {
    const durationStr = duration ? ` (${(duration / 1000).toFixed(1)}s)` : '';
    this.success(`Stage ${stageId} completed${durationStr}`);
  }

  stageFailed(stageId: string, error: string): void {
    this.error(`Stage ${stageId} failed: ${error}`);
  }

  // Pipeline logging
  pipelineStart(command: string): void {
    this.info(`Starting pipeline: ${command}`);
  }

  pipelineComplete(duration: number): void {
    this.success(`Pipeline completed in ${(duration / 1000).toFixed(1)}s`);
  }

  pipelineFailed(error: string): void {
    this.error(`Pipeline failed: ${error}`);
  }

  // Validation logging
  validationStart(schemaName: string): void {
    this.debug(`Validating against schema: ${schemaName}`);
  }

  validationSuccess(schemaName: string): void {
    this.success(`Schema validation passed: ${schemaName}`);
  }

  validationFailed(schemaName: string, errors: string[]): void {
    this.error(`Schema validation failed: ${schemaName}`);
    for (const err of errors) {
      this.error(`  - ${err}`);
    }
  }

  // API logging
  apiCall(model: string, tokens?: number): void {
    const tokenStr = tokens ? ` (${tokens} tokens)` : '';
    this.debug(`API call to ${model}${tokenStr}`);
  }

  apiSuccess(responseTokens: number): void {
    this.debug(`API response received (${responseTokens} tokens)`);
  }

  apiError(error: string): void {
    this.error(`API error: ${error}`);
  }

  // Script execution logging
  scriptStart(scriptName: string): void {
    this.debug(`Executing script: ${scriptName}`);
  }

  scriptSuccess(scriptName: string): void {
    this.success(`Script passed: ${scriptName}`);
  }

  scriptFailed(scriptName: string, exitCode: number): void {
    this.error(`Script failed: ${scriptName} (exit code ${exitCode})`);
  }
}

// Singleton logger instance
export const logger = new Logger();
