import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Truck, MoreVertical, Trash, Edit } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface CraneFormData {
  model: string;
  capacity: number;
  manufacturer: string;
  year_of_manufacture?: number;
  registration_number: string;
  status: 'available' | 'in_use' | 'maintenance';
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
}

const Cranes = () => {
  const { cranes, addCrane, updateCrane, deleteCrane } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCrane, setSelectedCrane] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<CraneFormData>();

  const filteredCranes = cranes.filter(crane =>
    crane.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crane.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crane.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      'available': 'text-green-600 bg-green-50',
      'in_use': 'text-blue-600 bg-blue-50',
      'maintenance': 'text-yellow-600 bg-yellow-50'
    };
    return colors[status as keyof typeof colors] || colors['available'];
  };

  const handleAddCrane = async (data: CraneFormData) => {
    await addCrane(data);
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditCrane = async (data: CraneFormData) => {
    if (selectedCrane) {
      await updateCrane(selectedCrane, data);
      setIsEditModalOpen(false);
      setSelectedCrane(null);
      reset();
    }
  };

  const handleDeleteCrane = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this crane?')) {
      await deleteCrane(id);
    }
  };

  const openEditModal = (crane: any) => {
    setSelectedCrane(crane.id);
    Object.entries(crane).forEach(([key, value]) => {
      setValue(key as keyof CraneFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  const CraneForm = ({ onSubmit }: { onSubmit: (data: CraneFormData) => void }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <input
          {...register('model', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Capacity (tons)</label>
        <input
          type="number"
          {...register('capacity', { required: true, min: 0 })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
        <input
          {...register('manufacturer', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Year of Manufacture</label>
        <input
          type="number"
          {...register('year_of_manufacture')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
        <input
          {...register('registration_number', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
        <input
          type="date"
          {...register('last_maintenance_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
        <input
          type="date"
          {...register('next_maintenance_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            reset();
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cranes</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Crane
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search cranes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid gap-4">
        {filteredCranes.map((crane) => (
          <div key={crane.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{crane.model}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(crane.status)}`}>
                    {crane.status.replace('_', ' ').charAt(0).toUpperCase() + crane.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">{crane.manufacturer} - {crane.capacity} tons</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowActions(showActions === crane.id ? null : crane.id)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActions === crane.id && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => openEditModal(crane)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCrane(crane.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <Trash className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Registration Number:</span>
                <p>{crane.registration_number}</p>
              </div>
              <div>
                <span className="text-gray-500">Year of Manufacture:</span>
                <p>{crane.year_of_manufacture || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Maintenance:</span>
                <p>{crane.last_maintenance_date ? new Date(crane.last_maintenance_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Next Maintenance:</span>
                <p>{crane.next_maintenance_date ? new Date(crane.next_maintenance_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            {crane.notes && (
              <div className="mt-4">
                <span className="text-gray-500">Notes:</span>
                <p className="mt-1 text-sm text-gray-600">{crane.notes}</p>
              </div>
            )}
          </div>
        ))}

        {filteredCranes.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No cranes found</h3>
            <p className="text-gray-500">Add your first crane or try a different search term</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Crane"
      >
        <CraneForm onSubmit={handleAddCrane} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Crane"
      >
        <CraneForm onSubmit={handleEditCrane} />
      </Modal>
    </div>
  );
};

export default Cranes;