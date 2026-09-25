import type { Patient } from './patient.interface.js';
export declare class PatientsService {
    private patients;
    findAll(): Patient[];
    findOne(id: number): Patient;
}
