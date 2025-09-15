import { Request, Response } from 'express';
import {
    createUser,
    getAllUsers,
    getUserById,
    getUserByPhone,
} from '../services/userService';

export async function createUserHandler(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { firstName, lastName, phone, role } = req.body;

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ error: 'Champs requis manquants.' });
        }

        const user = await createUser({ firstName, lastName, phone, role });
        return res.status(201).json(user);
    } catch (err) {
        console.error('❌ createUserHandler:', err);
        return res.status(400).json({ error: (err as Error).message });
    }
}

export async function getUserByIdHandler(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'ID requis.' });
        }

        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }
        return res.json(user);
    } catch (err) {
        console.error('❌ getUserByIdHandler:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

export async function getUserByPhoneHandler(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const phone = req.params['phone']; // ✅ Fix TS4111

        if (!phone) {
            return res.status(400).json({ error: 'Numéro de téléphone requis' });
        }

        const user = await getUserByPhone(phone); // ✅ phone est string
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }
        return res.json(user);
    } catch (err) {
        console.error('❌ getUserByPhoneHandler:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

export async function getAllUsersHandler(
    _req: Request,
    res: Response
): Promise<Response> {
    try {
        const users = await getAllUsers();
        return res.json(users);
    } catch (err) {
        console.error('❌ getAllUsersHandler:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}



