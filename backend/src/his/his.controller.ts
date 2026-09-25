import { Controller, Get, Param, Post } from '@nestjs/common';
import { HisService } from './his.service.js';
import type { SyncResult } from './his.types.js';
import { Patient } from '../patients/patient.entity.js';

@Controller('his')
export class HisController {
  constructor(private readonly hisService: HisService) {}

  // GET /his/patients: preview hospital data
  @Get('patients')
  listPatients() {
    return this.hisService.listPatients();
  }

  // POST /his/sync: copy all hospital patients into the clinic
  @Post('sync')
  sync(): Promise<SyncResult> {
    return this.hisService.syncPatients();
  }

  // POST /his/import/850612-10-1234: import one patient
  @Post('import/:icNumber')
  importByIc(@Param('icNumber') icNumber: string): Promise<Patient> {
    return this.hisService.importByIc(icNumber);
  }
}