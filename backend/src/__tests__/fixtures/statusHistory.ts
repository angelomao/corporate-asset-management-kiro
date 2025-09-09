import { AssetStatus } from '@prisma/client';

export interface StatusHistoryFixture {
  assetSerialNumber: string; // Reference to asset by serial number
  oldStatus: AssetStatus;
  newStatus: AssetStatus;
  reason: string;
  changedByEmail: string; // Reference to user by email
  createdAt?: Date;
}

export const statusHistoryFixtures: StatusHistoryFixture[] = [
  {
    assetSerialNumber: 'MBP-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'Assigned to new employee',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2023-01-16T10:00:00Z')
  },
  {
    assetSerialNumber: 'KEY-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'Assigned with laptop',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2022-11-02T09:00:00Z')
  },
  {
    assetSerialNumber: 'KEY-001',
    oldStatus: AssetStatus.ASSIGNED,
    newStatus: AssetStatus.MAINTENANCE,
    reason: 'Keys not working properly',
    changedByEmail: 'manager@example.com',
    createdAt: new Date('2023-05-15T14:30:00Z')
  },
  {
    assetSerialNumber: 'DSK-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'Office setup',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2021-06-02T08:00:00Z')
  },
  {
    assetSerialNumber: 'DSK-001',
    oldStatus: AssetStatus.ASSIGNED,
    newStatus: AssetStatus.MAINTENANCE,
    reason: 'Height adjustment mechanism broken',
    changedByEmail: 'user@example.com',
    createdAt: new Date('2023-01-10T11:00:00Z')
  },
  {
    assetSerialNumber: 'DSK-001',
    oldStatus: AssetStatus.MAINTENANCE,
    newStatus: AssetStatus.RETIRED,
    reason: 'Repair cost exceeds replacement cost',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2023-02-01T16:00:00Z')
  },
  {
    assetSerialNumber: 'PRJ-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'Conference room setup',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2022-08-16T09:00:00Z')
  },
  {
    assetSerialNumber: 'PRJ-001',
    oldStatus: AssetStatus.ASSIGNED,
    newStatus: AssetStatus.LOST,
    reason: 'Missing after office relocation',
    changedByEmail: 'manager@example.com',
    createdAt: new Date('2023-03-15T17:00:00Z')
  },
  {
    assetSerialNumber: 'IPH-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'Manager phone upgrade',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2023-04-02T10:30:00Z')
  },
  {
    assetSerialNumber: 'OFF-001',
    oldStatus: AssetStatus.AVAILABLE,
    newStatus: AssetStatus.ASSIGNED,
    reason: 'License activation for manager',
    changedByEmail: 'admin@example.com',
    createdAt: new Date('2023-01-02T08:30:00Z')
  }
];

export const createStatusHistoryFixture = (
  fixture: StatusHistoryFixture,
  assetId: string,
  changedById: string
) => {
  return {
    assetId,
    oldStatus: fixture.oldStatus,
    newStatus: fixture.newStatus,
    reason: fixture.reason,
    changedById,
    createdAt: fixture.createdAt || new Date()
  };
};