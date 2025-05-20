import React from 'react';
import { useStore } from '../store/useStore';
import ErrorBoundary from '../components/ErrorBoundary';
import { BarChart, Users, DollarSign, TrendingUp, Lightbulb } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const Dashboard = () => {
  const { contacts = [], deals = [], insights = [] } = useStore() || {};

  const stats = [
    {
      label: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Deals',
      value: deals.filter(d => !['closed-won', 'closed-lost'].includes(d.status)).length,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Deal Value',
      value: `₹${deals.reduce((acc, deal) => acc + deal.value, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'AI Insights',
      value: insights.length,
      icon: BarChart,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className={`inline-flex p-3 rounded-lg ${stat.color} bg-opacity-10 mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Contacts</h2>
          <div className="space-y-4">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                  <p className="text-sm text-gray-500">{contact.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Latest AI Insights</h2>
          <div className="space-y-4">
            {insights.slice(0, 5).map((insight) => (
              <div key={insight.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium capitalize">{insight.type}</span>
                </div>
                <p className="text-gray-600">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardWithErrorBoundary = () => (
  <ErrorBoundary fallback={<div className="text-red-500 p-4">Something went wrong loading the dashboard. Please try refreshing the page.</div>}>
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;