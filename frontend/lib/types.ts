export type AppointmentStatus = 'waiting' | 'called' | 'done';

export type Patient = {
  id: number;
  fullName: string;
  icNumber: string;
  dateOfBirth: string;
  age?: number;
  createdAt: string;
};

export type Appointment = {
  id: number;
  queueNumber: number;
  visitDate: string;
  reason: string | null;
  status: AppointmentStatus;
  fee: number;
  patient: Patient;
};