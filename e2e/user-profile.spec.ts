import { test, expect } from '@playwright/test';

test.describe('User Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as regular user before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('user123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to user profile page', async ({ page }) => {
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL('/profile');
    await expect(page.getByText('User Profile')).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/profile');
    
    // Should show user details
    await expect(page.getByText('Personal Information')).toBeVisible();
    await expect(page.getByText('Email:')).toBeVisible();
    await expect(page.getByText('Name:')).toBeVisible();
    await expect(page.getByText('Role:')).toBeVisible();
    
    // Should show actual user data
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('should display assigned assets section', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.getByText('Assigned Assets')).toBeVisible();
    
    // Should show either assigned assets or empty state
    const hasAssets = await page.getByTestId('assigned-assets-list').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No assets assigned to you').isVisible().catch(() => false);
    
    expect(hasAssets || hasEmptyState).toBeTruthy();
  });

  test('should show assigned assets when user has them', async ({ page }) => {
    // First, login as admin to assign an asset to the user
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Create and assign an asset
    await page.goto('/assets');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await page.getByLabel('Name').fill('User Profile Test Asset');
    await page.getByLabel('Category').selectOption('HARDWARE');
    await page.getByRole('button', { name: 'Create Asset' }).click();
    await expect(page.getByText('Asset created successfully')).toBeVisible();
    
    // Assign to user
    await page.getByRole('button', { name: 'Assign' }).first().click();
    await page.getByLabel('Assign to User').selectOption('user@example.com');
    await page.getByRole('button', { name: 'Assign Asset' }).click();
    await expect(page.getByText('Asset assigned successfully')).toBeVisible();
    
    // Logout and login as user
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('user123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Go to profile
    await page.goto('/profile');
    
    // Should show the assigned asset
    await expect(page.getByText('User Profile Test Asset')).toBeVisible();
    await expect(page.getByText('HARDWARE')).toBeVisible();
    await expect(page.getByText('ASSIGNED')).toBeVisible();
  });

  test('should update user profile information', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit profile button
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Update name
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('Updated User Name');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show success message and updated name
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await expect(page.getByText('Updated User Name')).toBeVisible();
  });

  test('should validate profile update form', async ({ page }) => {
    await page.goto('/profile');
    
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Clear required fields
    await page.getByLabel('Name').clear();
    await page.getByLabel('Email').clear();
    
    // Try to save
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should validate email format in profile update', async ({ page }) => {
    await page.goto('/profile');
    
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Enter invalid email
    await page.getByLabel('Email').clear();
    await page.getByLabel('Email').fill('invalid-email');
    
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show email validation error
    await expect(page.getByText('Invalid email format')).toBeVisible();
  });

  test('should prevent duplicate email in profile update', async ({ page }) => {
    await page.goto('/profile');
    
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Try to use admin email (assuming it exists)
    await page.getByLabel('Email').clear();
    await page.getByLabel('Email').fill('admin@example.com');
    
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show error about email being taken
    await expect(page.getByText('Email is already taken')).toBeVisible();
  });

  test('should cancel profile edit', async ({ page }) => {
    await page.goto('/profile');
    
    const originalName = await page.getByTestId('user-name').textContent();
    
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Make changes
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('Temporary Name');
    
    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Should revert to original name
    await expect(page.getByText(originalName || '')).toBeVisible();
    await expect(page.getByText('Temporary Name')).not.toBeVisible();
  });

  test('should display user role correctly', async ({ page }) => {
    await page.goto('/profile');
    
    // Should show USER role for regular user
    await expect(page.getByText('Role: USER')).toBeVisible();
  });

  test('should show asset details in assigned assets list', async ({ page }) => {
    await page.goto('/profile');
    
    // If user has assigned assets, check that details are shown
    const hasAssets = await page.getByTestId('assigned-assets-list').isVisible().catch(() => false);
    
    if (hasAssets) {
      // Should show asset name, category, and status
      const assetCards = page.getByTestId('asset-card');
      const firstAsset = assetCards.first();
      
      await expect(firstAsset.getByTestId('asset-name')).toBeVisible();
      await expect(firstAsset.getByTestId('asset-category')).toBeVisible();
      await expect(firstAsset.getByTestId('asset-status')).toBeVisible();
    }
  });

  test('should handle profile loading state', async ({ page }) => {
    await page.goto('/profile');
    
    // Should eventually show profile content
    await expect(page.getByText('User Profile')).toBeVisible();
    await expect(page.getByText('Personal Information')).toBeVisible();
  });

  test('should handle profile update errors gracefully', async ({ page }) => {
    await page.goto('/profile');
    
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    
    // Simulate network error by intercepting the request
    await page.route('**/api/users/me', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('New Name');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should show error message
    await expect(page.getByText('Failed to update profile')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/profile');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('User Profile')).toBeVisible();
    await expect(page.getByText('Personal Information')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('User Profile')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('User Profile')).toBeVisible();
  });

  test('should maintain profile data across page refreshes', async ({ page }) => {
    await page.goto('/profile');
    
    const userName = await page.getByTestId('user-name').textContent();
    const userEmail = await page.getByTestId('user-email').textContent();
    
    // Refresh page
    await page.reload();
    
    // Should still show same user data
    await expect(page.getByText(userName || '')).toBeVisible();
    await expect(page.getByText(userEmail || '')).toBeVisible();
  });
});