import { PaymentProvider, ChargeRequest } from './PaymentProvider';

export class NoopPaymentProvider implements PaymentProvider {
  async charge(req: ChargeRequest) {
    console.warn('💳 Payment provider not configured. Simulating pending charge.');
    return { id: 'noop', status: 'pending' as const };
  }
  async refund(paymentId: string, amount?: number) {
    console.warn('↩️ Payment provider not configured. Simulating refund failure.');
    return { id: paymentId, status: 'failed' as const };
  }
}

