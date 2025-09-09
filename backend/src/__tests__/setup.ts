import { testDb, cleanDatabase, disconnectTestDb } from './helpers/testDb';

// Global test setup
beforeAll(async () => {
  // Ensure test database is clean before starting tests
  await cleanDatabase();
});

// Global test teardown
afterAll(async () => {
  // Clean up and disconnect after all tests
  await cleanDatabase();
  await disconnectTestDb();
});

// Set longer timeout for database operations
jest.setTimeout(30000);