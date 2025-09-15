import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
} from 'typeorm';
import { Driver } from './Driver';
import { Passenger } from './Passenger';

export type RideStatus =
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'rejected'
    | 'timeout_cancelled';

@Entity('rides')
export class Ride {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Driver, (driver) => driver.rides, { nullable: true })
    driver?: Driver | null;

    @ManyToOne(() => Passenger, (passenger) => passenger.rides)
    passenger!: Passenger;

    @Column()
    origin!: string;

    @Column()
    destination!: string;

    @Column({ type: 'float' })
    distanceKm!: number;

    @Column({ type: 'float' })
    estimatedFare!: number;

    @Column({
        type: 'enum',
        enum: [
            'pending',
            'accepted',
            'in_progress',
            'completed',
            'cancelled',
            'rejected',
            'timeout_cancelled'
        ],
        default: 'pending'
    })
    status!: RideStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
