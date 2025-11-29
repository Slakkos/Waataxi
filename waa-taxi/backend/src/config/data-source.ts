import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../app/entities/User';
import { Driver } from '../app/entities/Driver';
import { Passenger } from '../app/entities/Passenger';
import { Ride } from '../app/entities/Ride';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [User, Driver, Passenger, Ride],
    migrations: [__dirname + '/../migrations/*.ts'],
    subscribers: [],
});
