import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @Matches(/^\d{6}-\d{2}-\d{4}$/, {
    message: 'icNumber must look like 900101-14-5678',
  })
  icNumber!: string;

  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;
}
