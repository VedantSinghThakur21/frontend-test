export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAllData: boolean;
  canEditAllData: boolean;
  canDeleteData: boolean;
  canApproveQuotations: boolean;
  canAssignJobs: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  firstName?: string;
  lastName?: string;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canManageUsers: true,
    canManageRoles: true,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: true,
    canApproveQuotations: true,
    canAssignJobs: true,
  },
  manager: {
    canManageUsers: false,
    canManageRoles: false,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: false,
    canApproveQuotations: true,
    canAssignJobs: true,
  },
  employee: {
    canManageUsers: false,
    canManageRoles: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canApproveQuotations: false,
    canAssignJobs: false,
  },
};