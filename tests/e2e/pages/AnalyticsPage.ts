import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Analytics Dashboard Page Object Model
 * Handles viewing metrics, generating reports, configuring widgets, and data visualization
 */
export class AnalyticsPage extends BasePage {
  // Locators
  readonly analyticsLink: string;
  readonly dashboardTitle: string;
  readonly metricsOverview: string;
  readonly metricCard: string;
  readonly generateReportButton: string;
  readonly reportTypeSelect: string;
  readonly dateRangeStart: string;
  readonly dateRangeEnd: string;
  readonly exportReportButton: string;
  readonly scheduleReportButton: string;
  readonly addWidgetButton: string;
  readonly widgetSettingsButton: string;
  readonly removeWidgetButton: string;
  readonly chartWidget: string;
  readonly tableWidget: string;
  readonly numberWidget: string;
  readonly gaugeWidget: string;
  readonly funnelWidget: string;
  readonly heatmapWidget: string;
  readonly scatterWidget: string;
  readonly lineWidget: string;
  readonly barWidget: string;
  readonly pieWidget: string;
  readonly areaWidget: string;
  readonly filterPanel: string;
  readonly addFilterButton: string;
  readonly removeFilterButton: string;
  readonly filterTypeSelect: string;
  readonly filterValueInput: string;
  readonly applyFiltersButton: string;
  readonly clearFiltersButton: string;
  readonly timeRangeSelect: string;
  readonly comparisonToggle: string;
  readonly previousPeriodButton: string;
  readonly samePeriodLastYearButton: string;
  readonly customRangeButton: string;
  readonly drillDownButton: string;
  readonly drillUpButton: string;
  readonly dataExportButton: string;
  readonly exportFormatSelect: string;
  readonly shareDashboardButton: string;
  readonly scheduleDashboardButton: string;
  readonly dashboardTemplateSelect: string;
  readonly createDashboardButton: string;
  readonly deleteDashboardButton: string;
  readonly renameDashboardButton: string;
  readonly cloneDashboardButton: string;
  readonly dashboardList: string;
  readonly favoriteDashboardButton: string;
  readonly dashboardSearch: string;
  readonly refreshDataButton: string;
  readonly autoRefreshToggle: string;
  readonly refreshIntervalSelect: string;
  readonly fullScreenButton: string;
  readonly printButton: string;
  readonly trendIndicator: string;
  readonly percentageChange: string;
  readonly absoluteChange: string;
  readonly tooltip: string;
  readonly legend: string;
  readonly xAxis: string;
  readonly yAxis: string;
  readonly gridLines: string;
  readonly dataLabels: string;
  readonly annotations: string;
  readonly benchmarkLine: string;
  readonly targetLine: string;
  readonly alertThreshold: string;
  readonly createAlertButton: string;
  readonly alertList: string;
  readonly alertConditionSelect: string;
  readonly alertThresholdInput: string;
  readonly alertNotificationMethod: string;
  readonly apiKeyManagement: string;
  readonly generateApiKeyButton: string;
  readonly revokeApiKeyButton: string;
  readonly apiDocumentationLink: string;
  readonly embedDashboardButton: string;
  readonly embedCode: string;
  readonly copyEmbedCodeButton: string;
  readonly integrationList: string;
  readonly addIntegrationButton: string;
  readonly integrationSettings: string;
  readonly dataSourceList: string;
  readonly addDataSourceButton: string;
  readonly dataSourceSettings: string;
  readonly connectionStatus: string;
  readonly lastSyncTime: string;
  readonly syncNowButton: string;
  readonly dataQualityIndicator: string;
  readonly missingDataAlert: string;
  readonly outlierDetection: string;
  readonly anomalyDetection: string;
  readonly forecastButton: string;
  readonly forecastPeriodSelect: string;
  readonly forecastConfidenceToggle: string;
  readonly insightPanel: string;
  readonly generateInsightButton: string;
  readonly aiRecommendations: string;
  readonly optimizationSuggestions: string;

