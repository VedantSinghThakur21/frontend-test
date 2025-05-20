import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Calculator, DollarSign, FileText, Trash } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface CostCalculationFormData {
  inquiry_id: string;
  distance_km: number;
  toll_charges: number;
  fuel_cost: number;
  operator_cost: number;
  maintenance_cost: number;
  additional_costs: number;
}

const CostCalculations = () => {
  const { costCalculations, inquiries, clients, addCostCalculation, updateCostCalculation, deleteCostCalculation } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<CostCalculationFormData>();

  const filteredCalculations = costCalculations.filter(calc => {
    const inquiry = inquiries.find(i => i.id === calc.inquiry_id);
    const client = clients.find(c => c.id === inquiry?.client_id);
    return client?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const calculateTotalCost = (data: CostCalculationFormData) => {
    return (
      Number(data.distance_km) * 2 + // Round trip
      Number(data.toll_charges) +
      Number(data.fuel_cost) +
      Number(data.operator_cost) +
      Number(data.maintenance_cost) +
      Number(data.additional_costs)
    );
  };

  const handleAddCalculation = async (data: CostCalculationFormData) => {
    const totalCost = calculateTotalCost(data);
    await addCostCalculation({
      ...data,
      total_cost: totalCost,
    });
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditCalculation = async (data: CostCalculationFormData) => {
    if (selectedCalculation) {
      const totalCost = calculateTotalCost(data);
      await updateCostCalculation(selectedCalculation, {
        ...data,
        total_cost: totalCost,
      });
      setIsEditModalOpen(false);
      setSelectedCalculation(null);
      reset();
    }
  };

  const handleDeleteCalculation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      await deleteCostCalculation(id);
    }
  };

  const openEditModal = (calculation: any) => {
    setSelectedCalculation(calculation.id);
    Object.entries(calculation).forEach(([key, value]) => {
      setValue(key as keyof CostCalculationFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  const CostCalculationForm = ({ onSubmit }: { onSubmit: (data: CostCalculationFormData) => void }) => {
    const formData = watch();
    const totalCost = calculateTotalCost(formData);

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
          <label className="block text-sm font-medium text-gray-700">Distance (KM)</label>
          <input
            type="number"
            {...register('distance_km', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Toll Charges</label>
          <input
            type="number"
            {...register('toll_charges', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fuel Cost</label>
          <input
            type="number"
            {...register('fuel_cost', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Operator Cost</label>
          <input
            type="number"
            {...register('operator_cost', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Maintenance Cost</label>
          <input
            type="number"
            {...register('maintenance_cost', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Costs</label>
          <input
            type="number"
            {...register('additional_costs', { required: true, min: 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Cost</span>
            <span className="text-lg font-semibold text-gray-900">
              ₹{totalCost.toLocaleString()}
            </span>
          </div>
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
            {selectedCalculation ? 'Update' : 'Create'} Calculation
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cost Calculations</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          New Calculation
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search calculations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none"
        />
      </div>

      <div className="grid gap-4">
        {filteredCalculations.map((calculation) => {
          const inquiry = inquiries.find(i => i.id === calculation.inquiry_id);
          const client = clients.find(c => c.id === inquiry?.client_id);

          return (
            <div key={calculation.id} className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{client?.company_name}</h3>
                  <p className="text-sm text-gray-500">{inquiry?.crane_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(calculation)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCalculation(calculation.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calculator className="w-4 h-4" />
                  Distance: {calculation.distance_km} km
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  Total Cost: ₹{calculation.total_cost.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Toll Charges</p>
                  <p className="text-sm font-medium">₹{calculation.toll_charges.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fuel Cost</p>
                  <p className="text-sm font-medium">₹{calculation.fuel_cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Operator Cost</p>
                  <p className="text-sm font-medium">₹{calculation.operator_cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Maintenance Cost</p>
                  <p className="text-sm font-medium">₹{calculation.maintenance_cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Additional Costs</p>
                  <p className="text-sm font-medium">₹{calculation.additional_costs.toLocaleString()}</p>
                </div>
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
        title="New Cost Calculation"
      >
        <CostCalculationForm onSubmit={handleAddCalculation} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCalculation(null);
          reset();
        }}
        title="Edit Cost Calculation"
      >
        <CostCalculationForm onSubmit={handleEditCalculation} />
      </Modal>
    </div>
  );
};

export default CostCalculations;