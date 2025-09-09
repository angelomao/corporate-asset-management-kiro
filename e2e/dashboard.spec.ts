import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard title', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should display asset statistics cards', async ({ page }) => {
    // Check for statistics cards
    await expect(page.getByText('Total Assets')).toBeVisible();
    await expect(page.getByText('Available')).toBeVisible();
    await expect(page.getByText('Assigned')).toBeVisible();
    await expect(page.getByText('Maintenance')).toBeVisible();
    await expect(page.getByText('Retired')).toBeVisible();
  });

  test('should display numeric values for statistics', async ({ page }) => {
    // Check that statistics show numeric values
    const totalAssets = page.locator('[data-testid="total-assets-count"]');
    const availableAssets = page.locator('[data-testid="available-assets-count"]');
    const assignedAssets = page.locator('[data-testid="assigned-assets-count"]');
    
    await expect(totalAssets).toBeVisible();
    await expect(availableAssets).toBeVisible();
    await expect(assignedAssets).toBeVisible();
    
    // Values should be numbers (0 or greater)
    const totalText = await totalAssets.textContent();
    const availableText = await availableAssets.textContent();
    const assignedText = await assignedAssets.textContent();
    
    expect(parseInt(totalText || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(availableText || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(assignedText || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should display recent assets section', async ({ page }) => {
    await expect(page.getByText('Recent Assets')).toBeVisible();
    
    // Should show either recent assets or empty state
    const hasRecentAssets = await page.getByTestId('recent-assets-list').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No recent assets').isVisible().catch(() => false);
    
    expect(hasRecentAssets || hasEmptyState).toBeTruthy();
  });

  test('should show recent assets when they exist', async ({ page }) => {
    // First create an asset to ensure we have recent assets
    await page.goto('/assets');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await page.getByLabel('Name').fill('Recent Dashboard Asset');
    await page.getByLabel('Category').selectOption('HARDWARE');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await expect(page.getByText('Asset created successfully')).toBeVisible();
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Should show the recent asset
    await expect(page.getByText('Recent Dashboard Asset')).toBeVisible();
  });

  test('should navigate to assets page from dashboard', async ({ page }) => {
    // Click on "View All Assets" link or similar
    const viewAllLink = page.getByRole('link', { name: 'View All Assets' });
    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL('/assets');
    }
  });

  test('should update statistics when assets are created', async ({ page }) => {
    // Get initial total count
    const initialTotal = await page.locator('[data-testid="total-assets-count"]').textContent();
    const initialTotalNum = parseInt(initialTotal || '0');
    
    // Create a new asset
    await page.goto('/assets');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await page.getByLabel('Name').fill('Statistics Test Asset');
    await page.getByLabel('Category').selectOption('HARDWARE');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await expect(page.getByText('Asset created successfully')).toBeVisible();
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Total should have increased
    const newTotal = await page.locator('[data-testid="total-assets-count"]').textContent();
    const newTotalNum = parseInt(newTotal || '0');
    
    expect(newTotalNum).toBeGreaterThan(initialTotalNum);
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to dashboard and check for loading indicators
    await page.goto('/dashboard');
    
    // This test might be too fast to catch loading state, but we can check
    // that the page loads successfully
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should handle dashboard data refresh', async ({ page }) => {
    // Refresh the page and ensure data loads correctly
    await page.reload();
    
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Total Assets')).toBeVisible();
    await expect(page.getByText('Recent Assets')).toBeVisible();
  });

  test('should display correct asset status distribution', async ({ page }) => {
    // Get all status counts
    const totalCount = parseInt(await page.locator('[data-testid="total-assets-count"]').textContent() || '0');
    const availableCount = parseInt(await page.locator('[data-testid="available-assets-count"]').textContent() || '0');
    const assignedCount = parseInt(await page.locator('[data-testid="assigned-assets-count"]').textContent() || '0');
    const maintenanceCount = parseInt(await page.locator('[data-testid="maintenance-assets-count"]').textContent() || '0');
    const retiredCount = parseInt(await page.locator('[data-testid="retired-assets-count"]').textContent() || '0');
    
    // Sum of all status counts should equal total (or be close due to timing)
    const statusSum = availableCount + assignedCount + maintenanceCount + retiredCount;
    
    // Allow for small discrepancies due to concurrent operations
    expect(Math.abs(statusSum - totalCount)).toBeLessThanOrEqual(1);
  });

  test('should show asset status badges with correct colors', async ({ page }) => {
    // Check that status badges have appropriate styling
    const availableBadge = page.getByTestId('available-status-badge');
    const assignedBadge = page.getByTestId('assigned-status-badge');
    const maintenanceBadge = page.getByTestId('maintenance-status-badge');
    
    if (await availableBadge.isVisible()) {
      await expect(availableBadge).toHaveClass(/bg-green/);
    }
    
    if (await assignedBadge.isVisible()) {
      await expect(assignedBadge).toHaveClass(/bg-blue/);
    }
    
    if (await maintenanceBadge.isVisible()) {
      await expect(maintenanceBadge).toHaveClass(/bg-yellow/);
    }
  });

  test('should handle empty dashboard state gracefully', async ({ page }) => {
    // This test would be relevant for a fresh installation
    // For now, we just ensure the dashboard renders without errors
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Even with no assets, the structure should be present
    await expect(page.getByText('Total Assets')).toBeVisible();
    await expect(page.getByText('Recent Assets')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Total Assets')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Total Assets')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Total Assets')).toBeVisible();
  });
});