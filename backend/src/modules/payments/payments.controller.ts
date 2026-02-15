import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() body: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user.sub, body);
  }

  @Get('me')
  myPayments(@Req() req: { user: { sub: string } }) {
    return this.paymentsService.listMyPayments(req.user.sub);
  }
}
