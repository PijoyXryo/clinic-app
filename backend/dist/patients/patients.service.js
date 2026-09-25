var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, NotFoundException } from '@nestjs/common';
let PatientsService = class PatientsService {
    patients = [
        { id: 1, fullName: 'Ahmad bin Ali', icNumber: '180101-14-1111', age: 8 },
        { id: 2, fullName: 'Siti Aminah', icNumber: '910315-10-2222', age: 35 },
        { id: 3, fullName: 'Tan Wei Ming', icNumber: '640720-08-3333', age: 62 },
    ];
    findAll() {
        return this.patients;
    }
    findOne(id) {
        const patient = this.patients.find((p) => p.id === id);
        if (!patient) {
            throw new NotFoundException(`Patient ${id} not found`);
        }
        return patient;
    }
};
PatientsService = __decorate([
    Injectable()
], PatientsService);
export { PatientsService };
//# sourceMappingURL=patients.service.js.map