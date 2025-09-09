import { AssetCategory, AssetStatus } from '@prisma/client';

export interface AssetFixture {
  name: string;
  description?: string;
  serialNumber?: string;
  category: AssetCategory;
  status: AssetStatus;
  purchaseDate?: Date;
  purchasePrice?: number;
  vendor?: string;
  location?: string;
  assigneeEmail?: string; // Reference to user by email
}

export const assetFixtures: AssetFixture[] = [
  {
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for development work',
    serialNumber: 'MBP-001',
    category: AssetCategory.HARDWARE,
    status: AssetStatus.ASSIGNED,
    purchaseDate: new Date('2023-01-15'),
    purchasePrice: 2500,
    vendor: 'Apple Inc.',
    location: 'Office A - Desk 1',
    assigneeEmail: 'user@example.com'
  },
  {
    name: 'Dell Monitor 27"',
    description: '4K external monitor',
    serialNumber: 'MON-001',
    category: AssetCategory.HARDWARE,
    status: AssetStatus.AVAILABLE,
    purchaseDate: new Date('2023-02-01'),
    purchasePrice: 400,
    vendor: 'Dell Technologies',
    location: 'Storage Room A'
  },
  {
    name: 'Microsoft Office 365',
    description: 'Office productivity suite license',
    serialNumber: 'OFF-001',
    category: AssetCategory.SOFTWARE,
    status: AssetStatus.ASSIGNED,
    purchaseDate: new Date('2023-01-01'),
    purchasePrice: 150,
    vendor: 'Microsoft Corporation',
    assigneeEmail: 'manager@example.com'
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support',
    serialNumber: 'CHR-001',
    category: AssetCategory.FURNITURE,
    status: AssetStatus.ASSIGNED,
    purchaseDate: new Date('2022-12-15'),
    purchasePrice: 300,
    vendor: 'Office Furniture Co.',
    location: 'Office A - Desk 1',
    assigneeEmail: 'user@example.com'
  },
  {
    name: 'Company Vehicle - Toyota Camry',
    description: '2023 Toyota Camry for business use',
    serialNumber: 'VEH-001',
    category: AssetCategory.VEHICLE,
    status: AssetStatus.AVAILABLE,
    purchaseDate: new Date('2023-03-01'),
    purchasePrice: 25000,
    vendor: 'Toyota Dealership',
    location: 'Parking Lot A'
  },
  {
    name: 'Wireless Keyboard',
    description: 'Bluetooth wireless keyboard',
    serialNumber: 'KEY-001',
    category: AssetCategory.HARDWARE,
    status: AssetStatus.MAINTENANCE,
    purchaseDate: new Date('2022-11-01'),
    purchasePrice: 80,
    vendor: 'Logitech',
    location: 'IT Department'
  },
  {
    name: 'Adobe Creative Suite',
    description: 'Design software license',
    serialNumber: 'ACS-001',
    category: AssetCategory.SOFTWARE,
    status: AssetStatus.AVAILABLE,
    purchaseDate: new Date('2023-01-10'),
    purchasePrice: 600,
    vendor: 'Adobe Inc.'
  },
  {
    name: 'Standing Desk',
    description: 'Height-adjustable standing desk',
    serialNumber: 'DSK-001',
    category: AssetCategory.FURNITURE,
    status: AssetStatus.RETIRED,
    purchaseDate: new Date('2021-06-01'),
    purchasePrice: 500,
    vendor: 'Desk Solutions Inc.',
    location: 'Storage Room B'
  },
  {
    name: 'iPhone 14 Pro',
    description: 'Company mobile phone',
    serialNumber: 'IPH-001',
    category: AssetCategory.HARDWARE,
    status: AssetStatus.ASSIGNED,
    purchaseDate: new Date('2023-04-01'),
    purchasePrice: 1000,
    vendor: 'Apple Inc.',
    assigneeEmail: 'manager@example.com'
  },
  {
    name: 'Projector - Epson',
    description: 'Conference room projector',
    serialNumber: 'PRJ-001',
    category: AssetCategory.HARDWARE,
    status: AssetStatus.LOST,
    purchaseDate: new Date('2022-08-15'),
    purchasePrice: 800,
    vendor: 'Epson',
    location: 'Conference Room B'
  }
];

export const createAssetFixture = (fixture: AssetFixture, createdById: string, assigneeId?: string) => {
  return {
    name: fixture.name,
    description: fixture.description,
    serialNumber: fixture.serialNumber,
    category: fixture.category,
    status: fixture.status,
    purchaseDate: fixture.purchaseDate,
    purchasePrice: fixture.purchasePrice,
    vendor: fixture.vendor,
    location: fixture.location,
    createdById,
    assigneeId: assigneeId || null
  };
};