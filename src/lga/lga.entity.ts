

import State from '../state/state.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "lgas" })
class Lga {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ nullable: true })
    public lga_slug: string;

    @ManyToOne(() => State, state => state.lgas, { onDelete: 'CASCADE' }) // Many lgas can belong to one state
    @JoinColumn({ name: 'state_id' })
    public state: State;



    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default Lga;