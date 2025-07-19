import SavedInventory from '../saved-inventory/saved-inventory.entity';
import AccountType from '../account-type/account-type.entity';
import Role from '../role/role.entity';

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public first_name: string;

  @Column({ nullable: true })
  public last_name: string;

  @Index()
  @Column({ unique: true })
  public email: string;

  @Index()
  @Column()
  public phone: string;

  @Column()
  public password: string;

  @Column({ default: false })
  public verified: boolean;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  public roles: Role[];

  @Column("varchar", { array: true, nullable: true })
  public user_types: string[];

  @Column("varchar", { array: true, nullable: true })
  public kycs: string[];


  @Column()
  public first_time_login: string;

  @Column()
  public profile_img: string;

  // One account type can be assigned to many users
  @OneToMany(() => SavedInventory, (savedInventory) => savedInventory.user, { eager: true })
  saved_inventories: SavedInventory[];

  @Column({ nullable: true, unique: true })
  user_slug?: string;



  @ManyToMany(() => AccountType, (at) => at.users, { eager: true })
  @JoinTable({
    name: 'user_account_types',               // join table name
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'account_type_id', referencedColumnName: 'id' },
  })
  accountTypes: AccountType[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}

export default User;
