import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Building2,
  Users,
  GraduationCap,
  MapPin,
  Moon,
  Sun,
  Shield,
  Navigation,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface NavbarProps {
  onToggleMobileFrame?: () => void;
  isMobileFrame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileFrame, isMobileFrame }) => {
  const {
    currentRole,
    setCurrentRole,
    tenants,
    activeTenantId,
    setActiveTenantId,
    activeTenant,
    isDarkMode,
    toggleDarkMode,
    currentProfile,
    geoState,
    refreshGPS,
    toggleSimulatedGPS,
    setSimulatedInsideState,
    getGeofenceStatus,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGpsMenuOpen, setIsGpsMenuOpen] = useState(false);

  const geofence = getGeofenceStatus();

  return (
    <>
      <header
        id="app-header-navbar"
        className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    Libri<span className="text-teal-600 dark:text-teal-400">Space</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    SaaS Multi-Tenant
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] md:max-w-xs">
                  {activeTenant?.name || 'Library Management System'}
                </p>
              </div>
            </div>

            {/* Middle: Quick Role Switcher Pill Bar */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                id="role-super-admin-btn"
                onClick={() => setCurrentRole('SUPER_ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'SUPER_ADMIN'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="SaaS Platform Super Admin"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">SaaS Super Admin</span>
                <span className="md:hidden">Super</span>
              </button>

              <button
                id="role-library-admin-btn"
                onClick={() => setCurrentRole('LIBRARY_ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'LIBRARY_ADMIN'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Library Branch Admin / Tenant"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Library Admin</span>
                <span className="md:hidden">Admin</span>
              </button>

              <button
                id="role-student-btn"
                onClick={() => setCurrentRole('STUDENT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'STUDENT'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Student Member Mobile Portal"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Student Portal</span>
                <span className="md:hidden">Student</span>
              </button>
            </div>

            {/* Right Controls: Branch Dropdown, GPS Widget, Theme, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tenant Switcher (For Admins) */}
              {currentRole !== 'SUPER_ADMIN' && (
                <div className="hidden lg:flex items-center gap-1 text-xs">
                  <select
                    id="tenant-branch-select"
                    value={activeTenantId}
                    onChange={(e) => setActiveTenantId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[160px] truncate"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* GPS Geofence Simulator Widget */}
              <div className="relative">
                <button
                  id="gps-geofence-tester-btn"
                  onClick={() => setIsGpsMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    geofence.isInside
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                  title="GPS Geofence Status & Simulator Controls"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xl:inline">
                    {geofence.isInside
                      ? `GPS: Inside (${geofence.distanceMeters.toFixed(0)}m)`
                      : `GPS: Outside (${geofence.distanceMeters.toFixed(0)}m)`}
                  </span>
                  <span className="xl:hidden">
                    {geofence.isInside ? 'In Geofence' : 'Out Geofence'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* GPS Simulator Dropdown */}
                {isGpsMenuOpen && (
                  <div
                    id="gps-simulator-dropdown"
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          GPS Geofence Sandbox
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        Radius: {activeTenant?.geofenceRadiusMeters}m
                      </span>
                    </div>

                    <div className="py-3 space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Current Status:</span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              geofence.isInside ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {geofence.isInside ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Inside ({geofence.distanceMeters.toFixed(1)}m)
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" /> Outside ({geofence.distanceMeters.toFixed(1)}m)
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {activeTenant?.name} (Lat: {activeTenant?.latitude}, Lng: {activeTenant?.longitude})
                        </p>
                      </div>

                      {/* Quick Location Presets */}
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Simulate Student Location
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="set-simulated-inside-btn"
                          onClick={() => {
                            setSimulatedInsideState(true);
                            setIsGpsMenuOpen(false);
                          }}
                          className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                            geoState.isSimulated && geoState.simulatedInside
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Inside (14m)</span>
                        </button>

                        <button
                          id="set-simulated-outside-btn"
                          onClick={() => {
                            setSimulatedInsideState(false);
                            setIsGpsMenuOpen(false);
                          }}
                          className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                            geoState.isSimulated && !geoState.simulatedInside
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Outside (185m)</span>
                        </button>
                      </div>

                      {/* Real GPS button */}
                      <button
                        id="use-device-gps-btn"
                        onClick={() => {
                          refreshGPS();
                          setIsGpsMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-indigo-500" />
                        <span>Acquire Real Device GPS</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                id="toggle-dark-mode-btn"
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* User Profile Avatar / Trigger */}
              <button
                id="open-profile-modal-btn"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Edit User Profile & Password"
              >
                <img
                  src={currentProfile.avatarUrl}
                  alt={currentProfile.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700 group-hover:ring-indigo-500"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[100px] truncate">
                    {currentProfile.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {currentRole === 'SUPER_ADMIN' ? 'Super' : currentRole === 'LIBRARY_ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
