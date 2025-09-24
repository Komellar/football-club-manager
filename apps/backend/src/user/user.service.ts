import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Role } from '../common/entities/role.entity';
import type { CreateUserDto } from '@repo/core';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const role = await this.roleRepository.findOne({
      where: { name: userData.roleName },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }
}
