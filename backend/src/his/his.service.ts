import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { HisClient } from './his.client.js';
import { toClinicPatient } from './his.mapper.js';
import type { SyncResult } from './his.types.js';
import { PatientsService } from '../patients/patients.service.js';
import { Patient } from '../patients/patient.entity.js';

@Injectable()
export class HisService {
  private readonly logger = new Logger(HisService.name);

  constructor(
    private readonly his: HisClient,
    private readonly patientsService: PatientsService,
  ) {}

  // Preview hospital patients in OUR format
  async listPatients() {
    const legacy = await this.his.listPatients();
    return legacy.map((lp) => ({
      hisId: Number(lp.id),
      fullName: lp.nama,
      icNumber: lp.no_kp,
      phone: lp.telefon,
    }));
  }

  // Copy every hospital patient into the clinic. One bad record must not stop the rest.
  async syncPatients(): Promise<SyncResult> {
    const legacy = await this.his.listPatients();
    const result: SyncResult = { total: legacy.length, created: 0, alreadyExists: 0, failed: [] };

    for (const lp of legacy) {
      try {
        await this.patientsService.create(toClinicPatient(lp));
        result.created++;
      } catch (error) {
        if (error instanceof ConflictException) {
          result.alreadyExists++; // already in clinic: fine, skip it
        } else {
          result.failed.push({ noKp: lp.no_kp, reason: (error as Error).message });
        }
      }
    }

    this.logger.log(`HIS sync finished: ${JSON.stringify(result)}`);
    return result;
  }

  // Import ONE patient by IC (used by check-in)
  async importByIc(icNumber: string): Promise<Patient> {
    const lp = await this.his.findPatientByIc(icNumber); // 404 if the hospital doesn't know them
    return this.patientsService.create(toClinicPatient(lp)); // reuses ALL our rules (IC date, duplicates)
  }
}