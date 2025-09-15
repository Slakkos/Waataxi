// Simple XOF fare estimation for Benin.
// baseFee + perKm*distance + perMin*duration
export function calculateFare(distanceKm: number, durationMin: number = 0): number {
    const baseFee = 500;      // XOF fixed pickup
    const perKm = 300;        // XOF per kilometer
    const perMin = 50;        // XOF per minute (optional)
    const total = baseFee + distanceKm * perKm + durationMin * perMin;
    return Math.max(0, Math.round(total));
}
