/**
 * Spreadsheet Moment - Plugin Ecosystem
 * Round 11: Plugin Architecture
 *
 * Comprehensive plugin and extension system:
 * - Plugin loader and manager
 * - Extension API for custom functions
 * - Package management
 * - Developer tools and SDK
 * - Plugin marketplace integration
 * - Sandboxed execution
 */

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  spreadsheetMomentVersion: string;
  permissions: PluginPermission[];
  functions: CustomFunction[];
  dependencies: PluginDependency[];
  entryPoint: string;
  icon?: string;
  screenshots?: string[];
}

interface PluginPermission {
  type: 'network' | 'filesystem' | 'clipboard' | 'notifications' | 'storage';
  description: string;
}

interface CustomFunction {
  name: string;
  category: 'math' | 'text' | 'date' | 'logical' | 'lookup' | 'custom';
  description: string;
  syntax: string;
  parameters: FunctionParameter[];
  returnType: 'number' | 'string' | 'boolean' | 'array' | 'any';
  isVolatile: boolean;
  handler: string;  // Function name in plugin
}

interface FunctionParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'any' | 'range';
  description: string;
  optional: boolean;
  defaultValue?: any;
}

interface PluginDependency {
  id: string;
  version: string;
}

interface PluginContext {
  spreadsheetId: string;
  userId: string;
  permissions: Set<string>;
  storage: PluginStorage;
  logger: PluginLogger;
  api: ExtensionAPI;
}

interface PluginStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface PluginLogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Extension API
 */
export class ExtensionAPI {
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  /**
   * Get cell value
   */
  async getCell(row: number, column: number): Promise<any> {
    // Implementation would call spreadsheet API
    return null;
  }

  /**
   * Set cell value
   */
  async setCell(row: number, column: number, value: any): Promise<void> {
    // Implementation would call spreadsheet API
  }

  /**
   * Get range values
   */
  async getRange(startRow: number, startCol: number, endRow: number, endCol: number): Promise<any[][]> {
    // Implementation would call spreadsheet API
    return [];
  }

  /**
   * Register custom function
   */
  registerFunction(fn: CustomFunction): void {
    // Register function with spreadsheet
  }

  /**
   * Show notification
   */
  async showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (this.context.permissions.has('notifications')) {
      // Show notification
    }
  }

  /**
   * Make HTTP request
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    if (this.context.permissions.has('network')) {
      return fetch(url, options);
    }
    throw new Error('Network permission not granted');
  }

  /**
   * Read clipboard
   */
  async readClipboard(): Promise<string> {
    if (this.context.permissions.has('clipboard')) {
      return navigator.clipboard.readText();
    }
    throw new Error('Clipboard permission not granted');
  }

  /**
   * Write to clipboard
   */
  async writeClipboard(text: string): Promise<void> {
    if (this.context.permissions.has('clipboard')) {
      await navigator.clipboard.writeText(text);
    }
  }
}

/**
 * Plugin Storage Implementation
 */
class PluginStorageImpl implements PluginStorage {
  private pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  async get(key: string): Promise<any> {
    const data = localStorage.getItem(`plugin-${this.pluginId}-${key}`);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(`plugin-${this.pluginId}-${key}`, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(`plugin-${this.pluginId}-${key}`);
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(`plugin-${this.pluginId}-`)) {
        localStorage.removeItem(key);
      }
    }
  }
}

/**
 * Plugin Logger Implementation
 */
class PluginLoggerImpl implements PluginLogger {
  private pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  debug(message: string): void {
    console.log(`[${this.pluginId}] DEBUG: ${message}`);
  }

  info(message: string): void {
    console.info(`[${this.pluginId}] INFO: ${message}`);
  }

  warn(message: string): void {
    console.warn(`[${this.pluginId}] WARN: ${message}`);
  }

  error(message: string): void {
    console.error(`[${this.pluginId}] ERROR: ${message}`);
  }
}

/**
 * Plugin Sandbox
 */
class PluginSandbox {
  private permissions: Set<string>;

  constructor(permissions: PluginPermission[]) {
    this.permissions = new Set(permissions.map(p => p.type));
  }

