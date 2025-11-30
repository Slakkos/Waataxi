import { AppDataSource } from '../../config/data-source';
import { Ride } from '../entities/Ride';
import { Passenger } from '../entities/Passenger';
import { Driver } from '../entities/Driver';
import { calculateFare } from '../utils/calculateFare';
import { RideInput } from '../types/RideInput';
import { RideStatus } from '../entities/Ride'; // ⚠️ assure-toi que ce type est exporté dans Ride.ts
import { In, IsNull } from 'typeorm';

const rideRepo = AppDataSource.getRepository(Ride);
const passengerRepo = AppDataSource.getRepository(Passenger);
const driverRepo = AppDataSource.getRepository(Driver);

async function enrichDriverProfile(ride: Ride | null): Promise<Ride | null> {
    if (!ride?.driver) return ride;
    const driver = ride.driver;
    if (!driver.user) {
        (driver as any).user = { id: driver.userId } as any;
    }
    const u: any = driver.user as any;
    // Complète avec les infos du driver ou de son profil passager (même userId)
    const maybePassenger = await passengerRepo.findOne({ where: { userId: driver.userId } });
    if (maybePassenger) {
        u.avatarUrl = u.avatarUrl ?? maybePassenger.avatarUrl ?? null;
        u.firstName = u.firstName ?? maybePassenger.firstName;
        u.lastName = u.lastName ?? maybePassenger.lastName;
    }
    u.firstName = u.firstName ?? driver.firstName;
    u.lastName = u.lastName ?? driver.lastName;
    (ride as any).driverProfile = {
        name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim(),
        avatarUrl: u.avatarUrl ?? null,
    };
    return ride;
}

// ✅ Créer une ride
export async function createRide(data: RideInput): Promise<Ride> {
    let passenger = null;
    if (data.passengerId) {
        passenger = await passengerRepo.findOne({ where: { id: data.passengerId } });
    }
    if (!passenger && data.passengerUserId) {
        passenger = await passengerRepo.findOne({ where: { userId: data.passengerUserId } });
    }
    // Fallback : si le client envoie le userId dans passengerId par erreur
    if (!passenger && data.passengerId) {
        passenger = await passengerRepo.findOne({ where: { userId: data.passengerId } });
    }

    // Si le passager a déjà une course active, on renvoie cette course (pas de doublon)
    const activeStatuses: RideStatus[] = ['pending', 'accepted', 'in_progress'];
    if (passenger) {
        const existing = await rideRepo.findOne({
            where: {
                passenger: { id: passenger.id },
                status: In(activeStatuses),
            },
            relations: ['passenger', 'driver', 'passenger.user', 'driver.user'],
            order: { createdAt: 'DESC' },
        });
        if (existing) {
            return existing;
        }
    }
    const driverRepo = AppDataSource.getRepository(Driver);
    const driver = data.driverId
        ? await driverRepo.findOne({ where: [{ id: data.driverId }, { userId: data.driverId }] })
        : null;

    const fare = calculateFare(data.distanceKm);

    const ride = rideRepo.create({
        passenger: passenger ?? null,
        driver: driver ?? null,
        origin: data.origin,
        destination: data.destination,
        originLabel: data.originLabel ?? null,
        destinationLabel: data.destinationLabel ?? null,
        originLngLat: data.originLngLat ?? null,
        destinationLngLat: data.destinationLngLat ?? null,
        distanceKm: data.distanceKm,
        distanceMeters: data.distanceMeters ?? null,
        durationSeconds: data.durationSeconds ?? null,
        estimatedFare: fare,
        status: 'pending',
    });

    return await rideRepo.save(ride);
}

// ✅ Rides en attente
export async function getPendingRides(): Promise<Ride[]> {
    const rides = await rideRepo.find({
        where: { status: 'pending', driver: IsNull() }, // ne proposer que les courses non encore assignées
        relations: ['passenger', 'driver', 'passenger.user', 'driver.user'],
    });
    return await Promise.all(rides.map((r) => enrichDriverProfile(r))) as Ride[];
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

// Affectation stricte (utilisée pour l'API assign)
export async function assignRideStrict(rideId: string, driverId: string): Promise<Ride> {
    return await AppDataSource.transaction(async (manager) => {
        const rideRepoTx = manager.getRepository(Ride);
        const driverRepoTx = manager.getRepository(Driver);

        const ride = await rideRepoTx.findOne({ where: { id: rideId }, relations: ['driver'] });
        if (!ride) throw new Error('Course introuvable');
        if (ride.status !== 'pending') throw new Error('Course déjà assignée ou démarrée');

        const driver = await driverRepoTx.findOne({ where: [{ id: driverId }, { userId: driverId }] });
        if (!driver) throw new Error('Chauffeur introuvable');

        ride.driver = driver;
        ride.status = 'accepted';
        driver.isAvailable = false;

        await driverRepoTx.save(driver);
        return await rideRepoTx.save(ride);
    });
}

// Passer en in_progress
export async function startRide(rideId: string): Promise<Ride> {
    const ride = await rideRepo.findOne({ where: { id: rideId }, relations: ['driver'] });
    if (!ride) throw new Error('Course introuvable');
    if (ride.status !== 'accepted') throw new Error('Course non acceptée');
    ride.status = 'in_progress';
    return await rideRepo.save(ride);
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
    const ride = await rideRepo.findOne({
        where: { id: rideId },
        relations: ['passenger', 'driver', 'passenger.user', 'driver.user'],
    });
    return await enrichDriverProfile(ride);
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

// 📂 Rides par driver
export async function getRidesByDriver(driverId: string): Promise<Ride[]> {
    const driver = await driverRepo.findOne({ where: [{ id: driverId }, { userId: driverId }] });
    if (!driver) return [];
    const rides = await rideRepo.find({
        where: { driver: { id: driver.id } },
        relations: ['passenger', 'driver', 'passenger.user', 'driver.user'],
        order: { createdAt: 'DESC' },
    });
    return await Promise.all(rides.map((r) => enrichDriverProfile(r))) as Ride[];
}

// 📂 Rides par passager
export async function getRidesByPassenger(passengerId: string): Promise<Ride[]> {
    const rides = await rideRepo.find({
        where: { passenger: { id: passengerId } },
        relations: ['passenger', 'driver', 'passenger.user', 'driver.user'],
        order: { createdAt: 'DESC' },
    });
    return await Promise.all(rides.map((r) => enrichDriverProfile(r))) as Ride[];
}

// Dernières adresses (origine + destination) d'un passager
export async function getRecentAddressesByPassenger(passengerId: string, limit = 3): Promise<string[]> {
    // Query builder pour éviter les soucis de projection (distinctAlias.Ride_id)
    const rides = await rideRepo
        .createQueryBuilder('ride')
        .where('ride.passengerId = :passengerId', { passengerId })
        .orderBy('ride.createdAt', 'DESC')
        .limit(Math.max(limit * 2, 6)) // on prend un peu plus pour dédupliquer
        .getMany();

    const seen = new Set<string>();
    const ordered: string[] = [];

    for (const ride of rides) {
        const candidates = [
            ride.destinationLabel,
            ride.destination,
            ride.originLabel,
            ride.origin,
        ].filter((v): v is string => !!v && v.trim().length > 0);
        for (const c of candidates) {
            const trimmed = c.trim();
            if (!seen.has(trimmed)) {
                seen.add(trimmed);
                ordered.push(trimmed);
                if (ordered.length >= limit) return ordered;
            }
        }
    }
    return ordered.slice(0, limit);
}
