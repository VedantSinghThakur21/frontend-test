import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, FileText, Trash, DollarSign, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Quotation } from '../types';

interface QuotationFormData {
  inquiry_id: string;
  cost_calculation_id: string;
  validity_period: number;
  terms_conditions?: string;
}

const Quotations = () => {
  const { quotations, inquiries, costCalculations, clients, addQuotation, updateQuotation, deleteQuotation } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<QuotationFormData>();

  const filteredQuotations = quotations.filter(quotation => {
    const inquiry = inquiries.find(i => i.id === quotation.inquiry_id);
    const client = clients.find(c => c.id === inquiry?.client_id);
    return client?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddQuotation = async (data: QuotationFormData) => {
    const costCalculation = costCalculations.find(c => c.id === data.cost_calculation_id);
    if (!costCalculation) return;

    const totalAmount = costCalculation.total_cost;
    const advanceAmount = totalAmount * 0.6; // 60% advance payment
    const remainingAmount = totalAmount * 0.4; // 40% remaining payment

    await addQuotation({
      ...data,
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      remaining_amount: remainingAmount,
      version: 1,
      status: 'pending',
    });
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditQuotation = async (data: QuotationFormData) => {
    if (selectedQuotation) {
      const costCalculation = costCalculations.find(c => c.id === data.cost_calculation_id);
      if (!costCalculation) return;

      const totalAmount = costCalculation.total_cost;
      const advanceAmount = totalAmount * 0.6;
      const remainingAmount = totalAmount * 0.4;

      await updateQuotation(selectedQuotation, {
        ...data,
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        remaining_amount: remainingAmount,
      });
      setIsEditModalOpen(false);
      setSelectedQuotation(null);
      reset();
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      await deleteQuotation(id);
    }
  };

  const openEditModal = (quotation: Quotation) => {
    setSelectedQuotation(quotation.id);
    Object.entries(quotation).forEach(([key, value]) => {
      setValue(key as keyof QuotationFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  const QuotationForm = ({ onSubmit }: { onSubmit: (data: QuotationFormData) => void }) => {
    const selectedInquiryId = watch('inquiry_id');
    const filteredCostCalculations = costCalculations.filter(calc => calc.inquiry_id === selectedInquiryId);

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Inquiry</label>
          <select
            {...register('inquiry_id', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select an inquiry</option>
            {inquiries.map(inquiry => {
              const client = clients.find(c => c.id === inquiry.client_id);
              return (
                <option key={inquiry.id} value={inquiry.id}>
                  {client?.company_name} - {inquiry.crane_type}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Calculation</label>
          <select
            {...register('cost_calculation_id', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a cost calculation</option>
            {filteredCostCalculations.map(calc => (
              <option key={calc.id} value={calc.id}>
                Total Cost: ₹{calc.total_cost.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Validity Period (Days)</label>
          <input
            type="number"
            {...register('validity_period', { required: true, min: 1 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
          <textarea
            {...register('terms_conditions')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter any additional terms and conditions..."
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
            {selectedQuotation ? 'Update' : 'Create'} Quotation
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          New Quotation
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search quotations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none"
        />
      </div>

      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => {
          const inquiry = inquiries.find(i => i.id === quotation.inquiry_id);
          const client = clients.find(c => c.id === inquiry?.client_id);
          const costCalculation = costCalculations.find(c => c.id === quotation.cost_calculation_id);

          return (
            <div key={quotation.id} className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{client?.company_name}</h3>
                  <p className="text-sm text-gray-500">{inquiry?.crane_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(quotation)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuotation(quotation.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  Total Amount: ₹{quotation.total_amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Valid for {quotation.validity_period} days
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Advance Payment (60%)</p>
                  <p className="text-sm font-medium">₹{quotation.advance_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining Payment (40%)</p>
                  <p className="text-sm font-medium">₹{quotation.remaining_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  quotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
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
        title="New Quotation"
      >
        <QuotationForm onSubmit={handleAddQuotation} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuotation(null);
          reset();
        }}
        title="Edit Quotation"
      >
        <QuotationForm onSubmit={handleEditQuotation} />
      </Modal>
    </div>
  );
};

export default Quotations;