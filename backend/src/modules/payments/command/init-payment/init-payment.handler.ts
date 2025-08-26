import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { InitPaymentCommand } from './init-payment.command';

@CommandHandler(InitPaymentCommand)
export class InitPaymentHandler implements ICommandHandler<InitPaymentCommand> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: InitPaymentCommand) {
    const { initPaymentDto, userId } = command;
    // Implement the logic to initialize a payment using initPaymentDto
    // For example, call a payment gateway API or save to the database

    const { default: SSLCommerzPayment } = await import('sslcommerz-lts');

    const store_id = 'pixfa68ac666b8316e';
    const store_passwd = 'pixfa68ac666b8316e@ssl';
    const is_live = false;

    // const port = 3030;

    const tran_id = initPaymentDto.tran_id || uuidv4();

    console.log('tran_id:', tran_id);

    const data = {
      total_amount: initPaymentDto.amount || 100,
      currency: initPaymentDto.currency || 'BDT',
      tran_id: tran_id,
      success_url:
        initPaymentDto.success_url ||
        'http://localhost:3001/api/v1/payments/success',
      fail_url:
        initPaymentDto.fail_url || 'http://localhost:3001/api/payments/fail',
      cancel_url:
        initPaymentDto.cancel_url ||
        'http://localhost:3001/api/payments/cancel',
      ipn_url:
        initPaymentDto.ipn_url || 'http://localhost:3001/api/payments/ipn',
      shipping_method: 'Courier',
      product_name: initPaymentDto.product_name || 'Product',
      product_category: initPaymentDto.product_category || 'General',
      product_profile: 'general',
      cus_name: initPaymentDto.cus_name || 'Customer Name',
      cus_email: initPaymentDto.cus_email || 'customer@example.com',
      cus_add1: initPaymentDto.cus_add1 || 'Dhaka',
      cus_add2: initPaymentDto.cus_add2 || 'Dhaka',
      cus_city: initPaymentDto.cus_city || 'Dhaka',
      cus_state: initPaymentDto.cus_state || 'Dhaka',
      cus_postcode: initPaymentDto.cus_postcode || '1000',
      cus_country: initPaymentDto.cus_country || 'Bangladesh',
      cus_phone: initPaymentDto.cus_phone || '01711111111',
      cus_fax: initPaymentDto.cus_phone || '01711111111',
      ship_name: initPaymentDto.ship_name || 'Customer Name',
      ship_add1: initPaymentDto.ship_add1 || 'Dhaka',
      ship_add2: initPaymentDto.ship_add2 || 'Dhaka',
      ship_city: initPaymentDto.ship_city || 'Dhaka',
      ship_state: initPaymentDto.ship_state || 'Dhaka',
      ship_postcode: initPaymentDto.ship_postcode || 1000,
      ship_country: initPaymentDto.ship_country || 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    try {
      const response = await sslcz.init(data);

      const payment = await this.prismaService.payments.create({
        data: {
          userId: userId,
          amount: data?.total_amount,
          tran_id: tran_id,
          status: 'PENDING',
        },
      });
      console.log('Payment record created: ', payment);
      return response;
    } catch (error) {
      console.error('Error initializing payment: ', error);
      throw new Error('Payment initialization failed');
    }
  }
}