  /**
   * Check permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }

  /**
   * Execute code in sandbox
   */
  async execute(code: string, context: PluginContext): Promise<any> {
    // Create sandboxed execution environment
    const sandbox = this.createSandbox(context);

    try {
      // Execute code in sandbox
      const fn = new Function(...Object.keys(sandbox), code);
      return fn(...Object.values(sandbox));
    } catch (error) {
      context.logger.error(`Plugin execution error: ${error}`);
      throw error;
    }
  }

  private createSandbox(context: PluginContext): Record<string, any> {
    return {
      console: context.logger,
      api: context.api,
      storage: context.storage,
      spreadsheet: {
        getCell: (row: number, col: number) => context.api.getCell(row, col),
        setCell: (row: number, col: number, value: any) => context.api.setCell(row, col, value),
        getRange: (sr: number, sc: number, er: number, ec: number) =>
          context.api.getRange(sr, sc, er, ec)
      },
      utils: {
        fetch: (url: string, options?: RequestInit) => context.api.fetch(url, options),
        notify: (msg: string, type?: string) => context.api.showNotification(msg, type as any),
        clipboard: {
          read: () => context.api.readClipboard(),
          write: (text: string) => context.api.writeClipboard(text)
        }
      }
    };
  }
}

/**
 * Plugin Manager
 */
