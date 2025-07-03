import Country from '../country/country.entity';
import State from '../state/state.entity';
import User from '../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';
import Lga from '../lga/lga.entity';
import { BusinessRegisteredEnum } from './enums/business-registered.enum';
import { Plan } from '../plan/plan.entity';


@Entity({ name: 'business_kycs' })
@Unique(['user']) // Enforces unique constraint on user
export class BusinessKyc {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    address: string;

    @Column({ type: 'varchar', nullable: true })
    cac_number: string;

    @Column({ type: 'varchar' })
    display_name: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({ type: 'varchar' })
    key_bonus: string;

    @Column({
        type: 'enum',
        enum: BusinessRegisteredEnum,
        default: BusinessRegisteredEnum.NO,
    })
    business_registered: BusinessRegisteredEnum;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Country, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @ManyToOne(() => State, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'state_id' })
    state: State;

    @ManyToOne(() => Lga, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lga_id' })
    lga: Lga;

    @ManyToOne(() => Plan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @Column({ default: false })
    public verified: boolean;

    @Column({ default: false })
    active_plan: boolean;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;
}



