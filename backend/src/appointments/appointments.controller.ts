import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { Appointment } from './appointment.entity.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // GET /appointments/today
  @Get('today')
  todayQueue(): Promise<Appointment[]> {
    return this.appointmentsService.todayQueue();
  }

  // POST /appointments
  @Post()
  book(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.book(dto);
  }

  // PATCH /appointments/5/status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(id, dto.status);
  }
}