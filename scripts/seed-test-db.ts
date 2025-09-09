#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { seedTestDatabase, disconnectTestDb } from '../backend/src/__tests__/helpers/testDb';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test database...');
  
  try {
    const result = await seedTestDatabase();
    
    console.log('✅ Test database seeded successfully!');
    console.log(`Created ${result.users.length} users`);
    console.log(`Created ${result.assets.length} assets`);
    
    // Log test user credentials for E2E tests
    console.log('\n📋 Test User Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / manager123');
    console.log('User: user@example.com / user123');
    console.log('User2: user2@example.com / user123');
    console.log('Test: test@example.com / test123');
    
  } catch (error) {
    console.error('❌ Error seeding test database:', error);
    process.exit(1);
  } finally {
    await disconnectTestDb();
  }
}

main();