import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OllamaClient {
  private readonly baseUrl: string;
  private readonly embedModel: string;
  private readonly chatModel: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('OLLAMA_URL') ?? 'http://127.0.0.1:11434';
    this.embedModel = config.get<string>('EMBED_MODEL') ?? 'nomic-embed-text';
    this.chatModel = config.get<string>('CHAT_MODEL') ?? 'llama3.2:1b';
  }

  private async post<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        `AI model service unavailable (${(error as Error).message})`,
      );
    }
    if (!res.ok) {
      const text = await res.text();
      throw new ServiceUnavailableException(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  // Text → vectors. nomic-embed-text works best with "search_document:" / "search_query:" prefixes
  async embed(texts: string[], kind: 'document' | 'query'): Promise<number[][]> {
    const prefix = kind === 'document' ? 'search_document: ' : 'search_query: ';
    const data = await this.post<{ embeddings: number[][] }>(
      '/api/embed',
      { model: this.embedModel, input: texts.map((t) => prefix + t) },
      60_000,
    );
    return data.embeddings;
  }

  // Ask the chat model. Low temperature = factual, less "creative"
  async chat(system: string, question: string): Promise<string> {
    const data = await this.post<{ message: { content: string } }>(
      '/api/chat',
      {
        model: this.chatModel,
        stream: false,
        options: { temperature: 0.1 },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
      },
      120_000, // local models on CPU can be slow
    );
    return data.message.content.trim();
  }
}