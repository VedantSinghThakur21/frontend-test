import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthUser, CustomRole, DEFAULT_PERMISSIONS, RolePermission, SYSTEM_ROLES, UserPermissions } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  createRole: (name: string, description: string, permissions: UserPermissions) => Promise<void>;
  updateRole: (roleId: string, data: Partial<CustomRole> & { permissions?: UserPermissions }) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRolesAndPermissions = async (userId: string) => {
    try {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          custom_roles!inner (id, name, description, is_system_role, created_at, updated_at)
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        return { roles: [], permissions: { ...DEFAULT_PERMISSIONS } };
      }

      // Fetch permissions for all roles
      const roleIds = userRoles?.map((ur: any) => ur.role_id) || [];
      const { data: rolePermissions, error: permError } = await supabase
        .from('role_permissions')
        .select('*')
        .in('role_id', roleIds);

      if (permError) {
        console.error('Error fetching role permissions:', permError);
        return { roles: [], permissions: { ...DEFAULT_PERMISSIONS } };
      }

      const roles = userRoles?.map((ur: any) => ({
        id: ur.custom_roles.id,
        name: ur.custom_roles.name,
        description: ur.custom_roles.description,
        isSystemRole: ur.custom_roles.is_system_role,
        createdAt: new Date(ur.custom_roles.created_at),
        updatedAt: new Date(ur.custom_roles.updated_at)
      })) || [];

      const permissions = { ...DEFAULT_PERMISSIONS };
      if (rolePermissions) {
        rolePermissions.forEach((rp: any) => {
          if (rp.enabled) permissions[rp.permission_name] = true;
        });
      }

      return { roles, permissions };
    } catch (error) {
      console.error('Error in fetchUserRolesAndPermissions:', error);
      return { roles: [], permissions: { ...DEFAULT_PERMISSIONS } };
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await mapUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const userData = await mapUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });


    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const mapUserData = async (userData: any): Promise<AuthUser | null> => {
    if (!userData) return null;

    const { roles, permissions } = await fetchUserRolesAndPermissions(userData.id);

    return {
      id: userData.id,
      email: userData.email,
      roles,
      permissions,
      firstName: userData.user_metadata?.firstName,
      lastName: userData.user_metadata?.lastName,
    };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      if (user) {
        // Create admin role if it doesn't exist
        const { data: existingRole } = await supabase
          .from('custom_roles')
          .select('id, name')
          .eq('name', SYSTEM_ROLES.ADMIN)
          .single();

        let adminRoleId = existingRole?.id;

        if (!adminRoleId) {
          const { data: newRole, error: roleError } = await supabase
            .from('custom_roles')
            .insert({
              name: SYSTEM_ROLES.ADMIN,
              description: 'Super Administrator',
              is_system_role: true
            })
            .select()
            .single();

          if (roleError) throw roleError;
          adminRoleId = newRole.id;

          // Set all permissions for admin role
          const adminPermissions = Object.entries(DEFAULT_PERMISSIONS).map(([permission]) => ({
            role_id: adminRoleId,
            permission_name: permission,
            enabled: true
          }));

          const { error: permError } = await supabase
            .from('role_permissions')
            .insert(adminPermissions);

          if (permError) throw permError;
        } else {
          // Ensure existing admin role has all permissions
          const { data: existingPerms } = await supabase
            .from('role_permissions')
            .select('permission_name')
            .eq('role_id', adminRoleId);

          const existingPermNames = existingPerms?.map(p => p.permission_name) || [];
          const missingPerms = Object.keys(DEFAULT_PERMISSIONS)
            .filter(perm => !existingPermNames.includes(perm))
            .map(permission => ({
              role_id: adminRoleId,
              permission_name: permission,
              enabled: true
            }));

          if (missingPerms.length > 0) {
            const { error: permError } = await supabase
              .from('role_permissions')
              .insert(missingPerms);

            if (permError) throw permError;
          }
        }

        // Assign admin role to the user
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: adminRoleId
          });

        if (assignError) throw assignError;

        // Refresh user data to include new role and permissions
        const userData = await mapUserData(user);
        setUser(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
      if (error) throw error;
      if (user) {
        const updatedUser = await mapUserData({ ...user, user_metadata: { firstName: data.firstName, lastName: data.lastName } });
        setUser(updatedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (name: string, description: string, permissions: UserPermissions) => {
    const { data: role, error: roleError } = await supabase
      .from('custom_roles')
      .insert({ name, description })
      .select()
      .single();

    if (roleError) throw roleError;

    const permissionInserts = Object.entries(permissions).map(([permission_name, enabled]) => ({
      role_id: role.id,
      permission_name,
      enabled,
    }));

    const { error: permError } = await supabase
      .from('role_permissions')
      .insert(permissionInserts);

    if (permError) throw permError;
  };

  const updateRole = async (roleId: string, data: Partial<CustomRole> & { permissions?: UserPermissions }) => {
    if (data.name || data.description) {
      const { error: roleError } = await supabase
        .from('custom_roles')
        .update({ name: data.name, description: data.description })
        .eq('id', roleId);

      if (roleError) throw roleError;
    }

    if (data.permissions) {
      const { error: permError } = await supabase
        .from('role_permissions')
        .upsert(
          Object.entries(data.permissions).map(([permission_name, enabled]) => ({
            role_id: roleId,
            permission_name,
            enabled,
          }))
        );

      if (permError) throw permError;
    }
  };

  const deleteRole = async (roleId: string) => {
    const { error } = await supabase
      .from('custom_roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;
  };

  const assignRole = async (userId: string, roleId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: user?.id,
      });

    if (error) throw error;
  };

  const removeRole = async (userId: string, roleId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        createRole,
        updateRole,
        deleteRole,
        assignRole,
        removeRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}