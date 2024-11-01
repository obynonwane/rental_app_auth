import Country from 'src/country/country.entity';
import IdentityType from 'src/identity-types/identity-types.entity';
import State from 'src/state/state.entity';
import User from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';
import Lga from 'src/lga/lga.entity';


@Entity({ name: 'renter_kycs' })
@Unique(['user']) // Enforces unique constraint on user
export class RenterKyc {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  address: string;

  @ManyToOne(() => IdentityType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'identity_type_id' })
  identityType: IdentityType;

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

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
