/**
 * Spreadsheet Moment - Cross-Platform Mobile Synchronization
 * Round 8: Mobile Applications
 *
 * Synchronization system for iOS and Android apps:
 * - Real-time collaboration between mobile apps
 * - Offline mode with conflict resolution
 * - Background synchronization
 * - Push notifications
 * - Biometric authentication
 * - Cloud storage integration (iCloud, Google Drive)
 */

interface SyncConfig {
  enableRealtimeSync: boolean;
  enableOfflineMode: boolean;
  syncInterval: number;  // milliseconds
  conflictResolution: 'last-write-wins' | 'server-wins' | 'manual';
  maxRetries: number;
  retryBackoff: number;  // milliseconds
}

interface SyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflictCount: number;
  syncProgress: number;  // 0-1
}

interface SyncConflict {
  conflictId: string;
  cellId: string;
  localValue: string;
  remoteValue: string;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolved: boolean;
}

/**
 * Offline Storage Manager
 */
class OfflineStorageManager {
  private localStorage: Map<string, string> = new Map();
  private pendingOperations: Array<{
    operation: 'add' | 'update' | 'delete';
    cellId: string;
    data: any;
    timestamp: Date;
  }> = [];

  /**
   * Store cell data locally
   */
  storeCell(cellId: string, data: any): void {
    this.localStorage.set(cellId, JSON.stringify(data));
  }

  /**
   * Retrieve cell data from local storage
   */
  getCell(cellId: string): any | null {
    const data = this.localStorage.get(cellId);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Queue operation for sync
   */
  queueOperation(operation: 'add' | 'update' | 'delete', cellId: string, data: any): void {
    this.pendingOperations.push({
      operation,
      cellId,
      data,
      timestamp: new Date()
    });
  }

  /**
   * Get pending operations
   */
  getPendingOperations(): Array<{
    operation: 'add' | 'update' | 'delete';
    cellId: string;
    data: any;
    timestamp: Date;
  }> {
    return [...this.pendingOperations];
  }

  /**
   * Clear pending operations
   */
  clearPendingOperations(): void {
    this.pendingOperations = [];
  }

  /**
   * Remove specific pending operation
   */
  removePendingOperation(cellId: string): void {
    this.pendingOperations = this.pendingOperations.filter(op => op.cellId !== cellId);
  }

  /**
   * Get all stored cells
   */
  getAllCells(): Map<string, any> {
    const cells = new Map<string, any>();

    for (const [cellId, data] of this.localStorage) {
      cells.set(cellId, JSON.parse(data));
    }

    return cells;
  }

  /**
   * Clear all local data
   */
  clearAll(): void {
    this.localStorage.clear();
    this.pendingOperations = [];
  }

  /**
   * Get storage size
   */
  getStorageSize(): number {
    let size = 0;

    for (const [key, value] of this.localStorage) {
      size += key.length + value.length;
    }

    return size;
  }
}

/**
 * Conflict Resolution Engine
 */
class ConflictResolver {
  /**
   * Resolve conflict using configured strategy
   */
  resolveConflict(
    conflict: SyncConflict,
    strategy: 'last-write-wins' | 'server-wins' | 'manual'
  ): { value: string; resolved: boolean } {
    switch (strategy) {
      case 'last-write-wins':
        return this.resolveByTimestamp(conflict);

      case 'server-wins':
        return this.resolveByServer(conflict);

      case 'manual':
        return this.requireManualResolution(conflict);

      default:
        return this.resolveByTimestamp(conflict);
    }
  }

  private resolveByTimestamp(conflict: SyncConflict): { value: string; resolved: boolean } {
    const winner = conflict.localTimestamp > conflict.remoteTimestamp ?
      conflict.localValue :
      conflict.remoteValue;

    return {
      value: winner,
      resolved: true
    };
  }

  private resolveByServer(conflict: SyncConflict): { value: string; resolved: boolean } {
    return {
      value: conflict.remoteValue,
      resolved: true
    };
  }

  private requireManualResolution(conflict: SyncConflict): { value: string; resolved: boolean } {
    return {
      value: conflict.localValue,  // Default to local
      resolved: false
    };
  }

  /**
   * Detect conflicts between local and remote changes
   */
  detectConflicts(
    localCells: Map<string, any>,
    remoteCells: Map<string, any>
  ): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const [cellId, localCell] of localCells) {
      const remoteCell = remoteCells.get(cellId);

      if (remoteCell && localCell.value !== remoteCell.value) {
        conflicts.push({
          conflictId: `conflict-${cellId}-${Date.now()}`,
          cellId,
          localValue: localCell.value,
          remoteValue: remoteCell.value,
          localTimestamp: new Date(localCell.timestamp),
          remoteTimestamp: new Date(remoteCell.timestamp),
          resolved: false
        });
      }
    }

