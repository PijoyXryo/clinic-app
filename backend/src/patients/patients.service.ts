import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';

import { birthDateFromIc } from './ic.util.js';
@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepo: Repository<Patient>,
  ) {}

  // Newest 50 patients (never load 20,000 rows at once!)
  findAll(): Promise<Patient[]> {
    return this.patientsRepo.find({ order: { id: 'DESC' }, take: 50 });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientsRepo.findOneBy({ id });
    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }
    return patient;
  }

    async create(dto: CreatePatientDto): Promise<Patient> {
    const dateOfBirth = birthDateFromIc(dto.icNumber);
    if (!dateOfBirth) {
      throw new BadRequestException('IC number does not contain a valid date of birth');
    }

    const exists = await this.patientsRepo.existsBy({ icNumber: dto.icNumber });
    if (exists) {
      throw new ConflictException(`IC number ${dto.icNumber} is already registered`);
    }

    const patient = this.patientsRepo.create({ ...dto, dateOfBirth });
    return this.patientsRepo.save(patient);
    }
}
