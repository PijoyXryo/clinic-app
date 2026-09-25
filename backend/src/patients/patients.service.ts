import { Injectable, NotFoundException } from '@nestjs/common';
import type { Patient } from './patient.interface.js';

@Injectable()
export class PatientsService {
  // Temporary data in memory. Lesson 16 replaces this with PostgreSQL.
  private patients: Patient[] = [
    { id: 1, fullName: 'Ahmad bin Ali', icNumber: '180101-14-1111', age: 8 },
    { id: 2, fullName: 'Siti Aminah', icNumber: '910315-10-2222', age: 35 },
    { id: 3, fullName: 'Tan Wei Ming', icNumber: '640720-08-3333', age: 62 },
  ];

  findAll(): Patient[] {
    return this.patients;
  }

  findOne(id: number): Patient {
    const patient = this.patients.find((p) => p.id === id);
    if (!patient) {
      throw new NotFoundException(`Patient ${id} not found`);
    }
    return patient;
  }
}