import { AppDataSource } from '../../config/data-source';
import { Ride } from '../entities/Ride';
import { Passenger } from '../entities/Passenger';
import { Driver } from '../entities/Driver';
import { calculateFare } from '../utils/calculateFare';
import { RideInput } from '../types/RideInput';
import { RideStatus } from '../entities/Ride'; // ⚠️ assure-toi que ce type est exporté dans Ride.ts

const rideRepo = AppDataSource.getRepository(Ride);
const passengerRepo = AppDataSource.getRepository(Passenger);

// ✅ Créer une ride
export async function createRide(data: RideInput): Promise<Ride> {
    const passenger = await passengerRepo.findOne({ where: { id: data.passengerId } });
    if (!passenger) throw new Error('Passager introuvable');

    const fare = calculateFare(data.distanceKm);

    const ride = rideRepo.create({
        passenger,
        origin: data.origin,
        destination: data.destination,
        distanceKm: data.distanceKm,
        estimatedFare: fare,
        status: 'pending',
    });

    return await rideRepo.save(ride);
}

// ✅ Rides en attente
export async function getPendingRides(): Promise<Ride[]> {
    return await rideRepo.find({ where: { status: 'pending' } });
}

export async function assignDriver(rideId: string, driverId: string): Promise<Ride> {
    return await AppDataSource.transaction(async (manager) => {
        // Repositories transactionnels
        const rideRepoTx = manager.getRepository(Ride);
        const driverRepoTx = manager.getRepository(Driver);

        // 1️⃣ Verrouiller la ride
        const ride = await rideRepoTx.findOne({
            where: { id: rideId },
            lock: { mode: 'pessimistic_write' },
            relations: ['driver']
        });
        if (!ride) throw new Error('Course introuvable');
        if (ride.status !== 'pending') throw new Error('Course déjà assignée ou non assignable');

        // 2️⃣ Verrouiller le driver
        const driver = await driverRepoTx.findOne({
            where: { id: driverId },
            lock: { mode: 'pessimistic_write' }
        });
        if (!driver) throw new Error('Chauffeur introuvable');
        if (!driver.isAvailable) throw new Error('Chauffeur indisponible');

        // 3️⃣ Vérifier que le driver n’a pas déjà une ride active
        const activeRide = await rideRepoTx.findOne({
            where: { driver: { id: driverId }, status: 'accepted' },
            lock: { mode: 'pessimistic_write' }
        });
        if (activeRide) throw new Error('Ce chauffeur a déjà une course active');

        // 4️⃣ Mise à jour de la ride et du driver
        ride.driver = driver;
        ride.status = 'accepted';
        driver.isAvailable = false;

        await driverRepoTx.save(driver); // MAJ disponibilité
        return await rideRepoTx.save(ride); // MAJ ride
    });
}


// ✅ Compléter une ride
export async function completeRide(rideId: string): Promise<Ride> {
    const ride = await rideRepo.findOneBy({ id: rideId });
    if (!ride) throw new Error('Course introuvable');

    ride.status = 'completed';
    return await rideRepo.save(ride);
}

// ❌ Annuler une ride (avec type sécurisé)
export async function cancelRide(rideId: string, reason: RideStatus = 'cancelled'): Promise<Ride> {
    const ride = await rideRepo.findOneBy({ id: rideId });
    if (!ride) throw new Error('Course introuvable');

    ride.status = reason;
    return await rideRepo.save(ride);
}

// 🚫 Rejet par chauffeur
export async function rejectRide(rideId: string, driverId: string): Promise<Ride> {
    const ride = await rideRepo.findOne({ where: { id: rideId }, relations: ['driver'] });
    if (!ride) throw new Error('Course introuvable');

    if (ride.driver?.id !== driverId) {
        throw new Error('Ce chauffeur n’est pas assigné à cette course');
    }

    ride.driver = null;
    ride.status = 'rejected';
    return await rideRepo.save(ride);
}

// 🔍 Get ride par ID
export async function getRideById(rideId: string): Promise<Ride | null> {
    return await rideRepo.findOne({
        where: { id: rideId },
        relations: ['passenger', 'driver'],
    });
}

// 📚 Historique d’un user
export async function getRidesByUser(userId: string): Promise<Ride[]> {
    return await rideRepo.find({
        where: [
            { passenger: { id: userId } },
            { driver: { id: userId } },
        ],
        relations: ['passenger', 'driver'],
        order: { createdAt: 'DESC' },
    });
}

// 🚖 Ride active d’un driver
export async function getDriverActiveRide(driverId: string): Promise<Ride | null> {
    return await rideRepo.findOne({
        where: {
            driver: { id: driverId },
            status: 'accepted',
        },
        relations: ['passenger'],
    });
}

// 🔄 MAJ statut ride (admin ou système)
export async function updateRideStatus(rideId: string, status: RideStatus): Promise<Ride> {
    const ride = await rideRepo.findOneBy({ id: rideId });
    if (!ride) throw new Error('Course introuvable');

    ride.status = status;
    return await rideRepo.save(ride);
}

// ⏱ Auto-cancel des rides inactives
export async function autoCancelUnassigned(timeoutMinutes = 10): Promise<number> {
    const now = new Date();
    const threshold = new Date(now.getTime() - timeoutMinutes * 60000);

    const expiredRides = await rideRepo
        .createQueryBuilder('ride')
        .where('ride.status = :status', { status: 'pending' })
        .andWhere('ride.createdAt < :threshold', { threshold })
        .getMany();

    for (const ride of expiredRides) {
        ride.status = 'timeout_cancelled';
        await rideRepo.save(ride);
    }

    return expiredRides.length;
}

// 📂 Rides par statut
export async function getRidesByStatus(status: RideStatus): Promise<Ride[]> {
    return await rideRepo.find({
        where: { status },
        relations: ['passenger', 'driver'],
        order: { createdAt: 'DESC' },
    });
}
