import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import User from '../user/user.entity';

@Entity({ name: 'participant_staffs' })
class ParticipantStaff {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    public user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'staff_id' })
    public staff: User;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default ParticipantStaff;