/**
 * Test Data Generator
 * Generates random test data for E2E tests
 */
export class TestDataGenerator {
  /**
   * Generate random email
   */
  static email(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test${timestamp}.${random}@example.com`;
  }

  /**
   * Generate random password
   */
  static password(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Generate random username
   */
  static username(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `testuser${timestamp}${random}`;
  }

  /**
   * Generate random name
   */
  static name(): string {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate random phone number
   */
  static phoneNumber(): string {
    return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  }

  /**
   * Generate random URL
   */
  static url(): string {
    const domains = ['example.com', 'test.com', 'demo.com', 'sample.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `https://${domain}/${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate random sentence
   */
  static sentence(wordCount: number = 10): string {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
      'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
      'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
      'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
      'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
      'est', 'laborum'
    ];

    let sentence = '';
    for (let i = 0; i < wordCount; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      sentence += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    }

    return sentence.trim() + '.';
  }

  /**
   * Generate random paragraph
   */
  static paragraph(sentenceCount: number = 5): string {
    let paragraph = '';
    for (let i = 0; i < sentenceCount; i++) {
      paragraph += this.sentence(Math.floor(Math.random() * 10 + 5)) + ' ';
    }
    return paragraph.trim();
  }

  /**
   * Generate random number
   */
  static number(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float
   */
  static float(min: number = 0, max: number = 100, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  /**
   * Generate random date
   */
  static date(startYear: number = 2020, endYear: number = 2030): Date {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Generate random date string
   */
  static dateString(format: 'ISO' | 'US' | 'EU' = 'ISO'): string {
    const date = this.date();
    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      case 'EU':
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  }

  /**
   * Generate random boolean
   */
  static boolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Generate random array element
   */
  static arrayElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random array subset
   */
  static arraySubset<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(size, array.length));
  }

  /**
   * Generate random object
   */
  static object<T>(template: T): T {
    const result: any = {};
    for (const key in template) {
      const value = template[key];
      if (typeof value === 'string') {
        result[key] = this.sentence(3);
      } else if (typeof value === 'number') {
        result[key] = this.number(0, 100);
      } else if (typeof value === 'boolean') {
        result[key] = this.boolean();
      } else if (Array.isArray(value)) {
        result[key] = this.arraySubset(value, Math.floor(Math.random() * value.length));
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.object(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Generate spreadsheet name
   */
  static spreadsheetName(): string {
    const prefixes = ['Sales', 'Revenue', 'Budget', 'Inventory', 'Project', 'Marketing'];
    const suffixes = ['Report', 'Tracker', 'Dashboard', 'Analysis', 'Summary', 'Plan'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix} ${this.dateString('ISO')}`;
  }

  /**
   * Generate cell value
   */
  static cellValue(type: 'text' | 'number' | 'date' | 'formula' = 'text'): string {
    switch (type) {
      case 'text':
        return this.sentence(3);
      case 'number':
        return this.number(0, 10000).toString();
      case 'date':
        return this.dateString('US');
      case 'formula':
        return `=SUM(A1:A${this.number(1, 100)})`;
    }
  }

  /**
   * Generate formula
   */
  static formula(type: 'SUM' | 'AVERAGE' | 'COUNT' | 'MAX' | 'MIN' | 'IF'): string {
    const functions = {
      SUM: (range: string) => `=SUM(${range})`,
      AVERAGE: (range: string) => `=AVERAGE(${range})`,
      COUNT: (range: string) => `=COUNT(${range})`,
      MAX: (range: string) => `=MAX(${range})`,
      MIN: (range: string) => `=MIN(${range})`,
      IF: (range: string) => `=IF(${range}>100, "High", "Low")`
    };
    const startRow = this.number(1, 10);
    const endRow = this.number(11, 20);
    const column = ['A', 'B', 'C', 'D'][this.number(0, 3)];
    const range = `${column}${startRow}:${column}${endRow}`;
    return functions[type](range);
  }

  /**
   * Generate badge name
   */
  static badgeName(): string {
    const badges = [
      'First Steps', 'Spreadsheet Master', 'Collaborator', 'Community Leader',
      'Template Creator', 'Helpful Contributor', 'Problem Solver', 'Data Wizard',
      'Formula Expert', 'Chart Champion', 'Analytics Pro', 'Forum Regular'
    ];
    return this.arrayElement(badges);
  }

  /**
   * Generate thread title
   */
  static threadTitle(): string {
    return `${this.sentence(4).slice(0, -1)}?`;
  }

  /**
   * Generate template name
   */
  static templateName(): string {
    const categories = ['Budget', 'Schedule', 'Inventory', 'Sales', 'Marketing', 'Project'];
    const types = ['Tracker', 'Template', 'Calculator', 'Planner', 'Dashboard'];
    const category = this.arrayElement(categories);
    const type = this.arrayElement(types);
    return `${category} ${type}`;
  }

  /**
   * Generate metric name
   */
  static metricName(): string {
    const metrics = [
      'Revenue', 'Users', 'Sessions', 'Page Views', 'Conversion Rate',
      'Bounce Rate', 'Average Order Value', 'Customer Acquisition Cost',
      'Return on Investment', 'Net Promoter Score'
    ];
    return this.arrayElement(metrics);
  }

  /**
   * Generate report name
   */
  static reportName(): string {
    const types = ['Monthly', 'Quarterly', 'Annual', 'Weekly', 'Daily'];
    const categories = ['Sales', 'Performance', 'Marketing', 'Financial', 'Operational'];
    const type = this.arrayElement(types);
    const category = this.arrayElement(categories);
    return `${type} ${category} Report`;
  }

  /**
   * Generate widget title
   */
  static widgetTitle(): string {
    const widgets = ['Total Revenue', 'User Growth', 'Conversion Funnel', 'Sales Trend'];
    return this.arrayElement(widgets);
  }

  /**
   * Generate chart type
   */
  static chartType(): 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel' | 'heatmap' {
    const types = ['line', 'bar', 'pie', 'area', 'scatter', 'funnel', 'heatmap'];
    return this.arrayElement(types);
  }

  /**
   * Generate 2FA code
   */
  static twoFactorCode(): string {
    return this.number(100000, 999999).toString();
  }

  /**
   * Generate reset token
   */
  static resetToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate API key
   */
  static apiKey(): string {
    return `sk_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
  }

  /**
   * Generate spreadsheet ID
   */
  static spreadsheetId(): string {
    return `spreadsheet_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate user ID
   */
  static userId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate thread ID
   */
  static threadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate template ID
   */
  static templateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate dashboard ID
   */
  static dashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate color
   */
  static color(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return this.arrayElement(colors);
  }

  /**
   * Generate locale
   */
  static locale(): string {
    const locales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA'];
    return this.arrayElement(locales);
  }

  /**
   * Generate currency code
   */
  static currency(): string {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'CAD', 'AUD'];
    return this.arrayElement(currencies);
  }

  /**
   * Generate timezone
   */
  static timezone(): string {
    const timezones = [
      'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Seoul', 'Australia/Sydney'
    ];
    return this.arrayElement(timezones);
  }

  /**
   * Generate device info
   */
  static device(): { type: string; viewport: { width: number; height: number } } {
    const devices = [
      { type: 'Desktop', viewport: { width: 1920, height: 1080 } },
      { type: 'Laptop', viewport: { width: 1366, height: 768 } },
      { type: 'Tablet', viewport: { width: 768, height: 1024 } },
      { type: 'Mobile', viewport: { width: 375, height: 667 } },
      { type: 'Mobile Large', viewport: { width: 414, height: 896 } }
    ];
    return this.arrayElement(devices);
  }
}
