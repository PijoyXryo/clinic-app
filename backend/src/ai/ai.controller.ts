import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service.js';
import type { AskResult } from './ai.service.js';
import { AskDto } from './dto/ask.dto.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // POST /ai/ingest: (re)load the knowledge documents into Qdrant
  @Post('ingest')
  ingest() {
    return this.aiService.ingest();
  }

  // POST /ai/ask  { "question": "..." }
  @Post('ask')
  ask(@Body() dto: AskDto): Promise<AskResult> {
    return this.aiService.ask(dto.question);
  }
}