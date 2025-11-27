import { AppDataSource } from '../../config/data-source';
import { Passenger } from '../entities/Passenger';
import { User } from '../entities/User';

const passengerRepo = AppDataSource.getRepository(Passenger);

export async function createPassenger(data: Partial<Passenger>) {
    if (!data.userId) throw new Error('userId requis');
    const passenger = passengerRepo.create(data);
    return passengerRepo.save(passenger);
}

export async function getAllPassengers() {
    return passengerRepo.find();
}

export async function getPassengerById(id: string) {
    return passengerRepo.findOne({ where: { id } });
}

type PassengerUpdatePayload = {
    firstName?: string;
    lastName?: string;
    gender?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    phone?: string | null;
};

export async function updatePassengerProfile(
    id: string,
    data: PassengerUpdatePayload
): Promise<{ passenger: Passenger; user: User }> {
    const userRepo = AppDataSource.getRepository(User);
    const passenger = await passengerRepo.findOne({
        where: [{ id }, { userId: id }],
        relations: ['user'],
    });

    if (!passenger) {
        throw new Error('Passager introuvable');
    }

    const user =
        passenger.user ??
        (await userRepo.findOne({
            where: { id: passenger.userId },
        }));

    if (!user) {
        throw new Error('Utilisateur associé introuvable');
    }

    if (typeof data.firstName === 'string') {
        passenger.firstName = data.firstName.trim();
    }
    if (typeof data.lastName === 'string') {
        passenger.lastName = data.lastName.trim();
    }
    if (data.gender !== undefined) {
        passenger.gender = data.gender?.trim() || null;
    }
    if (data.avatarUrl !== undefined) {
        passenger.avatarUrl = data.avatarUrl?.trim() || null;
    }

    if (data.email !== undefined) {
        const normalizedEmail = data.email?.trim().toLowerCase() || null;
        if (normalizedEmail) {
            const existingEmail = await userRepo.findOne({
                where: { email: normalizedEmail },
            });
            if (existingEmail && existingEmail.id !== user.id) {
                throw new Error('Email déjà utilisé');
            }
        }
        user.email = normalizedEmail;
    }

    if (data.phone !== undefined) {
        const normalizedPhone =
            data.phone?.replace(/\s+/g, '').trim() || null;
        if (normalizedPhone) {
            const existingPhone = await userRepo.findOne({
                where: { phone: normalizedPhone },
            });
            if (existingPhone && existingPhone.id !== user.id) {
                throw new Error('Numéro déjà utilisé');
            }
        }
        user.phone = normalizedPhone;
    }

    const savedUser = await userRepo.save(user);
    const savedPassenger = await passengerRepo.save(passenger);

    return { passenger: savedPassenger, user: savedUser };
}
