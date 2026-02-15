import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsIn(['cancelled'])
  status!: 'cancelled';
}
