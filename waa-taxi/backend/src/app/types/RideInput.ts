export interface RideInput {
    passengerId?: string;
    passengerUserId?: string;
    driverId?: string;
    origin: string;
    destination: string;
    distanceKm: number;
    originLabel?: string;
    destinationLabel?: string;
    originLngLat?: string;
    destinationLngLat?: string;
    distanceMeters?: number;
    durationSeconds?: number;
}
