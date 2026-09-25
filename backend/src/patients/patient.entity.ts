import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ name: 'ic_number', type: 'varchar', length: 20, unique: true })
  icNumber!: string;

  @Column({ type: 'int', nullable: true })
  age!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}