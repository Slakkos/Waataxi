/**
 * twilioService.ts
 * 🔕 Twilio temporairement désactivé — prêt à être activé plus tard
 */

/// Pour activer Twilio, décommente les lignes ci-dessous
// import twilio from 'twilio';
// import { env } from '../../config/env';
// const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

/**
 * Envoie un SMS via Twilio
 * @param to Le numéro du destinataire (ex: +229XXXXXXXX)
 * @param body Le message à envoyer
 */
export async function sendSMS(to: string, body: string): Promise<void> {
    console.warn('📴 Twilio désactivé — SMS non envoyé.');
    console.warn(`🔔 Destinataire : ${to}`);
    console.warn(`📝 Message : ${body}`);

    /*
    try {
        const message = await client.messages.create({
            body,
            from: env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`📩 SMS envoyé à ${to} (SID: ${message.sid})`);
    } catch (error: unknown) {
        console.error('❌ Erreur lors de l\'envoi du SMS :', error);
        throw new Error('Impossible d\'envoyer le SMS');
    }
    */
}
