


import { Column, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "identity_types" })
class IdentityType {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default IdentityType;