import type { Patient } from './patient.interface.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
export declare class PatientsService {
    private patients;
    findAll(): Patient[];
    findOne(id: number): Patient;
    create(dto: CreatePatientDto): Patient;
}
