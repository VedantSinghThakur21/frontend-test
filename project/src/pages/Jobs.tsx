import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Briefcase, MoreVertical, Trash, Edit, Calendar, MapPin, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';

interface JobFormData {
  title: string;
  client_id: string;
  crane_id: string;
  operator_id: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description?: string;
  special_requirements?: string;
}

const Jobs = () => {
  const { jobs, clients, cranes, operators, addJob, updateJob, deleteJob } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<JobFormData>();

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'text-blue-600 bg-blue-50',
      'in_progress': 'text-yellow-600 bg-yellow-50',
      'completed': 'text-green-600 bg-green-50',
      'cancelled': 'text-red-600 bg-red-50'
    };
    return colors[status as keyof typeof colors] || colors['scheduled'];
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company_name : 'Unknown Client';
  };

  const getCraneName = (craneId: string) => {
    const crane = cranes.find(c => c.id === craneId);
    return crane ? `${crane.manufacturer} ${crane.model}` : 'Unknown Crane';
  };

  const getOperatorName = (operatorId: string) => {
    const operator = operators.find(o => o.id === operatorId);
    return operator ? `${operator.first_name} ${operator.last_name}` : 'Unknown Operator';
  };

  const handleAddJob = async (data: JobFormData) => {
    await addJob(data);
    setIsAddModalOpen(false);
    reset();
  };

  const handleEditJob = async (data: JobFormData) => {
    if (selectedJob) {
      await updateJob(selectedJob, data);
      setIsEditModalOpen(false);
      setSelectedJob(null);
      reset();
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await deleteJob(id);
    }
  };

  const openEditModal = (job: any) => {
    setSelectedJob(job.id);
    Object.entries(job).forEach(([key, value]) => {
      setValue(key as keyof JobFormData, value as any);
    });
    setIsEditModalOpen(true);
  };

  const JobForm = ({ onSubmit }: { onSubmit: (data: JobFormData) => void }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          {...register('title', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          {...register('client_id', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.company_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Crane</label>
        <select
          {...register('crane_id', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a crane</option>
          {cranes.map((crane) => (
            <option key={crane.id} value={crane.id}>{crane.manufacturer} {crane.model}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Operator</label>
        <select
          {...register('operator_id', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select an operator</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>{operator.first_name} {operator.last_name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            {...register('start_date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            {...register('end_date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          {...register('location', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status', { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
        <textarea
          {...register('special_requirements')}
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
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{getClientName(job.client_id)}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowActions(showActions === job.id ? null : job.id)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActions === job.id && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => openEditModal(job)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
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
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p>{new Date(job.start_date).toLocaleDateString()} - {new Date(job.end_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p>{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Equipment:</span>
                  <p>{getCraneName(job.crane_id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Operator:</span>
                  <p>{getOperatorName(job.operator_id)}</p>
                </div>
              </div>
            </div>

            {(job.description || job.special_requirements) && (
              <div className="mt-4 space-y-2">
                {job.description && (
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <p className="mt-1 text-sm text-gray-600">{job.description}</p>
                  </div>
                )}
                {job.special_requirements && (
                  <div>
                    <span className="text-gray-500">Special Requirements:</span>
                    <p className="mt-1 text-sm text-gray-600">{job.special_requirements}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No jobs found</h3>
            <p className="text-gray-500">Add your first job or try a different search term</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Job"
      >
        <JobForm onSubmit={handleAddJob} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Job"
      >
        <JobForm onSubmit={handleEditJob} />
      </Modal>
    </div>
  );
};

export default Jobs;