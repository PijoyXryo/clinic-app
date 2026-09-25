import type { LegacyPatient } from './his.types.js';
import type { CreatePatientDto } from '../patients/dto/create-patient.dto.js';

// Translate hospital format → clinic format
export function toClinicPatient(lp: LegacyPatient): CreatePatientDto {
  const fullName = lp.nama?.trim();
  const icNumber = lp.no_kp?.trim();

  // Data from another system skips our ValidationPipe, so check it ourselves
  if (!fullName || !icNumber) {
    throw new Error('Hospital record is missing nama or no_kp');
  }

  return { fullName, icNumber };
}