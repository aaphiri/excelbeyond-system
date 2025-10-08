import React from 'react';
import { Clock, User, DollarSign, AlertTriangle, CheckSquare } from 'lucide-react';
import { User as UserType } from '../../types';

interface RecentActivitiesProps {
  user: UserType;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ user }) => {
  const activities = [
    {
      id: 1,
      type: 'allowance',
      icon: DollarSign,
      title: 'Allowance Approved',
      description: 'Grace Tembo - ZMW 2,500',
      time: '2 hours ago',
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 2,
      type: 'issue',
      icon: AlertTriangle,
      title: 'New Issue Reported',
      description: 'Accommodation problem at UNZA',
      time: '4 hours ago',
      color: 'text-orange-600 bg-orange-100',
    },
    {
      id: 3,
      type: 'task',
      icon: CheckSquare,
      title: 'Task Completed',
      description: 'Home visit form submitted',
      time: '6 hours ago',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 4,
      type: 'student',
      icon: User,
      title: 'New Student Added',
      description: 'John Banda - Engineering',
      time: '1 day ago',
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      id: 5,
      type: 'allowance',
      icon: DollarSign,
      title: 'Allowance Submitted',
      description: 'Batch of 15 students - ZMW 37,500',
      time: '1 day ago',
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 hover:bg-emerald-50 rounded-lg transition-colors">
        View All Activities
      </button>
    </div>
  );
};

export default RecentActivities;