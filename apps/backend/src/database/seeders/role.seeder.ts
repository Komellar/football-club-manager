import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleType } from '@repo/types';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);

  // Check if roles already exist
  const existingRoles = await roleRepository.count();
  if (existingRoles > 0) {
    console.log('Roles already exist, skipping seed');
    return;
  }

  // Create default roles
  const roles = [{ name: RoleType.ADMIN }, { name: RoleType.USER }];

  for (const roleData of roles) {
    const role = roleRepository.create(roleData);
    await roleRepository.save(role);
    console.log(`Created role: ${roleData.name}`);
  }

  console.log('Role seeding completed');
}
