import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity.js';

export type AppointmentStatus = 'waiting' | 'called' | 'done';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  // Many appointments belong to one patient (the foreign key from Lesson 12)
  @ManyToOne(() => Patient, { eager: true, nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ name: 'visit_date', type: 'date', default: () => 'CURRENT_DATE' })
  visitDate!: string;

  @Column({ name: 'queue_number', type: 'int' })
  queueNumber!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'waiting' })
  status!: AppointmentStatus;

  // PostgreSQL returns NUMERIC as text ("25.00"), so convert it to a number
  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  fee!: number;
}