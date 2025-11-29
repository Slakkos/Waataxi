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

    @ManyToOne(() => Passenger, (passenger) => passenger.rides, { nullable: true })
    passenger?: Passenger | null;

    @Column()
    origin!: string;

    @Column()
    destination!: string;

    // Libellés lisibles (adresses) pour affichage
    @Column({ type: 'varchar', nullable: true })
    originLabel?: string | null;

    @Column({ type: 'varchar', nullable: true })
    destinationLabel?: string | null;

    // Coordonnées LngLat stockées sous forme de texte "lng,lat"
    @Column({ type: 'varchar', nullable: true })
    originLngLat?: string | null;

    @Column({ type: 'varchar', nullable: true })
    destinationLngLat?: string | null;

    @Column({ type: 'float' })
    distanceKm!: number;

    // Distances / durées précises si disponibles
    @Column({ type: 'double precision', nullable: true })
    distanceMeters?: number | null;

    @Column({ type: 'double precision', nullable: true })
    durationSeconds?: number | null;

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
