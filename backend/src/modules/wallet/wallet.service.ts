import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async getWallet(userId: string) {
    const payments = await this.paymentRepository.find({ where: { userId, status: 'completed' } });
    const balance = payments
      .filter((p) => p.paymentMethod === 'wallet')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { balance, currency: 'IRR' };
  }
}
