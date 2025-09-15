import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne
} from 'typeorm';
import { Driver } from './Driver';
import { Passenger } from './Passenger';

export type UserRole = 'passenger' | 'driver' | 'admin';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    phone!: string;

    @Column({ type: 'enum', enum: ['passenger', 'driver', 'admin'], default: 'passenger' })
    role!: UserRole;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToOne(() => Passenger, (passenger) => passenger.user)
    passengerProfile?: Passenger;

    @OneToOne(() => Driver, (driver) => driver.user)
    driverProfile?: Driver;
}
