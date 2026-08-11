/**
 * Spreadsheet Moment - Enterprise Access Control System
 * Round 10: Enterprise Features
 *
 * Implements comprehensive access control for enterprise:
 * - Role-based access control (RBAC)
 * - Team and organization management
 * - Fine-grained permissions
 * - Audit logging
 * - Data retention policies
 * - Dynamic rule evaluation
 */

interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  roles: string[];
  attributes: Record<string, string>;
  createdAt: Date;
  lastLogin: Date;
  enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  condition?: string;
  effect: 'allow' | 'deny';
}

interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  members: string[];
  leads: string[];
  parentId?: string;
  permissions: Permission[];
  createdAt: Date;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  result: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface AccessRequest {
  id: string;
  userId: string;
  resource: string;
  resourceId: string;
  action: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewReason?: string;
}

/**
 * Access Control Engine
 */
export class AccessControlEngine {
  private users: Map<string, User> = new Map();
  private roles: Map<string, Role> = new Map();
  private teams: Map<string, Team> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private accessRequests: Map<string, AccessRequest> = new Map();

  constructor() {
    this.initializeSystemRoles();
  }

  /**
   * Initialize system roles
   */
  private initializeSystemRoles(): void {
    // Owner role - full access
    this.createRole({
      id: 'role-owner',
      name: 'Owner',
      description: 'Full access to all resources',
      permissions: [
        { id: 'perm-all', resource: '*', action: '*', effect: 'allow' }
      ],
      isSystem: true
    });

    // Admin role - administrative access
    this.createRole({
      id: 'role-admin',
      name: 'Admin',
      description: 'Administrative access',
      permissions: [
        { id: 'perm-users-read', resource: 'users', action: 'read', effect: 'allow' },
        { id: 'perm-users-write', resource: 'users', action: 'write', effect: 'allow' },
        { id: 'perm-teams-read', resource: 'teams', action: 'read', effect: 'allow' },
        { id: 'perm-teams-write', resource: 'teams', action: 'write', effect: 'allow' },
        { id: 'perm-roles-read', resource: 'roles', action: 'read', effect: 'allow' },
        { id: 'perm-audit-read', resource: 'audit', action: 'read', effect: 'allow' },
        { id: 'perm-spreadsheets-all', resource: 'spreadsheets', action: '*', effect: 'allow' }
      ],
      isSystem: true
    });

    // Editor role - can edit spreadsheets
    this.createRole({
      id: 'role-editor',
      name: 'Editor',
      description: 'Can create and edit spreadsheets',
      permissions: [
        { id: 'perm-spreadsheets-read', resource: 'spreadsheets', action: 'read', effect: 'allow' },
        { id: 'perm-spreadsheets-write', resource: 'spreadsheets', action: 'write', effect: 'allow' },
        { id: 'perm-spreadsheets-delete', resource: 'spreadsheets', action: 'delete', effect: 'allow' }
      ],
      isSystem: true
    });

    // Viewer role - read-only
    this.createRole({
      id: 'role-viewer',
      name: 'Viewer',
      description: 'Read-only access to spreadsheets',
      permissions: [
        { id: 'perm-spreadsheets-read', resource: 'spreadsheets', action: 'read', effect: 'allow' }
      ],
      isSystem: true
    });
  }

