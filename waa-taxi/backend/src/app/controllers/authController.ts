import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../config/data-source';
import { Passenger } from '../entities/Passenger';
import { createUser, getUserByEmail, getUserByPhone } from '../services/userService';
import type { User, UserRole } from '../entities/User';

const passengerRepo = () => AppDataSource.getRepository(Passenger);

async function hydratePassenger(userId: string) {
    return passengerRepo().findOne({
        where: { userId },
    });
}

function sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
}

export async function register(req: Request, res: Response): Promise<Response> {
    try {
        const {
            email,
            password,
            phone,
            firstName,
            lastName,
            role = 'passenger',
        } = req.body as {
            email?: string;
            password?: string;
            phone?: string;
            firstName?: string;
            lastName?: string;
            role?: UserRole;
        };

        if (!email || !password || !firstName || !lastName) {
            return res
                .status(400)
                .json({ error: 'email, password, firstName et lastName sont requis' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone ? phone.replace(/\s+/g, '').trim() : null;

        const existingEmail = await getUserByEmail(normalizedEmail);
        if (existingEmail) {
            return res
                .status(409)
                .json({ error: 'Un compte existe déjà avec cet email' });
        }

        if (normalizedPhone) {
            const existingPhone = await getUserByPhone(normalizedPhone);
            if (existingPhone) {
                return res.status(409).json({ error: 'Ce numéro est déjà utilisé' });
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // ✅ Correction du typage ici :
        const user = await createUser({
            email: normalizedEmail,
            phone: normalizedPhone ?? null,
            passwordHash,
            firstName,
            lastName,
            role,
        });

        const passenger = await hydratePassenger(user.id);

        return res.status(201).json({
            user: sanitizeUser(user),
            passenger,
        });
    } catch (error) {
        console.error('❌ register error', error);
        const message = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
        return res.status(400).json({ error: message });
    }
}

export async function login(req: Request, res: Response): Promise<Response> {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        };

        if (!email || !password) {
            return res.status(400).json({ error: 'email et password requis' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await getUserByEmail(normalizedEmail);
        if (!user || !user.passwordHash) {
            return res.status(404).json({ error: 'Identifiants invalides' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const passenger = await hydratePassenger(user.id);

        return res.json({
            user: sanitizeUser(user),
            passenger,
        });
    } catch (error) {
        console.error('❌ login error', error);
        return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
}
