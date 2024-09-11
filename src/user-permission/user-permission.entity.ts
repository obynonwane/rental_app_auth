import Permission from '../permission/permission.entity';
import User from '../user/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';


@Entity({ name: "user_permissions" })
class UserPermission {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @ManyToOne(() => User, user => user.permissions, { onDelete: 'CASCADE' }) // Many permissions can belong to one user
    @JoinColumn({ name: 'user_id' })
    public user: User;

    @ManyToOne(() => Permission, permission => permission.userPermissions, { onDelete: 'CASCADE' }) // Many users can have one permission
    @JoinColumn({ name: 'permission_id' })
    public permission: Permission;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    public updated_at: Date;
}

export default UserPermission;
