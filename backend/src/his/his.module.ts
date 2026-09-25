import { Module } from '@nestjs/common';
import { HisController } from './his.controller.js';
import { HisService } from './his.service.js';
import { HisClient } from './his.client.js';
import { PatientsModule } from '../patients/patients.module.js';

@Module({
  imports: [PatientsModule], // for PatientsService (it's exported, from Lesson 18)
  controllers: [HisController],
  providers: [HisService, HisClient],
})
export class HisModule {}