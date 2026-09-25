import { PatientsService } from './patients.service.js';
import type { Patient } from './patient.interface.js';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    findAll(): Patient[];
    findOne(id: number): Patient;
}
