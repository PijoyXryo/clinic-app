import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LegacyPatient } from './his.types.js';

@Injectable()
export class HisClient {
  private readonly logger = new Logger(HisClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('HIS_URL') ?? 'http://127.0.0.1:8080';
    this.apiKey = config.get<string>('HIS_API_KEY') ?? '';
    this.timeoutMs = Number(config.get('HIS_TIMEOUT_MS') ?? 5000);
  }

  // One place for every call: API key, timeout, logging, error translation
  private async get<T>(path: string): Promise<T> {
    const started = Date.now();
    let res: Response;

    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'X-Api-Key': this.apiKey, Accept: 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs), // never wait forever
      });
    } catch (error) {
      const err = error as Error;
      if (err.name === 'TimeoutError') {
        this.logger.error(`HIS timeout after ${this.timeoutMs}ms: GET ${path}`);
        throw new GatewayTimeoutException('Hospital system is too slow to respond');
      }
      this.logger.error(`HIS unreachable: GET ${path} (${err.message})`);
      throw new BadGatewayException('Hospital system is unavailable');
    }

    this.logger.log(`GET ${path} → ${res.status} (${Date.now() - started}ms)`);

    if (res.status === 404) {
      throw new NotFoundException('Patient not found in hospital system');
    }
    if (res.status === 401) {
      this.logger.error('HIS rejected our API key: check HIS_API_KEY in .env');
      throw new BadGatewayException('Hospital system refused the connection');
    }
    if (!res.ok) {
      throw new BadGatewayException(`Hospital system error (${res.status})`);
    }
    return (await res.json()) as T;
  }

  async listPatients(): Promise<LegacyPatient[]> {
    const body = await this.get<{ data: LegacyPatient[] }>('/patients');
    return body.data;
  }

  async findPatientByIc(icNumber: string): Promise<LegacyPatient> {
    const body = await this.get<{ data: LegacyPatient }>(
      `/patients/by-ic/${encodeURIComponent(icNumber)}`,
    );
    return body.data;
  }
}