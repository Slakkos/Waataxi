import { Request, Response } from 'express';
import * as passengerService from '../services/passengerService';

export async function createPassenger(req: Request, res: Response) {
    try {
        const passenger = await passengerService.createPassenger(req.body);
        res.status(201).json(passenger);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

export async function getAllPassengers(_: Request, res: Response) {
    const passengers = await passengerService.getAllPassengers();
    res.json(passengers);
}

export async function getPassengerById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID requis' });
    }

    const passenger = await passengerService.getPassengerById(id);

    if (!passenger) {
        return res.status(404).json({ error: 'Passager introuvable' });
    }

    return res.json(passenger);
}


