import { AppDataSource } from '../../config/data-source';
import { User, UserRole } from '../entities/User';
import { Passenger } from '../entities/Passenger';
import { Driver } from '../entities/Driver';

/**
 * Crée un nouvel utilisateur avec entité liée (passenger ou driver)
 */
export async function createUser(data: {
    phone: string;
    role: UserRole;
    firstName: string;
    lastName: string;
}): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const passengerRepo = AppDataSource.getRepository(Passenger);
    const driverRepo = AppDataSource.getRepository(Driver);

    const existing = await userRepo.findOneBy({ phone: data.phone });
    if (existing) throw new Error('❌ Utilisateur déjà existant');

    const user = userRepo.create({ phone: data.phone, role: data.role });
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
    return userRepo.findOneBy({ phone });
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
