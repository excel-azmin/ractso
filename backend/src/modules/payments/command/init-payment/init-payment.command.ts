export class InitPaymentCommand {
  constructor(
    public readonly initPaymentDto: any,
    public readonly userId: string,
  ) {}
}
