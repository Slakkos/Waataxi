import { Request, Response } from 'express';
import * as driverService from '../services/driverService';

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
