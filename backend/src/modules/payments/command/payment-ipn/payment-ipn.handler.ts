import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentIpnStatusEvent } from '../../events/payment-ipn/payment-ipn.event';
import { PaymentIpnStatusCommand } from './payment-ipn.command';

@CommandHandler(PaymentIpnStatusCommand)
export class PaymentIpnStatusHandler
  implements ICommandHandler<PaymentIpnStatusCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PaymentIpnStatusCommand) {
    const { paymentInfo } = command;
    console.log(paymentInfo);
    const payment = await this.prismaService.payments.findUnique({
      where: { tran_id: paymentInfo.tran_id },
      include: { user: true },
    });

    payment && this.eventBus.publish(new PaymentIpnStatusEvent(payment));
  }
}
