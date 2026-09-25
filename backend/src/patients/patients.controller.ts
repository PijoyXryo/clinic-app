import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { Patient } from './patient.entity.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePatientDto): Promise<Patient> {
    return this.patientsService.create(dto);
  }
}