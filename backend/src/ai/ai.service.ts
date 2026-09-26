import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { OllamaClient } from './ollama.client.js';
import { VectorStore, type ChunkPayload } from './vector.store.js';
import { chunkMarkdown } from './chunker.js';

export type AskResult = {
  answer: string;
  sources: { file: string; score: number }[];
};

const NOT_FOUND_ANSWER = "I don't know. Please ask the front desk.";
const MIN_SCORE = 0.45; // below this, a chunk is "not really related"

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly knowledgeDir = join(process.cwd(), 'knowledge');

  constructor(
    private readonly ollama: OllamaClient,
    private readonly store: VectorStore,
  ) {}

  // ===== INGEST: documents → chunks → vectors → Qdrant =====
  async ingest(): Promise<{ files: number; chunks: number }> {
    const files = (await readdir(this.knowledgeDir)).filter((f) => f.endsWith('.md'));

    const chunks: ChunkPayload[] = [];
    for (const file of files) {
      const text = await readFile(join(this.knowledgeDir, file), 'utf8');
      const title = /^#\s+(.+)$/m.exec(text)?.[1] ?? file;
      for (const chunk of chunkMarkdown(text)) {
        // Add the document title so every chunk keeps its context
        chunks.push({ source: file, text: chunk.startsWith('#') ? chunk : `${title}\n\n${chunk}` });
      }
    }

    const vectors = await this.ollama.embed(chunks.map((c) => c.text), 'document');
    await this.store.recreateCollection(vectors[0].length);
    await this.store.upsert(
      chunks.map((payload, i) => ({ id: randomUUID(), vector: vectors[i], payload })),
    );

    this.logger.log(`Ingested ${chunks.length} chunks from ${files.length} files`);
    return { files: files.length, chunks: chunks.length };
  }

  // ===== ASK: question → vector → search → prompt → answer =====
  async ask(question: string): Promise<AskResult> {
    // 1. RETRIEVE
    const [vector] = await this.ollama.embed([question], 'query');
    let hits;
    try {
      hits = await this.store.search(vector, 3);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Knowledge base is empty. Run POST /ai/ingest first');
      }
      throw error;
    }

    this.logger.log(
      `Q: "${question}" → scores ${hits.map((h) => h.score.toFixed(2)).join(', ')}`,
    );

    const relevant = hits.filter((h) => h.score >= MIN_SCORE);
    if (relevant.length === 0) {
      return { answer: NOT_FOUND_ANSWER, sources: [] }; // don't even ask the model
    }

    // 2. AUGMENT
    const context = relevant
      .map((h, i) => `[${i + 1}] (from ${h.payload.source})\n${h.payload.text}`)
      .join('\n\n');

    const system = `You are the friendly front-desk assistant of Klinik MediQueue.
Answer ONLY using the context below. If the answer is not in the context, reply exactly: "${NOT_FOUND_ANSWER}"
Keep answers short (1-3 sentences). Never give medical diagnoses or medicine advice; suggest seeing the doctor instead.

Context:
${context}`;

    // 3. GENERATE
    const answer = await this.ollama.chat(system, question);

    return {
      answer,
      sources: relevant.map((h) => ({ file: h.payload.source, score: Number(h.score.toFixed(3)) })),
    };
  }
}
