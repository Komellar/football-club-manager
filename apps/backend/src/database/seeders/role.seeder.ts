import { DataSource } from 'typeorm';
import { Role } from '@/shared/entities/role.entity';
import { RoleType } from '@repo/core';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);

  const existingRoles = await roleRepository.count();
  if (existingRoles > 0) {
    console.log('Roles already exist, skipping seed');
    return;
  }

  const roles = [{ name: RoleType.ADMIN }, { name: RoleType.USER }];

  for (const roleData of roles) {
    const role = roleRepository.create(roleData);
    await roleRepository.save(role);
    console.log(`Created role: ${roleData.name}`);
  }

  console.log('Role seeding completed');
}
