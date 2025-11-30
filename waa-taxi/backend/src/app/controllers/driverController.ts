import { Request, Response } from 'express';
import * as driverService from '../services/driverService';
import { AppDataSource } from '../../config/data-source';
import { Driver } from '../entities/Driver';

export async function createDriver(req: Request, res: Response): Promise<Response> {
    try {
        const { userId, firstName, lastName, licenseNumber } = req.body;

        if (!userId || !firstName || !lastName || !licenseNumber) {
            return res.status(400).json({ error: 'Champs requis manquants.' });
        }

        const driver = await driverService.createDriver({
            userId,
            firstName,
            lastName,
            licenseNumber,
        });

        return res.status(201).json(driver);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}


export async function getAllDrivers(_: Request, res: Response) {
    const drivers = await driverService.getAllDrivers();
    res.json(drivers);
}

export async function getNearbyDrivers(_: Request, res: Response) {
    // Placeholder: pas de géolocalisation stockée, on renvoie les drivers disponibles
    const drivers = await driverService.getNearbyAvailableDrivers();
    res.json(drivers);
}

// PATCH /drivers/:id/location  { coord: [lng, lat] }
export async function updateDriverLocation(req: Request, res: Response) {
    const { id } = req.params;
    const { coord } = req.body as { coord?: [number, number] };
    if (!id || !coord || !Array.isArray(coord) || coord.length !== 2) {
        return res.status(400).json({ error: 'coord invalide' });
    }
    try {
        const repo = AppDataSource.getRepository(Driver);
        const driver = await repo.findOne({ where: [{ id: id as string }, { userId: id as string }] });
        if (!driver) return res.status(404).json({ error: 'Driver introuvable' });
        (driver as any).lastLngLat = coord.join(','); // champ non mappé, stocké dynamiquement
        await repo.save(driver);
        return res.json({ ok: true });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}

// GET /drivers/:id/location
export async function getDriverLocation(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const repo = AppDataSource.getRepository(Driver);
        const driver = await repo.findOne({ where: [{ id: id as string }, { userId: id as string }] });
        if (!driver) return res.status(404).json({ error: 'Driver introuvable' });
        const loc = (driver as any).lastLngLat;
        if (!loc) return res.json({ coord: null });
        const [lng, lat] = String(loc).split(',').map((v) => parseFloat(v));
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return res.json({ coord: null });
        return res.json({ coord: [lng, lat] });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
