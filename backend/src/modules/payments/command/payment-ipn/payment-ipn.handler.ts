import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentIpnStatusCommand } from './payment-ipn.command';

@CommandHandler(PaymentIpnStatusCommand)
export class PaymentIpnStatusHandler
  implements ICommandHandler<PaymentIpnStatusCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: PaymentIpnStatusCommand) {
    const { paymentInfo } = command;
    console.log('Payment Info IPN:', paymentInfo);
    const payment = await this.prismaService.payments.findUnique({
      where: { tran_id: paymentInfo.tran_id },
      include: { user: true },
    });

    console.log('Payment found:', payment);
  }
}
