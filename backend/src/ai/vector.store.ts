import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ChunkPayload = { source: string; text: string };
export type SearchHit = { score: number; payload: ChunkPayload };

@Injectable()
export class VectorStore {
  private readonly baseUrl: string;
  private readonly collection = 'clinic_knowledge';

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('QDRANT_URL') ?? 'http://127.0.0.1:6333';
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new ServiceUnavailableException(
        `Vector database unavailable (${(error as Error).message})`,
      );
    }
    if (res.status === 404) throw new NotFoundException('Collection not found');
    if (!res.ok) {
      throw new ServiceUnavailableException(`Qdrant error ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  }

  // Start fresh: delete the old collection (if any) and create an empty one
  async recreateCollection(vectorSize: number): Promise<void> {
    await this.request('DELETE', `/collections/${this.collection}`).catch(() => undefined);
    await this.request('PUT', `/collections/${this.collection}`, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
  }

  async upsert(points: { id: string; vector: number[]; payload: ChunkPayload }[]): Promise<void> {
    await this.request('PUT', `/collections/${this.collection}/points?wait=true`, { points });
  }

  // Find the chunks whose meaning is closest to the question
  async search(vector: number[], limit: number): Promise<SearchHit[]> {
    const data = await this.request<{ result: { points: SearchHit[] } }>(
      'POST',
      `/collections/${this.collection}/points/query`,
      { query: vector, limit, with_payload: true },
    );
    return data.result.points;
  }
}