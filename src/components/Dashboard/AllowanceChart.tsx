import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { User } from '../../types';

interface AllowanceChartProps {
  user: User;
}

const AllowanceChart: React.FC<AllowanceChartProps> = ({ user }) => {
  const monthlyData = [
    { month: 'Jan', amount: 45000, students: 180 },
    { month: 'Feb', amount: 42000, students: 168 },
    { month: 'Mar', amount: 48000, students: 192 },
    { month: 'Apr', amount: 50000, students: 200 },
    { month: 'May', amount: 47000, students: 188 },
    { month: 'Jun', amount: 52000, students: 208 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Allowances</h3>
        <DollarSign className="w-5 h-5 text-emerald-600" />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">ZMW 52,000</p>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+10.6%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {monthlyData.map((data, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-8 text-xs text-gray-600 font-medium">{data.month}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right min-w-0">
              <p className="text-sm font-semibold text-gray-900">ZMW {data.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{data.students} students</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Disbursed</p>
            <p className="text-xs text-blue-700">Last 6 months</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">ZMW 284,000</p>
            <p className="text-xs text-blue-600">1,136 payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllowanceChart;