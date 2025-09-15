import { isValidPhone } from '../validatePhone';

describe('isValidPhone (Benin)', () => {
  it('accepts +229 followed by 8 digits', () => {
    expect(isValidPhone('+22961234567')).toBe(true);
  });

  it('accepts 00229 international prefix', () => {
    expect(isValidPhone('0022961234567')).toBe(true);
  });

  it('accepts local 8-digit numbers', () => {
    expect(isValidPhone('61234567')).toBe(true);
  });

  it('rejects wrong country code or length', () => {
    expect(isValidPhone('+2296123456')).toBe(false); // 7 digits only
    expect(isValidPhone('+22891234567')).toBe(false); // different country code
    expect(isValidPhone('1234567')).toBe(false); // 7 digits local
  });
});

