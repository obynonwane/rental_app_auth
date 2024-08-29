
import { UserType } from "../_enums/user-type.enum";
import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "users" })
class User {
    @PrimaryGeneratedColumn("uuid")
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

    // @Column({ type: 'enum', enum: UserType, default: UserType.OWNER, })
    // public userType: UserType;

    @Column()
    public password: string;

    @Column({ default: false })
    public verified: boolean;

    @Column({ default: true })
    public first_time_login: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default User;