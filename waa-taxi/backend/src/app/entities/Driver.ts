import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { Ride } from './Ride';
import { User } from './User';

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' }) // ✅ FK explicite
    userId!: string;

    @OneToOne(() => User, (user) => user.driverProfile, { cascade: true })
    @JoinColumn({ name: 'userId' }) // ✅ FK liée à `userId`
    user!: User;

    @Column({ length: 50 })
    firstName!: string;

    @Column({ length: 50 })
    lastName!: string;

    @Column({ default: false })
    isAvailable!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Ride, (ride) => ride.driver)
    rides!: Ride[];
}
