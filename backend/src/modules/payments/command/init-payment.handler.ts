import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import SSLCommerz from 'ssl-commerz-node';
import { InitPaymentCommand } from './init-payment.command';

@CommandHandler(InitPaymentCommand)
export class InitPaymentHandler implements ICommandHandler<InitPaymentCommand> {
  async execute(command: InitPaymentCommand) {
    const { initPaymentDto } = command;
    // Implement the logic to initialize a payment using initPaymentDto
    // For example, call a payment gateway API or save to the database

    const PaymentSession = SSLCommerz.PaymentSession;

    const payment = new PaymentSession(true, 'dev-pixfar', 'Pixf@rDevs');

    // Set the urls
    payment.setUrls({
      success: 'yoursite.com/success', // If payment Succeed
      fail: 'yoursite.com/fail', // If payment failed
      cancel: 'yoursite.com/cancel', // If user cancel payment
      ipn: 'yoursite.com/ipn', // SSLCommerz will send http post request in this link
    });

    // Set order details
    payment.setOrderInfo({
      total_amount: 1570, // Number field
      currency: 'BDT', // Must be three character string
      tran_id: 'ref12345667', // Unique Transaction id
      emi_option: 0, // 1 or 0
      multi_card_name: 'internetbank', // Do not Use! If you do not customize the gateway list,
      allowed_bin: '371598,371599,376947,376948,376949', // Do not Use! If you do not control on transaction
      emi_max_inst_option: 3, // Max instalment Option
      emi_allow_only: 0, // Value is 1/0, if value is 1 then only EMI transaction is possible
    });

    // Set customer info
    payment.setCusInfo({
      name: 'Simanta Paul',
      email: 'simanta@bohubrihi.com',
      add1: '66/A Midtown',
      add2: 'Andarkilla',
      city: 'Chittagong',
      state: 'Optional',
      postcode: 4000,
      country: 'Bangladesh',
      phone: '010000000000',
      fax: 'Customer_fax_id',
    });

    // Set shipping info
    payment.setShippingInfo({
      method: 'Courier', //Shipping method of the order. Example: YES or NO or Courier
      num_item: 2,
      name: 'Simanta Paul',
      add1: '66/A Midtown',
      add2: 'Andarkilla',
      city: 'Chittagong',
      state: 'Optional',
      postcode: 4000,
      country: 'Bangladesh',
    });

    // Set Product Profile
    payment.setProductInfo({
      product_name: 'Computer',
      product_category: 'Electronics',
      product_profile: 'general',
    });

    const response = await payment.paymentInit();

    return response;

    // const store_id = 'dev-pixfar';
    // const store_passwd = 'Pixf@rDevs';
    // const is_live = false; //true for live, false for sandbox
    // const direct_api_url =
    //   'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    // const port = 3030;

    // const data = {
    //   store_id: store_id,
    //   store_passwd: store_passwd,
    //   total_amount: initPaymentDto.amount || 100,
    //   currency: initPaymentDto.currency || 'BDT',
    //   tran_id: initPaymentDto.tran_id || randomUUID(),
    //   success_url:
    //     initPaymentDto.success_url ||
    //     'http://localhost:3001/api/payments/success',
    //   fail_url:
    //     initPaymentDto.fail_url || 'http://localhost:3001/api/payments/fail',
    //   cancel_url:
    //     initPaymentDto.cancel_url ||
    //     'http://localhost:3001/api/payments/cancel',
    //   ipn_url:
    //     initPaymentDto.ipn_url || 'http://localhost:3001/api/payments/ipn',
    //   shipping_method: 'Courier',
    //   product_name: initPaymentDto.product_name || 'Product',
    //   product_category: initPaymentDto.product_category || 'General',
    //   product_profile: 'general',
    //   cus_name: initPaymentDto.cus_name || 'Customer Name',
    //   cus_email: initPaymentDto.cus_email || 'customer@example.com',
    //   cus_add1: initPaymentDto.cus_add1 || 'Dhaka',
    //   cus_add2: initPaymentDto.cus_add2 || 'Dhaka',
    //   cus_city: initPaymentDto.cus_city || 'Dhaka',
    //   cus_state: initPaymentDto.cus_state || 'Dhaka',
    //   cus_postcode: initPaymentDto.cus_postcode || '1000',
    //   cus_country: initPaymentDto.cus_country || 'Bangladesh',
    //   cus_phone: initPaymentDto.cus_phone || '01711111111',
    //   cus_fax: initPaymentDto.cus_phone || '01711111111',
    //   ship_name: initPaymentDto.ship_name || 'Customer Name',
    //   ship_add1: initPaymentDto.ship_add1 || 'Dhaka',
    //   ship_add2: initPaymentDto.ship_add2 || 'Dhaka',
    //   ship_city: initPaymentDto.ship_city || 'Dhaka',
    //   ship_state: initPaymentDto.ship_state || 'Dhaka',
    //   ship_postcode: initPaymentDto.ship_postcode || 1000,
    //   ship_country: initPaymentDto.ship_country || 'Bangladesh',
    // };

    // const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    // try {
    //   const response = await axios.post(direct_api_url, data, {
    //     timeout: 30000,
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //   });

    //   return response.data;
    // } catch (error) {
    //   console.error('Error initializing payment: ', error);
    //   throw new Error('Payment initialization failed');
    // }
  }
}
