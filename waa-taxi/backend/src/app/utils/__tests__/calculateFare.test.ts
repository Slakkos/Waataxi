import { calculateFare } from '../calculateFare';

describe('calculateFare (XOF)', () => {
  it('uses base fee for zero distance/duration', () => {
    expect(calculateFare(0, 0)).toBe(500);
  });

  it('adds per-km and per-minute charges', () => {
    // 500 + (10 * 300) + (15 * 50) = 500 + 3000 + 750 = 4250
    expect(calculateFare(10, 15)).toBe(4250);
  });
});

