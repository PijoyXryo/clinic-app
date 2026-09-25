import {
  AfterInsert,
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ageFromBirthDate } from './ic.util.js';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ name: 'ic_number', type: 'varchar', length: 20, unique: true })
  icNumber!: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: string;

  // NOT a database column: calculated every time a patient is loaded or saved
  age?: number;

  @AfterLoad()
  @AfterInsert()
  calculateAge() {
    this.age = ageFromBirthDate(this.dateOfBirth);
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
