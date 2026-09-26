import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, type AppointmentStatus } from './appointment.entity.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { PatientsService } from '../patients/patients.service.js';
import { getFee } from './fee.js';
import { QueueGateway } from './queue.gateway.js'; // NEW

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
    private readonly patientsService: PatientsService,
    private readonly queueGateway: QueueGateway, // NEW
  ) {}

  // Today's queue, with patient info (JOIN)
  todayQueue(): Promise<Appointment[]> {
    return this.appointmentsRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.patient', 'p')
      .where('a.visit_date = CURRENT_DATE')
      .orderBy('a.queue_number', 'ASC')
      .getMany();
  }

  // Book a patient into today's queue
  async book(dto: CreateAppointmentDto): Promise<Appointment> {
    // Throws 404 automatically if the patient doesn't exist
    const patient = await this.patientsService.findOne(dto.patientId);

    // Business rule: a patient can't be in today's queue twice
    const alreadyQueued = await this.appointmentsRepo
      .createQueryBuilder('a')
      .where('a.patient_id = :patientId', { patientId: patient.id })
      .andWhere('a.visit_date = CURRENT_DATE')
      .andWhere("a.status <> 'done'")
      .getExists();
    if (alreadyQueued) {
      throw new ConflictException(
        `${patient.fullName} is already in today's queue`,
      );
    }

    // Next queue number for today
    const { max } = await this.appointmentsRepo
      .createQueryBuilder('a')
      .select('COALESCE(MAX(a.queue_number), 0)', 'max')
      .where('a.visit_date = CURRENT_DATE')
      .getRawOne();

    const appointment = this.appointmentsRepo.create({
      patient,
      queueNumber: Number(max) + 1,
      reason: dto.reason ?? null,
      status: 'waiting',
      fee: getFee(patient.age),
    });
    const saved = await this.appointmentsRepo.save(appointment);
    await this.notifyQueueChanged(); // NEW
    return saved;
  }

  // Call / done / back to waiting
  async updateStatus(
    id: number,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const appointment = await this.appointmentsRepo.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }

    // Only one patient can be "called" at a time
    if (status === 'called') {
      await this.appointmentsRepo
        .createQueryBuilder()
        .update(Appointment)
        .set({ status: 'done' })
        .where("status = 'called' AND visit_date = CURRENT_DATE")
        .execute();
    }

    appointment.status = status;
    const saved = await this.appointmentsRepo.save(appointment);
    await this.notifyQueueChanged(); // NEW
    return saved;
  }

  // NEW: send the fresh queue to every screen
  private async notifyQueueChanged(): Promise<void> {
    this.queueGateway.broadcastQueue(await this.todayQueue());
  }
}