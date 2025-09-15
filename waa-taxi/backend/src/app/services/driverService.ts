import { AppDataSource } from '../../config/data-source';
import { Driver } from '../entities/Driver';

interface DriverInput {
    userId: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
}

const driverRepo = AppDataSource.getRepository(Driver);

export async function createDriver(data: DriverInput) {
    // Vérifier si déjà un driver lié à ce userId
    const existingDriver = await driverRepo.findOne({ where: { userId: data.userId } });
    if (existingDriver) {
        throw new Error('❌ Driver déjà existant pour cet utilisateur.');
    }

    const driver = driverRepo.create(data);
    return await driverRepo.save(driver);
}

export async function getAllDrivers() {
    return await driverRepo.find();
}
