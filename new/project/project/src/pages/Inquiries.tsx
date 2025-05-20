import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, MapPin, Calendar, Clock, HardHat, FileText, Trash, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface InquiryFormData {
  client_id: string;
  crane_type: string;
  rental_duration: number;
  expected_start_date: string;
  location: string;
  shift_type: string;
  site_conditions?: string;
  food_accommodation_required: boolean;
  additional_requirements?: string;
  site_visit_required: boolean;
}

const Inquiries = () => {
  const { inquiries, clients, operators, addInquiry, updateInquiry, deleteInquiry } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null); // State for action menu

  const { register, handleSubmit, reset, setValue } = useForm<InquiryFormData>();

  const filteredInquiries = inquiries.filter(inquiry =>
    clients.find(c => c.id === inquiry.client_id)?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInquiry = async (data: InquiryFormData) => {
    await addInquiry({
      ...data,
      status: 'pending',
    });
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditInquiry = async (data: InquiryFormData) => {
    if (selectedInquiry) {
      await updateInquiry(selectedInquiry, data);
      setIsEditModalOpen(false);
      setSelectedInquiry(null);
      reset();
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      await deleteInquiry(id);
      setShowActions(null); // Close actions menu
    }
  };

  const openEditModal = (inquiry: any) => {
    setSelectedInquiry(inquiry.id);
    Object.entries(inquiry).forEach(([key, value]) => {
      setValue(key as keyof InquiryFormData, value as any);
    });
    setIsEditModalOpen(true);
    setShowActions(null); // Close actions menu
  };

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    // Find the inquiry to get its current data
    const inquiryToUpdate = inquiries.find(inq => inq.id === id);
    if (!inquiryToUpdate) return; // Inquiry not found

    // Prepare the update data, only changing the status
    const updateData = { ...inquiryToUpdate, status };

    // Call the store's update function
    await updateInquiry(id, updateData);
    setShowActions(null); // Close actions menu
  };

  const InquiryForm = ({ onSubmit }: { onSubmit: (data: InquiryFormData) => void }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          {...register('client_id', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.company_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Crane Type</label>
        <input
          {...register('crane_type', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Rental Duration (Days)</label>
        <input
          type="number"
          {...register('rental_duration', { required: true, min: 1 })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Expected Start Date</label>
        <input
          type="date"
          {...register('expected_start_date', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          {...register('location', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Shift Type</label>
        <select
          {...register('shift_type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="day">Day</option>
          <option value="night">Night</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Site Conditions</label>
        <textarea
          {...register('site_conditions')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('food_accommodation_required')}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">Food & Accommodation Required</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('site_visit_required')}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">Site Visit Required</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
        <textarea
          {...register('additional_requirements')}
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
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {selectedInquiry ? 'Update' : 'Create'} Inquiry
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          New Inquiry
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none"
        />
      </div>

      <div className="grid gap-4">
        {filteredInquiries.map((inquiry) => {
          const client = clients.find(c => c.id === inquiry.client_id);
          const operator = operators.find(o => o.id === inquiry.assigned_operator_id);

          return (
            <div key={inquiry.id} className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{client?.company_name}</h3>
                  <p className="text-sm text-gray-500">{client?.contact_person}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === inquiry.id ? null : inquiry.id)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showActions === inquiry.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => openEditModal(inquiry)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="w-4 h-4" /> Edit Details
                        </button>
                        {inquiry.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(inquiry.id, 'confirmed')}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                            >
                              <CheckCircle className="w-4 h-4" /> Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(inquiry.id, 'cancelled')}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash className="w-4 h-4" /> Delete Inquiry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {inquiry.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(inquiry.expected_start_date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {inquiry.rental_duration} days
                </div>
                {operator && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HardHat className="w-4 h-4" />
                    {operator.name}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  inquiry.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  inquiry.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          reset();
        }}
        title="New Inquiry"
      >
        <InquiryForm onSubmit={handleAddInquiry} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInquiry(null);
          reset();
        }}
        title="Edit Inquiry"
      >
        <InquiryForm onSubmit={handleEditInquiry} />
      </Modal>
    </div>
  );
};

export default Inquiries;