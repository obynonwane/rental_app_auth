import Country from 'src/country/country.entity';
import IdentityType from 'src/identity-types/identity-types.entity';
import State from 'src/state/state.entity';
import User from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';
import Lga from 'src/lga/lga.entity';
import { Plan } from '../plan/plan.entity';


@Entity({ name: 'renter_kycs' })
@Unique(['user']) // Enforces unique constraint on user
export class RenterKyc {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  uploaded_image: string;

  @Column({ type: 'varchar' })
  identity_number: string;

  @ManyToOne(() => IdentityType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'identity_type_id' })
  identityType: IdentityType;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Country, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => State, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => Lga, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'lga_id' })
  lga: Lga;

  @ManyToOne(() => Plan, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ default: false })
  public verified: boolean;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  public updated_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at: Date;
}
