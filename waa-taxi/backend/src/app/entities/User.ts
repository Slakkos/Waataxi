import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { Driver } from './Driver';
import { Passenger } from './Passenger';

export type UserRole = 'passenger' | 'driver' | 'admin';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
    phone?: string | null;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    email?: string | null;

    @Column({ type: 'varchar', nullable: true })
    passwordHash?: string | null;

    @Column({
        type: 'enum',
        enum: ['passenger', 'driver', 'admin'],
        default: 'passenger',
    })
    role!: UserRole;

    @Column({ type: 'boolean', default: true })
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
