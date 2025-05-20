import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, DollarSign, Calendar, User, MoreVertical, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface DealFormData {
  title: string;
  contactId: string;
  value: number;
  status: string;
  expectedCloseDate?: string;
  notes?: string;
}

const Deals = () => {
  const { deals, contacts, addDeal, updateDeal, deleteDeal } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<DealFormData>();

  const getStatusColor = (status: string) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'opportunity': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-purple-100 text-purple-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors['lead'];
  };

  const filteredDeals = filterStatus === 'all' 
    ? deals 
    : deals.filter(deal => deal.status === filterStatus);

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact';
  };

  const handleAddDeal = async (data: DealFormData) => {
    await addDeal(data);
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditDeal = async (data: DealFormData) => {
    if (selectedDeal) {
      await updateDeal(selectedDeal, data);
      setIsEditModalOpen(false);
      setSelectedDeal(null);
      reset();
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      await deleteDeal(id);
    }
  };

  const openEditModal = (deal: any) => {
    setSelectedDeal(deal.id);
    Object.entries(deal).forEach(([key, value]) => {
      setValue(key as keyof DealFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  const DealForm = ({ onSubmit }: { onSubmit: (data: DealFormData) => void }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          {...register('title', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contact</label>
        <select
          {...register('contactId', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.first_name} {contact.last_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₹</span>
          </div>
          <input
            type="number"
            {...register('value', { required: true, min: 0 })}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {['lead', 'opportunity', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].map((status) => (
            <option key={status} value={status}>
              {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
        <input
          type="date"
          {...register('expectedCloseDate')}
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
        <h1 className="text-2xl font-bold">Deals</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Deals
        </button>
        {['lead', 'opportunity', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{deal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{getContactName(deal.contactId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(deal.status)}`}>
                  {deal.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === deal.id ? null : deal.id)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showActions === deal.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => openEditModal(deal)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold">₹{deal.value.toLocaleString()}</span>
              </div>
              {deal.expectedCloseDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            {deal.notes && (
              <p className="mt-4 text-gray-600 text-sm">{deal.notes}</p>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Deal"
      >
        <DealForm onSubmit={handleAddDeal} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Deal"
      >
        <DealForm onSubmit={handleEditDeal} />
      </Modal>
    </div>
  );
};

export default Deals;