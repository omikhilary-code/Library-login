import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftType, Seat, ShiftOccupant, SeatStatus } from '../../types';
import {
  Armchair,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  X,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const InteractiveSeatMap: React.FC = () => {
  const {
    seats,
    occupants,
    activeShift,
    setActiveShift,
    activeTenant,
    getSeatOccupant,
    assignOccupant,
    vacateSeat,
    updateSeatStatus,
    recordPayment,
    feeLedgers,
    fireConfetti,
  } = useApp();

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [searchSeatQuery, setSearchSeatQuery] = useState<string>('');

  // Form state for assigning a student
  const [assignForm, setAssignForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    planName: 'Standard Monthly',
    monthlyFee: 1400,
    paidAmount: 1400,
    notes: '',
  });

  const shifts: { id: ShiftType; label: string; timing: string }[] = [
    { id: 'MORNING', label: 'Morning Shift', timing: activeTenant?.shiftHours.MORNING || '06:00 AM - 12:00 PM' },
    { id: 'AFTERNOON', label: 'Afternoon Shift', timing: activeTenant?.shiftHours.AFTERNOON || '12:00 PM - 05:00 PM' },
    { id: 'EVENING', label: 'Evening Shift', timing: activeTenant?.shiftHours.EVENING || '05:00 PM - 11:00 PM' },
    { id: 'FULL_DAY', label: 'Full Day / 24x7', timing: activeTenant?.shiftHours.FULL_DAY || '06:00 AM - 11:00 PM' },
  ];

  // Group seats by sections
  const sections: string[] = Array.from(new Set(seats.map((s) => s.section)));

  // Calculate shift stats
  const totalSeatsCount = seats.length;
  let occupiedCount = 0;
  let paymentDueCount = 0;
  let maintenanceCount = 0;

  seats.forEach((s) => {
    const occ = getSeatOccupant(s.id, activeShift);
    if (occ) {
      if (occ.status === 'OCCUPIED') occupiedCount++;
      else if (occ.status === 'PAYMENT_DUE') paymentDueCount++;
      else if (occ.status === 'MAINTENANCE') maintenanceCount++;
    }
  });

  const availableCount = Math.max(0, totalSeatsCount - occupiedCount - paymentDueCount - maintenanceCount);
  const occupancyPercent = totalSeatsCount > 0 ? Math.round(((occupiedCount + paymentDueCount) / totalSeatsCount) * 100) : 0;

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !assignForm.studentName) return;

    const due = Math.max(0, assignForm.monthlyFee - assignForm.paidAmount);
    const status: SeatStatus = due === 0 ? 'OCCUPIED' : 'PAYMENT_DUE';

    assignOccupant({
      seatId: selectedSeat.id,
      tenantId: selectedSeat.tenantId,
      shift: activeShift,
      studentId: `stud-${Date.now()}`,
      studentName: assignForm.studentName,
      studentEmail: assignForm.studentEmail || `${assignForm.studentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      studentPhone: assignForm.studentPhone || '+91 98000 11223',
      status,
      planName: assignForm.planName,
      monthlyFee: assignForm.monthlyFee,
      paidAmount: assignForm.paidAmount,
      dueAmount: due,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: assignForm.notes,
    });

    setIsAssignModalOpen(false);
    fireConfetti();
  };

  const selectedOccupant = selectedSeat ? getSeatOccupant(selectedSeat.id, activeShift) : undefined;

  return (
    <div className="space-y-6">
      {/* Top Shift Switcher & Summary Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Interactive 2D Seat Floor Plan</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Multi-Shift Scheduling
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a shift slot to view live seat occupancy, payment dues, and reassign desks in real-time.
            </p>
          </div>

          {/* Shift Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                id={`shift-tab-${shift.id.toLowerCase()}`}
                onClick={() => setActiveShift(shift.id)}
                className={`flex flex-col items-start px-3.5 py-2 min-h-[44px] rounded-xl border text-left transition-all ${
                  activeShift === shift.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <span className="text-xs font-bold">{shift.label}</span>
                <span className={`text-[10px] ${activeShift === shift.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {shift.timing}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend & Quick Filters */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs"></span>
              <span>Available ({availableCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-xs"></span>
              <span>Occupied ({occupiedCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-xs"></span>
              <span>Payment Due ({paymentDueCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-400 shadow-xs"></span>
              <span>Maintenance ({maintenanceCount})</span>
            </div>
          </div>

          {/* Section Filter & Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find seat (e.g. A-01)..."
                value={searchSeatQuery}
                onChange={(e) => setSearchSeatQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Zones</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2D Floor Plan Grid Stage */}
      <div className="space-y-6">
        {sections
          .filter((sec) => filterSection === 'ALL' || filterSection === sec)
          .map((sectionName) => {
            const sectionSeats = seats.filter(
              (s) =>
                s.section === sectionName &&
                (searchSeatQuery === '' || s.seatNumber.toLowerCase().includes(searchSeatQuery.toLowerCase()))
            );

            if (sectionSeats.length === 0) return null;

            return (
              <div
                key={sectionName}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{sectionName}</h3>
                    <span className="text-xs text-slate-400 font-normal">({sectionSeats.length} Desks)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    {sectionName.includes('Silent') ? 'Strict Quiet Zone 🤫' : sectionName.includes('Window') ? 'Natural Light ☀️' : 'Collaborative 💬'}
                  </span>
                </div>

                {/* Grid of Seats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                  {sectionSeats.map((seat) => {
                    const occupant = getSeatOccupant(seat.id, activeShift);
                    const status: SeatStatus = occupant ? occupant.status : 'AVAILABLE';

                    const statusStyles: Record<SeatStatus, { bg: string; border: string; text: string; iconColor: string }> = {
                      AVAILABLE: {
                        bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
                        border: 'border-emerald-200 dark:border-emerald-800/80',
                        text: 'text-emerald-800 dark:text-emerald-300',
                        iconColor: 'text-emerald-600 dark:text-emerald-400',
                      },
                      OCCUPIED: {
                        bg: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50',
                        border: 'border-rose-200 dark:border-rose-800/80',
                        text: 'text-rose-800 dark:text-rose-300',
                        iconColor: 'text-rose-600 dark:text-rose-400',
                      },
                      PAYMENT_DUE: {
                        bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
                        border: 'border-amber-200 dark:border-amber-800/80',
                        text: 'text-amber-800 dark:text-amber-300',
                        iconColor: 'text-amber-600 dark:text-amber-400',
                      },
                      MAINTENANCE: {
                        bg: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800',
                        border: 'border-slate-300 dark:border-slate-700',
                        text: 'text-slate-600 dark:text-slate-400',
                        iconColor: 'text-slate-500',
                      },
                    };

                    const style = statusStyles[status];
                    const isSelected = selectedSeat?.id === seat.id;

                    return (
                      <button
                        key={seat.id}
                        id={`seat-card-${seat.seatNumber}`}
                        onClick={() => handleSeatClick(seat)}
                        className={`p-3.5 min-h-[90px] rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer group ${
                          style.bg
                        } ${style.border} ${
                          isSelected ? 'ring-3 ring-indigo-500 scale-105 shadow-lg' : 'hover:scale-[1.03]'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                            {seat.seatNumber}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${status === 'AVAILABLE' ? 'bg-emerald-500' : status === 'OCCUPIED' ? 'bg-rose-500' : status === 'PAYMENT_DUE' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        </div>

                        <div className="my-1">
                          <Armchair className={`w-6 h-6 ${style.iconColor} group-hover:scale-110 transition-transform`} />
                        </div>

                        <div className="w-full truncate">
                          {status === 'AVAILABLE' && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Available</span>
                          )}
                          {status === 'OCCUPIED' && (
                            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 truncate block">
                              {occupant?.studentName.split(' ')[0]}
                            </span>
                          )}
                          {status === 'PAYMENT_DUE' && (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 truncate block">
                              Due {formatCurrency(occupant?.dueAmount || 0)}
                            </span>
                          )}
                          {status === 'MAINTENANCE' && (
                            <span className="text-[11px] font-bold text-slate-500">Service</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Slide-out / Detail Modal for Selected Seat */}
      {selectedSeat && (
        <div
          id="seat-details-drawer-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 sm:p-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedSeat(null)}
        >
          <div
            className="w-full sm:max-w-md sm:h-full bg-white dark:bg-slate-900 sm:border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between rounded-3xl sm:rounded-none animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-lg">
                    {selectedSeat.seatNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      Desk {selectedSeat.seatNumber}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedSeat.section}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Shift Badge */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold">Active Shift: {activeShift}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {shifts.find((s) => s.id === activeShift)?.timing}
                </span>
              </div>

              {/* Seat Amenities */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Desk Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeat.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-medium"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                    Type: {selectedSeat.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Occupant Profile View */}
              {selectedOccupant && selectedOccupant.status !== 'MAINTENANCE' ? (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Current Occupant
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        selectedOccupant.status === 'OCCUPIED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {selectedOccupant.status === 'OCCUPIED' ? 'Active Paid' : 'Payment Due'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedOccupant.studentPhoto ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={selectedOccupant.studentName}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {selectedOccupant.studentName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedOccupant.planName}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOccupant.studentPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOccupant.studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Plan Expiry: {formatDate(selectedOccupant.expiryDate)}</span>
                    </div>
                  </div>

                  {/* Financial Due Block */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Monthly Fee:</span>{' '}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(selectedOccupant.monthlyFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Pending:</span>{' '}
                      <span
                        className={`font-bold ${
                          selectedOccupant.dueAmount > 0 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(selectedOccupant.dueAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Record Payment for Due */}
                  {selectedOccupant.dueAmount > 0 && (
                    <button
                      onClick={() => {
                        const matchingLedger = feeLedgers.find((l) => l.studentId === selectedOccupant.studentId);
                        if (matchingLedger) {
                          recordPayment(matchingLedger.id, selectedOccupant.dueAmount, 'UPI');
                        }
                      }}
                      className="w-full py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <DollarSign className="w-4 h-4" /> Collect Full Due ({formatCurrency(selectedOccupant.dueAmount)})
                    </button>
                  )}
                </div>
              ) : selectedOccupant?.status === 'MAINTENANCE' ? (
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-2 text-center">
                  <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Under Maintenance</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedOccupant.notes || 'This seat is flagged for repair/cleaning in this shift.'}
                  </p>
                  <button
                    onClick={() => updateSeatStatus(selectedSeat.id, activeShift, 'AVAILABLE')}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                  >
                    Mark as Available
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-base">Seat is Available</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      No active bookings for Desk {selectedSeat.seatNumber} in {activeShift} shift.
                    </p>
                  </div>
                  <button
                    id="assign-student-to-seat-btn"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full py-3 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Assign Student to Seat
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {selectedOccupant && selectedOccupant.status !== 'MAINTENANCE' && (
                <button
                  id="vacate-seat-btn"
                  onClick={() => {
                    if (confirm(`Vacate seat ${selectedSeat.seatNumber} for ${selectedOccupant.studentName}?`)) {
                      vacateSeat(selectedSeat.id, activeShift);
                      setSelectedSeat(null);
                    }
                  }}
                  className="w-full py-3 min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Vacate Seat (Free Up Desk)
                </button>
              )}

              {!selectedOccupant && (
                <button
                  onClick={() => updateSeatStatus(selectedSeat.id, activeShift, 'MAINTENANCE', 'Routine Inspection')}
                  className="w-full py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" /> Put Under Maintenance
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {isAssignModalOpen && selectedSeat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Assign Student to Desk {selectedSeat.seatNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedSeat.section} • {activeShift} Shift
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.studentName}
                  onChange={(e) => setAssignForm({ ...assignForm, studentName: e.target.value })}
                  placeholder="e.g. Rahul Sen"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={assignForm.studentPhone}
                    onChange={(e) => setAssignForm({ ...assignForm, studentPhone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={assignForm.studentEmail}
                    onChange={(e) => setAssignForm({ ...assignForm, studentEmail: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={assignForm.monthlyFee}
                    onChange={(e) => setAssignForm({ ...assignForm, monthlyFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Paid Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={assignForm.paidAmount}
                    onChange={(e) => setAssignForm({ ...assignForm, paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