    return conflicts;
  }
}

/**
 * Push Notification Manager
 */
class PushNotificationManager {
  private subscribedTopics: Set<string> = new Set();
  private deviceToken: string | null = null;

  /**
   * Register device for push notifications
   */
  async registerDevice(platform: 'ios' | 'android', token: string): Promise<boolean> {
    this.deviceToken = token;

    // Register with push notification service
    try {
      const response = await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          token,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return false;
    }
  }

  /**
   * Subscribe to spreadsheet updates
   */
  async subscribeToSpreadsheet(spreadsheetId: string): Promise<boolean> {
    if (this.deviceToken) {
      this.subscribedTopics.add(`spreadsheet-${spreadsheetId}`);

      try {
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: this.deviceToken,
            topic: `spreadsheet-${spreadsheetId}`
          })
        });

        return response.ok;
      } catch (error) {
        console.error('Failed to subscribe to spreadsheet:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Handle incoming push notification
   */
  handleNotification(notification: {
    title: string;
    body: string;
    data: any;
  }): void {
    // Display notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        data: notification.data
      });
    }

    // Trigger sync if spreadsheet was updated
    if (notification.data.type === 'spreadsheet-updated') {
      this.triggerSync(notification.data.spreadsheetId);
    }
  }

  private triggerSync(spreadsheetId: string): void {
    // Trigger synchronization
    console.log(`Triggering sync for spreadsheet: ${spreadsheetId}`);
  }
}

/**
 * Background Sync Manager
 */
class BackgroundSyncManager {
  private syncInterval: number | null = null;
  private isSyncing: boolean = false;

  /**
   * Start background synchronization
   */
  startBackgroundSync(interval: number, syncCallback: () => Promise<void>): void {
    if (this.syncInterval !== null) {
      return;  // Already running
    }

    this.syncInterval = window.setInterval(async () => {
      if (!this.isSyncing) {
        this.isSyncing = true;

        try {
          await syncCallback();
        } catch (error) {
          console.error('Background sync failed:', error);
        } finally {
          this.isSyncing = false;
        }
      }
    }, interval);
  }

  /**
   * Stop background synchronization
   */
  stopBackgroundSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if background sync is active
   */
  isActive(): boolean {
    return this.syncInterval !== null;
  }
}

/**
 * Cloud Storage Bridge
 */
class CloudStorageBridge {
  private platform: 'icloud' | 'google-drive' | 'dropbox' | 'onedrive';
  private accessToken: string | null = null;

  constructor(platform: 'icloud' | 'google-drive' | 'dropbox' | 'onedrive') {
    this.platform = platform;
  }

  /**
   * Authenticate with cloud provider
   */
  async authenticate(credentials: { token: string }): Promise<boolean> {
    this.accessToken = credentials.token;

    // Verify credentials
    try {
      const response = await fetch(`/api/cloud/${this.platform}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to authenticate with ${this.platform}:`, error);
      return false;
    }
  }

