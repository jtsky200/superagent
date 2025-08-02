// @ts-nocheck
import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * End-to-End Tests for CADILLAC EV CIS - Customer Journey
 * 
 * Tests critical user flows in the Swiss market context:
 * 1. User Registration & Login
 * 2. Customer Search & Profile Creation
 * 3. Vehicle Configuration & TCO Calculation
 * 4. Lead Management & Follow-up
 */

test.describe('CADILLAC EV CIS - Customer Journey E2E', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Authentication Flow', () => {
    test('should allow user registration and login', async () => {
      // Navigate to registration
      await page.click('[data-testid="register-button"]');
      await expect(page).toHaveURL(/.*\/register/);

      // Fill registration form with Swiss data
      await page.fill('[data-testid="firstName-input"]', 'Hans');
      await page.fill('[data-testid="lastName-input"]', 'Müller');
      await page.fill('[data-testid="email-input"]', 'hans.mueller@cadillac-test.ch');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirmPassword-input"]', 'SecurePassword123!');

      // Submit registration
      await page.click('[data-testid="register-submit"]');

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toContainText('Hans Müller');
    });

    test('should allow user login with existing credentials', async () => {
      // Navigate to login
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*\/login/);

      // Fill login form
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');

      // Submit login
      await page.click('[data-testid="login-submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Verify dashboard elements are visible
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="statistics-overview"]')).toBeVisible();
    });

    test('should handle login errors gracefully', async () => {
      await page.click('[data-testid="login-button"]');
      
      // Try with invalid credentials
      await page.fill('[data-testid="email-input"]', 'invalid@test.ch');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-submit"]');

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });
  });

  test.describe('Customer Management Flow', () => {
    test.beforeEach(async () => {
      // Login as admin user
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);
    });

    test('should create a new private customer', async () => {
      // Navigate to customer creation
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="add-customer-button"]');

      // Fill customer form with Swiss data
      await page.fill('[data-testid="firstName-input"]', 'Anna');
      await page.fill('[data-testid="lastName-input"]', 'Weber');
      await page.fill('[data-testid="email-input"]', 'anna.weber@example.ch');
      await page.fill('[data-testid="phone-input"]', '+41 79 123 45 67');
      await page.fill('[data-testid="street-input"]', 'Rue du Rhône 25');
      await page.fill('[data-testid="city-input"]', 'Genève');
      await page.fill('[data-testid="postalCode-input"]', '1201');
      
      // Select canton
      await page.selectOption('[data-testid="canton-select"]', 'GE');
      
      // Select customer type
      await page.click('[data-testid="customerType-private"]');

      // Submit form
      await page.click('[data-testid="create-customer-submit"]');

      // Should redirect to customer profile
      await expect(page).toHaveURL(/.*\/customers\/.*$/);
      
      // Verify customer data is displayed
      await expect(page.locator('[data-testid="customer-name"]')).toContainText('Anna Weber');
      await expect(page.locator('[data-testid="customer-email"]')).toContainText('anna.weber@example.ch');
      await expect(page.locator('[data-testid="customer-canton"]')).toContainText('GE');
    });

    test('should create a business customer with company data', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="add-customer-button"]');

      // Fill basic customer info
      await page.fill('[data-testid="firstName-input"]', 'Peter');
      await page.fill('[data-testid="lastName-input"]', 'Schmidt');
      await page.fill('[data-testid="email-input"]', 'peter.schmidt@techag.ch');
      await page.fill('[data-testid="phone-input"]', '+41 44 123 45 67');
      await page.fill('[data-testid="street-input"]', 'Technologiepark 1');
      await page.fill('[data-testid="city-input"]', 'Zürich');
      await page.fill('[data-testid="postalCode-input"]', '8005');
      await page.selectOption('[data-testid="canton-select"]', 'ZH');

      // Select business customer type
      await page.click('[data-testid="customerType-business"]');

      // Fill company information
      await expect(page.locator('[data-testid="company-section"]')).toBeVisible();
      await page.fill('[data-testid="companyName-input"]', 'TechAG Solutions');
      await page.fill('[data-testid="uidNumber-input"]', 'CHE-123.456.789');
      await page.selectOption('[data-testid="legalForm-select"]', 'AG');
      await page.fill('[data-testid="employeesCount-input"]', '45');
      await page.fill('[data-testid="annualRevenue-input"]', '8500000');

      // Submit form
      await page.click('[data-testid="create-customer-submit"]');

      // Verify business customer is created
      await expect(page.locator('[data-testid="customer-name"]')).toContainText('Peter Schmidt');
      await expect(page.locator('[data-testid="company-name"]')).toContainText('TechAG Solutions');
      await expect(page.locator('[data-testid="uid-number"]')).toContainText('CHE-123.456.789');
    });

    test('should search for existing customers', async () => {
      await page.click('[data-testid="nav-customers"]');

      // Use search functionality
      await page.fill('[data-testid="customer-search-input"]', 'Weber');
      await page.click('[data-testid="search-button"]');

      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify search results contain expected customer
      const searchResults = page.locator('[data-testid="customer-card"]');
      await expect(searchResults.first()).toContainText('Weber');
    });

    test('should filter customers by canton and type', async () => {
      await page.click('[data-testid="nav-customers"]');

      // Apply canton filter
      await page.selectOption('[data-testid="canton-filter"]', 'ZH');
      await page.click('[data-testid="apply-filters"]');

      // Verify filtered results
      const customerCards = page.locator('[data-testid="customer-card"]');
      const count = await customerCards.count();
      
      for (let i = 0; i < count; i++) {
        const card = customerCards.nth(i);
        await expect(card.locator('[data-testid="customer-canton"]')).toContainText('ZH');
      }

      // Apply customer type filter
      await page.selectOption('[data-testid="type-filter"]', 'business');
      await page.click('[data-testid="apply-filters"]');

      // Verify business customers only
      const businessCards = page.locator('[data-testid="customer-card"]');
      const businessCount = await businessCards.count();
      
      for (let i = 0; i < businessCount; i++) {
        const card = businessCards.nth(i);
        await expect(card.locator('[data-testid="customer-type"]')).toContainText('Business');
      }
    });
  });

  test.describe('Vehicle Configuration & TCO Flow', () => {
    test.beforeEach(async () => {
      // Login and navigate to vehicles
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);
      await page.click('[data-testid="nav-vehicles"]');
    });

    test('should configure a CADILLAC LYRIQ for Swiss market', async () => {
      // Select LYRIQ model
      await page.click('[data-testid="vehicle-lyriq"]');
      await expect(page).toHaveURL(/.*\/vehicles\/configure\/lyriq/);

      // Select variant
      await page.click('[data-testid="variant-premium"]');

      // Configure exterior
      await page.click('[data-testid="color-stellar-black"]');
      await page.click('[data-testid="wheels-20-inch"]');

      // Configure interior
      await page.click('[data-testid="interior-semi-aniline"]');
      await page.click('[data-testid="seats-heated-cooled"]');

      // Add technology options
      await page.check('[data-testid="option-super-cruise"]');
      await page.check('[data-testid="option-akg-audio"]');
      await page.check('[data-testid="option-hud"]');

      // Verify price calculation
      const totalPrice = page.locator('[data-testid="total-price"]');
      await expect(totalPrice).toBeVisible();
      await expect(totalPrice).toContainText('CHF');

      // Save configuration
      await page.click('[data-testid="save-configuration"]');

      // Should show saved confirmation
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    });

    test('should calculate TCO for Swiss market factors', async () => {
      // Configure vehicle first
      await page.click('[data-testid="vehicle-lyriq"]');
      await page.click('[data-testid="variant-luxury"]');
      await page.click('[data-testid="calculate-tco"]');

      // Fill TCO calculation form
      await page.selectOption('[data-testid="canton-select"]', 'ZH');
      await page.fill('[data-testid="annual-kilometers"]', '15000');
      await page.fill('[data-testid="duration-years"]', '5');

      // Configure charging mix
      await page.fill('[data-testid="home-charging"]', '80');
      await page.fill('[data-testid="public-charging"]', '15');
      await page.fill('[data-testid="fast-charging"]', '5');

      // Add Swiss-specific factors
      await page.check('[data-testid="include-vignette"]');
      await page.check('[data-testid="winter-adjustment"]');
      await page.check('[data-testid="canton-incentives"]');

      // Calculate TCO
      await page.click('[data-testid="calculate-tco-submit"]');

      // Wait for calculation results
      await page.waitForSelector('[data-testid="tco-results"]');

      // Verify TCO results
      await expect(page.locator('[data-testid="total-tco"]')).toBeVisible();
      await expect(page.locator('[data-testid="tco-per-month"]')).toBeVisible();
      await expect(page.locator('[data-testid="tco-per-kilometer"]')).toBeVisible();

      // Verify Swiss-specific costs are included
      await expect(page.locator('[data-testid="vignette-cost"]')).toContainText('CHF 40');
      await expect(page.locator('[data-testid="canton-incentive"]')).toBeVisible();

      // Save TCO calculation
      await page.click('[data-testid="save-tco-calculation"]');
      await expect(page.locator('[data-testid="save-tco-success"]')).toBeVisible();
    });

    test('should compare multiple vehicle configurations', async () => {
      // Configure first vehicle (LYRIQ)
      await page.click('[data-testid="vehicle-lyriq"]');
      await page.click('[data-testid="variant-luxury"]');
      await page.click('[data-testid="add-to-comparison"]');

      // Configure second vehicle (VISTIQ)
      await page.click('[data-testid="back-to-vehicles"]');
      await page.click('[data-testid="vehicle-vistiq"]');
      await page.click('[data-testid="variant-sport"]');
      await page.click('[data-testid="add-to-comparison"]');

      // Open comparison view
      await page.click('[data-testid="view-comparison"]');
      await expect(page).toHaveURL(/.*\/vehicles\/compare/);

      // Verify comparison table
      await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="vehicle-lyriq-row"]')).toBeVisible();
      await expect(page.locator('[data-testid="vehicle-vistiq-row"]')).toBeVisible();

      // Compare specifications
      const lyriqRange = page.locator('[data-testid="lyriq-range"]');
      const vistiqRange = page.locator('[data-testid="vistiq-range"]');
      
      await expect(lyriqRange).toContainText('502 km');
      await expect(vistiqRange).toContainText('550 km');

      // Compare prices
      const lyriqPrice = page.locator('[data-testid="lyriq-price"]');
      const vistiqPrice = page.locator('[data-testid="vistiq-price"]');
      
      await expect(lyriqPrice).toContainText('CHF');
      await expect(vistiqPrice).toContainText('CHF');
    });
  });

  test.describe('Lead Management & Customer Insights Flow', () => {
    test.beforeEach(async () => {
      // Login and ensure we have customer data
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);
    });

    test('should generate AI-powered customer insights', async () => {
      // Navigate to customer profile
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="customer-card"]').first();

      // Trigger AI analysis
      await page.click('[data-testid="generate-insights"]');

      // Wait for AI analysis to complete
      await page.waitForSelector('[data-testid="insights-results"]', { timeout: 30000 });

      // Verify insights are displayed
      await expect(page.locator('[data-testid="lead-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommended-vehicle"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-selling-points"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();

      // Verify Swiss market specific recommendations
      await expect(page.locator('[data-testid="swiss-incentives"]')).toBeVisible();
      await expect(page.locator('[data-testid="canton-benefits"]')).toBeVisible();
    });

    test('should track customer interactions and sentiment', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="customer-card"]').first();

      // Add new interaction
      await page.click('[data-testid="add-interaction"]');
      await page.selectOption('[data-testid="interaction-type"]', 'email');
      await page.fill('[data-testid="interaction-subject"]', 'LYRIQ Interesse');
      await page.fill('[data-testid="interaction-content"]', 'Kunde zeigt starkes Interesse am LYRIQ Premium. Möchte Probefahrt vereinbaren.');
      await page.click('[data-testid="save-interaction"]');

      // Verify interaction is saved
      await expect(page.locator('[data-testid="interaction-history"]')).toContainText('LYRIQ Interesse');

      // Trigger sentiment analysis
      await page.click('[data-testid="analyze-sentiment"]');
      await page.waitForSelector('[data-testid="sentiment-results"]');

      // Verify sentiment analysis results
      await expect(page.locator('[data-testid="overall-sentiment"]')).toBeVisible();
      await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-phrases"]')).toContainText('Interesse');
    });

    test('should create and track follow-up tasks', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="customer-card"]').first();

      // Create follow-up task
      await page.click('[data-testid="create-follow-up"]');
      await page.selectOption('[data-testid="task-type"]', 'phone_call');
      await page.fill('[data-testid="task-description"]', 'Probefahrt-Termin vereinbaren');
      await page.fill('[data-testid="task-due-date"]', '2024-12-31');
      await page.selectOption('[data-testid="task-priority"]', 'high');
      await page.click('[data-testid="save-task"]');

      // Verify task is created
      await expect(page.locator('[data-testid="follow-up-tasks"]')).toContainText('Probefahrt-Termin');
      await expect(page.locator('[data-testid="task-priority-high"]')).toBeVisible();

      // Mark task as completed
      await page.click('[data-testid="complete-task"]');
      await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();
    });

    test('should generate and send personalized proposals', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="customer-card"]').first();

      // Generate proposal
      await page.click('[data-testid="generate-proposal"]');

      // Configure proposal settings
      await page.selectOption('[data-testid="proposal-vehicle"]', 'lyriq-premium');
      await page.selectOption('[data-testid="financing-type"]', 'lease');
      await page.fill('[data-testid="lease-duration"]', '48');
      await page.fill('[data-testid="annual-mileage"]', '15000');

      // Add Swiss market incentives
      await page.check('[data-testid="include-canton-incentives"]');
      await page.check('[data-testid="include-ev-benefits"]');

      // Generate proposal
      await page.click('[data-testid="generate-proposal-submit"]');

      // Wait for proposal generation
      await page.waitForSelector('[data-testid="proposal-preview"]');

      // Verify proposal content
      await expect(page.locator('[data-testid="proposal-vehicle-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="proposal-financing"]')).toBeVisible();
      await expect(page.locator('[data-testid="proposal-incentives"]')).toBeVisible();
      await expect(page.locator('[data-testid="proposal-total-cost"]')).toContainText('CHF');

      // Send proposal
      await page.fill('[data-testid="proposal-recipient"]', 'customer@example.ch');
      await page.fill('[data-testid="proposal-message"]', 'Anbei finden Sie Ihr personalisiertes CADILLAC LYRIQ Angebot.');
      await page.click('[data-testid="send-proposal"]');

      // Verify proposal sent
      await expect(page.locator('[data-testid="proposal-sent-success"]')).toBeVisible();
    });
  });

  test.describe('Swiss Market Specific Features', () => {
    test.beforeEach(async () => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);
    });

    test('should integrate with Swiss APIs (Handelsregister)', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="add-customer-button"]');
      await page.click('[data-testid="customerType-business"]');

      // Use UID lookup
      await page.fill('[data-testid="uid-lookup-input"]', 'CHE-123.456.789');
      await page.click('[data-testid="lookup-company"]');

      // Wait for API response
      await page.waitForSelector('[data-testid="company-lookup-results"]');

      // Verify company data is populated
      await expect(page.locator('[data-testid="companyName-input"]')).toHaveValue();
      await expect(page.locator('[data-testid="legalForm-select"]')).toHaveValue('AG');
    });

    test('should calculate canton-specific tax benefits', async () => {
      await page.click('[data-testid="nav-vehicles"]');
      await page.click('[data-testid="vehicle-lyriq"]');
      await page.click('[data-testid="calculate-tco"]');

      // Test different cantons
      const cantons = ['ZH', 'GE', 'BE', 'TI'];
      
      for (const canton of cantons) {
        await page.selectOption('[data-testid="canton-select"]', canton);
        await page.fill('[data-testid="annual-kilometers"]', '15000');
        await page.click('[data-testid="calculate-tco-submit"]');
        
        await page.waitForSelector('[data-testid="tco-results"]');
        
        // Verify canton-specific tax information
        await expect(page.locator('[data-testid="road-tax"]')).toBeVisible();
        await expect(page.locator('[data-testid="registration-fee"]')).toBeVisible();
        await expect(page.locator(`[data-testid="canton-${canton.toLowerCase()}-benefits"]`)).toBeVisible();
        
        // Clear results for next iteration
        await page.click('[data-testid="clear-tco"]');
      }
    });

    test('should display multilingual support (DE/FR/IT)', async () => {
      // Test German (default)
      await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard');

      // Switch to French
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-french"]');
      await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Tableau de bord');

      // Switch to Italian
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-italian"]');
      await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Cruscotto');

      // Switch back to German
      await page.click('[data-testid="language-selector"]');
      await page.click('[data-testid="language-german"]');
      await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard');
    });

    test('should validate Swiss address formats', async () => {
      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="add-customer-button"]');

      // Test various Swiss address formats
      const addresses = [
        { street: 'Bahnhofstrasse 42', postalCode: '8001', city: 'Zürich' },
        { street: 'Rue du Rhône 25', postalCode: '1201', city: 'Genève' },
        { street: 'Freie Strasse 8', postalCode: '4001', city: 'Basel' },
        { street: 'Via Nassa 12', postalCode: '6900', city: 'Lugano' },
      ];

      for (const address of addresses) {
        await page.fill('[data-testid="street-input"]', address.street);
        await page.fill('[data-testid="postalCode-input"]', address.postalCode);
        await page.fill('[data-testid="city-input"]', address.city);

        // Trigger address validation
        await page.click('[data-testid="validate-address"]');
        
        // Should show valid address confirmation
        await expect(page.locator('[data-testid="address-valid"]')).toBeVisible();
        
        // Clear fields for next iteration
        await page.fill('[data-testid="street-input"]', '');
        await page.fill('[data-testid="postalCode-input"]', '');
        await page.fill('[data-testid="city-input"]', '');
      }
    });
  });

  test.describe('Performance & Accessibility Tests', () => {
    test('should load dashboard within performance budget', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      
      await page.waitForURL(/.*\/dashboard/);
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Dashboard should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be accessible with screen readers', async () => {
      await page.goto('http://localhost:3000');
      
      // Check for proper ARIA labels
      await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible();
      await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
      
      // Check for proper heading structure
      const h1Elements = await page.locator('h1').count();
      expect(h1Elements).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should work on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000');
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
      
      // Test touch interactions
      await page.tap('[data-testid="nav-customers"]');
      await expect(page).toHaveURL(/.*\/customers/);
      
      // Verify responsive layout
      await expect(page.locator('[data-testid="mobile-customer-list"]')).toBeVisible();
    });
  });

  test.describe('Error Handling & Edge Cases', () => {
    test('should handle network failures gracefully', async () => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);

      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      // Try to perform an action that requires API call
      await page.click('[data-testid="nav-customers"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle session expiration', async () => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);

      // Simulate expired token
      await page.evaluate(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

      // Try to access protected resource
      await page.click('[data-testid="nav-customers"]');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('should validate form inputs and show helpful errors', async () => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email-input"]', 'admin@cadillac.ch');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
      await page.click('[data-testid="login-submit"]');
      await page.waitForURL(/.*\/dashboard/);

      await page.click('[data-testid="nav-customers"]');
      await page.click('[data-testid="add-customer-button"]');

      // Submit form with invalid data
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="phone-input"]', '123'); // Invalid Swiss phone
      await page.fill('[data-testid="postalCode-input"]', '99999'); // Invalid Swiss postal code
      await page.click('[data-testid="create-customer-submit"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Valid email required');
      await expect(page.locator('[data-testid="phone-error"]')).toContainText('Valid Swiss phone number required');
      await expect(page.locator('[data-testid="postalCode-error"]')).toContainText('Valid Swiss postal code required');
    });
  });
});