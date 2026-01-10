/**
 * Anthropic API Client Module
 *
 * Wrapper around the official Anthropic SDK with retry logic and streaming support.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logging.js';

// Configuration from environment
export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Default configuration values
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 16000;
const DEFAULT_TEMPERATURE = 0.3;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Stub mode for testing
let stubMode = false;
let stubResponses: Map<string, string> = new Map();

export function setStubMode(enabled: boolean): void {
  stubMode = enabled;
}

export function addStubResponse(prompt: string, response: string): void {
  stubResponses.set(prompt, response);
}

export function clearStubResponses(): void {
  stubResponses.clear();
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AnthropicConfig {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey && !stubMode) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return {
    apiKey: apiKey || 'stub-key',
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    maxTokens: parseInt(process.env.APPFACTORY_MAX_TOKENS || String(DEFAULT_MAX_TOKENS), 10),
    temperature: parseFloat(process.env.APPFACTORY_TEMPERATURE || String(DEFAULT_TEMPERATURE))
  };
}

/**
 * Create an Anthropic client instance
 */
export function createClient(config: AnthropicConfig): Anthropic {
  return new Anthropic({
    apiKey: config.apiKey
  });
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract JSON from a Claude response that may contain markdown code blocks
 */
export function extractJson(content: string): string {
  // Try to find JSON in code blocks first
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON object or array
  const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Return as-is
  return content.trim();
}

/**
 * Call Claude API with the given prompt
 */
export async function callClaude(
  prompt: string,
  systemPrompt?: string,
  config?: Partial<AnthropicConfig>
): Promise<string> {
  const fullConfig = { ...loadConfig(), ...config };

  // Handle stub mode
  if (stubMode) {
    logger.debug('Stub mode: returning mock response');
    const stubResponse = stubResponses.get(prompt);
    if (stubResponse) {
      return stubResponse;
    }
    // Return a generic stub response
    return JSON.stringify({
      stub: true,
      message: 'This is a stub response for testing'
    });
  }

  const client = createClient(fullConfig);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.apiCall(fullConfig.model);

      const response = await client.messages.create({
        model: fullConfig.model,
        max_tokens: fullConfig.maxTokens,
        temperature: fullConfig.temperature,
        ...(systemPrompt && { system: systemPrompt }),
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      // Extract text content
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const responseText = textContent.text;
      logger.apiSuccess(response.usage?.output_tokens || 0);

      return responseText;
    } catch (err) {
      lastError = err as Error;
      const errorMessage = lastError.message || String(err);

      // Check for rate limiting
      if (errorMessage.includes('rate') || errorMessage.includes('429')) {
        logger.warn(`Rate limited, waiting ${RETRY_DELAY_MS * attempt}ms before retry ${attempt}/${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      // Check for overloaded
      if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
        logger.warn(`API overloaded, waiting ${RETRY_DELAY_MS * attempt}ms before retry ${attempt}/${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      // Other errors - don't retry
      logger.apiError(errorMessage);
      throw err;
    }
  }

  throw lastError || new Error('API call failed after retries');
}

/**
 * Call Claude API and parse JSON response
 */
export async function callClaudeJson<T>(
  prompt: string,
  systemPrompt?: string,
  config?: Partial<AnthropicConfig>
): Promise<T> {
  const response = await callClaude(prompt, systemPrompt, config);
  const jsonStr = extractJson(response);

  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    logger.error(`Failed to parse JSON response: ${err}`);
    logger.debug('Raw response:', { response });
    throw new Error(`Invalid JSON in response: ${err}`);
  }
}

/**
 * Stream Claude API response (for long-running generations)
 */
export async function streamClaude(
  prompt: string,
  systemPrompt?: string,
  onChunk?: (chunk: string) => void,
  config?: Partial<AnthropicConfig>
): Promise<string> {
  const fullConfig = { ...loadConfig(), ...config };

  if (stubMode) {
    const response = stubResponses.get(prompt) || '{"stub": true}';
    if (onChunk) onChunk(response);
    return response;
  }

  const client = createClient(fullConfig);

  let fullResponse = '';

  const stream = client.messages.stream({
    model: fullConfig.model,
    max_tokens: fullConfig.maxTokens,
    temperature: fullConfig.temperature,
    ...(systemPrompt && { system: systemPrompt }),
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta;
      if ('text' in delta) {
        fullResponse += delta.text;
        if (onChunk) {
          onChunk(delta.text);
        }
      }
    }
  }

  return fullResponse;
}
