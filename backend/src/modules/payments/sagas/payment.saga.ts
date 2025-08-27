import { Injectable, Logger } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { EMPTY, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PaymentSuccessEvent } from '../events/payment-succss/payment-success.event';

@Injectable()
export class PaymentSagas {
  private readonly logger = new Logger(PaymentSagas.name);

  constructor() {}

  @Saga()
  onPaymentSuccess(
    events$: Observable<PaymentSuccessEvent>,
  ): Observable<ICommand> {
    return events$.pipe(
      ofType(PaymentSuccessEvent),
      tap(({ paymentInfo }) => {
        console.log(`Payment Sagas Event: ${paymentInfo}`);
        // Log objects properly
        this.logger.log(
          `Payment Sagas Event:\n${JSON.stringify(paymentInfo, null, 2)}`,
        );
        // or: console.dir(paymentInfo, { depth: null });
      }),

      // If you want to dispatch a command, map to it:
      // map(({ paymentInfo }) =>
      //   new UpdatePaymentStatusCommand(
      //     paymentInfo.orderId,
      //     paymentInfo.status,
      //     paymentInfo.amount,
      //     paymentInfo.gatewayRef,
      //   )
      // ),

      // If you don't need to dispatch anything, return EMPTY:
      // () => EMPTY // <-- not valid inside pipe; instead:
      // switchMap(() => EMPTY)

      // For now, if you truly have no command to emit, use:
      // map(() => null as unknown as ICommand) // temporary hack (not recommended)
      // Better: actually create & return a real command as above.
      // For illustration, we'll just pass through without emitting:
      // Replace the next line with your real command
      map(() => {
        // TODO: return new YourCommand(...)
        return EMPTY as unknown as ICommand; // placeholder to satisfy typing
      }),
    );
  }
}
