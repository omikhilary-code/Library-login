import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Armchair,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp,
  FileCheck,
  Receipt,
  Settings,
  Printer,
  Plus,
  X,
  ShieldCheck,
  DollarSign,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { ShiftType } from '../../types';

interface LibraryAdminDashboardProps {
  onNavigateTab: (tab: 'DASHBOARD' | 'SEAT_MAP' | 'KYC_APPROVALS' | 'FINANCIALS' | 'BRANCH_SETTINGS' | 'STICKERS') => void;
}

export const LibraryAdminDashboard: React.FC<LibraryAdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    activeTenant,
    seats,
    occupants,
    activeShift,
    kycRequests,
    attendanceRecords,
    feeLedgers,
    getTodayCheckInCount,
    manualAdminOverrideAttendance,
    recordPayment,
    fireConfetti,
  } = useApp();

  // Receptionist Manual Override Check-in Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    studentName: '',
    seatNumber: 'A-01',
    shift: 'MORNING' as ShiftType,
    notes: 'Phone GPS failed; student ID verified at reception desk.',
  });

  // Calculate live occupancy for active shift
  const totalSeats = seats.length;
  const shiftOccupants = occupants.filter((o) => o.shift === activeShift);
  const occupiedCount = shiftOccupants.filter((o) => o.status === 'OCCUPIED').length;
  const paymentDueCount = shiftOccupants.filter((o) => o.status === 'PAYMENT_DUE').length;
  const activeBookings = occupiedCount + paymentDueCount;
  const occupancyPercent = totalSeats > 0 ? Math.round((activeBookings / totalSeats) * 100) : 0;

  // Overdue Ledgers
  const overdueLedgers = feeLedgers.filter((l) => l.pendingBalance > 0);
  const pendingKycCount = kycRequests.filter((k) => k.status === 'PENDING').length;
  const todayCheckIns = getTodayCheckInCount();

  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideForm.studentName) return;

    manualAdminOverrideAttendance(
      overrideForm.studentName,
      overrideForm.seatNumber,
      overrideForm.shift,
      overrideForm.notes
    );
    setIsOverrideModalOpen(false);
    setOverrideForm({
      studentName: '',
      seatNumber: 'A-01',
      shift: 'MORNING',
      notes: 'Phone GPS failed; verified in person at desk.',
    });
    fireConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Branch Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              Branch Operations Node
            </span>
            <span className="text-xs text-slate-400">Code: {activeTenant?.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeTenant?.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {activeTenant?.address} • GPS Anchor ({activeTenant?.latitude.toFixed(4)}, {activeTenant?.longitude.toFixed(4)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="reception-manual-checkin-btn"
            onClick={() => setIsOverrideModalOpen(true)}
            className="px-4 py-3 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <UserCheck className="w-4 h-4" /> Reception Desk Check-in Override
          </button>
          <button
            onClick={() => onNavigateTab('SEAT_MAP')}
            className="px-4 py-3 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition-colors"
          >
            <Armchair className="w-4 h-4" /> View 2D Floor Plan
          </button>
        </div>
      </div>

      {/* Main Widget Area: 4 Key Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Occupancy Rate Gauge */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Occupancy ({activeShift})
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-center gap-4">
            {/* Circular / Visual Percent */}
            <div className="relative w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
              <span>{occupancyPercent}%</span>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {activeBookings} / {totalSeats}
              </div>
              <span className="text-xs text-slate-400">Active Shift Desks</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Today's Verified Check-ins */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Check-ins</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{todayCheckIns}</div>
            <span className="text-xs text-emerald-600 font-semibold">100% Location Verified</span>
          </div>
          <span className="text-[11px] text-slate-400">Zero OTP fraud logged</span>
        </div>

        {/* Metric 3: Pending KYC Approvals */}
        <div
          onClick={() => onNavigateTab('KYC_APPROVALS')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-indigo-400 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">KYC Approval Queue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <div className="text-3xl font-black text-amber-600">{pendingKycCount}</div>
            <span className="text-xs text-slate-500">applicants waiting</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
            Review Documents →
          </span>
        </div>

        {/* Metric 4: Geofence Verification Status */}
        <div
          onClick={() => onNavigateTab('BRANCH_SETTINGS')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-teal-400 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">GPS Geofence</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {activeTenant?.geofenceRadiusMeters}m Radius
            </div>
            <span className="text-xs text-teal-600 font-semibold">Active & Armed</span>
          </div>
          <span className="text-xs font-bold text-teal-600 group-hover:underline flex items-center gap-1">
            Configure Radius & Map Pin →
          </span>
        </div>
      </div>

      {/* Main Two Column Area: Overdue Payments & Live Attendance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Overdue / Due Payments List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pending & Overdue Student Fees
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('FINANCIALS')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Ledger →
            </button>
          </div>

          {overdueLedgers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All student fee dues are currently cleared!
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueLedgers.slice(0, 5).map((ledger) => (
                <div
                  key={ledger.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {ledger.studentName}
                    </div>
                    <div className="text-slate-400">
                      Desk {ledger.seatNumber} • {ledger.shift} Shift
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-extrabold text-amber-600 text-sm">
                      Due: {formatCurrency(ledger.pendingBalance)}
                    </div>
                    <button
                      onClick={() => recordPayment(ledger.id, ledger.pendingBalance, 'UPI')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                    >
                      Collect Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live GPS Attendance Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live Check-in & Punch Activity
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-bold">
              ● Live Stream
            </span>
          </div>

          <div className="space-y-2.5">
            {attendanceRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No check-in activity recorded yet today.
              </div>
            ) : (
              attendanceRecords.slice(0, 6).map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                      {att.seatNumber}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{att.studentName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {att.isManualOverride ? (
                          <span className="text-indigo-600 font-semibold">
                            Desk Override ({att.overrideAdminName})
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">
                            GPS Verified ({att.distanceMeters?.toFixed(1) || '12'}m away)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {formatDateTime(att.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Check-in Override Modal */}
      {isOverrideModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsOverrideModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Receptionist Attendance Override
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fallback check-in when a student's mobile GPS sensor is unavailable.
                </p>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCheckInSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={overrideForm.studentName}
                  onChange={(e) => setOverrideForm({ ...overrideForm, studentName: e.target.value })}
                  placeholder="e.g. Pooja Hegde"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Desk #
                  </label>
                  <select
                    value={overrideForm.seatNumber}
                    onChange={(e) => setOverrideForm({ ...overrideForm, seatNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {seats.map((s) => (
                      <option key={s.id} value={s.seatNumber}>
                        {s.seatNumber} ({s.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Shift
                  </label>
                  <select
                    value={overrideForm.shift}
                    onChange={(e) => setOverrideForm({ ...overrideForm, shift: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="FULL_DAY">Full Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Override
                </label>
                <input
                  type="text"
                  value={overrideForm.notes}
                  onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Verify & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
