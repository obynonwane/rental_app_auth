

import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "email_verification_tokens" })
class EmailVerificationToken {
    @PrimaryGeneratedColumn("uuid")
    public id: number;

    @Index()
    @Column({ unique: true })
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

export default EmailVerificationToken;