  /**
   * Create new user
   */
  createUser(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const newUser: User = {
      ...user,
      id: this.generateId('user'),
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.users.set(newUser.id, newUser);

    this.logAudit({
      userId: newUser.id,
      action: 'user.create',
      resource: 'users',
      resourceId: newUser.id,
      result: 'success',
      metadata: { email: user.email }
    });

    return newUser;
  }

  /**
   * Create new role
   */
  createRole(role: Omit<Role, 'id'>): Role {
    const newRole: Role = {
      ...role,
      id: this.generateId('role')
    };

    this.roles.set(newRole.id, newRole);

    this.logAudit({
      userId: 'system',
      action: 'role.create',
      resource: 'roles',
      resourceId: newRole.id,
      result: 'success',
      metadata: { name: role.name }
    });

    return newRole;
  }

  /**
   * Create team
   */
  createTeam(team: Omit<Team, 'id' | 'createdAt'>): Team {
    const newTeam: Team = {
      ...team,
      id: this.generateId('team'),
      createdAt: new Date()
    };

    this.teams.set(newTeam.id, newTeam);

    this.logAudit({
      userId: 'system',
      action: 'team.create',
      resource: 'teams',
      resourceId: newTeam.id,
      result: 'success',
      metadata: { name: team.name }
    });

    return newTeam;
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, resource: string, action: string, context?: any): boolean {
    const user = this.users.get(userId);
    if (!user || !user.enabled) {
      return false;
    }

    // Collect all permissions from user's roles
    const permissions: Permission[] = [];

    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    // Also check team permissions
    for (const [teamId, team] of this.teams) {
      if (team.members.includes(userId)) {
        permissions.push(...team.permissions);
      }
    }

    // Evaluate permissions
    let allowed = false;

    for (const permission of permissions) {
      if (this.matchesPermission(permission, resource, action)) {
        if (permission.effect === 'allow') {
          // Check condition if present
          if (permission.condition) {
            if (this.evaluateCondition(permission.condition, user, context)) {
              allowed = true;
            }
          } else {
            allowed = true;
          }
        } else if (permission.effect === 'deny') {
          // Deny takes precedence
          return false;
        }
      }
    }

    return allowed;
  }

  /**
   * Grant role to user
   */
  grantRole(userId: string, roleId: string): boolean {
    const user = this.users.get(userId);
    const role = this.roles.get(roleId);

    if (!user || !role) {
      return false;
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);

      this.logAudit({
        userId,
        action: 'role.grant',
        resource: 'users',
        resourceId: userId,
        result: 'success',
        metadata: { roleId }
      });
    }

    return true;
  }

  /**
   * Revoke role from user
   */
  revokeRole(userId: string, roleId: string): boolean {
    const user = this.users.get(userId);

    if (!user) {
      return false;
    }

    const index = user.roles.indexOf(roleId);
    if (index >= 0) {
      user.roles.splice(index, 1);

      this.logAudit({
        userId,
        action: 'role.revoke',
        resource: 'users',
        resourceId: userId,
        result: 'success',
        metadata: { roleId }
      });

      return true;
    }

    return false;
  }

  /**
   * Add member to team
   */
  addTeamMember(teamId: string, userId: string): boolean {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team || !user) {
      return false;
    }

    if (!team.members.includes(userId)) {
      team.members.push(userId);

      this.logAudit({
        userId,
        action: 'team.join',
        resource: 'teams',
        resourceId: teamId,
        result: 'success',
        metadata: { teamName: team.name }
      });
    }