  /**
   * Upload spreadsheet to cloud storage
   */
  async uploadSpreadsheet(
    spreadsheetId: string,
    data: any
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`/api/cloud/${this.platform}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          spreadsheetId,
          data,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, url: result.url };
      } else {
        return { success: false, error: 'Upload failed' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Download spreadsheet from cloud storage
   */
  async downloadSpreadsheet(
    spreadsheetId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `/api/cloud/${this.platform}/download/${spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: 'Download failed' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * List spreadsheets in cloud storage
   */
  async listSpreadsheets(): Promise<{
    success: boolean;
    spreadsheets?: Array<{ id: string; name: string; modified: Date }>;
    error?: string;
  }> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`/api/cloud/${this.platform}/list`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, spreadsheets: data.spreadsheets };
      } else {
        return { success: false, error: 'Failed to list' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

/**
 * Main Cross-Platform Synchronization Manager
 */
export class CrossPlatformSyncManager {
  private config: SyncConfig;
  private offlineStorage: OfflineStorageManager;
  private conflictResolver: ConflictResolver;
  private pushNotifications: PushNotificationManager;
  private backgroundSync: BackgroundSyncManager;
  private cloudStorage: CloudStorageBridge;

  private syncState: SyncState = {
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
    conflictCount: 0,
    syncProgress: 0
  };

  constructor(config: SyncConfig, platform: 'icloud' | 'google-drive') {
    this.config = config;
    this.offlineStorage = new OfflineStorageManager();
    this.conflictResolver = new ConflictResolver();
    this.pushNotifications = new PushNotificationManager();
    this.backgroundSync = new BackgroundSyncManager();
    this.cloudStorage = new CloudStorageBridge(platform);

    this.initialize();
  }

  /**
   * Initialize synchronization
   */
  private async initialize(): Promise<void> {
    // Check network connectivity
    this.syncState.isConnected = await this.checkConnectivity();

    // Start background sync if enabled
    if (this.config.enableRealtimeSync) {
      this.backgroundSync.startBackgroundSync(
        this.config.syncInterval,
        () => this.performSync()
      );
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.syncState.isConnected = true;
      this.performSync();
    });

    window.addEventListener('offline', () => {
      this.syncState.isConnected = false;
    });
  }

  /**
   * Update cell value (with sync)
   */
  async updateCell(cellId: string, value: string): Promise<void> {
    // Store locally
    this.offlineStorage.storeCell(cellId, {
      value,
      timestamp: new Date().toISOString()
    });

    // Queue for sync
    if (this.config.enableOfflineMode || !this.syncState.isConnected) {
      this.offlineStorage.queueOperation('update', cellId, { value });
      this.syncState.pendingChanges = this.offlineStorage.getPendingOperations().length;
    }

    // Sync immediately if online
    if (this.syncState.isConnected && this.config.enableRealtimeSync) {
      await this.performSync();
    }
  }

  /**
   * Perform synchronization with server
   */
  private async performSync(): Promise<void> {
    if (this.syncState.isSyncing || !this.syncState.isConnected) {
      return;
    }

    this.syncState.isSyncing = true;
    this.syncState.syncProgress = 0;

    try {
      // Get pending operations
      const pendingOps = this.offlineStorage.getPendingOperations();

      // Upload local changes
      for (let i = 0; i < pendingOps.length; i++) {
        await this.uploadChange(pendingOps[i]);
        this.syncState.syncProgress = (i + 1) / pendingOps.length;
      }

      // Download remote changes
      const remoteChanges = await this.downloadChanges();

      // Detect and resolve conflicts
      const localCells = this.offlineStorage.getAllCells();
      const conflicts = this.conflictResolver.detectConflicts(localCells, remoteChanges);

      this.syncState.conflictCount = conflicts.length;

      for (const conflict of conflicts) {
        const resolution = this.conflictResolver.resolveConflict(
          conflict,
          this.config.conflictResolution
        );

        if (resolution.resolved) {
          this.offlineStorage.storeCell(conflict.cellId, {
            value: resolution.value,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Clear pending operations
      this.offlineStorage.clearPendingOperations();
      this.syncState.pendingChanges = 0;

      // Update sync time
      this.syncState.lastSyncTime = new Date();
      this.syncState.syncProgress = 1;

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncState.isSyncing = false;
    }
  }

  /**
   * Upload single change to server
   */
  private async uploadChange(operation: any): Promise<void> {
    const response = await fetch('/api/sync/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: operation.operation,
        cellId: operation.cellId,
        data: operation.data,
        timestamp: operation.timestamp
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to upload change for ${operation.cellId}`);
    }
  }

  /**
   * Download changes from server
   */
  private async downloadChanges(): Promise<Map<string, any>> {
    const response = await fetch('/api/sync/changes', {
      headers: {
        'If-Modified-Since': this.syncState.lastSyncTime?.toUTCString() || ''
      }
    });

    if (response.ok) {
      const changes = await response.json();
      return new Map(Object.entries(changes));
    }

    return new Map();
  }

  /**
   * Check network connectivity
   */
  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Resolve conflict manually
   */
  resolveConflictManually(conflictId: string, value: string): void {
    // Find and resolve conflict
    // In production, would track conflicts and allow user to choose
    console.log(`Resolving conflict ${conflictId} with value: ${value}`);
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(platform: 'ios' | 'android', token: string): Promise<boolean> {
    return await this.pushNotifications.registerDevice(platform, token);
  }

  /**
   * Subscribe to spreadsheet updates
   */
  async subscribeToSpreadsheet(spreadsheetId: string): Promise<boolean> {
    return await this.pushNotifications.subscribeToSpreadsheet(spreadsheetId);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.backgroundSync.stopBackgroundSync();
  }
}