  constructor(page: Page) {
    super(page);
    this.analyticsLink = '[data-testid="analytics-link"]';
    this.dashboardTitle = '[data-testid="dashboard-title"]';
    this.metricsOverview = '[data-testid="metrics-overview"]';
    this.metricCard = '[data-testid="metric-card"]';
    this.generateReportButton = '[data-testid="generate-report"]';
    this.reportTypeSelect = '[data-testid="report-type"]';
    this.dateRangeStart = '[data-testid="date-range-start"]';
    this.dateRangeEnd = '[data-testid="date-range-end"]';
    this.exportReportButton = '[data-testid="export-report"]';
    this.scheduleReportButton = '[data-testid="schedule-report"]';
    this.addWidgetButton = '[data-testid="add-widget"]';
    this.widgetSettingsButton = '[data-testid="widget-settings"]';
    this.removeWidgetButton = '[data-testid="remove-widget"]';
    this.chartWidget = '[data-testid="chart-widget"]';
    this.tableWidget = '[data-testid="table-widget"]';
    this.numberWidget = '[data-testid="number-widget"]';
    this.gaugeWidget = '[data-testid="gauge-widget"]';
    this.funnelWidget = '[data-testid="funnel-widget"]';
    this.heatmapWidget = '[data-testid="heatmap-widget"]';
    this.scatterWidget = '[data-testid="scatter-widget"]';
    this.lineWidget = '[data-testid="line-widget"]';
    this.barWidget = '[data-testid="bar-widget"]';
    this.pieWidget = '[data-testid="pie-widget"]';
    this.areaWidget = '[data-testid="area-widget"]';
    this.filterPanel = '[data-testid="filter-panel"]';
    this.addFilterButton = '[data-testid="add-filter"]';
    this.removeFilterButton = '[data-testid="remove-filter"]';
    this.filterTypeSelect = '[data-testid="filter-type"]';
    this.filterValueInput = '[data-testid="filter-value"]';
    this.applyFiltersButton = '[data-testid="apply-filters"]';
    this.clearFiltersButton = '[data-testid="clear-filters"]';
    this.timeRangeSelect = '[data-testid="time-range"]';
    this.comparisonToggle = '[data-testid="comparison-toggle"]';
    this.previousPeriodButton = '[data-testid="previous-period"]';
    this.samePeriodLastYearButton = '[data-testid="same-period-last-year"]';
    this.customRangeButton = '[data-testid="custom-range"]';
    this.drillDownButton = '[data-testid="drill-down"]';
    this.drillUpButton = '[data-testid="drill-up"]';
    this.dataExportButton = '[data-testid="data-export"]';
    this.exportFormatSelect = '[data-testid="export-format"]';
    this.shareDashboardButton = '[data-testid="share-dashboard"]';
    this.scheduleDashboardButton = '[data-testid="schedule-dashboard"]';
    this.dashboardTemplateSelect = '[data-testid="dashboard-template"]';
    this.createDashboardButton = '[data-testid="create-dashboard"]';
    this.deleteDashboardButton = '[data-testid="delete-dashboard"]';
    this.renameDashboardButton = '[data-testid="rename-dashboard"]';
    this.cloneDashboardButton = '[data-testid="clone-dashboard"]';
    this.dashboardList = '[data-testid="dashboard-list"]';
    this.favoriteDashboardButton = '[data-testid="favorite-dashboard"]';
    this.dashboardSearch = '[data-testid="dashboard-search"]';
    this.refreshDataButton = '[data-testid="refresh-data"]';
    this.autoRefreshToggle = '[data-testid="auto-refresh-toggle"]';
    this.refreshIntervalSelect = '[data-testid="refresh-interval"]';
    this.fullScreenButton = '[data-testid="full-screen"]';
    this.printButton = '[data-testid="print"]';
    this.trendIndicator = '[data-testid="trend-indicator"]';
    this.percentageChange = '[data-testid="percentage-change"]';
    this.absoluteChange = '[data-testid="absolute-change"]';
    this.tooltip = '[data-testid="tooltip"]';
    this.legend = '[data-testid="legend"]';
    this.xAxis = '[data-testid="x-axis"]';
    this.yAxis = '[data-testid="y-axis"]';
    this.gridLines = '[data-testid="grid-lines"]';
    this.dataLabels = '[data-testid="data-labels"]';
    this.annotations = '[data-testid="annotations"]';
    this.benchmarkLine = '[data-testid="benchmark-line"]';
    this.targetLine = '[data-testid="target-line"]';
    this.alertThreshold = '[data-testid="alert-threshold"]';
    this.createAlertButton = '[data-testid="create-alert"]';
    this.alertList = '[data-testid="alert-list"]';
    this.alertConditionSelect = '[data-testid="alert-condition"]';
    this.alertThresholdInput = '[data-testid="alert-threshold"]';
    this.alertNotificationMethod = '[data-testid="alert-notification"]';
    this.apiKeyManagement = '[data-testid="api-key-management"]';
    this.generateApiKeyButton = '[data-testid="generate-api-key"]';
    this.revokeApiKeyButton = '[data-testid="revoke-api-key"]';
    this.apiDocumentationLink = '[data-testid="api-docs"]';
    this.embedDashboardButton = '[data-testid="embed-dashboard"]';
    this.embedCode = '[data-testid="embed-code"]';
    this.copyEmbedCodeButton = '[data-testid="copy-embed-code"]';
    this.integrationList = '[data-testid="integration-list"]';
    this.addIntegrationButton = '[data-testid="add-integration"]';
    this.integrationSettings = '[data-testid="integration-settings"]';
    this.dataSourceList = '[data-testid="data-source-list"]';
    this.addDataSourceButton = '[data-testid="add-data-source"]';
    this.dataSourceSettings = '[data-testid="data-source-settings"]';
    this.connectionStatus = '[data-testid="connection-status"]';
    this.lastSyncTime = '[data-testid="last-sync-time"]';
    this.syncNowButton = '[data-testid="sync-now"]';
    this.dataQualityIndicator = '[data-testid="data-quality"]';
    this.missingDataAlert = '[data-testid="missing-data-alert"]';
    this.outlierDetection = '[data-testid="outlier-detection"]';
    this.anomalyDetection = '[data-testid="anomaly-detection"]';
    this.forecastButton = '[data-testid="forecast"]';
    this.forecastPeriodSelect = '[data-testid="forecast-period"]';
    this.forecastConfidenceToggle = '[data-testid="forecast-confidence"]';
    this.insightPanel = '[data-testid="insight-panel"]';
    this.generateInsightButton = '[data-testid="generate-insight"]';
    this.aiRecommendations = '[data-testid="ai-recommendations"]';
    this.optimizationSuggestions = '[data-testid="optimization-suggestions"]';
  }

