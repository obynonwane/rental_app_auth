

import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "reset_password_tokens" })
class ResetPasswordToken {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Index()
    @Column()
    public email: string;

    @Column({ nullable: true })
    public token: string;

    @Column({ default: false })
    public expired: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default ResetPasswordToken;