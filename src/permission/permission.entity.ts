import UserPermission from '../user-permission/user-permission.entity';
import Role from '../role/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity({ name: 'permissions' })
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];

    @OneToMany(() => UserPermission, userPermission => userPermission.permission)
    public users: UserPermission[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default Permission;