import { IsIn, IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsNumberString()
  amount!: string;

  @IsIn(['zarinpal', 'paypal', 'stripe', 'bank_transfer', 'wallet'])
  paymentMethod!: string;

  @IsOptional()
  gatewayTransactionId?: string;
}
