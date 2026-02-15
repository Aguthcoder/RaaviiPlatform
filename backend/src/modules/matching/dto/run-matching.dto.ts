import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RunMatchingDto {
  @IsUUID()
  eventId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  trigger?: 'event_created' | 'reservation_created' | 'scheduled_rebalance';
}
