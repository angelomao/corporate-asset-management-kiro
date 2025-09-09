import { PrismaClient } from '@prisma/client';
import { userFixtures, createAllUserFixtures } from '../fixtures/users';
import { assetFixtures, createAssetFixture } from '../fixtures/assets';
import { statusHistoryFixtures, createStatusHistoryFixture } from '../fixtures/statusHistory';

// Use a separate test database
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

export const cleanDatabase = async () => {
  // Clean up in reverse order of dependencies
  await testDb.assetStatusHistory.deleteMany();
  await testDb.asset.deleteMany();
  await testDb.user.deleteMany();
};

export const seedTestDatabase = async () => {
  // Clean database first
  await cleanDatabase();

  // Create users
  const userFixtureData = await createAllUserFixtures();
  const createdUsers = await testDb.user.createMany({
    data: userFixtureData
  });

  // Get created users for reference
  const users = await testDb.user.findMany();
  const userMap = new Map(users.map(user => [user.email, user]));

  // Create assets
  const adminUser = userMap.get('admin@example.com')!;
  const createdAssets = [];

  for (const assetFixture of assetFixtures) {
    const assigneeId = assetFixture.assigneeEmail 
      ? userMap.get(assetFixture.assigneeEmail)?.id 
      : undefined;

    const assetData = createAssetFixture(assetFixture, adminUser.id, assigneeId);
    const asset = await testDb.asset.create({ data: assetData });
    createdAssets.push(asset);
  }

  // Create asset map for status history
  const assetMap = new Map(createdAssets.map(asset => [asset.serialNumber, asset]));

  // Create status history
  for (const historyFixture of statusHistoryFixtures) {
    const asset = assetMap.get(historyFixture.assetSerialNumber);
    const changedBy = userMap.get(historyFixture.changedByEmail);

    if (asset && changedBy) {
      const historyData = createStatusHistoryFixture(
        historyFixture,
        asset.id,
        changedBy.id
      );
      await testDb.assetStatusHistory.create({ data: historyData });
    }
  }

  return {
    users: Array.from(userMap.values()),
    assets: createdAssets,
    userMap,
    assetMap
  };
};

export const getTestUser = async (email: string) => {
  return await testDb.user.findUnique({
    where: { email }
  });
};

export const getTestAsset = async (serialNumber: string) => {
  return await testDb.asset.findUnique({
    where: { serialNumber }
  });
};

export const createTestUser = async (userData: {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}) => {
  return await testDb.user.create({
    data: userData
  });
};

export const createTestAsset = async (assetData: {
  name: string;
  category: 'HARDWARE' | 'SOFTWARE' | 'FURNITURE' | 'VEHICLE' | 'OTHER';
  status?: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | 'LOST';
  createdById: string;
  assigneeId?: string;
  serialNumber?: string;
  description?: string;
  purchasePrice?: number;
  vendor?: string;
  location?: string;
}) => {
  return await testDb.asset.create({
    data: {
      status: 'AVAILABLE',
      ...assetData
    }
  });
};

export const disconnectTestDb = async () => {
  await testDb.$disconnect();
};

// Helper function to reset database to clean state
export const resetTestDatabase = async () => {
  await cleanDatabase();
  await seedTestDatabase();
};

// Helper function for test isolation
export const withTestDatabase = async (testFn: () => Promise<void>) => {
  try {
    await seedTestDatabase();
    await testFn();
  } finally {
    await cleanDatabase();
  }
};

// Helper to create a minimal test environment
export const createMinimalTestData = async () => {
  await cleanDatabase();
  
  const adminUser = await createTestUser({
    email: 'test-admin@example.com',
    name: 'Test Admin',
    password: 'hashedpassword',
    role: 'ADMIN'
  });

  const regularUser = await createTestUser({
    email: 'test-user@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    role: 'USER'
  });

  const testAsset = await createTestAsset({
    name: 'Test Asset',
    category: 'HARDWARE',
    createdById: adminUser.id,
    serialNumber: 'TEST-001'
  });

  return {
    adminUser,
    regularUser,
    testAsset
  };
};