  /**
   * Navigate to analytics dashboard
   */
  async gotoAnalytics(): Promise<void> {
    await this.goto('/analytics');
    await this.waitForLoadState();
  }

  /**
   * Navigate to specific dashboard
   */
  async gotoDashboard(dashboardId: string): Promise<void> {
    await this.goto(`/analytics/dashboard/${dashboardId}`);
    await this.waitForLoadState();
  }

  /**
   * View metrics overview
   */
  async viewMetricsOverview(): Promise<void> {
    await this.gotoAnalytics();
    await this.verifyVisible(this.metricsOverview);
  }

  /**
   * Get metric value
   */
  async getMetricValue(metricName: string): Promise<string> {
    const metricSelector = `[data-metric="${metricName}"]`;
    return await this.getText(metricSelector);
  }

  /**
   * Verify metric value
   */
  async verifyMetricValue(metricName: string, expectedValue: string): Promise<void> {
    const actualValue = await this.getMetricValue(metricName);
    expect(actualValue).toContain(expectedValue);
  }

  /**
   * Generate report
   */
  async generateReport(reportType: string, startDate: string, endDate: string): Promise<void> {
    await this.click(this.generateReportButton);
    await this.selectOption(this.reportTypeSelect, reportType);
    await this.fill(this.dateRangeStart, startDate);
    await this.fill(this.dateRangeEnd, endDate);
    await this.click(this.generateReportButton);
    await this.wait(2000);
  }

  /**
   * Export report
   */
  async exportReport(format: 'pdf' | 'excel' | 'csv' | 'json'): Promise<void> {
    await this.click(this.exportReportButton);
    await this.selectOption(this.exportFormatSelect, format);
    await this.wait(2000);
  }

