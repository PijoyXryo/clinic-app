import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @Min(1)
  patientId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}