    return true;
  }

  /**
   * Remove member from team
   */
  removeTeamMember(teamId: string, userId: string): boolean {
    const team = this.teams.get(teamId);

    if (!team) {
      return false;
    }

    const index = team.members.indexOf(userId);
    if (index >= 0) {
      team.members.splice(index, 1);

      this.logAudit({
        userId,
        action: 'team.leave',
        resource: 'teams',
        resourceId: teamId,
        result: 'success',
        metadata: { teamName: team.name }
      });

      return true;
    }

    return false;
  }

  /**
   * Request access
   */
  requestAccess(userId: string, resource: string, resourceId: string, action: string, reason: string): AccessRequest {
    const request: AccessRequest = {
      id: this.generateId('access-request'),
      userId,
      resource,
      resourceId,
      action,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    this.accessRequests.set(request.id, request);

    this.logAudit({
      userId,
      action: 'access.request',
      resource,
      resourceId,
      result: 'success',
      metadata: { action, reason }
    });

    return request;
  }

  /**
   * Review access request
   */
  reviewAccessRequest(requestId: string, reviewerId: string, approved: boolean, reason?: string): boolean {
    const request = this.accessRequests.get(requestId);

    if (!request || request.status !== 'pending') {
      return false;
    }

    request.status = approved ? 'approved' : 'denied';
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.reviewReason = reason;

    this.logAudit({
      userId: reviewerId,
      action: 'access.review',
      resource: request.resource,
      resourceId: requestId,
      result: approved ? 'success' : 'failure',
      metadata: {
        originalRequest: request.userId,
        approved,
        reason
      }
    });

    // If approved, grant temporary permission
    if (approved) {
      // Would create temporary permission grant
    }

    return true;
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId('audit'),
      timestamp: new Date()
    };

    this.auditLog.push(auditEntry);

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let entries = this.auditLog;

    if (filters) {
      if (filters.userId) {
        entries = entries.filter(e => e.userId === filters.userId);
      }
      if (filters.action) {
        entries = entries.filter(e => e.action === filters.action);
      }
      if (filters.resource) {
        entries = entries.filter(e => e.resource === filters.resource);
      }
      if (filters.startDate) {
        entries = entries.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return entries;
  }

  /**
   * Check if permission matches resource and action
   */
  private matchesPermission(permission: Permission, resource: string, action: string): boolean {
    const resourceMatches = permission.resource === '*' ||
      resource.startsWith(permission.resource.replace('*', ''));

    const actionMatches = permission.action === '*' ||
      action === permission.action ||
      (permission.action === '*' && action !== '');

    return resourceMatches && actionMatches;
  }

  /**
   * Evaluate permission condition
   */
  private evaluateCondition(condition: string, user: User, context?: any): boolean {
    // Simple condition evaluation
    // In production, would use proper expression evaluator

    if (condition.includes('user.attributes.')) {
      const attr = condition.split('user.attributes.')[1].split(' ')[0];
      const value = condition.split('==')[1].trim().replace(/'/g, '');
      return user.attributes[attr] === value;
    }

    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get all users
   */
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get role
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all roles
   */
  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get team
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get all teams
   */
  getTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get access requests
   */
  getAccessRequests(status?: 'pending' | 'approved' | 'denied'): AccessRequest[] {
    let requests = Array.from(this.accessRequests.values());

    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    return requests;
  }
}

/**
 * Data Retention Policy Manager
 */
export class DataRetentionManager {
  private policies: Map<string, RetentionPolicy> = new Map();

  /**
   * Create retention policy
   */
  createPolicy(policy: Omit<RetentionPolicy, 'id'>): RetentionPolicy {
    const newPolicy: RetentionPolicy = {
      ...policy,
      id: this.generateId('policy')
    };

    this.policies.set(newPolicy.id, newPolicy);

    return newPolicy;
  }

  /**
   * Apply retention policies
   */
  applyPolicies(): {
    deleted: Array<{ type: string; id: string; reason: string }>;
    archived: Array<{ type: string; id: string; location: string }>;
  } {
    const deleted: Array<{ type: string; id: string; reason: string }> = [];
    const archived: Array<{ type: string; id: string; location: string }> = [];

    const now = Date.now();

    for (const policy of this.policies.values()) {
      if (policy.enabled) {
        // Check if policy should be applied
        // In production, would query database and apply actions

        const cutoffTime = now - policy.retentionPeriod;

        // Simulated application
        if (policy.action === 'delete') {
          deleted.push({
            type: policy.resourceType,
            id: 'simulated-id',
            reason: `Retention policy: ${policy.name}`
          });
        } else if (policy.action === 'archive') {
          archived.push({
            type: policy.resourceType,
            id: 'simulated-id',
            location: policy.archiveLocation || 'default-archive'
          });
        }
      }
    }

    return { deleted, archived };
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  resourceType: string;
  retentionPeriod: number;  // milliseconds
  action: 'delete' | 'archive' | 'anonymize';
  archiveLocation?: string;
  enabled: boolean;
  createdAt: Date;
}

/**
 * Enterprise Security Manager
 */
export class EnterpriseSecurityManager {
  private accessControl: AccessControlEngine;
  private retentionManager: DataRetentionManager;
  private encryptionKey: string;

  constructor() {
    this.accessControl = new AccessControlEngine();
    this.retentionManager = new DataRetentionManager();
    this.encryptionKey = this.generateEncryptionKey();
  }

  /**
   * Check access
   */
  checkAccess(userId: string, resource: string, action: string, context?: any): boolean {
    return this.accessControl.hasPermission(userId, resource, action, context);
  }

  /**
   * Encrypt data
   */
  encrypt(data: string): string {
    // Simplified encryption
    // In production, would use proper encryption (AES-256)
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): string {
    // Simplified decryption
    return Buffer.from(encryptedData, 'base64').toString();
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
  }

  /**
   * Get access control engine
   */
  getAccessControl(): AccessControlEngine {
    return this.accessControl;
  }

  /**
   * Get retention manager
   */
  getRetentionManager(): DataRetentionManager {
    return this.retentionManager;
  }
}
