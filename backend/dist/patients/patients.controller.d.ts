import { PatientsService } from './patients.service.js';
import type { Patient } from './patient.interface.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    findAll(): Patient[];
    findOne(id: number): Patient;
    create(dto: CreatePatientDto): Patient;
}
