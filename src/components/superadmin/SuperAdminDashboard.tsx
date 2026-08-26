import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TenantBranch, SubscriptionStatus } from '../../types';
import {
  Building2,
  TrendingUp,
  Users,
  Armchair,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  ShieldCheck,
  MapPin,
  Wifi,
  ExternalLink,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const SuperAdminDashboard: React.FC = () => {
  const {
    tenants,
    addTenant,
    updateTenantStatus,
    deleteTenant,
    setActiveTenantId,
    setCurrentRole,
    fireConfetti,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New tenant form state
  const [newTenantData, setNewTenantData] = useState<Omit<TenantBranch, 'id' | 'createdAt'>>({
    name: '',
    code: '',
    city: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    latitude: 28.6315,
    longitude: 77.2167,
    geofenceRadiusMeters: 50,
    subscriptionStatus: 'ACTIVE',
    monthlySubscriptionFee: 3999,
    totalSeats: 32,
    wifiSsid: 'LibriSpace_Fibre_Guest',
    wifiPassword: 'StudySpace@2026',
    shiftHours: {
      MORNING: '06:00 AM - 12:00 PM',
      AFTERNOON: '12:00 PM - 05:00 PM',
      EVENING: '05:00 PM - 11:00 PM',
      FULL_DAY: '06:00 AM - 11:00 PM',
    },
  });

  // Calculate platform metrics
  const totalActiveTenants = tenants.filter((t) => t.subscriptionStatus === 'ACTIVE').length;
  const totalMRR = tenants
    .filter((t) => t.subscriptionStatus === 'ACTIVE' || t.subscriptionStatus === 'TRIAL')
    .reduce((sum, t) => sum + t.monthlySubscriptionFee, 0);
  const totalPlatformSeats = tenants.reduce((sum, t) => sum + t.totalSeats, 0);

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tenant.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.name || !newTenantData.ownerName) return;

    addTenant(newTenantData);
    setIsAddModalOpen(false);
    // Reset form
    setNewTenantData({
      name: '',
      code: '',
      city: '',
      address: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      latitude: 28.6315,
      longitude: 77.2167,
      geofenceRadiusMeters: 50,
      subscriptionStatus: 'ACTIVE',
      monthlySubscriptionFee: 3999,
      totalSeats: 32,
      wifiSsid: 'LibriSpace_Guest',
      wifiPassword: 'Password@123',
      shiftHours: {
        MORNING: '06:00 AM - 12:00 PM',
        AFTERNOON: '12:00 PM - 05:00 PM',
        EVENING: '05:00 PM - 11:00 PM',
        FULL_DAY: '06:00 AM - 11:00 PM',
      },
    });
  };

  const handleManageBranch = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setCurrentRole('LIBRARY_ADMIN');
    fireConfetti();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              SaaS Control Plane
            </span>
            <span className="text-xs text-slate-400">Multi-Tenant Cloud Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Tenants
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Monitor all study libraries, co-working branch nodes, subscription billing status, and location-geofenced
            infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-new-tenant-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Provision New Library Tenant
          </button>
        </div>
      </div>

      {/* Global SaaS Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Active Tenants */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Libraries
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalActiveTenants}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ {tenants.length} total branches</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            100% cloud isolation enabled
          </p>
        </div>

        {/* Metric 2: Monthly Recurring Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Platform MRR
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalMRR)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+18.4% MoM</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Recurring SaaS subscription</p>
        </div>

        {/* Metric 3: Total Managed Seats */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capacity Under Mgmt
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalPlatformSeats}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Physical Desks</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across 4 multi-shift slots</p>
        </div>

        {/* Metric 4: Geofence Verification Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GPS Geofencing Active
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">99.8%</span>
            <span className="text-xs text-emerald-600 font-semibold">Zero OTP fraud</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Strict on-site verification</p>
        </div>
      </div>

      {/* Main View: Tenant Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Table Filters & Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registered Library Tenants</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage branches, verify subscriptions, and configure GPS geofence anchors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search library, owner, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Horizontally scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">Library Branch</th>
                <th className="py-4 px-4">Owner & Contact</th>
                <th className="py-4 px-4">GPS Geofence Anchor</th>
                <th className="py-4 px-4">Seats / Cap</th>
                <th className="py-4 px-4">Subscription</th>
                <th className="py-4 px-4">MRR</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No library branches found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const statusColors: Record<SubscriptionStatus, string> = {
                    ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                    TRIAL: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                    PAST_DUE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                    SUSPENDED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                  };

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Library Name & Location */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center font-extrabold text-indigo-700 dark:text-indigo-300 shrink-0">
                            {tenant.code.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{tenant.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                                {tenant.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                              {tenant.address}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner Details */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{tenant.ownerName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{tenant.ownerEmail}</div>
                        <div className="text-xs text-slate-400">{tenant.ownerPhone}</div>
                      </td>

                      {/* GPS Geofence */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Radius: {tenant.geofenceRadiusMeters}m</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {tenant.latitude.toFixed(4)}, {tenant.longitude.toFixed(4)}
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        {tenant.totalSeats} seats
                      </td>

                      {/* Subscription Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            statusColors[tenant.subscriptionStatus]
                          }`}
                        >
                          {tenant.subscriptionStatus === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                          {tenant.subscriptionStatus === 'TRIAL' && <Sparkles className="w-3 h-3" />}
                          {tenant.subscriptionStatus === 'PAST_DUE' && <AlertTriangle className="w-3 h-3" />}
                          {tenant.subscriptionStatus === 'SUSPENDED' && <XCircle className="w-3 h-3" />}
                          {tenant.subscriptionStatus}
                        </span>
                      </td>

                      {/* MRR */}
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(tenant.monthlySubscriptionFee)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleManageBranch(tenant.id)}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Enter this Library Admin View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Manage
                          </button>

                          {tenant.subscriptionStatus === 'ACTIVE' ? (
                            <button
                              onClick={() => updateTenantStatus(tenant.id, 'SUSPENDED')}
                              className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-semibold transition-colors"
                              title="Suspend branch access"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTenantStatus(tenant.id, 'ACTIVE')}
                              className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-colors"
                              title="Activate branch access"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete tenant "${tenant.name}"?`)) {
                                deleteTenant(tenant.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div
          id="add-tenant-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Provision New Library Tenant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adds an isolated database tenant with seats, GPS anchor, and multi-shift bookings.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Library / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantData.name}
                    onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                    placeholder="e.g. Athena Reading Lounge"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantData.code}
                    onChange={(e) => setNewTenantData({ ...newTenantData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ATH-MUM"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantData.city}
                    onChange={(e) => setNewTenantData({ ...newTenantData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Total Physical Seats
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={newTenantData.totalSeats}
                    onChange={(e) => setNewTenantData({ ...newTenantData, totalSeats: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={newTenantData.address}
                  onChange={(e) => setNewTenantData({ ...newTenantData, address: e.target.value })}
                  placeholder="e.g. 2nd Floor, Phoenix Mall Road, Kurla West, Mumbai 400070"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantData.ownerName}
                    onChange={(e) => setNewTenantData({ ...newTenantData, ownerName: e.target.value })}
                    placeholder="e.g. Rajesh Khurana"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newTenantData.ownerEmail}
                    onChange={(e) => setNewTenantData({ ...newTenantData, ownerEmail: e.target.value })}
                    placeholder="rajesh@library.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Owner Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTenantData.ownerPhone}
                    onChange={(e) => setNewTenantData({ ...newTenantData, ownerPhone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Geofence Settings */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 space-y-3">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>GPS Geofencing Configuration (Zero OTP)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newTenantData.latitude}
                      onChange={(e) => setNewTenantData({ ...newTenantData, latitude: parseFloat(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newTenantData.longitude}
                      onChange={(e) => setNewTenantData({ ...newTenantData, longitude: parseFloat(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Radius (meters)
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={250}
                      value={newTenantData.geofenceRadiusMeters}
                      onChange={(e) =>
                        setNewTenantData({ ...newTenantData, geofenceRadiusMeters: parseInt(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WiFi & Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Monthly SaaS Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={newTenantData.monthlySubscriptionFee}
                    onChange={(e) =>
                      setNewTenantData({ ...newTenantData, monthlySubscriptionFee: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Library WiFi SSID
                  </label>
                  <input
                    type="text"
                    value={newTenantData.wifiSsid}
                    onChange={(e) => setNewTenantData({ ...newTenantData, wifiSsid: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Library WiFi Password
                  </label>
                  <input
                    type="text"
                    value={newTenantData.wifiPassword}
                    onChange={(e) => setNewTenantData({ ...newTenantData, wifiPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-provision-tenant-btn"
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md"
                >
                  Provision Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
