import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, HardHat, MoreVertical, Trash, Edit } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface OperatorFormData {
  first_name: string;
  last_name: string;
  license_number: string;
  license_expiry_date: string;
  experience_years: number;
  phone: string;
  email?: string;
  status: 'available' | 'assigned' | 'on_leave' | 'training';
  notes?: string;
}

const Operators = () => {
  const { operators, addOperator, updateOperator, deleteOperator } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<OperatorFormData>();

  const filteredOperators = operators.filter(operator =>
    operator.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: OperatorFormData['status']) => {
    const colors: Record<OperatorFormData['status'], string> = {
      available: 'text-green-600 bg-green-50',
      assigned: 'text-blue-600 bg-blue-50',
      on_leave: 'text-yellow-600 bg-yellow-50',
      training: 'text-purple-600 bg-purple-50',
    };
    return colors[status];
  };



  const handleAddOperator = async (data: OperatorFormData) => {
    await addOperator(data);
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditOperator = async (data: OperatorFormData) => {
    if (selectedOperator) {
      await updateOperator(selectedOperator, data);
      setIsEditModalOpen(false);
      setSelectedOperator(null);
      reset();
    }
  };

  const handleDeleteOperator = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      await deleteOperator(id);
    }
  };

  const openEditModal = (operator: any) => {
    setSelectedOperator(operator.id);
    Object.entries(operator).forEach(([key, value]) => {
      setValue(key as keyof OperatorFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operators</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Operator
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search operators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid gap-4">
        {filteredOperators.map((operator) => (
          <div key={operator.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{operator.first_name} {operator.last_name}</h3>
                <p className="text-gray-600">{operator.license_number}</p>
              </div>
              <button
                onClick={() => openEditModal(operator)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteOperator(operator.id)}
                className="text-red-400 hover:text-red-600 p-2"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">

              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operator.status)}`}>
                {operator.status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Operator">
        <form onSubmit={handleSubmit(handleAddOperator)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                {...register('first_name', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                {...register('last_name', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input
              {...register('license_number', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Expiry Date</label>
            <input
              type="date"
              {...register('license_expiry_date', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            <input
              type="number"
              {...register('experience_years', { required: true, min: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              {...register('phone', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
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
              <option value="assigned">Assigned</option>
              <option value="on_leave">On Leave</option>
              <option value="training">Training</option>
            </select>
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
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Operator">
        <form onSubmit={handleSubmit(handleEditOperator)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                {...register('first_name', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                {...register('last_name', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input
              {...register('license_number', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Expiry Date</label>
            <input
              type="date"
              {...register('license_expiry_date', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            <input
              type="number"
              {...register('experience_years', { required: true, min: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              {...register('phone', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
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
              <option value="assigned">Assigned</option>
              <option value="on_leave">On Leave</option>
              <option value="training">Training</option>
            </select>
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
      </Modal>
    </div>
  );
};

export default Operators;
