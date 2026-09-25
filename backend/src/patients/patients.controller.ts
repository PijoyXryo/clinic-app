import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import type { Patient } from './patient.interface.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // GET /patients
  @Get()
  findAll(): Patient[] {
    return this.patientsService.findAll();
  }

  // GET /patients/2
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Patient {
    return this.patientsService.findOne(id);
  }
}