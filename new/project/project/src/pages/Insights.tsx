import React from 'react';
import { useStore } from '../store/useStore';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const Insights = () => {
  const { insights, contacts } = useStore();

  const getInsightIcon = (type: string) => {
    const icons = {
      'sentiment': Lightbulb,
      'opportunity': TrendingUp,
      'risk': AlertTriangle,
      'action': CheckCircle,
    };
    const Icon = icons[type as keyof typeof icons] || Lightbulb;
    return <Icon className="w-5 h-5" />;
  };

  const getInsightColor = (type: string) => {
    const colors = {
      'sentiment': 'text-yellow-500 bg-yellow-50',
      'opportunity': 'text-green-500 bg-green-50',
      'risk': 'text-red-500 bg-red-50',
      'action': 'text-blue-500 bg-blue-50',
    };
    return colors[type as keyof typeof colors] || colors['sentiment'];
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Insights</h1>

      <div className="grid gap-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium capitalize">{insight.type}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{getContactName(insight.contactId)}</span>
                </div>
                <p className="text-gray-800">{insight.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Generated on {new Date(insight.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No insights yet</h3>
            <p className="text-gray-500">Insights will appear here as they are generated for your contacts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;