export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionName: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy?: string;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAllData: boolean;
  canEditAllData: boolean;
  canDeleteData: boolean;
  canApproveQuotations: boolean;
  canAssignJobs: boolean;
  [key: string]: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: CustomRole[];
  permissions: UserPermissions;
  firstName?: string;
  lastName?: string;
}

export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type SystemRoleType = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

export const DEFAULT_PERMISSIONS: UserPermissions = {
  canManageUsers: false,
  canManageRoles: false,
  canViewAllData: false,
  canEditAllData: false,
  canDeleteData: false,
  canApproveQuotations: false,
  canAssignJobs: false,
};