import { sendSMS } from '../twilioService';

describe('sendSMS (Twilio désactivé)', () => {
    const originalWarn = console.warn;

    beforeEach(() => {
        console.warn = jest.fn(); // on mock console.warn
    });

    afterEach(() => {
        console.warn = originalWarn; // on remet la version normale
    });

    it('affiche un warning quand Twilio est désactivé', async () => {
        await sendSMS('+22900000000', 'Code test 1234');

        expect(console.warn).toHaveBeenCalledWith('📴 Twilio désactivé — SMS non envoyé.');
        expect(console.warn).toHaveBeenCalledWith('🔔 Destinataire : +22900000000');
        expect(console.warn).toHaveBeenCalledWith('📝 Message : Code test 1234');
    });
});
