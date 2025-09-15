import { SmsProvider } from './SmsProvider';

export class DisabledSmsProvider implements SmsProvider {
  async send(to: string, message: string): Promise<void> {
    console.warn('📴 SMS provider disabled — SMS not sent.');
    console.warn(`🔔 To: ${to}`);
    console.warn(`📝 Message: ${message}`);
  }
}

