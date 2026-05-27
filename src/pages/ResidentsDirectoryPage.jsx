import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserCheck, UserX, QrCode, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const MOCK_RESIDENTS = [
  { id: 'RES-001', name: 'Juan Dela Cruz',    age: 45, gender: 'Male',   barangay: 'Brgy. San Lorenzo', hasProfile: true,  status: 'Active' },
  { id: 'RES-002', name: 'Maria Santos',      age: 28, gender: 'Female', barangay: 'Brgy. Plainview',   hasProfile: true,  status: 'Active' },
  { id: 'RES-003', name: 'Pedro Reyes',       age: 62, gender: 'Male',   barangay: 'Brgy. 45',          hasProfile: false, status: 'Active' },
  { id: 'RES-004', name: 'Ana Liza Torres',   age: 33, gender: 'Female', barangay: 'Brgy. 45',          hasProfile: true,  status: 'Active' },
  { id: 'RES-005', name: 'Rodrigo Mendoza',   age: 71, gender: 'Male',   barangay: 'Brgy. San Lorenzo', hasProfile: false, status: 'Inactive' },
  { id: 'RES-006', name: 'Corazon Buenaventura', age: 52, gender: 'Female', barangay: 'Brgy. 45',       hasProfile: true,  status: 'Active' },
  { id: 'RES-007', name: 'Armando Cruz',      age: 19, gender: 'Male',   barangay: 'Brgy. Plainview',   hasProfile: false, status: 'Active' },
  { id: 'RES-008', name: 'Lourdes Aquino',    age: 44, gender: 'Female', barangay: 'Brgy. 45',          hasProfile: true,  status: 'Active' },
];

export default function ResidentsDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | enrolled | pending

  const filtered = MOCK_RESIDENTS.filter(r => {
    const matchSearch = search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'enrolled' && r.hasProfile) ||
      (filter === 'pending' && !r.hasProfile);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <header className="bg-[#0e0e0e] border-b border-white/[0.07] px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/admin/dashboard')} className="text-[#8e909f] hover:text-[#e5e2e1]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#e5e2e1]">Residents Directory</h1>
          <p className="text-xs font-mono text-[#8e909f]">{MOCK_RESIDENTS.length} registered residents</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => navigate('/admin/enrollment')}
        >
          Enroll Resident
        </Button>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-white/[0.07] bg-[#131313]">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444653]" />
          <input
            id="residents-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full bg-[#171717] border border-[#444653] focus:border-[#1e3fae] rounded pl-9 pr-3 py-2 text-sm text-[#e5e2e1] placeholder-[#444653] outline-none"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'enrolled', label: 'Enrolled' },
            { id: 'pending', label: 'Pending QR' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                filter === id
                  ? 'bg-[#1e3fae] text-white border-[#1e3fae]'
                  : 'text-[#8e909f] border-[#444653] hover:border-[#8e909f]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="ml-auto flex gap-3 text-xs font-mono">
          <span className="text-emerald-400">{MOCK_RESIDENTS.filter(r => r.hasProfile).length} Enrolled</span>
          <span className="text-amber-400">{MOCK_RESIDENTS.filter(r => !r.hasProfile).length} Pending</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07] text-[10px] font-mono text-[#444653] uppercase tracking-widest">
              <th className="text-left px-6 py-3">Resident ID</th>
              <th className="text-left px-4 py-3">Full Name</th>
              <th className="text-left px-4 py-3">Age</th>
              <th className="text-left px-4 py-3">Gender</th>
              <th className="text-left px-4 py-3">Barangay</th>
              <th className="text-left px-4 py-3">QR Profile</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(resident => (
              <tr
                key={resident.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-3">
                  <span className="text-xs font-mono text-[#b8c4ff]">{resident.id}</span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#e5e2e1]">{resident.name}</td>
                <td className="px-4 py-3 text-sm text-[#c5c5d5]">{resident.age}</td>
                <td className="px-4 py-3 text-sm text-[#c5c5d5]">{resident.gender}</td>
                <td className="px-4 py-3 text-xs text-[#8e909f]">{resident.barangay}</td>
                <td className="px-4 py-3">
                  {resident.hasProfile ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                      <QrCode size={12} />
                      <span>Enrolled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
                      <UserX size={12} />
                      <span>Pending</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    resident.status === 'Active'
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20'
                      : 'text-[#8e909f] border-[#444653]'
                  }`}>
                    {resident.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-[10px] font-mono text-[#b8c4ff] hover:text-[#e5e2e1] border border-[#1e3fae]/40 hover:border-[#1e3fae] px-2 py-1 rounded transition-colors"
                    onClick={() => navigate('/admin/enrollment')}
                  >
                    {resident.hasProfile ? 'View' : 'Enroll'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#444653]">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-mono text-sm">No residents match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
