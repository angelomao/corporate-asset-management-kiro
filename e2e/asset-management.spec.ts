import { test, expect } from '@playwright/test';

test.describe('Asset Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to assets page', async ({ page }) => {
    await page.getByRole('link', { name: 'Assets' }).click();
    await expect(page).toHaveURL('/assets');
    await expect(page.getByText('Asset Management')).toBeVisible();
  });

  test('should display asset list', async ({ page }) => {
    await page.goto('/assets');
    
    // Should show asset list or empty state
    await expect(page.getByText('Asset Management')).toBeVisible();
    
    // Check for either assets or empty state message
    const hasAssets = await page.getByRole('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No assets found').isVisible().catch(() => false);
    
    expect(hasAssets || hasEmptyState).toBeTruthy();
  });

  test('should create a new asset', async ({ page }) => {
    await page.goto('/assets');
    
    // Click create asset button
    await page.getByRole('button', { name: 'Create Asset' }).click();
    
    // Fill out the form
    await page.getByLabel('Name').fill('Test Laptop E2E');
    await page.getByLabel('Description').fill('A test laptop for E2E testing');
    await page.getByLabel('Serial Number').fill(`E2E-${Date.now()}`);
    await page.getByLabel('Category').selectOption('HARDWARE');
    await page.getByLabel('Vendor').fill('Test Vendor');
    await page.getByLabel('Location').fill('Test Office');
    await page.getByLabel('Purchase Price').fill('1500');
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Asset' }).click();
    
    // Should show success message and redirect or update list
    await expect(page.getByText('Asset created successfully')).toBeVisible();
    await expect(page.getByText('Test Laptop E2E')).toBeVisible();
  });

  test('should validate required fields when creating asset', async ({ page }) => {
    await page.goto('/assets');
    
    await page.getByRole('button', { name: 'Create Asset' }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Asset' }).click();
    
    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Category is required')).toBeVisible();
  });

  test('should search for assets', async ({ page }) => {
    await page.goto('/assets');
    
    // Create an asset first if none exist
    const hasAssets = await page.getByRole('table').isVisible().catch(() => false);
    if (!hasAssets) {
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Searchable Asset');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
    }
    
    // Search for assets
    await page.getByPlaceholder('Search assets...').fill('Searchable');
    
    // Should filter results
    await expect(page.getByText('Searchable Asset')).toBeVisible();
    
    // Clear search
    await page.getByPlaceholder('Search assets...').clear();
  });

  test('should filter assets by category', async ({ page }) => {
    await page.goto('/assets');
    
    // Select category filter
    await page.getByLabel('Category').selectOption('HARDWARE');
    
    // Should filter results (if any hardware assets exist)
    // This test assumes there are assets to filter
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    if (tableVisible) {
      // Check that only hardware assets are shown
      const categoryBadges = await page.getByText('HARDWARE').count();
      expect(categoryBadges).toBeGreaterThan(0);
    }
  });

  test('should filter assets by status', async ({ page }) => {
    await page.goto('/assets');
    
    // Select status filter
    await page.getByLabel('Status').selectOption('AVAILABLE');
    
    // Should filter results
    const tableVisible = await page.getByRole('table').isVisible().catch(() => false);
    if (tableVisible) {
      // Check that only available assets are shown
      const statusBadges = await page.getByText('AVAILABLE').count();
      expect(statusBadges).toBeGreaterThan(0);
    }
  });

  test('should assign asset to user', async ({ page }) => {
    await page.goto('/assets');
    
    // Find an available asset or create one
    let hasAvailableAsset = await page.getByText('AVAILABLE').isVisible().catch(() => false);
    
    if (!hasAvailableAsset) {
      // Create an available asset
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Asset for Assignment');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
    }
    
    // Find and click assign button for an available asset
    const assignButton = page.getByRole('button', { name: 'Assign' }).first();
    await assignButton.click();
    
    // Select a user to assign to (this assumes users exist)
    await page.getByLabel('Assign to User').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Assign Asset' }).click();
    
    // Should show success message and update status
    await expect(page.getByText('Asset assigned successfully')).toBeVisible();
    await expect(page.getByText('ASSIGNED')).toBeVisible();
  });

  test('should unassign asset from user', async ({ page }) => {
    await page.goto('/assets');
    
    // Find an assigned asset or create and assign one first
    let hasAssignedAsset = await page.getByText('ASSIGNED').isVisible().catch(() => false);
    
    if (!hasAssignedAsset) {
      // Create and assign an asset first
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Asset for Unassignment');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
      
      // Assign it
      await page.getByRole('button', { name: 'Assign' }).first().click();
      await page.getByLabel('Assign to User').selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Assign Asset' }).click();
      await expect(page.getByText('Asset assigned successfully')).toBeVisible();
    }
    
    // Find and click unassign button for an assigned asset
    const unassignButton = page.getByRole('button', { name: 'Unassign' }).first();
    await unassignButton.click();
    
    // Confirm unassignment
    await page.getByRole('button', { name: 'Confirm Unassign' }).click();
    
    // Should show success message and update status
    await expect(page.getByText('Asset unassigned successfully')).toBeVisible();
    await expect(page.getByText('AVAILABLE')).toBeVisible();
  });

  test('should update asset status', async ({ page }) => {
    await page.goto('/assets');
    
    // Find an asset or create one
    let hasAssets = await page.getByRole('table').isVisible().catch(() => false);
    
    if (!hasAssets) {
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Asset for Status Update');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
    }
    
    // Click on status change button
    await page.getByRole('button', { name: 'Change Status' }).first().click();
    
    // Select new status
    await page.getByLabel('New Status').selectOption('MAINTENANCE');
    await page.getByLabel('Reason').fill('Scheduled maintenance');
    await page.getByRole('button', { name: 'Update Status' }).click();
    
    // Should show success message and update status
    await expect(page.getByText('Asset status updated successfully')).toBeVisible();
    await expect(page.getByText('MAINTENANCE')).toBeVisible();
  });

  test('should view asset status history', async ({ page }) => {
    await page.goto('/assets');
    
    // Find an asset with history or create one and change its status
    let hasAssets = await page.getByRole('table').isVisible().catch(() => false);
    
    if (!hasAssets) {
      // Create asset and change status to generate history
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Asset with History');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
      
      // Change status to create history
      await page.getByRole('button', { name: 'Change Status' }).first().click();
      await page.getByLabel('New Status').selectOption('MAINTENANCE');
      await page.getByLabel('Reason').fill('Creating history');
      await page.getByRole('button', { name: 'Update Status' }).click();
      await expect(page.getByText('Asset status updated successfully')).toBeVisible();
    }
    
    // Click on view history button
    await page.getByRole('button', { name: 'View History' }).first().click();
    
    // Should show status history modal
    await expect(page.getByText('Status History')).toBeVisible();
    await expect(page.getByText('AVAILABLE → MAINTENANCE')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should edit asset details', async ({ page }) => {
    await page.goto('/assets');
    
    // Find an asset or create one
    let hasAssets = await page.getByRole('table').isVisible().catch(() => false);
    
    if (!hasAssets) {
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await page.getByLabel('Name').fill('Asset to Edit');
      await page.getByLabel('Category').selectOption('HARDWARE');
      await page.getByRole('button', { name: 'Create Asset' }).click();
      await expect(page.getByText('Asset created successfully')).toBeVisible();
    }
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Update asset details
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('Updated Asset Name');
    await page.getByLabel('Description').clear();
    await page.getByLabel('Description').fill('Updated description');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show success message and updated details
    await expect(page.getByText('Asset updated successfully')).toBeVisible();
    await expect(page.getByText('Updated Asset Name')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/assets');
    
    // This test assumes there are enough assets to paginate
    // Check if pagination controls are visible
    const paginationVisible = await page.getByRole('navigation', { name: 'pagination' }).isVisible().catch(() => false);
    
    if (paginationVisible) {
      // Test next page
      await page.getByRole('button', { name: 'Next' }).click();
      
      // Should navigate to next page
      await expect(page).toHaveURL(/page=2/);
      
      // Test previous page
      await page.getByRole('button', { name: 'Previous' }).click();
      
      // Should navigate back to first page
      await expect(page).toHaveURL(/page=1|\/assets$/);
    }
  });
});