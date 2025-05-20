import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CustomRole, UserPermissions, DEFAULT_PERMISSIONS } from '../types/auth';

interface RoleFormData {
  name: string;
  description: string;
  permissions: UserPermissions;
}

export default function Settings() {
  const { user, createRole, updateRole, deleteRole } = useAuth();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  useEffect(() => {
    if (selectedRole) {
      setFormData({
        name: selectedRole.name,
        description: selectedRole.description || '',
        permissions: { ...DEFAULT_PERMISSIONS },
      });
    }
  }, [selectedRole]);

  if (!user?.permissions.canManageRoles) {
    return <div className="p-4">You don't have permission to access this page.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
      } else {
        await createRole(formData.name, formData.description, formData.permissions);
      }
      setFormData({
        name: '',
        description: '',
        permissions: { ...DEFAULT_PERMISSIONS },
      });
      setSelectedRole(null);
      // Refresh roles list
    } catch (error) {
      console.error('Error managing role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      // Refresh roles list
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handlePermissionChange = (permission: keyof UserPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Role Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(formData.permissions).map(([permission, enabled]) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={enabled}
                    onChange={() => handlePermissionChange(permission as keyof UserPermissions)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={permission} className="ml-2 block text-sm text-gray-900">
                    {permission.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {selectedRole ? 'Update Role' : 'Create Role'}
            </button>
            {selectedRole && (
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Roles</h2>
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{role.name}</h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  {!role.isSystemRole && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}