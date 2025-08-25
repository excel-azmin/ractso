import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { InitPaymentCommand } from '../command/init-payment.command';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('init')
  async initPayment(@Body() initPaymentDto: any) {
    return this.commandBus.execute(new InitPaymentCommand(initPaymentDto));
  }
}
