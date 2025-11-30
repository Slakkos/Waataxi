import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../app/entities/User';
import { Driver } from '../app/entities/Driver';
import { Passenger } from '../app/entities/Passenger';
import { Ride } from '../app/entities/Ride';
import { Conversation } from '../app/entities/Conversation';
import { Message } from '../app/entities/Message';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [User, Driver, Passenger, Ride, Conversation, Message],
    migrations: [
        __dirname + '/../migrations/*.ts',
        __dirname + '/../app/migrations/*.ts',
    ],
    subscribers: [],
});
