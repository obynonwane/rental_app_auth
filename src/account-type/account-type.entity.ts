

import User from '../user/user.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "account_types" })
class AccountType {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    public name: string;


    // One account type can be assigned to many users
    @OneToMany(() => User, (user) => user.accountType)
    users: User[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default AccountType;