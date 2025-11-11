import React from 'react';
import { Upload, X } from 'lucide-react';

interface StudentFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    community: string;
    date_of_birth: string;
    gender: string;
    nrc_number: string;
    chl_number: string;
    school_id_number: string;
    program_level: string;
    program_status: string;
    academic_standing: string;
    institution_name: string;
    institution_location: string;
    current_program: string;
    area_of_study: string;
    start_date: string;
    expected_end_date: string;
    guardian_full_name: string;
    guardian_contact_number: string;
    guardian_community: string;
    guardian_relationship: string;
    assigned_officer_id: string;
    assigned_officer_name: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  photoPreview: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: () => void;
  isEdit?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  setFormData,
  photoPreview,
  onPhotoChange,
  onPhotoRemove,
  isEdit = false
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
              />
              <button
                type="button"
                onClick={onPhotoRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onPhotoChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">Max 5MB. JPEG, PNG, or WebP</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
            <input
              type="tel"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+260977123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Community</label>
            <input
              type="text"
              value={formData.community}
              onChange={(e) => setFormData({ ...formData, community: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lusaka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NRC Number</label>
            <input
              type="text"
              value={formData.nrc_number}
              onChange={(e) => setFormData({ ...formData, nrc_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456/78/1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CHL Number</label>
            <input
              type="text"
              value={formData.chl_number}
              onChange={(e) => setFormData({ ...formData, chl_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CHL-12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">School ID Number</label>
            <input
              type="text"
              value={formData.school_id_number}
              onChange={(e) => setFormData({ ...formData, school_id_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2024-12345"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Program Category *</label>
            <select
              required
              value={formData.program_level}
              onChange={(e) => setFormData({ ...formData, program_level: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="university">University</option>
              <option value="diploma">College/Diploma</option>
              <option value="launch_year">Launch Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Program Status</label>
            <select
              value={formData.program_status}
              onChange={(e) => setFormData({ ...formData, program_status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="enrolled">Enrolled</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="discharged">Discharged</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Academic Standing</label>
            <select
              value={formData.academic_standing}
              onChange={(e) => setFormData({ ...formData, academic_standing: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="probation">Probation</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              value={formData.institution_name}
              onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="University of Zambia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institution Location</label>
            <input
              type="text"
              value={formData.institution_location}
              onChange={(e) => setFormData({ ...formData, institution_location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lusaka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Program</label>
            <input
              type="text"
              value={formData.current_program}
              onChange={(e) => setFormData({ ...formData, current_program: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Area of Study</label>
            <input
              type="text"
              value={formData.area_of_study}
              onChange={(e) => setFormData({ ...formData, area_of_study: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Software Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expected End Date</label>
            <input
              type="date"
              value={formData.expected_end_date}
              onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Full Name</label>
            <input
              type="text"
              value={formData.guardian_full_name}
              onChange={(e) => setFormData({ ...formData, guardian_full_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Contact</label>
            <input
              type="tel"
              value={formData.guardian_contact_number}
              onChange={(e) => setFormData({ ...formData, guardian_contact_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+260977123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Community</label>
            <input
              type="text"
              value={formData.guardian_community}
              onChange={(e) => setFormData({ ...formData, guardian_community: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lusaka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
            <input
              type="text"
              value={formData.guardian_relationship}
              onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Parent, Guardian, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
