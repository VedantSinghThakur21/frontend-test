import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useStore } from '../store/useStore';
import { Plus, Search, Calculator, DollarSign, FileText, Trash } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

// Interface for form data for creating/editing a cost calculation
interface CostCalculationFormData {
  inquiry_id: string;
  distance_km: number;
  toll_charges: number;
  fuel_cost: number;
  operator_cost: number;
  maintenance_cost: number;
  additional_costs: number;
}

// Interface for stored cost calculation (includes id and total_cost)
interface StoredCostCalculation extends CostCalculationFormData {
  id: string;
  total_cost: number;
}

// Interface for Rent Calculation form data
interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

// Interface for stored rent calculation
interface StoredRentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
}

const CostCalculations = () => {
  const {
    costCalculations,
    rentCalculations,
    inquiries,
    clients,
    // machines, // machines store was not used in previous logic, ensure it's needed if uncommented
    addCostCalculation,
    updateCostCalculation,
    deleteCostCalculation,
    addRentCalculation,
    updateRentCalculation,
    deleteRentCalculation
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cost');

  const [isAddCostModalOpen, setIsAddCostModalOpen] = useState(false);
  const [isEditCostModalOpen, setIsEditCostModalOpen] = useState(false);
  const [selectedCostId, setSelectedCostId] = useState<string | null>(null);

  const [isAddRentModalOpen, setIsAddRentModalOpen] = useState(false);
  const [isEditRentModalOpen, setIsEditRentModalOpen] = useState(false);
  const [selectedRentId, setSelectedRentId] = useState<string | null>(null);

  const { register: registerCost, handleSubmit: handleSubmitCost, reset: resetCost, setValue: setValueCost, watch: watchCost, formState: { errors: errorsCost } } = useForm<CostCalculationFormData>();
  const { register: registerRent, handleSubmit: handleSubmitRent, reset: resetRent, setValue: setValueRent, watch: watchRent, formState: { errors: errorsRent } } = useForm<RentCalculationFormData>();

  const MACHINE_BASE_RATES: { [key: string]: number } = React.useMemo(() => ({ // Use useMemo for constants derived from external/potentially changing sources
    'crane_model_a': 5000,
    'crane_model_b': 7500,
    'crane_model_c': 10000,
    'excavator_model_a': 4000,
    'excavator_model_b': 6000,
    'bulldozer_model_a': 8000,
    'default': 6000,
  }), []);

  const GST_RATE = 0.18;
  const ELONGATION_PERCENTAGE = 0.05;
  const USAGE_PERCENTAGES: { [key: string]: number } = React.useMemo(() => ({
    'heavy': 0.10,
    'light': 0.05,
  }), []);
  const RISK_FACTOR_PERCENTAGES: { [key: string]: number } = React.useMemo(() => ({
    'high': 0.15,
    'medium': 0.10,
    'low': 0.05,
  }), []);

  const filteredCostCalculations = costCalculations.filter((calc) => {
    const inquiry = inquiries.find(i => i.id === calc.inquiry_id);
    const client = clients.find(c => c.id === inquiry?.client_id);
    return client?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           calc.inquiry_id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredRentCalculations = rentCalculations?.filter((calc) => {
    return calc.p2_type_of_machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
           calc.id.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const calculateTotalCostForForm = useCallback((data: CostCalculationFormData | StoredCostCalculation) => {
    const distanceKm = Number(data.distance_km) || 0;
    const tollCharges = Number(data.toll_charges) || 0;
    const fuelCost = Number(data.fuel_cost) || 0;
    const operatorCost = Number(data.operator_cost) || 0;
    const maintenanceCost = Number(data.maintenance_cost) || 0;
    const additionalCosts = Number(data.additional_costs) || 0;
    return (distanceKm * 2) + tollCharges + fuelCost + operatorCost + maintenanceCost + additionalCosts;
  }, []);

  const calculateH2 = useCallback((machineType: string) => {
    return MACHINE_BASE_RATES[machineType] || MACHINE_BASE_RATES['default'];
  }, [MACHINE_BASE_RATES]);

  const calculateH3 = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    const numHoursWorking = Number(data.p3_no_of_hours_working) || 0;
    const shiftFactor = data.p5_shift === 'double' ? 2 : 1;
    const currentContractDays = Number(data.contract_days) || 1;
    if (currentContractDays > 30 && data.p1_order_type === 'large') {
      return 26 * shiftFactor * Math.max(1, Math.floor(currentContractDays / 30));
    } else {
      return numHoursWorking * shiftFactor * 10 * currentContractDays;
    }
  }, []);

  const calculateH4 = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    const foodCost = (Number(data.p7_food_resources) || 0) * (Number(data.p7_food_cost_per_resource) || 0);
    const accommodationCost = (Number(data.p10_accommodation_resources) || 0) * (Number(data.p10_accommodation_cost_per_resource) || 0);
    return foodCost + accommodationCost;
  }, []);

  const calculateH5 = useCallback((machineBaseRate: number, usageType: 'heavy' | 'light' | string) => {
    const percentage = USAGE_PERCENTAGES[usageType as 'heavy' | 'light'] || 0;
    return machineBaseRate * percentage;
  }, [USAGE_PERCENTAGES]);

  const calculateH7 = useCallback((workingCostP15: number) => {
    const elongationP16 = workingCostP15 * ELONGATION_PERCENTAGE;
    return workingCostP15 + elongationP16;
  }, [ELONGATION_PERCENTAGE]);

  const calculateH8 = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    return Number(data.p18_extra_charge_for_p17) || 0;
  }, []);

  const calculateH9 = useCallback((machineBaseRate: number, riskFactor: 'high' | 'medium' | 'low' | string) => {
    const percentage = RISK_FACTOR_PERCENTAGES[riskFactor as 'high' | 'medium' | 'low'] || 0;
    return machineBaseRate * percentage;
  }, [RISK_FACTOR_PERCENTAGES]);

  const calculateH10 = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    return Number(data.p20_incidental_charges) || 0;
  }, []);

  const calculateH11 = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    return Number(data.p22_charges_for_other_factors) || 0;
  }, []);

  const calculateTotalRentForForm = useCallback((data: RentCalculationFormData | StoredRentCalculation) => {
    if (!data || Object.keys(data).length === 0 || !data.p2_type_of_machine) {
      return { totalRent: 0, hValues: {} };
    }
    const h2 = calculateH2(data.p2_type_of_machine);
    const h3 = calculateH3(data);
    const h4 = calculateH4(data);
    const h5 = calculateH5(h2, data.p11_usage);
    const workingCostP15 = h2 * h3;
    const h7 = calculateH7(workingCostP15);
    const h8 = calculateH8(data);
    const h9 = calculateH9(h2, data.p19_risk_factor);
    const h10 = calculateH10(data);
    const h11 = calculateH11(data);
    let totalRentBeforeGst = workingCostP15 + h4 + h5 + h7 + h8 + h9 + h10 + h11;
    let totalRent = totalRentBeforeGst;
    if (data.billing_gst === 'gst') {
      totalRent *= (1 + GST_RATE);
    }
    return {
        totalRent,
        hValues: { h2, h3, h4, h5, workingCostP15, elongationP16: workingCostP15 * ELONGATION_PERCENTAGE, h7, h8, h9, h10, h11 }
    };
  }, [calculateH2, calculateH3, calculateH4, calculateH5, calculateH7, calculateH8, calculateH9, calculateH10, calculateH11, GST_RATE, ELONGATION_PERCENTAGE]);


  const handleAddCostCalculation = useCallback(async (data: CostCalculationFormData) => {
    const totalCost = calculateTotalCostForForm(data);
    await addCostCalculation({
      ...data,
      id: Date.now().toString(),
      total_cost: totalCost,
    });
    setIsAddCostModalOpen(false);
    resetCost();
  }, [addCostCalculation, resetCost, calculateTotalCostForForm]);

  const handleEditCostCalculation = useCallback(async (data: CostCalculationFormData) => {
    if (selectedCostId) {
      const totalCost = calculateTotalCostForForm(data);
      await updateCostCalculation(selectedCostId, {
        ...data,
        total_cost: totalCost,
      });
      setIsEditCostModalOpen(false);
      setSelectedCostId(null);
      resetCost();
    }
  }, [selectedCostId, updateCostCalculation, resetCost, calculateTotalCostForForm]);

  const handleDeleteCostCalculation = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cost calculation?')) {
      await deleteCostCalculation(id);
    }
  }, [deleteCostCalculation]);

  const handleAddRentCalculation = useCallback(async (data: RentCalculationFormData) => {
    const { totalRent, hValues } = calculateTotalRentForForm(data);
    await addRentCalculation({
      ...data,
      // id: Date.now().toString(), // Supabase will generate the id
      total_rent: totalRent,
      h2_value: hValues.h2 || 0,
      h3_value: hValues.h3 || 0,
      h4_value: hValues.h4 || 0,
      h5_value: hValues.h5 || 0,
      h7_value: hValues.h7 || 0,
      h8_value: hValues.h8 || 0,
      h9_value: hValues.h9 || 0,
      h10_value: hValues.h10 || 0,
      h11_value: hValues.h11 || 0,
      // created_at: new Date().toISOString() // Supabase will generate created_at
    });
    setIsAddRentModalOpen(false);
    resetRent();
  }, [addRentCalculation, resetRent, calculateTotalRentForForm]);

  const handleEditRentCalculation = useCallback(async (data: RentCalculationFormData) => {
    if (selectedRentId) {
      const { totalRent, hValues } = calculateTotalRentForForm(data);
      const existingCalc = rentCalculations.find(rc => rc.id === selectedRentId);
      await updateRentCalculation(selectedRentId, {
        ...(existingCalc || {} as StoredRentCalculation), // Ensure existingCalc is not undefined for spread
        ...data,
        total_rent: totalRent,
        h2_value: hValues.h2 || 0,
        h3_value: hValues.h3 || 0,
        h4_value: hValues.h4 || 0,
        h5_value: hValues.h5 || 0,
        h7_value: hValues.h7 || 0,
        h8_value: hValues.h8 || 0,
        h9_value: hValues.h9 || 0,
        h10_value: hValues.h10 || 0,
        h11_value: hValues.h11 || 0,
      });
      setIsEditRentModalOpen(false);
      setSelectedRentId(null);
      resetRent();
    }
  }, [selectedRentId, updateRentCalculation, resetRent, calculateTotalRentForForm, rentCalculations]);

  const handleDeleteRentCalculation = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rent calculation?')) {
      await deleteRentCalculation(id);
    }
  }, [deleteRentCalculation]);

  const openEditCostModal = useCallback((calculation: StoredCostCalculation) => {
    setSelectedCostId(calculation.id);
    setValueCost('inquiry_id', calculation.inquiry_id);
    setValueCost('distance_km', calculation.distance_km);
    setValueCost('toll_charges', calculation.toll_charges);
    setValueCost('fuel_cost', calculation.fuel_cost);
    setValueCost('operator_cost', calculation.operator_cost);
    setValueCost('maintenance_cost', calculation.maintenance_cost);
    setValueCost('additional_costs', calculation.additional_costs);
    setIsEditCostModalOpen(true);
  }, [setValueCost]);

  // Dummy object for type checking keys in openEditRentModal
  const RentCalculationFormDataDummy: RentCalculationFormData = {
    p1_order_type: 'micro', p2_type_of_machine: '', p3_no_of_hours_working: 0, p4_day_night: 'day', p5_shift: 'single', p6_sunday_working: 'no',
    p7_food_resources: 0, p7_food_cost_per_resource: 0, p10_accommodation_resources: 0, p10_accommodation_cost_per_resource: 0,
    p11_usage: 'light', p12_distance_of_site: 0, p13_trailer_cost: 0, p14_mob_relaxation_given: 0,
    p17_type_of_deal: 'no_advance', p18_extra_charge_for_p17: 0, billing_gst: 'no_gst',
    p19_risk_factor: 'low', p20_incidental_charges: 0, p21_other_factors: '', p22_charges_for_other_factors: 0, contract_days: 30,
  };

  const openEditRentModal = useCallback((calculation: StoredRentCalculation) => {
    setSelectedRentId(calculation.id);
    resetRent(); 
    (Object.keys(calculation) as Array<keyof StoredRentCalculation>).forEach(key => {
        if (key !== 'id' && key !== 'total_rent' && !key.startsWith('h') && !key.endsWith('_value') && key !== 'created_at') {
            if (key in RentCalculationFormDataDummy) { 
                 setValueRent(key as keyof RentCalculationFormData, calculation[key] as any);
            }
        }
    });
    // Explicitly set potentially problematic fields that might not be covered by the loop or have defaults
    setValueRent('p1_order_type', calculation.p1_order_type);
    setValueRent('p2_type_of_machine', calculation.p2_type_of_machine);
    // ... (ensure all fields from StoredRentCalculation that are part of RentCalculationFormData are set)
    // This part can be tricky if types don't align perfectly or if some fields are optional
    // The loop above is intended to cover most, but double-check
    setValueRent('contract_days', calculation.contract_days);

    setIsEditRentModalOpen(true);
  }, [resetRent, setValueRent]);


  const CostCalculationForm = ({ onSubmit, isEditMode }: { onSubmit: (data: CostCalculationFormData) => void; isEditMode: boolean }) => {
    const formData = watchCost();
    const [calculatedTotalCost, setCalculatedTotalCost] = useState(0);

    useEffect(() => {
        setCalculatedTotalCost(calculateTotalCostForForm(formData));
    }, [formData, calculateTotalCostForForm]);


    return (
      <form onSubmit={handleSubmitCost(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="inquiry_id" className="block text-sm font-medium text-gray-700">Inquiry</label>
          <select
            id="inquiry_id"
            {...registerCost('inquiry_id', { required: "Inquiry is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select an inquiry</option>
            {inquiries.map((inquiry) => {
              const client = clients.find(c => c.id === inquiry.client_id);
              return (
                <option key={inquiry.id} value={inquiry.id}>
                  {client?.company_name || 'Unknown Client'} - {inquiry.crane_type || 'Unknown Type'} (ID: {inquiry.id})
                </option>
              );
            })}
          </select>
          {errorsCost.inquiry_id && <p className="text-red-500 text-xs mt-1">{errorsCost.inquiry_id.message}</p>}
        </div>

        <div>
          <label htmlFor="distance_km" className="block text-sm font-medium text-gray-700">Distance (KM)</label>
          <input
            id="distance_km" type="number" step="any"
            {...registerCost('distance_km', { required: "Distance is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.distance_km && <p className="text-red-500 text-xs mt-1">{errorsCost.distance_km.message}</p>}
        </div>

        <div>
          <label htmlFor="toll_charges" className="block text-sm font-medium text-gray-700">Toll Charges</label>
          <input
            id="toll_charges" type="number" step="any"
            {...registerCost('toll_charges', { required: "Toll charges are required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.toll_charges && <p className="text-red-500 text-xs mt-1">{errorsCost.toll_charges.message}</p>}
        </div>

        <div>
          <label htmlFor="fuel_cost" className="block text-sm font-medium text-gray-700">Fuel Cost</label>
          <input
            id="fuel_cost" type="number" step="any"
            {...registerCost('fuel_cost', { required: "Fuel cost is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.fuel_cost && <p className="text-red-500 text-xs mt-1">{errorsCost.fuel_cost.message}</p>}
        </div>

        <div>
          <label htmlFor="operator_cost" className="block text-sm font-medium text-gray-700">Operator Cost</label>
          <input
            id="operator_cost" type="number" step="any"
            {...registerCost('operator_cost', { required: "Operator cost is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.operator_cost && <p className="text-red-500 text-xs mt-1">{errorsCost.operator_cost.message}</p>}
        </div>

        <div>
          <label htmlFor="maintenance_cost" className="block text-sm font-medium text-gray-700">Maintenance Cost</label>
          <input
            id="maintenance_cost" type="number" step="any"
            {...registerCost('maintenance_cost', { required: "Maintenance cost is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.maintenance_cost && <p className="text-red-500 text-xs mt-1">{errorsCost.maintenance_cost.message}</p>}
        </div>

        <div>
          <label htmlFor="additional_costs" className="block text-sm font-medium text-gray-700">Additional Costs</label>
          <input
            id="additional_costs" type="number" step="any" defaultValue={0}
            {...registerCost('additional_costs', { valueAsNumber: true, min: { value: 0, message: "Cannot be negative"} })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errorsCost.additional_costs && <p className="text-red-500 text-xs mt-1">{errorsCost.additional_costs.message}</p>}
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Cost</span>
            <span className="text-lg font-semibold text-gray-900">
              ₹{calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              isEditMode ? setIsEditCostModalOpen(false) : setIsAddCostModalOpen(false);
              resetCost();
              setSelectedCostId(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update' : 'Create'} Calculation
          </button>
        </div>
      </form>
    );
  };

  const RentCalculationForm = ({ onSubmit, isEditMode }: { onSubmit: (data: RentCalculationFormData) => void; isEditMode: boolean }) => {
    const rentFormData = watchRent();
    const [calculatedTotalRent, setCalculatedTotalRent] = useState(0);
    const [hValuesDisplay, setHValuesDisplay] = useState<any>({});

    // Use of calculateTotalRentForForm from parent scope, already wrapped in useCallback
    useEffect(() => {
      const { totalRent, hValues } = calculateTotalRentForForm(rentFormData);
      setCalculatedTotalRent(totalRent);
      setHValuesDisplay(hValues);
    }, [rentFormData, calculateTotalRentForForm]);

    const h2Value = rentFormData.p2_type_of_machine ? calculateH2(rentFormData.p2_type_of_machine) : 0;

    return (
      <form onSubmit={handleSubmitRent(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit' : 'New'} Rent Calculation</h2>
        
        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
            <h3 className="text-md font-medium text-gray-800">H1: Order & Contract</h3>
            <div>
            <label htmlFor="p1_order_type" className="block text-sm font-medium text-gray-700">P1: Order Type</label>
            <select
                id="p1_order_type"
                {...registerRent('p1_order_type', { required: "Order type is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                <option value="micro">Micro</option>
                <option value="large">Large</option>
            </select>
            {errorsRent.p1_order_type && <p className="text-red-500 text-xs mt-1">{errorsRent.p1_order_type.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Micro/Large order selection.</p>
            </div>

            <div>
            <label htmlFor="contract_days" className="block text-sm font-medium text-gray-700">Contract Duration (Days)</label>
            <input
                id="contract_days" type="number"
                {...registerRent('contract_days', { required: "Contract days are required", valueAsNumber: true, min: { value: 1, message: "Must be at least 1 day" } })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 30"
            />
            {errorsRent.contract_days && <p className="text-red-500 text-xs mt-1">{errorsRent.contract_days.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Number of days for the contract. Impacts H3 calculation.</p>
            </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H2: Machine Base Rate (₹{hValuesDisplay.h2?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p2_type_of_machine" className="block text-sm font-medium text-gray-700">P2: Type of Machine</label>
            <select
              id="p2_type_of_machine"
              {...registerRent('p2_type_of_machine', { required: "Machine type is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select machine type</option>
              {Object.entries(MACHINE_BASE_RATES).filter(([key]) => key !== 'default').map(([key, rate]) => (
                 <option key={key} value={key}>{`${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`} (₹{rate.toLocaleString()})</option>
              ))}
            </select>
            {errorsRent.p2_type_of_machine && <p className="text-red-500 text-xs mt-1">{errorsRent.p2_type_of_machine.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Selected machine base rate (H2): ₹{h2Value.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H3: Hours Factor ({hValuesDisplay.h3?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) || '0'})</h3>
          <div>
            <label htmlFor="p3_no_of_hours_working" className="block text-sm font-medium text-gray-700">P3: No of Hours Working (per day for micro)</label>
            <input
              id="p3_no_of_hours_working" type="number" step="any"
              {...registerRent('p3_no_of_hours_working', { required: "Number of hours is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative" }})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 8"
            />
            {errorsRent.p3_no_of_hours_working && <p className="text-red-500 text-xs mt-1">{errorsRent.p3_no_of_hours_working.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Formula: (Large Order 30 days): 26 * shift_factor * months. (Micro Order): P3 * shift_factor * 10 * contract_days.</p>
          </div>
          <div>
            <label htmlFor="p4_day_night" className="block text-sm font-medium text-gray-700">P4: Day/Night</label>
            <select
              id="p4_day_night" {...registerRent('p4_day_night', { required: "Day/Night is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="day">Day</option>
              <option value="night">Night</option>
            </select>
            {errorsRent.p4_day_night && <p className="text-red-500 text-xs mt-1">{errorsRent.p4_day_night.message}</p>}
          </div>
          <div>
            <label htmlFor="p5_shift" className="block text-sm font-medium text-gray-700">P5: Shift</label>
            <select
              id="p5_shift" {...registerRent('p5_shift', { required: "Shift is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="single">Single</option>
              <option value="double">Double</option>
            </select>
            {errorsRent.p5_shift && <p className="text-red-500 text-xs mt-1">{errorsRent.p5_shift.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Single or double shift affects hour calculation factor.</p>
          </div>
          <div>
            <label htmlFor="p6_sunday_working" className="block text-sm font-medium text-gray-700">P6: Sunday Working</label>
            <select
              id="p6_sunday_working" {...registerRent('p6_sunday_working', { required: "Sunday working is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errorsRent.p6_sunday_working && <p className="text-red-500 text-xs mt-1">{errorsRent.p6_sunday_working.message}</p>}
             <p className="text-xs text-gray-500 mt-1">Considered for specific hour calculations or charges (not directly in current H3 formula).</p>
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H4: Accommodation (₹{hValuesDisplay.h4?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p7_food_resources" className="block text-sm font-medium text-gray-700">P7: Food Resources (Count)</label>
            <input id="p7_food_resources" type="number" {...registerRent('p7_food_resources', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0} />
          </div>
          <div>
            <label htmlFor="p7_food_cost_per_resource" className="block text-sm font-medium text-gray-700">P7: Food Cost per Resource</label>
            <input id="p7_food_cost_per_resource" type="number" step="any" {...registerRent('p7_food_cost_per_resource', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
          <div>
            <label htmlFor="p10_accommodation_resources" className="block text-sm font-medium text-gray-700">P10: Accommodation Resources (Count)</label>
            <input id="p10_accommodation_resources" type="number" {...registerRent('p10_accommodation_resources', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
          <div>
            <label htmlFor="p10_accommodation_cost_per_resource" className="block text-sm font-medium text-gray-700">P10: Accommodation Cost per Resource</label>
            <input id="p10_accommodation_cost_per_resource" type="number" step="any" {...registerRent('p10_accommodation_cost_per_resource', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H5: Usage ({USAGE_PERCENTAGES[rentFormData.p11_usage as keyof typeof USAGE_PERCENTAGES]*100 || 0}% of H2 = ₹{hValuesDisplay.h5?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p11_usage" className="block text-sm font-medium text-gray-700">P11: Usage Type</label>
            <select id="p11_usage" {...registerRent('p11_usage', { required: "Usage type is required"})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="light">Light ({(USAGE_PERCENTAGES.light*100)}%)</option>
              <option value="heavy">Heavy ({(USAGE_PERCENTAGES.heavy*100)}%)</option>
            </select>
            {errorsRent.p11_usage && <p className="text-red-500 text-xs mt-1">{errorsRent.p11_usage.message}</p>}
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H6: Mobilization - Demobilization</h3>
          <p className="text-xs text-gray-500 mt-1">Note: H6 is not currently part of the final sum formula. These are inputs for record/separate calculation.</p>
          <div>
            <label htmlFor="p12_distance_of_site" className="block text-sm font-medium text-gray-700">P12: Distance of Site (KM)</label>
            <input id="p12_distance_of_site" type="number" step="any" {...registerRent('p12_distance_of_site', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
          <div>
            <label htmlFor="p13_trailer_cost" className="block text-sm font-medium text-gray-700">P13: Trailer Cost</label>
            <input id="p13_trailer_cost" type="number" step="any" {...registerRent('p13_trailer_cost', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
             <p className="text-xs text-gray-500 mt-1">Comment says "This will be calculated" - currently an input.</p>
          </div>
          <div>
            <label htmlFor="p14_mob_relaxation_given" className="block text-sm font-medium text-gray-700">P14: Mob/Demob Relaxation Given</label>
            <input id="p14_mob_relaxation_given" type="number" step="any" {...registerRent('p14_mob_relaxation_given', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H7: Fuel Cost (₹{hValuesDisplay.h7?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) || '0'})</h3>
          <p className="text-sm">P15 (Working Cost: H2 * H3): ₹{hValuesDisplay.workingCostP15?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) || '0'}</p>
          <p className="text-sm">P16 (Elongation: {ELONGATION_PERCENTAGE*100}% of P15): ₹{hValuesDisplay.elongationP16?.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) || '0'}</p>
          <p className="text-xs text-gray-500 mt-1">H7 = P15 + P16. These are calculated based on H2 and H3.</p>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H8: Commercial (₹{hValuesDisplay.h8?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p17_type_of_deal" className="block text-sm font-medium text-gray-700">P17: Type of Deal</label>
            <select id="p17_type_of_deal" {...registerRent('p17_type_of_deal', { required: "Type of deal is required" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="no_advance">No Advance</option>
              <option value="credit">Credit</option>
              <option value="long_credit">Long Credit</option>
            </select>
            {errorsRent.p17_type_of_deal && <p className="text-red-500 text-xs mt-1">{errorsRent.p17_type_of_deal.message}</p>}
          </div>
          <div>
            <label htmlFor="p18_extra_charge_for_p17" className="block text-sm font-medium text-gray-700">P18: Extra Charge for Deal Type (H8)</label>
            <input id="p18_extra_charge_for_p17" type="number" step="any" {...registerRent('p18_extra_charge_for_p17', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
          <div>
            <label htmlFor="billing_gst" className="block text-sm font-medium text-gray-700">Billing GST</label>
            <select id="billing_gst" {...registerRent('billing_gst', { required: "GST option is required" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="no_gst">No GST</option>
              <option value="gst">GST ({GST_RATE*100}%)</option>
            </select>
            {errorsRent.billing_gst && <p className="text-red-500 text-xs mt-1">{errorsRent.billing_gst.message}</p>}
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H9: Risk Factor ({RISK_FACTOR_PERCENTAGES[rentFormData.p19_risk_factor as keyof typeof RISK_FACTOR_PERCENTAGES]*100 || 0}% of H2 = ₹{hValuesDisplay.h9?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p19_risk_factor" className="block text-sm font-medium text-gray-700">P19: Risk Factor</label>
            <select id="p19_risk_factor" {...registerRent('p19_risk_factor', { required: "Risk factor is required" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="low">Low ({(RISK_FACTOR_PERCENTAGES.low*100)}%)</option>
              <option value="medium">Medium ({(RISK_FACTOR_PERCENTAGES.medium*100)}%)</option>
              <option value="high">High ({(RISK_FACTOR_PERCENTAGES.high*100)}%)</option>
            </select>
            {errorsRent.p19_risk_factor && <p className="text-red-500 text-xs mt-1">{errorsRent.p19_risk_factor.message}</p>}
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H10: Incidental Charge (₹{hValuesDisplay.h10?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p20_incidental_charges" className="block text-sm font-medium text-gray-700">P20: Incidental Charges (H10)</label>
            <input id="p20_incidental_charges" type="number" step="any" {...registerRent('p20_incidental_charges', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
        </div>

        <div className="p-3 border rounded-md space-y-3 bg-slate-50">
          <h3 className="text-md font-medium text-gray-800">H11: Other Factors (₹{hValuesDisplay.h11?.toLocaleString() || '0'})</h3>
          <div>
            <label htmlFor="p21_other_factors" className="block text-sm font-medium text-gray-700">P21: Other Factor Type</label>
            <select id="p21_other_factors" {...registerRent('p21_other_factors')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" >
              <option value="">None</option>
              <option value="area">Area</option>
              <option value="condition">Condition</option>
              <option value="customer_reputation">Customer Reputation</option>
            </select>
          </div>
          <div>
            <label htmlFor="p22_charges_for_other_factors" className="block text-sm font-medium text-gray-700">P22: Charges for Other Factors (H11)</label>
            <input id="p22_charges_for_other_factors" type="number" step="any" {...registerRent('p22_charges_for_other_factors', { valueAsNumber: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue={0}/>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">Total Calculated Rent</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{calculatedTotalRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {rentFormData.billing_gst === 'gst' && (
             <p className="text-xs text-gray-500 text-right">Includes {GST_RATE*100}% GST</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={() => { isEditMode ? setIsEditRentModalOpen(false) : setIsAddRentModalOpen(false); resetRent(); setSelectedRentId(null); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >
            {isEditMode ? 'Update Rent Calculation' : 'Create Rent Calculation'}
          </button>
        </div>
      </form>
    );
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Calculations Dashboard</h1>
      </header>

      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select id="tabs" name="tabs" onChange={(e) => setActiveTab(e.target.value)} value={activeTab}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" >
            <option value="cost">Cost Calculations</option>
            <option value="rent">Rent Calculations</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('cost')}
                className={`${ activeTab === 'cost' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`} >
                <DollarSign size={18} className="mr-2" /> Cost Calculations
              </button>
              <button onClick={() => setActiveTab('rent')}
                className={`${ activeTab === 'rent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`} >
                <Calculator size={18} className="mr-2" /> Rent Calculations
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder={activeTab === 'cost' ? "Search cost calculations (by client)..." : "Search rent calculations (by machine/ID)..."}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button onClick={() => activeTab === 'cost' ? setIsAddCostModalOpen(true) : setIsAddRentModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >
          <Plus size={20} className="mr-2" /> Add New {activeTab === 'cost' ? 'Cost' : 'Rent'} Calculation
        </button>
      </div>

      {activeTab === 'cost' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredCostCalculations.length > 0 ? filteredCostCalculations.map((calc) => {
              const inquiry = inquiries.find(i => i.id === calc.inquiry_id);
              const client = clients.find(c => c.id === inquiry?.client_id);
              return (
                <li key={calc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Client: {client?.company_name || 'N/A'} (Inquiry ID: {calc.inquiry_id})
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Cost: <span className="font-semibold">₹{calc.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      <button onClick={() => openEditCostModal(calc)} className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none" title="Edit Cost Calculation" >
                        <FileText size={20} />
                      </button>
                      <button onClick={() => handleDeleteCostCalculation(calc.id)} className="p-1 text-gray-400 hover:text-red-600 focus:outline-none" title="Delete Cost Calculation" >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            }) : (
              <li className="px-4 py-10 sm:px-6 text-center text-gray-500">
                No cost calculations found.
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'rent' && (
         <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredRentCalculations.length > 0 ? filteredRentCalculations.map((calc) => (
              <li key={calc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Machine: {calc.p2_type_of_machine.replace(/_/g, ' ')} (ID: {calc.id})
                    </p>
                    <p className="text-sm text-gray-500">
                      Total Rent: <span className="font-semibold">₹{calc.total_rent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                     <p className="text-xs text-gray-400">Created: {new Date(calc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                    <button onClick={() => openEditRentModal(calc)} className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none" title="Edit Rent Calculation" >
                      <FileText size={20} />
                    </button>
                    <button onClick={() => handleDeleteRentCalculation(calc.id)} className="p-1 text-gray-400 hover:text-red-600 focus:outline-none" title="Delete Rent Calculation" >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </li>
            )) : (
              <li className="px-4 py-10 sm:px-6 text-center text-gray-500">
                No rent calculations found.
              </li>
            )}
          </ul>
        </div>
      )}

      <Modal isOpen={isAddCostModalOpen} onClose={() => { setIsAddCostModalOpen(false); resetCost(); }}>
        <h2 className="text-xl font-semibold mb-4">Add New Cost Calculation</h2>
        <CostCalculationForm onSubmit={handleAddCostCalculation} isEditMode={false} />
      </Modal>
      <Modal isOpen={isEditCostModalOpen} onClose={() => { setIsEditCostModalOpen(false); resetCost(); setSelectedCostId(null); }}>
        <h2 className="text-xl font-semibold mb-4">Edit Cost Calculation</h2>
        <CostCalculationForm onSubmit={handleEditCostCalculation} isEditMode={true} />
      </Modal>

      <Modal isOpen={isAddRentModalOpen} onClose={() => { setIsAddRentModalOpen(false); resetRent(); }}>
        <RentCalculationForm onSubmit={handleAddRentCalculation} isEditMode={false} />
      </Modal>
      <Modal isOpen={isEditRentModalOpen} onClose={() => { setIsEditRentModalOpen(false); resetRent(); setSelectedRentId(null); }}>
        <RentCalculationForm onSubmit={handleEditRentCalculation} isEditMode={true} />
      </Modal>

    </div>
  );
}; // This is the closing brace for the CostCalculations component. Ensure it's correctly placed and not missing.

export default CostCalculations; // This must be at the top level of the module.