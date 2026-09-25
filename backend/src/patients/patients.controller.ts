import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import type { Patient } from './patient.interface.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';

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

  // POST /patients
  @Post()
  create(@Body() dto: CreatePatientDto): Patient {
    return this.patientsService.create(dto);
  }
}