import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { LibraryAdminDashboard } from './components/admin/LibraryAdminDashboard';
import { InteractiveSeatMap } from './components/admin/InteractiveSeatMap';
import { KycApprovalQueue } from './components/admin/KycApprovalQueue';
import { FinancialsView } from './components/admin/FinancialsView';
import { BranchSettingsView } from './components/admin/BranchSettingsView';
import { SeatStickerGenerator } from './components/admin/SeatStickerGenerator';
import { StudentPortal } from './components/student/StudentPortal';
import {
  LayoutDashboard,
  Armchair,
  FileCheck,
  Receipt,
  Settings,
  Printer,
  ShieldCheck,
  Sparkles,
  MapPin,
} from 'lucide-react';

type AdminTab =
  | 'DASHBOARD'
  | 'SEAT_MAP'
  | 'KYC_APPROVALS'
  | 'FINANCIALS'
  | 'BRANCH_SETTINGS'
  | 'STICKERS';

const MainContent: React.FC = () => {
  const { currentRole, kycRequests, activeTenant, geoState, isInsideGeofence, currentDistanceMeters } = useApp();
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const pendingKycCount = kycRequests.filter((k) => k.status === 'PENDING').length;

  const adminNavTabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'SEAT_MAP', label: '2D Seat Map', icon: <Armchair className="w-4 h-4" /> },
    {
      id: 'KYC_APPROVALS',
      label: 'KYC Approvals',
      icon: <FileCheck className="w-4 h-4" />,
      badge: pendingKycCount,
    },
    { id: 'FINANCIALS', label: 'Ledgers & Costs', icon: <Receipt className="w-4 h-4" /> },
    { id: 'BRANCH_SETTINGS', label: 'Geofence Settings', icon: <MapPin className="w-4 h-4" /> },
    { id: 'STICKERS', label: 'Seat Stickers', icon: <Printer className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar onOpenProfile={() => setIsProfileModalOpen(true)} />

      {/* Role-Specific Sub-Navigation (Only for Library Admin) */}
      {currentRole === 'LIBRARY_ADMIN' && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 overflow-x-auto py-2.5 no-scrollbar">
              {adminNavTabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    adminTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}

        {currentRole === 'LIBRARY_ADMIN' && (
          <div>
            {adminTab === 'DASHBOARD' && (
              <LibraryAdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />
            )}
            {adminTab === 'SEAT_MAP' && <InteractiveSeatMap />}
            {adminTab === 'KYC_APPROVALS' && <KycApprovalQueue />}
            {adminTab === 'FINANCIALS' && <FinancialsView />}
            {adminTab === 'BRANCH_SETTINGS' && <BranchSettingsView />}
            {adminTab === 'STICKERS' && <SeatStickerGenerator />}
          </div>
        )}

        {currentRole === 'STUDENT' && <StudentPortal />}
      </main>

      {/* User Profile Modal (Name, Photo, Password) */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
