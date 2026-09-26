import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { OllamaClient } from './ollama.client.js';
import { VectorStore } from './vector.store.js';

@Module({
  controllers: [AiController],
  providers: [AiService, OllamaClient, VectorStore],
})
export class AiModule {}