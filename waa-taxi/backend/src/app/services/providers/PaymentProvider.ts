export interface ChargeRequest {
  amount: number; // in XOF (CFA)
  currency?: string; // default XOF
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentProvider {
  charge(req: ChargeRequest): Promise<{ id: string; status: 'succeeded' | 'failed' | 'pending' }>; 
  refund(paymentId: string, amount?: number): Promise<{ id: string; status: 'succeeded' | 'failed' }>; 
}

