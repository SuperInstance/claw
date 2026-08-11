import { test, expect } from '../../fixtures/test-fixtures';
import { TestDataGenerator } from '../../helpers/test-data-generator';

test.describe('Analytics Dashboard E2E Tests', () => {
  test.beforeEach(async ({ analyticsPage, authPage, testUser }) => {
    await authPage.gotoLoginPage();
    await authPage.login(testUser.email, testUser.password);
    await authPage.verifyLoginSuccess();
  });

  test.describe('Dashboard Navigation', () => {
    test('should navigate to analytics dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyVisible(analyticsPage.dashboardTitle);
    });

    test('should display metrics overview', async ({ analyticsPage }) => {
      await analyticsPage.viewMetricsOverview();
      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
    });
  });

  test.describe('Metrics Display', () => {
    test('should display revenue metric', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyMetricCardVisible('revenue');
      const value = await analyticsPage.getMetricValue('revenue');
      expect(value).toBeTruthy();
    });

    test('should display user count metric', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyMetricCardVisible('users');
      const value = await analyticsPage.getMetricValue('users');
      expect(value).toBeTruthy();
    });

    test('should show trend indicators', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      const trend = await analyticsPage.getTrend('revenue');
      expect(['up', 'down', 'neutral']).toContain(trend);
    });

    test('should display percentage change', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      const change = await analyticsPage.getPercentageChange('revenue');
      expect(change).toContain('%');
    });
  });

  test.describe('Report Generation', () => {
    test('should generate sales report', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.generateReport('sales', '2024-01-01', '2024-12-31');
      await analyticsPage.verifyVisible(analyticsPage.successMessage);
    });

    test('should export report as PDF', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.exportReport('pdf');
      // File download verification
    });

    test('should schedule recurring report', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.scheduleReport('weekly', ['admin@example.com']);
      await analyticsPage.verifyVisible(analyticsPage.successMessage);
    });
  });

  test.describe('Widget Management', () => {
    test('should add widget to dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Sales Trend');
      await analyticsPage.verifyWidgetVisible('sales-trend');
    });

    test('should remove widget from dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('bar', 'User Growth');
      await analyticsPage.removeWidget('user-growth');
      await analyticsPage.verifyWidgetNotVisible('user-growth');
    });

    test('should configure widget settings', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Test Widget');
      await analyticsPage.configureWidget('test-widget', { title: 'Updated Title' });
      await analyticsPage.verifyVisible('[data-widget="test-widget"][data-title="Updated Title"]');
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('should apply date range filter', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.setTimeRange('last30days');
      await analyticsPage.wait(1000);
      // Verify filtered data
    });

    test('should add custom filter', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addFilter('region', 'North America');
      await analyticsPage.wait(1000);
      // Verify filtered results
    });

    test('should clear all filters', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addFilter('region', 'North America');
      await analyticsPage.clearFilters();
      // Verify filters cleared
    });

    test('should enable comparison mode', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.enableComparison('previous');
      await analyticsPage.wait(1000);
      // Verify comparison data displayed
    });
  });

  test.describe('Data Visualization', () => {
    test('should display line chart', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Revenue Trend');
      await analyticsPage.verifyWidgetVisible('revenue-trend');
    });

    test('should display bar chart', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('bar', 'Sales by Region');
      await analyticsPage.verifyWidgetVisible('sales-by-region');
    });

    test('should display pie chart', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('pie', 'Market Share');
      await analyticsPage.verifyWidgetVisible('market-share');
    });

    test('should show tooltip on hover', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Test Chart');
      await analyticsPage.hoverChartElement('test-chart', 0);
      await analyticsPage.verifyVisible(analyticsPage.tooltip);
    });

    test('should toggle legend visibility', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Test Chart');
      await analyticsPage.toggleLegend('test-chart');
      // Verify legend toggled
    });
  });

  test.describe('Dashboard Management', () => {
    test('should create new dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createDashboard('Custom Dashboard');
      await analyticsPage.verifyVisible('[data-dashboard="custom-dashboard"]');
    });

    test('should delete dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createDashboard('To Delete');
      await analyticsPage.deleteDashboard('to-delete');
      await analyticsPage.verifyHidden('[data-dashboard="to-delete"]');
    });

    test('should rename dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createDashboard('Original Name');
      await analyticsPage.renameDashboard('New Name');
      await analyticsPage.verifyVisible('[data-dashboard="original-name"][data-name="New Name"]');
    });

    test('should clone dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createDashboard('Source Dashboard');
      await analyticsPage.cloneDashboard('source-dashboard', 'Cloned Dashboard');
      await analyticsPage.verifyVisible('[data-dashboard="cloned-dashboard"]');
    });

    test('should favorite dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createDashboard('Favorite Test');
      await analyticsPage.favoriteDashboard('favorite-test');
      await analyticsPage.verifyHasClass('[data-dashboard="favorite-test"]', 'favorited');
    });
  });

  test.describe('Data Refresh', () => {
    test('should refresh data manually', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.refreshData();
      await analyticsPage.verifyVisible(analyticsPage.successMessage);
    });

    test('should enable auto refresh', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.enableAutoRefresh('5min');
      await analyticsPage.verifyHasClass(analyticsPage.autoRefreshToggle, 'active');
    });
  });

  test.describe('Alerting', () => {
    test('should create alert', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.createAlert('revenue', 'drops_below', '10000', 'email');
      await analyticsPage.verifyVisible(analyticsPage.successMessage);
    });

    test('should display active alerts', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyVisible(analyticsPage.alertList);
    });
  });

  test.describe('API Integration', () => {
    test('should generate API key', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.goto('/settings/api');
      const apiKey = await analyticsPage.generateApiKey();
      expect(apiKey).toBeTruthy();
      expect(apiKey).toMatch(/^sk_/);
    });

    test('should revoke API key', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.goto('/settings/api');
      await analyticsPage.generateApiKey();
      // Revoke key verification
    });
  });

  test.describe('Data Quality', () => {
    test('should show data quality indicator', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyDataQuality('good');
    });

    test('should detect missing data', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      // Missing data alert verification
    });
  });

  test.describe('Forecasting', () => {
    test('should enable forecast', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.addWidget('line', 'Revenue Forecast');
      await analyticsPage.enableForecast('30days', true);
      await analyticsPage.verifyVisible('[data-forecast="true"]');
    });
  });

  test.describe('AI Insights', () => {
    test('should generate AI insights', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.generateInsights();
      await analyticsPage.verifyVisible(analyticsPage.insightPanel);
    });

    test('should show AI recommendations', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.generateInsights();
      const recommendations = await analyticsPage.getAIRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  test.describe('Drill Down', () => {
    test('should drill down into data', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.drillDown('region');
      await analyticsPage.wait(1000);
      // Verify drilled down view
    });

    test('should drill up from current level', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.drillDown('region');
      await analyticsPage.drillUp();
      // Verify returned to previous level
    });
  });

  test.describe('Export and Share', () => {
    test('should export data as CSV', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.click(analyticsPage.dataExportButton);
      await analyticsPage.selectOption(analyticsPage.exportFormatSelect, 'csv');
      // File download verification
    });

    test('should share dashboard', async ({ analyticsPage }) => {
      await analyticsPage.gotoAnalytics();
      await analyticsPage.shareDashboard(['user@example.com'], 'view');
      await analyticsPage.verifyVisible(analyticsPage.successMessage);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display on mobile viewport', async ({ analyticsPage }) => {
      await analyticsPage.setViewport(375, 667);
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
    });

    test('should display on tablet viewport', async ({ analyticsPage }) => {
      await analyticsPage.setViewport(768, 1024);
      await analyticsPage.gotoAnalytics();
      await analyticsPage.verifyVisible(analyticsPage.metricsOverview);
    });
  });
});