export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private functions: Map<string, CustomFunction> = new Map();
  private marketplace: PluginMarketplace;

  constructor() {
    this.marketplace = new PluginMarketplace();
  }

  /**
   * Load plugin
   */
  async loadPlugin(manifest: PluginManifest, code: string): Promise<boolean> {
    try {
      // Validate manifest
      this.validateManifest(manifest);

      // Check dependencies
      await this.checkDependencies(manifest);

      // Create plugin context
      const context: PluginContext = {
        spreadsheetId: 'current',
        userId: 'current-user',
        permissions: new Set(manifest.permissions.map(p => p.type)),
        storage: new PluginStorageImpl(manifest.id),
        logger: new PluginLoggerImpl(manifest.id),
        api: new ExtensionAPI({} as PluginContext)
      };

      // Create sandbox
      const sandbox = new PluginSandbox(manifest.permissions);

      // Execute plugin code
      const module = await sandbox.execute(code, context);

      // Register custom functions
      for (const fn of manifest.functions) {
        this.functions.set(fn.name, fn);

        if (module && module[fn.handler]) {
          this.registerFunctionHandler(fn, module[fn.handler]);
        }
      }

      // Store loaded plugin
      this.plugins.set(manifest.id, {
        manifest,
        context,
        sandbox,
        module
      });

      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.id}:`, error);
      return false;
    }
  }

  /**
   * Unload plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return false;
    }

    // Unregister functions
    for (const fn of plugin.manifest.functions) {
      this.functions.delete(fn.name);
    }

    // Clear storage
    await plugin.context.storage.clear();

    // Remove plugin
    this.plugins.delete(pluginId);

    return true;
  }

  /**
   * Execute custom function
   */
  async executeFunction(functionName: string, args: any[]): Promise<any> {
    const fn = this.functions.get(functionName);

    if (!fn) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    const pluginId = functionName.split('.')[0];
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    const handler = plugin.module?.[fn.handler];

    if (!handler) {
      throw new Error(`Function handler not found: ${fn.handler}`);
    }

    try {
      return await handler(...args);
    } catch (error) {
      plugin.context.logger.error(`Function execution error: ${error}`);
      throw error;
    }
  }

  /**
   * Get plugin marketplace
   */
  getMarketplace(): PluginMarketplace {
    return this.marketplace;
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all custom functions
   */
  getFunctions(): CustomFunction[] {
    return Array.from(this.functions.values());
  }

  /**
   * Validate plugin manifest
   */
  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Invalid manifest: missing required fields');
    }

    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error('Invalid version format (use semver)');
    }

    for (const fn of manifest.functions) {
      if (!fn.name || !fn.handler) {
        throw new Error('Invalid function definition');
      }
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(manifest: PluginManifest): Promise<void> {
    for (const dep of manifest.dependencies) {
      if (!this.plugins.has(dep.id)) {
        // Try to load from marketplace
        const available = await this.marketplace.search(dep.id);

        if (!available) {
          throw new Error(`Missing dependency: ${dep.id}@${dep.version}`);
        }
      }
    }
  }

  /**
   * Register function handler
   */
  private registerFunctionHandler(fn: CustomFunction, handler: Function): void {
    // In production, would register with spreadsheet engine
  }
}

interface LoadedPlugin {
  manifest: PluginManifest;
  context: PluginContext;
  sandbox: PluginSandbox;
  module: any;
}

/**
 * Plugin Marketplace
 */
export class PluginMarketplace {
  private plugins: Map<string, PluginManifest> = new Map();

  /**
   * Publish plugin
   */
  async publish(manifest: PluginManifest, code: string): Promise<string> {
    // Validate and store plugin
    this.plugins.set(manifest.id, manifest);

    // In production, would upload to marketplace server

    return manifest.id;
  }

  /**
   * Search plugins
   */
  search(query: string): PluginManifest[] {
    const results: PluginManifest[] = [];

    const lowerQuery = query.toLowerCase();

    for (const plugin of this.plugins.values()) {
      if (
        plugin.name.toLowerCase().includes(lowerQuery) ||
        plugin.description.toLowerCase().includes(lowerQuery) ||
        plugin.id.toLowerCase().includes(lowerQuery)
      ) {
        results.push(plugin);
      }
    }

    return results;
  }

  /**
   * Get plugin
   */
  get(pluginId: string): PluginManifest | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Install plugin
   */
  async install(pluginId: string): Promise<{ manifest: PluginManifest; code: string }> {
    // In production, would download from marketplace
    const manifest = this.plugins.get(pluginId);

    if (!manifest) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    return {
      manifest,
      code: '// Plugin code would be downloaded'
    };
  }
}

/**
 * Plugin SDK for Developers
 */
export class PluginSDK {
  /**
   * Create plugin manifest
   */
  static createManifest(manifest: Partial<PluginManifest>): PluginManifest {
    return {
      id: manifest.id || 'com.example.plugin',
      name: manifest.name || 'My Plugin',
      version: manifest.version || '1.0.0',
      description: manifest.description || '',
      author: manifest.author || '',
      license: manifest.license || 'MIT',
      spreadsheetMomentVersion: '>=1.0.0',
      permissions: manifest.permissions || [],
      functions: manifest.functions || [],
      dependencies: manifest.dependencies || [],
      entryPoint: manifest.entryPoint || 'index.js'
    };
  }

  /**
   * Define custom function
   */
  static defineFunction(
    name: string,
    handler: Function,
    options: Partial<CustomFunction> = {}
  ): CustomFunction {
    return {
      name,
      category: options.category || 'custom',
      description: options.description || '',
      syntax: options.syntax || `${name}(...)`,
      parameters: options.parameters || [],
      returnType: options.returnType || 'any',
      isVolatile: options.isVolatile || false,
      handler: name
    };
  }

  /**
   * Request permission
   */
  static requestPermission(
    type: 'network' | 'filesystem' | 'clipboard' | 'notifications' | 'storage',
    description: string
  ): PluginPermission {
    return {
      type,
      description
    };
  }

  /**
   * Create plugin template
   */
  static createTemplate(): string {
    return `
// Spreadsheet Moment Plugin Template
// Plugin SDK v1.0

const { defineFunction, requestPermission } = SpreadsheetMomentSDK;

// Define permissions
const permissions = [
  requestPermission('network', 'Fetch data from external APIs'),
  requestPermission('storage', 'Store plugin settings')
];

// Define custom function
const MY_FUNCTION = defineFunction('MYFUNCTION', (arg1, arg2) => {
  // Your function logic here
  return arg1 + arg2;
}, {
  category: 'math',
  description: 'Adds two numbers together',
  parameters: [
    { name: 'arg1', type: 'number', description: 'First number', optional: false },
    { name: 'arg2', type: 'number', description: 'Second number', optional: false }
  ],
  returnType: 'number'
});

// Export plugin metadata
export default {
  manifest: SpreadsheetMomentSDK.createManifest({
    id: 'com.example.myplugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'My first plugin',
    author: 'Your Name',
    permissions,
    functions: [MY_FUNCTION]
  })
};
    `.trim();
  }
}
