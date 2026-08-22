import OpenAILLM from '../openai/openaiLLM';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Message } from '@/lib/types';

/**
 * Anthropic is driven through the OpenAI-compatible endpoint (OpenAILLM). One incompatibility:
 * Anthropic REJECTS assistant messages with empty text content — but the researcher loop pushes
 * `{ role: 'assistant', content: '', tool_calls: [...] }` after the model decides to search, which
 * OpenAI tolerates and Anthropic does not (fails with "… is empty" on the next iteration, before any
 * search runs). Coerce empty assistant content to a non-empty placeholder before conversion.
 */
class AnthropicLLM extends OpenAILLM {
  convertToOpenAIMessages(messages: Message[]): ChatCompletionMessageParam[] {
    const safe = messages.map((m) =>
      m.role === 'assistant' && (!m.content || m.content.trim() === '')
        ? { ...m, content: '(calling tools)' }
        : m,
    );
    return super.convertToOpenAIMessages(safe);
  }
}

export default AnthropicLLM;
