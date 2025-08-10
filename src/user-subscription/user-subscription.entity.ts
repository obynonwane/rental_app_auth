import { Plan } from '../plan/plan.entity';
import User from '../user/user.entity';

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';



@Entity('user_subscriptions')
@Unique(['user'])
export class UserSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.userSubscription, { nullable: false })
    @JoinColumn({ name: 'user_id' }) // owning side: user_id in user_subscriptions table
    user: User;

    @ManyToOne(() => Plan, { nullable: true, eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan?: Plan;

    @Column({ type: 'varchar', length: 50 })
    billing_cycle: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    receipt_number?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    reference?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @Column({ type: 'timestamp', })
    start_date: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_date?: Date;

    @Column({ type: 'int', nullable: true })
    number_of_days?: number;

    @Column({ type: 'int', nullable: true })
    available_postings?: number;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column({ type: 'boolean', default: false })
    subscription_canceled: boolean;

    @Column({ type: 'text', nullable: true, select: false })
    payload?: string;

    @Column({ type: 'numeric', nullable: true })
    amount?: number;
}
