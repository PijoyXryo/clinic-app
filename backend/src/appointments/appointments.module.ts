import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';
import { Appointment } from './appointment.entity.js';
import { PatientsModule } from '../patients/patients.module.js';
import { QueueGateway } from './queue.gateway.js';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), PatientsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, QueueGateway],
})
export class AppointmentsModule {}