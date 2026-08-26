import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentRegistrationFlow } from './StudentRegistrationFlow';
import {
  MapPin,
  QrCode,
  Wifi,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Phone,
  Copy,
  Check,
  Building2,
  Armchair,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { formatDate, formatDateTime, formatCurrency, generateQrSvgUrl } from '../../utils/helpers';

export const StudentPortal: React.FC = () => {
  const {
    activeTenant,
    currentUser,
    occupants,
    isInsideGeofence,
    currentDistanceMeters,
    punchStudentAttendance,
    attendanceRecords,
    setSimulatedGPS,
    geoState,
    fireConfetti,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'BADGE' | 'ATTENDANCE' | 'APPLY_NEW'>('BADGE');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [punchSuccessMessage, setPunchSuccessMessage] = useState<string | null>(null);

  // Find active occupant details for this student
  // In demo mode, pick matching occupant or first occupant in tenant
  const studentOccupancy =
    occupants.find((o) => o.studentId === currentUser.id || o.studentEmail === currentUser.email) ||
    occupants[0];

  const studentAttendanceLogs = attendanceRecords.filter(
    (a) => a.studentId === currentUser.id || a.studentName === studentOccupancy?.studentName
  );

  const handleCopyWifi = () => {
    if (activeTenant?.wifiPassword) {
      navigator.clipboard.writeText(activeTenant.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  const handlePunchAttendance = () => {
    if (!isInsideGeofence || !studentOccupancy) return;

    punchStudentAttendance(
      studentOccupancy.seatId,
      studentOccupancy.shift,
      studentOccupancy.studentName
    );

    setPunchSuccessMessage(
      `Attendance verified and logged at ${new Date().toLocaleTimeString()}! (Distance: ${currentDistanceMeters.toFixed(1)}m)`
    );
    fireConfetti();
    setTimeout(() => setPunchSuccessMessage(null), 5000);
  };

  const badgeQrPayload = `STUDENT:${studentOccupancy?.studentId || 'stud-101'};NAME:${studentOccupancy?.studentName || currentUser.name};SEAT:${studentOccupancy?.seatId || 'A-01'};TENANT:${activeTenant?.code}`;
  const badgeQrUrl = generateQrSvgUrl(badgeQrPayload);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Mobile Top Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTab('BADGE')}
          className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BADGE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          My Digital Badge
        </button>
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          GPS Attendance Punch
        </button>
        <button
          onClick={() => setActiveTab('APPLY_NEW')}
          className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
            activeTab === 'APPLY_NEW'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          New Admission KYC
        </button>
      </div>

      {/* Tab 1: Digital ID Badge */}
      {activeTab === 'BADGE' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Futuristic / Clean Digital ID Card */}
          <div
            id="digital-student-badge-card"
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-indigo-900/60 relative overflow-hidden space-y-6"
          >
            {/* Background Aesthetic Watermark */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Badge Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                    {activeTenant?.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Branch: {activeTenant?.code} • Student ID Badge
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ● Active Member
              </span>
            </div>

            {/* Member Core Profile & Seat */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    studentOccupancy?.studentPhoto ||
                    currentUser.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                  }
                  alt={studentOccupancy?.studentName || currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-400/50 shadow-lg"
                />
                <div>
                  <h4 className="font-extrabold text-lg text-white">
                    {studentOccupancy?.studentName || currentUser.name}
                  </h4>
                  <p className="text-xs text-indigo-300 font-medium">
                    {studentOccupancy?.planName || 'Monthly Deep Focus Plan'}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Valid Till: {formatDate(studentOccupancy?.expiryDate || '2026-12-31')}
                  </div>
                </div>
              </div>

              {/* Large Desk Badge */}
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                  Assigned Desk
                </span>
                <span className="text-3xl font-black font-mono text-white">
                  {studentOccupancy?.seatId ? 'A-01' : 'A-01'}
                </span>
                <span className="text-[10px] text-slate-300 block font-semibold">
                  {studentOccupancy?.shift || 'MORNING'} Shift
                </span>
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Geofence Security Token
                </span>
                <div className="font-mono text-xs text-teal-300 tracking-widest">
                  GEOFENCE-HASH: #88F9-2026
                </div>
                <div className="text-[10px] text-slate-400">Scan at entrance kiosk or desk scanner</div>
              </div>

              <div className="p-1.5 bg-white rounded-xl shadow-md">
                <img src={badgeQrUrl} alt="Badge QR" className="w-14 h-14 rounded-md" />
              </div>
            </div>
          </div>

          {/* Member WiFi Card with 1-Click Copy */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">High-Speed Study WiFi</h4>
                <div className="text-xs text-slate-500 font-mono">
                  SSID: <strong>{activeTenant?.wifiSsid}</strong> • Password: <strong>{activeTenant?.wifiPassword}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyWifi}
              className="px-3 py-2 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Pass
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: GPS Attendance Puncher */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                GPS Geofenced Punch Clock
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Daily Attendance Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No SMS codes needed. Your device's satellite location automatically confirms your desk presence.
              </p>
            </div>

            {/* Geofence Proximity Status Ring */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all ${
                isInsideGeofence
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin
                  className={`w-5 h-5 ${
                    isInsideGeofence ? 'text-emerald-600 animate-pulse' : 'text-rose-600'
                  }`}
                />
                <span
                  className={`font-black text-sm uppercase tracking-wider ${
                    isInsideGeofence ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {isInsideGeofence ? 'Inside Library Geofence' : 'Outside Library Geofence'}
                </span>
              </div>

              <div className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {currentDistanceMeters.toFixed(1)}m
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Distance to {activeTenant?.name} (Allowed: &lt; {activeTenant?.geofenceRadiusMeters}m)
              </p>

              {/* Instant Test GPS Toggles */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Preview Simulator:</span>
                <button
                  onClick={() => setSimulatedGPS(activeTenant?.latitude || 28.6315, activeTenant?.longitude || 77.2167)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                >
                  Jump Inside Library (0m)
                </button>
                <button
                  onClick={() =>
                    setSimulatedGPS(
                      (activeTenant?.latitude || 28.6315) + 0.006,
                      (activeTenant?.longitude || 77.2167) + 0.006
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[11px]"
                >
                  Jump Away (650m)
                </button>
              </div>
            </div>

            {/* Attendance Punch Button */}
            <div>
              <button
                id="student-punch-attendance-btn"
                disabled={!isInsideGeofence}
                onClick={handlePunchAttendance}
                className={`w-full py-4 min-h-[56px] rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isInsideGeofence
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 scale-100 hover:scale-[1.02] cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Clock className="w-5 h-5" />
                {isInsideGeofence ? 'PUNCH ATTENDANCE NOW' : 'GEOFENCE LOCKED — MUST BE AT DESK'}
              </button>
            </div>

            {punchSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{punchSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Student's Punch History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              My Attendance History (Past Sessions)
            </h4>

            {studentAttendanceLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No punch logs recorded yet today.</p>
            ) : (
              <div className="space-y-2">
                {studentAttendanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">Desk {log.seatNumber}</span>
                        <span className="text-slate-400 ml-2 font-mono">({log.shift})</span>
                      </div>
                    </div>
                    <span className="font-mono text-slate-500">{formatDateTime(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: New Student KYC Registration Flow */}
      {activeTab === 'APPLY_NEW' && (
        <StudentRegistrationFlow onComplete={() => setActiveTab('BADGE')} />
      )}
    </div>
  );
};
