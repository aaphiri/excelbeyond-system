import React, { useState, useEffect } from 'react';
import { Building2, Home, Plus, Edit2, Trash2, MapPin, Phone, Mail, Users, FileText, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Landlord, Institution } from '../types';

type ViewMode = 'landlords' | 'institutions';

export default function CorporateCollaborations() {
  const [viewMode, setViewMode] = useState<ViewMode>('landlords');
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [landlordForm, setLandlordForm] = useState({
    name: '',
    boarding_house_name: '',
    cell_line: '',
    landline: '',
    address: '',
    email: '',
    geolocation: '',
    total_students: 0,
    lease_agreement_signed: false,
    comments: ''
  });

  const [institutionForm, setInstitutionForm] = useState({
    liaison_name: '',
    liaison_role: '',
    cell_line: '',
    institution_direct_line: '',
    institution_name: '',
    department: '',
    liaison_email: '',
    institution_email: '',
    geolocation: '',
    mou_signed: false,
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [landlordsRes, institutionsRes] = await Promise.all([
        supabase.from('landlords').select('*').order('created_at', { ascending: false }),
        supabase.from('institutions').select('*').order('created_at', { ascending: false })
      ]);

      if (landlordsRes.data) setLandlords(landlordsRes.data);
      if (institutionsRes.data) setInstitutions(institutionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setShowForm(true);
    if (viewMode === 'landlords') {
      setLandlordForm({
        name: '',
        boarding_house_name: '',
        cell_line: '',
        landline: '',
        address: '',
        email: '',
        geolocation: '',
        total_students: 0,
        lease_agreement_signed: false,
        comments: ''
      });
    } else {
      setInstitutionForm({
        liaison_name: '',
        liaison_role: '',
        cell_line: '',
        institution_direct_line: '',
        institution_name: '',
        department: '',
        liaison_email: '',
        institution_email: '',
        geolocation: '',
        mou_signed: false,
        comments: ''
      });
    }
  };

  const handleEdit = (item: Landlord | Institution) => {
    setEditingId(item.id);
    setShowForm(true);
    if (viewMode === 'landlords') {
      const landlord = item as Landlord;
      setLandlordForm({
        name: landlord.name,
        boarding_house_name: landlord.boarding_house_name,
        cell_line: landlord.cell_line || '',
        landline: landlord.landline || '',
        address: landlord.address || '',
        email: landlord.email || '',
        geolocation: landlord.geolocation || '',
        total_students: landlord.total_students,
        lease_agreement_signed: landlord.lease_agreement_signed,
        comments: landlord.comments || ''
      });
    } else {
      const institution = item as Institution;
      setInstitutionForm({
        liaison_name: institution.liaison_name,
        liaison_role: institution.liaison_role || '',
        cell_line: institution.cell_line || '',
        institution_direct_line: institution.institution_direct_line || '',
        institution_name: institution.institution_name,
        department: institution.department || '',
        liaison_email: institution.liaison_email || '',
        institution_email: institution.institution_email || '',
        geolocation: institution.geolocation || '',
        mou_signed: institution.mou_signed,
        comments: institution.comments || ''
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const table = viewMode === 'landlords' ? 'landlords' : 'institutions';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete record');
    } else {
      fetchData();
    }
  };

  const handleSubmitLandlord = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...landlordForm, updated_at: new Date().toISOString() };

    if (editingId) {
      const { error } = await supabase.from('landlords').update(data).eq('id', editingId);
      if (error) {
        console.error('Error updating:', error);
        alert('Failed to update landlord');
        return;
      }
    } else {
      const { error } = await supabase.from('landlords').insert([data]);
      if (error) {
        console.error('Error inserting:', error);
        alert('Failed to add landlord');
        return;
      }
    }

    setShowForm(false);
    fetchData();
  };

  const handleSubmitInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...institutionForm, updated_at: new Date().toISOString() };

    if (editingId) {
      const { error } = await supabase.from('institutions').update(data).eq('id', editingId);
      if (error) {
        console.error('Error updating:', error);
        alert('Failed to update institution');
        return;
      }
    } else {
      const { error } = await supabase.from('institutions').insert([data]);
      if (error) {
        console.error('Error inserting:', error);
        alert('Failed to add institution');
        return;
      }
    }

    setShowForm(false);
    fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Corporate Collaborations</h1>
        <p className="text-slate-600">Manage partnerships with landlords and institutions</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            {viewMode === 'landlords' ? (
              <>
                <Home className="w-5 h-5" />
                <span>Landlords</span>
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                <span>Institutions</span>
              </>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
              <button
                onClick={() => {
                  setViewMode('landlords');
                  setDropdownOpen(false);
                  setShowForm(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3"
              >
                <Home className="w-5 h-5 text-slate-600" />
                <span className="text-slate-800">Landlords</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('institutions');
                  setDropdownOpen(false);
                  setShowForm(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3"
              >
                <Building2 className="w-5 h-5 text-slate-600" />
                <span className="text-slate-800">Institutions</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add {viewMode === 'landlords' ? 'Landlord' : 'Institution'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {editingId ? 'Edit' : 'Add New'} {viewMode === 'landlords' ? 'Landlord' : 'Institution'}
          </h2>

          {viewMode === 'landlords' ? (
            <form onSubmit={handleSubmitLandlord} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name of Landlord *</label>
                  <input
                    type="text"
                    required
                    value={landlordForm.name}
                    onChange={(e) => setLandlordForm({ ...landlordForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name of Boarding House *</label>
                  <input
                    type="text"
                    required
                    value={landlordForm.boarding_house_name}
                    onChange={(e) => setLandlordForm({ ...landlordForm, boarding_house_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cell Line</label>
                  <input
                    type="tel"
                    value={landlordForm.cell_line}
                    onChange={(e) => setLandlordForm({ ...landlordForm, cell_line: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Landline</label>
                  <input
                    type="tel"
                    value={landlordForm.landline}
                    onChange={(e) => setLandlordForm({ ...landlordForm, landline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={landlordForm.email}
                    onChange={(e) => setLandlordForm({ ...landlordForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Students</label>
                  <input
                    type="number"
                    min="0"
                    value={landlordForm.total_students}
                    onChange={(e) => setLandlordForm({ ...landlordForm, total_students: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={landlordForm.address}
                    onChange={(e) => setLandlordForm({ ...landlordForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Geolocation (Google Maps URL)</label>
                  <input
                    type="text"
                    value={landlordForm.geolocation}
                    onChange={(e) => setLandlordForm({ ...landlordForm, geolocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landlordForm.lease_agreement_signed}
                      onChange={(e) => setLandlordForm({ ...landlordForm, lease_agreement_signed: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Lease Agreement Signed</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                  <textarea
                    value={landlordForm.comments}
                    onChange={(e) => setLandlordForm({ ...landlordForm, comments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Landlord
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitInstitution} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Liaison Name *</label>
                  <input
                    type="text"
                    required
                    value={institutionForm.liaison_name}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, liaison_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={institutionForm.institution_name}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, institution_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Liaison Role</label>
                  <input
                    type="text"
                    value={institutionForm.liaison_role}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, liaison_role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={institutionForm.department}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cell Line</label>
                  <input
                    type="tel"
                    value={institutionForm.cell_line}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, cell_line: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Direct Line</label>
                  <input
                    type="tel"
                    value={institutionForm.institution_direct_line}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, institution_direct_line: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Liaison Email</label>
                  <input
                    type="email"
                    value={institutionForm.liaison_email}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, liaison_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Email</label>
                  <input
                    type="email"
                    value={institutionForm.institution_email}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, institution_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Geolocation (Google Maps URL)</label>
                  <input
                    type="text"
                    value={institutionForm.geolocation}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, geolocation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={institutionForm.mou_signed}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, mou_signed: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Memorandum of Understanding (MOU) Signed</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                  <textarea
                    value={institutionForm.comments}
                    onChange={(e) => setInstitutionForm({ ...institutionForm, comments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Institution
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewMode === 'landlords' ? (
            landlords.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No landlords added yet. Click "Add Landlord" to get started.
              </div>
            ) : (
              landlords.map((landlord) => (
                <div key={landlord.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{landlord.name}</h3>
                        <p className="text-sm text-slate-500">{landlord.boarding_house_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(landlord)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(landlord.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {landlord.cell_line && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{landlord.cell_line}</span>
                      </div>
                    )}
                    {landlord.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{landlord.email}</span>
                      </div>
                    )}
                    {landlord.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{landlord.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{landlord.total_students} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      landlord.lease_agreement_signed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {landlord.lease_agreement_signed ? 'Lease Signed' : 'Lease Pending'}
                    </span>
                    {landlord.geolocation && (
                      <a
                        href={landlord.geolocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        View Map
                      </a>
                    )}
                  </div>

                  {landlord.comments && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600 line-clamp-2">{landlord.comments}</p>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            institutions.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No institutions added yet. Click "Add Institution" to get started.
              </div>
            ) : (
              institutions.map((institution) => (
                <div key={institution.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{institution.institution_name}</h3>
                        <p className="text-sm text-slate-500">{institution.department || 'No department'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(institution)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(institution.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm font-medium text-slate-700">
                      {institution.liaison_name}
                      {institution.liaison_role && (
                        <span className="text-slate-500 font-normal"> - {institution.liaison_role}</span>
                      )}
                    </div>
                    {institution.cell_line && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{institution.cell_line}</span>
                      </div>
                    )}
                    {institution.liaison_email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{institution.liaison_email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      institution.mou_signed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {institution.mou_signed ? 'MOU Signed' : 'MOU Pending'}
                    </span>
                    {institution.geolocation && (
                      <a
                        href={institution.geolocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        View Map
                      </a>
                    )}
                  </div>

                  {institution.comments && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600 line-clamp-2">{institution.comments}</p>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
