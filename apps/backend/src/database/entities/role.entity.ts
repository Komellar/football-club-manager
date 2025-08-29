import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RoleType } from '@repo/utils';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleType,
    nullable: false,
    unique: true,
  })
  name: RoleType;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
