import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';
import { Response } from 'express';
import { InitPaymentCommand } from '../command/init-payment/init-payment.command';
import { PaymentSuccessStatusCommand } from '../command/payment-success/payment-success.command';
import { GetMyPaymentsQuery } from '../query/get-my-payments/get-my-payments.query';

@ApiTags('payments')
@Controller('v1/payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('init')
  @ApiBearerAuth()
  async initPayment(@Body() initPaymentDto: any, @Req() req: any) {
    return await this.commandBus.execute(
      new InitPaymentCommand(initPaymentDto, req.user.id),
    );
  }

  @Post('success')
  async paymentSuccess(@Body() paymentInfo: any, @Res() res: Response) {
    try {
      const result = await this.commandBus.execute(
        new PaymentSuccessStatusCommand(paymentInfo),
      );
      result
        ? res.redirect(result.redirectTo)
        : res.status(404).send('Not Found');
    } catch (error) {
      console.error('Error processing payment success:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Get('my-payments')
  @ApiBearerAuth()
  async getMyPayments(@Query() query: BasePaginationDto, @Req() req: any) {
    return await this.queryBus.execute(
      new GetMyPaymentsQuery(query, req.user.id),
    );
  }
}
