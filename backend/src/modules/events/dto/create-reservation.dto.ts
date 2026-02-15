import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  eventId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  seats?: number;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
