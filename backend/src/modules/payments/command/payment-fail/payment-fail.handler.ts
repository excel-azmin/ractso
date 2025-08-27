import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentFailStatusCommand } from './payment-fail.command';

@CommandHandler(PaymentFailStatusCommand)
export class PaymentFailStatusHandler
  implements ICommandHandler<PaymentFailStatusCommand>
{
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: PaymentFailStatusCommand) {
    const { paymentInfo } = command;
    // Implement the logic to handle payment success status

    const payment = await this.prismaService.payments.findUnique({
      where: { tran_id: paymentInfo.tran_id },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Use transaction
    const result = await this.prismaService.$transaction(async (prisma) => {
      const updatedPayment = await prisma.payments.update({
        where: { tran_id: paymentInfo.tran_id },
        data: { status: 'FAILED', paymentType: paymentInfo.card_brand },
      });
      return updatedPayment;
    });

    console.log('Transaction result: ', paymentInfo.tran_id);
    console.log('Info', paymentInfo);
    console.log('Payment status updated successfully', result);

    return {
      message: 'Payment status updated successfully',
      payment: result,
      redirectTo: 'http://localhost:5173/profile',
    };
  }
}