  /**
   * Schedule report
   */
  async scheduleReport(frequency: 'daily' | 'weekly' | 'monthly', recipients: string[]): Promise<void> {
    await this.click(this.scheduleReportButton);
    await this.selectOption('[data-testid="schedule-frequency"]', frequency);
    for (const recipient of recipients) {
      await this.fill('[data-testid="schedule-recipients"]', recipient);
      await this.keyboardPress('Enter');
    }
    await this.click('[data-testid="save-schedule"]');
    await this.wait(1000);
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(widgetType: string, title: string): Promise<void> {
    await this.click(this.addWidgetButton);
    await this.selectOption('[data-testid="widget-type"]', widgetType);
    await this.fill('[data-testid="widget-title"]', title);
    await this.click('[data-testid="save-widget"]');
    await this.wait(1000);
  }

  /**
   * Configure widget settings
   */
  async configureWidget(widgetId: string, settings: Record<string, any>): Promise<void> {
    await this.click(`[data-widget="${widgetId}"] ${this.widgetSettingsButton}`);
    for (const [key, value] of Object.entries(settings)) {
      const settingInput = `[data-setting="${key}"]`;
      if (await this.isVisible(settingInput)) {
        await this.fill(settingInput, String(value));
      }
    }
    await this.click('[data-testid="save-settings"]');
    await this.wait(1000);
  }

  /**
   * Remove widget
   */
  async removeWidget(widgetId: string): Promise<void> {
    await this.click(`[data-widget="${widgetId}"]`);
    await this.click(`[data-widget="${widgetId}"] ${this.removeWidgetButton}`);
    await this.wait(500);
  }

  /**
   * Add filter
   */
  async addFilter(filterType: string, filterValue: string): Promise<void> {
    await this.click(this.addFilterButton);
    await this.selectOption(this.filterTypeSelect, filterType);
    await this.fill(this.filterValueInput, filterValue);
    await this.click(this.applyFiltersButton);
    await this.wait(1000);
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    await this.click(this.clearFiltersButton);
    await this.wait(1000);
  }

  /**
   * Set time range
   */
  async setTimeRange(range: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'custom'): Promise<void> {
    await this.selectOption(this.timeRangeSelect, range);
    if (range === 'custom') {
      await this.click(this.customRangeButton);
      await this.wait(500);
    }
    await this.wait(1000);
  }

  /**
   * Enable comparison mode
   */
  async enableComparison(mode: 'previous' | 'lastYear'): Promise<void> {
    await this.click(this.comparisonToggle);
    if (mode === 'previous') {
      await this.click(this.previousPeriodButton);
    } else {
      await this.click(this.samePeriodLastYearButton);
    }
    await this.wait(1000);
  }

  /**
   * Drill down into data
   */
  async drillDown(dimension: string): Promise<void> {
    await this.click(this.drillDownButton);
    await this.selectOption('[data-testid="drill-dimension"]', dimension);
    await this.wait(1000);
  }

  /**
   * Drill up from current level
   */
  async drillUp(): Promise<void> {
    await this.click(this.drillUpButton);
    await this.wait(1000);
  }

  /**
   * Share dashboard
   */
  async shareDashboard(emails: string[], permission: 'view' | 'edit'): Promise<void> {
    await this.click(this.shareDashboardButton);
    for (const email of emails) {
      await this.fill('[data-testid="share-email"]', email);
      await this.keyboardPress('Enter');
    }
    await this.selectOption('[data-testid="share-permission"]', permission);
    await this.click('[data-testid="send-invite"]');
    await this.wait(1000);
  }

  /**
   * Create new dashboard
   */
  async createDashboard(name: string, template?: string): Promise<void> {
    await this.click(this.createDashboardButton);
    await this.fill('[data-testid="dashboard-name"]', name);
    if (template) {
      await this.selectOption(this.dashboardTemplateSelect, template);
    }
    await this.click('[data-testid="save-dashboard"]');
    await this.wait(1000);
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<void> {
    await this.gotoDashboard(dashboardId);
    await this.click(this.deleteDashboardButton);
    await this.click('[data-testid="confirm-delete"]');
    await this.wait(1000);
  }

  /**
   * Rename dashboard
   */
  async renameDashboard(newName: string): Promise<void> {
    await this.click(this.renameDashboardButton);
    await this.fill('[data-testid="new-dashboard-name"]', newName);
    await this.click('[data-testid="save-rename"]');
    await this.wait(1000);
  }

  /**
   * Clone dashboard
   */
  async cloneDashboard(sourceDashboardId: string, newName: string): Promise<void> {
    await this.gotoDashboard(sourceDashboardId);
    await this.click(this.cloneDashboardButton);
    await this.fill('[data-testid="cloned-dashboard-name"]', newName);
    await this.click('[data-testid="save-clone"]');
    await this.wait(1000);
  }

  /**
   * Favorite dashboard
   */
  async favoriteDashboard(dashboardId: string): Promise<void> {
    await this.click(`[data-dashboard="${dashboardId}"] ${this.favoriteDashboardButton}`);
    await this.wait(500);
  }

  /**
   * Search dashboards
   */
  async searchDashboards(searchTerm: string): Promise<void> {
    await this.fill(this.dashboardSearch, searchTerm);
    await this.wait(1000);
  }

  /**
   * Refresh data
   */
  async refreshData(): Promise<void> {
    await this.click(this.refreshDataButton);
    await this.wait(2000);
  }

  /**
   * Enable auto refresh
   */
  async enableAutoRefresh(interval: '1min' | '5min' | '15min' | '30min' | '1hour'): Promise<void> {
    await this.click(this.autoRefreshToggle);
    await this.selectOption(this.refreshIntervalSelect, interval);
    await this.wait(1000);
  }

  /**
   * Enter fullscreen mode
   */
  async enterFullscreen(): Promise<void> {
    await this.click(this.fullScreenButton);
    await this.wait(500);
  }

  /**
   * Print dashboard
   */
  async printDashboard(): Promise<void> {
    await this.click(this.printButton);
    await this.wait(1000);
  }

  /**
   * Get trend indicator
   */
  async getTrend(metricName: string): Promise<'up' | 'down' | 'neutral'> {
    const trendSelector = `[data-metric="${metricName}"] ${this.trendIndicator}`;
    const trendClass = await this.getAttribute(trendSelector, 'class');
    if (trendClass?.includes('trend-up')) return 'up';
    if (trendClass?.includes('trend-down')) return 'down';
    return 'neutral';
  }

  /**
   * Get percentage change
   */
  async getPercentageChange(metricName: string): Promise<string> {
    const selector = `[data-metric="${metricName}"] ${this.percentageChange}`;
    return await this.getText(selector);
  }

  /**
   * Get absolute change
   */
  async getAbsoluteChange(metricName: string): Promise<string> {
    const selector = `[data-metric="${metricName}"] ${this.absoluteChange}`;
    return await this.getText(selector);
  }

  /**
   * Hover over chart element
   */
  async hoverChartElement(widgetId: string, elementIndex: number): Promise<void> {
    await this.hover(`[data-widget="${widgetId}"] [data-element="${elementIndex}"]`);
    await this.wait(500);
  }

  /**
   * Get tooltip content
   */
  async getTooltipContent(): Promise<string> {
    return await this.getText(this.tooltip);
  }

  /**
   * Toggle legend visibility
   */
  async toggleLegend(widgetId: string): Promise<void> {
    await this.click(`[data-widget="${widgetId}"] ${this.legend}`);
    await this.wait(500);
  }

  /**
   * Create alert
   */
  async createAlert(metricName: string, condition: string, threshold: string, notificationMethod: string): Promise<void> {
    await this.click(this.createAlertButton);
    await this.selectOption('[data-testid="alert-metric"]', metricName);
    await this.selectOption(this.alertConditionSelect, condition);
    await this.fill(this.alertThresholdInput, threshold);
    await this.selectOption(this.alertNotificationMethod, notificationMethod);
    await this.click('[data-testid="save-alert"]');
    await this.wait(1000);
  }

  /**
   * Generate API key
   */
  async generateApiKey(): Promise<string> {
    await this.click(this.apiKeyManagement);
    await this.click(this.generateApiKeyButton);
    await this.wait(1000);
    const apiKey = await this.getText('[data-testid="api-key-value"]');
    return apiKey;
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    await this.click(this.apiKeyManagement);
    await this.click(`[data-key="${keyId}"] ${this.revokeApiKeyButton}`);
    await this.click('[data-testid="confirm-revoke"]');
    await this.wait(1000);
  }

  /**
   * Embed dashboard
   */
  async embedDashboard(): Promise<string> {
    await this.click(this.embedDashboardButton);
    await this.wait(1000);
    const embedCode = await this.getAttribute(this.embedCode, 'value');
    return embedCode || '';
  }

  /**
   * Add integration
   */
  async addIntegration(integrationType: string, settings: Record<string, string>): Promise<void> {
    await this.click(this.addIntegrationButton);
    await this.selectOption('[data-testid="integration-type"]', integrationType);
    for (const [key, value] of Object.entries(settings)) {
      await this.fill(`[data-setting="${key}"]`, value);
    }
    await this.click('[data-testid="save-integration"]');
    await this.wait(2000);
  }

  /**
   * Add data source
   */
  async addDataSource(sourceType: string, connectionString: string): Promise<void> {
    await this.click(this.addDataSourceButton);
    await this.selectOption('[data-testid="source-type"]', sourceType);
    await this.fill('[data-testid="connection-string"]', connectionString);
    await this.click('[data-testid="test-connection"]');
    await this.wait(2000);
    await this.click('[data-testid="save-source"]');
    await this.wait(1000);
  }

  /**
   * Sync data source
   */
  async syncDataSource(sourceId: string): Promise<void> {
    await this.click(`[data-source="${sourceId}"] ${this.syncNowButton}`);
    await this.wait(5000);
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(sourceId: string): Promise<'connected' | 'disconnected' | 'error'> {
    const statusSelector = `[data-source="${sourceId}"] ${this.connectionStatus}`;
    const statusText = await this.getText(statusSelector);
    return statusText.toLowerCase() as any;
  }

  /**
   * Enable forecast
   */
  async enableForecast(period: '7days' | '30days' | '90days', showConfidence: boolean): Promise<void> {
    await this.click(this.forecastButton);
    await this.selectOption(this.forecastPeriodSelect, period);
    if (showConfidence) {
      await this.click(this.forecastConfidenceToggle);
    }
    await this.click('[data-testid="apply-forecast"]');
    await this.wait(2000);
  }

  /**
   * Generate AI insights
   */
  async generateInsights(): Promise<void> {
    await this.click(this.generateInsightButton);
    await this.wait(3000);
    await this.verifyVisible(this.insightPanel);
  }

  /**
   * Get AI recommendations
   */
  async getAIRecommendations(): Promise<string[]> {
    await this.verifyVisible(this.aiRecommendations);
    const recommendations = await this.getAllText('[data-testid="recommendation-item"]');
    return recommendations;
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(): Promise<string[]> {
    await this.verifyVisible(this.optimizationSuggestions);
    const suggestions = await this.getAllText('[data-testid="suggestion-item"]');
    return suggestions;
  }

  /**
   * Verify widget visible
   */
  async verifyWidgetVisible(widgetId: string): Promise<void> {
    await this.verifyVisible(`[data-widget="${widgetId}"]`);
  }

  /**
   * Verify widget not visible
   */
  async verifyWidgetNotVisible(widgetId: string): Promise<void> {
    await this.verifyHidden(`[data-widget="${widgetId}"]`);
  }

  /**
   * Verify metric card visible
   */
  async verifyMetricCardVisible(metricName: string): Promise<void> {
    await this.verifyVisible(`[data-metric="${metricName}"]`);
  }

  /**
   * Verify trend is positive
   */
  async verifyTrendPositive(metricName: string): Promise<void> {
    const trend = await this.getTrend(metricName);
    expect(trend).toBe('up');
  }

  /**
   * Verify trend is negative
   */
  async verifyTrendNegative(metricName: string): Promise<void> {
    const trend = await this.getTrend(metricName);
    expect(trend).toBe('down');
  }

  /**
   * Verify data quality indicator
   */
  async verifyDataQuality(status: 'good' | 'warning' | 'error'): Promise<void> {
    await this.verifyVisible(`${this.dataQualityIndicator}[data-status="${status}"]`);
  }

  /**
   * Verify alert visible
   */
  async verifyAlertVisible(alertId: string): Promise<void> {
    await this.verifyVisible(`[data-alert="${alertId}"]`);
  }

  /**
   * Verify integration active
   */
  async verifyIntegrationActive(integrationId: string): Promise<void> {
    await this.verifyHasClass(`[data-integration="${integrationId}"]`, 'active');
  }

  /**
   * Verify data source connected
   */
  async verifyDataSourceConnected(sourceId: string): Promise<void> {
    const status = await this.getConnectionStatus(sourceId);
    expect(status).toBe('connected');
  }
}
