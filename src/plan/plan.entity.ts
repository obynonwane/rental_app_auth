import { BusinessKyc } from '../business-kyc/business-kyc.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 32, nullable: true })
    name: string | null;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    monthly_price: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    annual_price: number;

    @OneToMany(() => BusinessKyc, (kyc) => kyc.plan)
    businessKycs: BusinessKyc[];

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}
