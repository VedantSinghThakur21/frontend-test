import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Truck,
  HardHat,
  Calculator,
  FileCheck,
  Briefcase,
  Settings,
  Building,
  DollarSign,
  Lightbulb,
  Settings2
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: DollarSign, label: 'Deals', path: '/deals' },
    { icon: Building, label: 'Clients', path: '/clients' },
    { icon: FileText, label: 'Inquiries', path: '/inquiries' },
    { icon: Truck, label: 'Cranes', path: '/cranes' },
    { icon: HardHat, label: 'Operators', path: '/operators' },
    { icon: Calculator, label: 'Cost Calculations', path: '/calculations' },
    { icon: FileCheck, label: 'Quotations', path: '/quotations' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Lightbulb, label: 'Insights', path: '/insights' },
    { icon: Settings2, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full relative">
      <div className="flex items-center gap-2 mb-8">
        <Truck className="w-8 h-8 text-blue-600" />
        <h1 className="text-xl font-bold">ASP Crane CRM</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="text-center text-gray-500 text-xs">
          <p>Powered by</p>
          <p className="font-semibold text-gray-600">InfoRepos Technologies</p>
          <p>Private Limited</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;