import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['waiting', 'called', 'done'])
  status!: 'waiting' | 'called' | 'done';
}
