import { Request, Response } from 'express';
import * as rideService from '../services/rideService';
import { RideInput } from '../types/RideInput';
import { Ride, RideStatus } from '../entities/Ride';
import { AppDataSource } from '../../config/data-source';
import { Driver } from '../entities/Driver';

// ✅ Créer une ride
export async function createRide(req: Request, res: Response): Promise<void> {
    try {
        const data: RideInput = req.body;
        const ride = await rideService.createRide(data);
        res.status(201).json(ride);
    } catch (error: any) {
        console.error('❌ Erreur createRide:', error);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Rides en attente
export async function getPendingRides(_: Request, res: Response): Promise<void> {
    try {
        const rides = await rideService.getPendingRides();
        res.json(rides);
    } catch (error: any) {
        console.error('❌ Erreur getPendingRides:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// ✅ Assigner un driver
export async function assignDriver(req: Request, res: Response): Promise<void> {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
        res.status(400).json({ error: 'rideId et driverId requis' });
        return;
    }

    try {
        const rideRepo = AppDataSource.getRepository(Ride);
        const driverRepo = AppDataSource.getRepository(Driver);

        // Vérif ride
        const ride = await rideRepo.findOne({
            where: { id: rideId },
            relations: ['driver', 'passenger']
        });
        if (!ride) {
            res.status(404).json({ error: 'Ride introuvable' });
            return;
        }

        // Vérif driver
        const driver = await driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            res.status(404).json({ error: 'Driver introuvable' });
            return;
        }

        if (!driver.isAvailable) {
            res.status(400).json({ error: 'Driver non disponible' });
            return;
        }

        // Mise à jour
        ride.driver = driver;
        ride.status = 'accepted';
        driver.isAvailable = false;

        await rideRepo.save(ride);
        await driverRepo.save(driver);

        res.status(200).json({ message: '✅ Driver assigné avec succès', ride });
    } catch (error: any) {
        console.error('❌ Erreur assignDriver:', error);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Compléter une ride
export async function completeRide(req: Request, res: Response): Promise<void> {
    const { rideId } = req.params;

    if (!rideId) {
        res.status(400).json({ error: 'rideId requis' });
        return;
    }

    try {
        const ride = await rideService.completeRide(rideId);

        // 🔹 Remet le chauffeur dispo si affecté
        if (ride.driver) {
            const driverRepo = AppDataSource.getRepository(Driver);
            ride.driver.isAvailable = true;
            await driverRepo.save(ride.driver);
        }

        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur completeRide:', error);
        res.status(400).json({ error: error.message });
    }
}


// ✅ Annuler une ride
export async function cancelRide(req: Request, res: Response): Promise<void> {
    const { rideId, reason } = req.body;

    if (!rideId) {
        res.status(400).json({ error: 'rideId requis' });
        return;
    }

    try {
        const ride = await rideService.cancelRide(rideId, reason as RideStatus);

        // 🔹 Remet le chauffeur dispo si affecté
        if (ride.driver) {
            const driverRepo = AppDataSource.getRepository(Driver);
            ride.driver.isAvailable = true;
            await driverRepo.save(ride.driver);
        }

        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur cancelRide:', error);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Assigner un chauffeur à une ride
export async function assignRide(req: Request, res: Response): Promise<void> {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
        res.status(400).json({ error: 'rideId et driverId requis' });
        return;
    }

    try {
        const ride = await rideService.assignRideStrict(rideId, driverId);
        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur assignRide:', error);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Démarrer une ride (passer en in_progress)
export async function startRide(req: Request, res: Response): Promise<void> {
    const { rideId } = req.params;

    if (!rideId) {
        res.status(400).json({ error: 'rideId requis' });
        return;
    }

    try {
        const ride = await rideService.startRide(rideId);
        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur startRide:', error);
        res.status(400).json({ error: error.message });
    }
}


// ✅ Rejeter une ride
export async function rejectRide(req: Request, res: Response): Promise<void> {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
        res.status(400).json({ error: 'rideId et driverId requis' });
        return;
    }

    try {
        const ride = await rideService.rejectRide(rideId, driverId);

        // 🔹 Remet le chauffeur dispo si affecté
        const driverRepo = AppDataSource.getRepository(Driver);
        const driver = await driverRepo.findOne({ where: { id: driverId } });
        if (driver) {
            driver.isAvailable = true;
            await driverRepo.save(driver);
        }

        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur rejectRide:', error);
        res.status(400).json({ error: error.message });
    }
}


// ✅ Get ride par ID
export async function getRideById(req: Request, res: Response): Promise<void> {
    const { rideId } = req.params;

    if (!rideId) {
        res.status(400).json({ error: 'rideId requis' });
        return;
    }

    try {
        const ride = await rideService.getRideById(rideId);
        if (!ride) {
            res.status(404).json({ error: 'Ride non trouvée' });
            return;
        }
        res.json(ride);
    } catch (error: any) {
        console.error('❌ Erreur getRideById:', error.message);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Rides par utilisateur
export async function getRidesByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
        res.status(400).json({ error: 'userId requis' });
        return;
    }

    try {
        const rides = await rideService.getRidesByUser(userId);
        res.json(rides);
    } catch (error: any) {
        console.error('❌ Erreur getRidesByUser:', error.message);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Rides par statut
export async function getRidesByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;

    if (!status) {
        res.status(400).json({ error: 'Statut requis' });
        return;
    }

    try {
        const rides = await rideService.getRidesByStatus(status as RideStatus);
        res.json(rides);
    } catch (error: any) {
        console.error('❌ Erreur getRidesByStatus:', error.message);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Rides par driver
export async function getRidesByDriver(req: Request, res: Response): Promise<void> {
    const { driverId } = req.params;

    if (!driverId) {
        res.status(400).json({ error: 'driverId requis' });
        return;
    }

    try {
        const rides = await rideService.getRidesByDriver(driverId);
        res.json(rides);
    } catch (error: any) {
        console.error('❌ Erreur getRidesByDriver:', error.message);
        res.status(400).json({ error: error.message });
    }
}

// ✅ Rides par passager
export async function getRidesByPassenger(req: Request, res: Response): Promise<void> {
    const { passengerId } = req.params;

    if (!passengerId) {
        res.status(400).json({ error: 'passengerId requis' });
        return;
    }

    try {
        const rides = await rideService.getRidesByPassenger(passengerId);
        res.json(rides);
    } catch (error: any) {
        console.error('❌ Erreur getRidesByPassenger:', error.message);
        res.status(400).json({ error: error.message });
    }
}
