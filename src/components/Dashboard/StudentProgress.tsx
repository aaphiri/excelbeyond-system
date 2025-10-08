import React from 'react';
import { TrendingUp, Users, GraduationCap } from 'lucide-react';
import { User } from '../../types';

interface StudentProgressProps {
  user: User;
}

const StudentProgress: React.FC<StudentProgressProps> = ({ user }) => {
  const progressData = [
    { year: 'Year 1', students: 420, graduated: 395, percentage: 94 },
    { year: 'Year 2', students: 385, graduated: 360, percentage: 93 },
    { year: 'Year 3', students: 360, graduated: 340, percentage: 94 },
    { year: 'Year 4', students: 340, graduated: 320, percentage: 94 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Student Progress</h3>
        <TrendingUp className="w-5 h-5 text-emerald-600" />
      </div>
      
      <div className="space-y-4">
        {progressData.map((data, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{data.year}</p>
                <p className="text-sm text-gray-600">{data.students} enrolled</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">{data.percentage}%</span>
              </div>
              <p className="text-xs text-gray-500">{data.graduated} graduated</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-900">Overall Success Rate</p>
            <p className="text-xs text-emerald-700">Average across all years</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">94%</p>
            <p className="text-xs text-emerald-600">+2% from last year</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;