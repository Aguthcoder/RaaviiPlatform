import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([PaymentEntity])],
  providers: [WalletService, JwtAuthGuard],
  controllers: [WalletController],
})
export class WalletModule {}
