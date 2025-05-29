

import Lga from 'src/lga/lga.entity';
import Country from '../country/country.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "states" })
class State {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: true })
    public name: string;

    @Column({ nullable: true })
    public state_slug: string;

    @ManyToOne(() => Country, country => country.states, { onDelete: 'CASCADE' }) // Many states can belong to one country
    @JoinColumn({ name: 'country_id' })
    public country: Country;

    @OneToMany(() => Lga, lga => lga.state)
    public lgas: Lga[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default State;