import { AppDataSource } from '../../config/data-source';
import { User, UserRole } from '../entities/User';
import { Passenger } from '../entities/Passenger';
import { Driver } from '../entities/Driver';

/**
 * Crée un nouvel utilisateur avec entité liée (passenger ou driver)
 */
export async function createUser(data: {
    phone?: string;
    email?: string;
    passwordHash?: string | null;
    role: UserRole;
    firstName: string;
    lastName: string;
}): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const passengerRepo = AppDataSource.getRepository(Passenger);
    const driverRepo = AppDataSource.getRepository(Driver);

    const normalizedPhone = data.phone?.replace(/\s+/g, '').trim() ?? null;
    const normalizedEmail = data.email?.trim().toLowerCase() ?? null;

    if (normalizedPhone) {
        const existingPhone = await userRepo.findOne({ where: { phone: normalizedPhone } });
        if (existingPhone) throw new Error('❌ Numéro déjà utilisé');
    }

    if (normalizedEmail) {
        const existingEmail = await userRepo.findOne({ where: { email: normalizedEmail } });
        if (existingEmail) throw new Error('❌ Email déjà utilisé');
    }

    const user = userRepo.create({
        phone: normalizedPhone,
        email: normalizedEmail,
        passwordHash: data.passwordHash ?? null,
        role: data.role,
    });
    await userRepo.save(user);

    if (data.role === 'passenger') {
        const passenger = passengerRepo.create({
            user,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        await passengerRepo.save(passenger);
    }

    if (data.role === 'driver') {
        const driver = driverRepo.create({
            user,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        await driverRepo.save(driver);
    }

    return user;
}

/**
 * Récupère un utilisateur par ID
 */
export async function getUserById(id: string): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return userRepo.findOneBy({ id });
}

/**
 * Récupère un utilisateur par téléphone
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    const normalized = phone.replace(/\s+/g, '').trim();
    return userRepo.findOne({ where: { phone: normalized } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('❌ Utilisateur introuvable');

    Object.assign(user, data);
    return userRepo.save(user);
}

/**
 * Désactive un utilisateur (soft delete)
 */
export async function deactivateUser(id: string): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('❌ Utilisateur introuvable');

    user.isActive = false;
    return userRepo.save(user);
}

/**
 * Supprime définitivement un utilisateur
 */
export async function deleteUser(id: string): Promise<void> {
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete(id);
}

/**
 * Liste des utilisateurs
 */
export async function getAllUsers(limit = 100): Promise<User[]> {
    const userRepo = AppDataSource.getRepository(User);
    return userRepo.find({
        take: limit,
        order: { createdAt: 'DESC' },
    });
}
