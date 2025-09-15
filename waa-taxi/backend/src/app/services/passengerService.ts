import { AppDataSource } from '../../config/data-source';
import { Passenger } from '../entities/Passenger';

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
