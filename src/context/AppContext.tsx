import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  ShiftType,
  SeatStatus,
  SubscriptionStatus,
  TenantBranch,
  Seat,
  ShiftOccupant,
  StudentKYC,
  AttendanceRecord,
  FeeLedgerEntry,
  ExpenseItem,
  UserProfile,
  GeolocationState,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_SEATS,
  INITIAL_OCCUPANTS,
  INITIAL_KYC_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEDGERS,
  INITIAL_EXPENSES,
  INITIAL_PROFILES,
} from '../data/mockData';
import { isWithinGeofence, generateNearbyCoordinate } from '../utils/geo';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Authentication & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTenantId: string;
  setActiveTenantId: (tenantId: string) => void;
  currentProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Multi-Tenant data
  tenants: TenantBranch[];
  activeTenant: TenantBranch | undefined;
  addTenant: (newTenant: Omit<TenantBranch, 'id' | 'createdAt'>) => void;
  updateTenant: (tenantId: string, updates: Partial<TenantBranch>) => void;
  updateTenantStatus: (tenantId: string, status: SubscriptionStatus) => void;
  deleteTenant: (tenantId: string) => void;

  // Seats & Occupancy
  seats: Seat[];
  occupants: ShiftOccupant[];
  activeShift: ShiftType;
  setActiveShift: (shift: ShiftType) => void;
  getSeatOccupant: (seatId: string, shift: ShiftType) => ShiftOccupant | undefined;
  assignOccupant: (data: Omit<ShiftOccupant, 'id'>) => void;
  vacateSeat: (seatId: string, shift: ShiftType) => void;
  updateSeatStatus: (seatId: string, shift: ShiftType, status: SeatStatus, notes?: string) => void;

  // Geofencing & GPS
  geoState: GeolocationState;
  refreshGPS: () => void;
  toggleSimulatedGPS: () => void;
  setSimulatedInsideState: (inside: boolean) => void;
  getGeofenceStatus: (tenant?: TenantBranch) => { isInside: boolean; distanceMeters: number; targetRadius: number };

  // KYC Management
  kycRequests: StudentKYC[];
  submitKYCApplication: (data: Omit<StudentKYC, 'id' | 'appliedAt' | 'status'>) => Promise<boolean>;
  approveKYC: (kycId: string, seatId: string, monthlyFee: number) => void;
  rejectKYC: (kycId: string, reason: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  markAttendance: (type: 'CHECK_IN' | 'CHECK_OUT') => { success: boolean; message: string; record?: AttendanceRecord };
  manualAdminOverrideAttendance: (studentName: string, seatNumber: string, shift: ShiftType, notes: string) => void;
  getTodayCheckInCount: () => number;

  // Financials & Expenses
  feeLedgers: FeeLedgerEntry[];
  recordPayment: (ledgerId: string, amountPaid: number, method: FeeLedgerEntry['paymentMethod']) => void;
  addLedgerEntry: (entry: Omit<FeeLedgerEntry, 'id'>) => void;
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (expenseId: string) => void;

  // Student specific active state
  activeStudentData: {
    seat?: Seat;
    occupant?: ShiftOccupant;
    ledger?: FeeLedgerEntry;
    todayCheckedIn: boolean;
    lastAttendance?: AttendanceRecord;
  };

  // Helper trigger for confetti
  fireConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  TENANTS: 'librispace_tenants_v1',
  SEATS: 'librispace_seats_v1',
  OCCUPANTS: 'librispace_occupants_v1',
  KYC: 'librispace_kyc_v1',
  ATTENDANCE: 'librispace_attendance_v1',
  LEDGERS: 'librispace_ledgers_v1',
  EXPENSES: 'librispace_expenses_v1',
  PROFILES: 'librispace_profiles_v1',
  ROLE: 'librispace_role_v1',
  ACTIVE_TENANT: 'librispace_active_tenant_v1',
  DARK_MODE: 'librispace_dark_mode_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & Tenant State
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE) as UserRole) || 'LIBRARY_ADMIN';
  });

  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_TENANT) || 'tenant-1';
  });

  const [activeShift, setActiveShift] = useState<ShiftType>('MORNING');

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE) === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Entities Data state
  const [tenants, setTenants] = useState<TenantBranch[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TENANTS);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SEATS);
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });

  const [occupants, setOccupants] = useState<ShiftOccupant[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OCCUPANTS);
    return saved ? JSON.parse(saved) : INITIAL_OCCUPANTS;
  });

  const [kycRequests, setKycRequests] = useState<StudentKYC[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.KYC);
    return saved ? JSON.parse(saved) : INITIAL_KYC_REQUESTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [feeLedgers, setFeeLedgers] = useState<FeeLedgerEntry[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LEDGERS);
    return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SEATS, JSON.stringify(seats));
  }, [seats]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OCCUPANTS, JSON.stringify(occupants));
  }, [occupants]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.KYC, JSON.stringify(kycRequests));
  }, [kycRequests]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGERS, JSON.stringify(feeLedgers));
  }, [feeLedgers]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, role);
  };

  const setActiveTenantId = (tId: string) => {
    setActiveTenantIdState(tId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_TENANT, tId);
  };

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  // Geolocation state: supports real device GPS + toggleable simulator for instant in-browser test
  const [geoState, setGeoState] = useState<GeolocationState>({
    lat: 28.63155,
    lng: 77.21672,
    accuracy: 10,
    error: null,
    isSimulated: true, // Default to true so users can instantly test inside/outside on desktop without having to be in Delhi/BLR
    simulatedInside: true,
  });

  const refreshGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isSimulated: true,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          isSimulated: false,
          simulatedInside: false,
        });
      },
      (err) => {
        // Fallback to simulated if user denies or in sandbox iframe
        setGeoState((prev) => ({
          ...prev,
          error: err.message,
          isSimulated: true,
        }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  const toggleSimulatedGPS = () => {
    setGeoState((prev) => ({
      ...prev,
      isSimulated: !prev.isSimulated,
    }));
  };

  const setSimulatedInsideState = (inside: boolean) => {
    if (!activeTenant) return;
    if (inside) {
      // 12 meters from branch
      const coord = generateNearbyCoordinate(activeTenant.latitude, activeTenant.longitude, 12);
      setGeoState({
        lat: coord.lat,
        lng: coord.lng,
        accuracy: 8,
        error: null,
        isSimulated: true,
        simulatedInside: true,
      });
    } else {
      // 185 meters from branch (outside typical 50m geofence)
      const coord = generateNearbyCoordinate(activeTenant.latitude, activeTenant.longitude, 185);
      setGeoState({
        lat: coord.lat,
        lng: coord.lng,
        accuracy: 15,
        error: null,
        isSimulated: true,
        simulatedInside: false,
      });
    }
  };

  // Check geofence status
  const getGeofenceStatus = useCallback(
    (tenant?: TenantBranch) => {
      const target = tenant || activeTenant;
      if (!target) return { isInside: false, distanceMeters: 9999, targetRadius: 50 };

      // If simulated mode:
      if (geoState.isSimulated) {
        const distanceMeters = geoState.simulatedInside ? 14.5 : 185.0;
        return {
          isInside: distanceMeters <= target.geofenceRadiusMeters,
          distanceMeters,
          targetRadius: target.geofenceRadiusMeters,
        };
      }

      if (geoState.lat === null || geoState.lng === null) {
        return { isInside: false, distanceMeters: 9999, targetRadius: target.geofenceRadiusMeters };
      }

      const res = isWithinGeofence(
        geoState.lat,
        geoState.lng,
        target.latitude,
        target.longitude,
        target.geofenceRadiusMeters
      );

      return {
        isInside: res.isInside,
        distanceMeters: res.distanceMeters,
        targetRadius: target.geofenceRadiusMeters,
      };
    },
    [activeTenant, geoState]
  );

  // Current logged in profile based on role
  const profileKey =
    currentRole === 'SUPER_ADMIN'
      ? 'super_admin'
      : currentRole === 'LIBRARY_ADMIN'
      ? 'library_admin'
      : 'student';

  const currentProfile = profiles[profileKey] || INITIAL_PROFILES[profileKey];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfiles((prev) => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        ...updates,
      },
    }));
  };

  // Seat Helpers
  const getSeatOccupant = (seatId: string, shift: ShiftType) => {
    return occupants.find((o) => o.seatId === seatId && o.shift === shift && o.tenantId === activeTenantId);
  };

  const assignOccupant = (data: Omit<ShiftOccupant, 'id'>) => {
    const newOccupant: ShiftOccupant = {
      ...data,
      id: `occ-${Date.now()}`,
    };
    setOccupants((prev) => {
      // Remove any existing booking for this seat + shift
      const filtered = prev.filter(
        (o) => !(o.seatId === data.seatId && o.shift === data.shift && o.tenantId === data.tenantId)
      );
      return [...filtered, newOccupant];
    });

    // Create ledger entry if fee is set
    if (data.monthlyFee > 0) {
      const newLedger: FeeLedgerEntry = {
        id: `led-${Date.now()}`,
        tenantId: data.tenantId,
        studentId: data.studentId,
        studentName: data.studentName,
        seatNumber: seats.find((s) => s.id === data.seatId)?.seatNumber || 'N/A',
        shift: data.shift,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        billingMonth: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        billingDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalBilled: data.monthlyFee,
        totalPaid: data.paidAmount,
        pendingBalance: Math.max(0, data.monthlyFee - data.paidAmount),
        status: data.paidAmount >= data.monthlyFee ? 'PAID' : data.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING',
        paymentMethod: data.paidAmount > 0 ? 'UPI' : undefined,
        lastPaymentDate: data.paidAmount > 0 ? new Date().toISOString().split('T')[0] : undefined,
      };
      setFeeLedgers((prev) => [newLedger, ...prev]);
    }
  };

  const vacateSeat = (seatId: string, shift: ShiftType) => {
    setOccupants((prev) =>
      prev.filter((o) => !(o.seatId === seatId && o.shift === shift && o.tenantId === activeTenantId))
    );
  };

  const updateSeatStatus = (seatId: string, shift: ShiftType, status: SeatStatus, notes?: string) => {
    setOccupants((prev) => {
      const existing = prev.find(
        (o) => o.seatId === seatId && o.shift === shift && o.tenantId === activeTenantId
      );
      if (existing) {
        return prev.map((o) =>
          o.id === existing.id ? { ...o, status, notes: notes ?? o.notes } : o
        );
      } else if (status === 'MAINTENANCE') {
        const dummy: ShiftOccupant = {
          id: `occ-${Date.now()}`,
          seatId,
          tenantId: activeTenantId,
          shift,
          studentId: 'none',
          studentName: '',
          studentEmail: '',
          studentPhone: '',
          status: 'MAINTENANCE',
          planName: 'Maintenance Block',
          monthlyFee: 0,
          paidAmount: 0,
          dueAmount: 0,
          startDate: '',
          expiryDate: '',
          notes: notes || 'Under routine maintenance',
        };
        return [...prev, dummy];
      }
      return prev;
    });
  };

  // KYC Management
  const submitKYCApplication = async (
    data: Omit<StudentKYC, 'id' | 'appliedAt' | 'status'>
  ): Promise<boolean> => {
    const newKyc: StudentKYC = {
      ...data,
      id: `kyc-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    setKycRequests((prev) => [newKyc, ...prev]);
    return true;
  };

  const approveKYC = (kycId: string, seatId: string, monthlyFee: number) => {
    const kyc = kycRequests.find((k) => k.id === kycId);
    if (!kyc) return;

    // Update KYC status
    setKycRequests((prev) =>
      prev.map((k) =>
        k.id === kycId ? { ...k, status: 'APPROVED', assignedSeatId: seatId, monthlyFeeProposed: monthlyFee } : k
      )
    );

    const seat = seats.find((s) => s.id === seatId);

    // Create occupant
    const newOccupant: ShiftOccupant = {
      id: `occ-${Date.now()}`,
      seatId,
      tenantId: kyc.tenantId,
      shift: kyc.requestedShift,
      studentId: `stud-${Date.now()}`,
      studentName: kyc.fullName,
      studentEmail: kyc.email,
      studentPhone: kyc.phone,
      studentPhoto: kyc.selfieUrl,
      status: 'PAYMENT_DUE', // Payment due initially
      planName: `${kyc.requestedShift} Shift Member`,
      monthlyFee: monthlyFee,
      paidAmount: 0,
      dueAmount: monthlyFee,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Approved KYC via GPS Verification (${kyc.submissionDistanceMeters.toFixed(1)}m away)`,
    };

    setOccupants((prev) => {
      const filtered = prev.filter(
        (o) => !(o.seatId === seatId && o.shift === kyc.requestedShift && o.tenantId === kyc.tenantId)
      );
      return [...filtered, newOccupant];
    });

    // Create Invoice Ledger
    const newLedger: FeeLedgerEntry = {
      id: `led-${Date.now()}`,
      tenantId: kyc.tenantId,
      studentId: newOccupant.studentId,
      studentName: kyc.fullName,
      seatNumber: seat?.seatNumber || 'A-01',
      shift: kyc.requestedShift,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      billingMonth: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalBilled: monthlyFee,
      totalPaid: 0,
      pendingBalance: monthlyFee,
      status: 'PENDING',
    };

    setFeeLedgers((prev) => [newLedger, ...prev]);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const rejectKYC = (kycId: string, reason: string) => {
    setKycRequests((prev) =>
      prev.map((k) => (k.id === kycId ? { ...k, status: 'REJECTED', rejectionReason: reason } : k))
    );
  };

  // Attendance
  const markAttendance = (type: 'CHECK_IN' | 'CHECK_OUT') => {
    const geoStatus = getGeofenceStatus();
    if (!geoStatus.isInside) {
      return {
        success: false,
        message: `Geofence check failed: You are ${geoStatus.distanceMeters.toFixed(
          1
        )}m away. You must be within ${geoStatus.targetRadius}m of the library to check in.`,
      };
    }

    const studentProfile = profiles.student;
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId: activeTenantId,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      seatNumber: studentProfile.studentSeatNumber || 'A-01',
      shift: studentProfile.studentShift || 'MORNING',
      type,
      timestamp: new Date().toISOString(),
      deviceLat: geoState.lat ?? activeTenant?.latitude,
      deviceLng: geoState.lng ?? activeTenant?.longitude,
      distanceMeters: geoStatus.distanceMeters,
      isGeofenceVerified: true,
      isManualOverride: false,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    return {
      success: true,
      message: `Successfully marked ${type === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} (GPS Verified: ${geoStatus.distanceMeters.toFixed(1)}m from center).`,
      record: newRecord,
    };
  };

  const manualAdminOverrideAttendance = (
    studentName: string,
    seatNumber: string,
    shift: ShiftType,
    notes: string
  ) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId: activeTenantId,
      studentId: `stud-override-${Date.now()}`,
      studentName,
      seatNumber,
      shift,
      type: 'CHECK_IN',
      timestamp: new Date().toISOString(),
      isGeofenceVerified: true,
      isManualOverride: true,
      overrideAdminName: currentProfile.name + ' (Desk Override)',
      notes,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  const getTodayCheckInCount = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(
      (r) => r.tenantId === activeTenantId && r.type === 'CHECK_IN' && r.timestamp.startsWith(todayStr)
    ).length;
  };

  // Financials & Expenses
  const recordPayment = (
    ledgerId: string,
    amountPaid: number,
    method: FeeLedgerEntry['paymentMethod'] = 'UPI'
  ) => {
    setFeeLedgers((prev) =>
      prev.map((led) => {
        if (led.id === ledgerId) {
          const newTotalPaid = led.totalPaid + amountPaid;
          const newBalance = Math.max(0, led.totalBilled - newTotalPaid);
          const newStatus =
            newBalance === 0 ? 'PAID' : newTotalPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING';

          // Update occupant status as well
          setOccupants((occList) =>
            occList.map((o) => {
              if (o.studentId === led.studentId && o.tenantId === led.tenantId) {
                return {
                  ...o,
                  paidAmount: o.paidAmount + amountPaid,
                  dueAmount: Math.max(0, o.monthlyFee - (o.paidAmount + amountPaid)),
                  status: newBalance === 0 ? 'OCCUPIED' : 'PAYMENT_DUE',
                };
              }
              return o;
            })
          );

          return {
            ...led,
            totalPaid: newTotalPaid,
            pendingBalance: newBalance,
            status: newStatus,
            paymentMethod: method,
            lastPaymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return led;
      })
    );
    confetti({ particleCount: 50, spread: 60 });
  };

  const addLedgerEntry = (entry: Omit<FeeLedgerEntry, 'id'>) => {
    const newLedger: FeeLedgerEntry = {
      ...entry,
      id: `led-${Date.now()}`,
    };
    setFeeLedgers((prev) => [newLedger, ...prev]);
  };

  const addExpense = (exp: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // Super Admin Tenant Operations
  const addTenant = (newTenantData: Omit<TenantBranch, 'id' | 'createdAt'>) => {
    const newTenant: TenantBranch = {
      ...newTenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [newTenant, ...prev]);

    // Create 24 default seats for the new branch
    const defaultSeats: Seat[] = Array.from({ length: 24 }).map((_, idx) => {
      const row = Math.floor(idx / 4) + 1;
      const col = (idx % 4) + 1;
      const section =
        row <= 2
          ? 'Zone A - Silent Cabin'
          : row <= 4
          ? 'Zone B - Open Pods'
          : 'Zone C - Window Cubicles';
      const letter = row <= 2 ? 'A' : row <= 4 ? 'B' : 'C';
      const seatNumber = `${letter}-${String(idx + 1).padStart(2, '0')}`;
      return {
        id: `s-${newTenant.id}-${idx + 1}`,
        tenantId: newTenant.id,
        seatNumber,
        section,
        row,
        col,
        type: row === 1 ? 'ERGONOMIC_PRO' : row >= 5 ? 'WINDOW_VIEW' : 'STANDARD',
        amenities: ['Power Socket', 'LED Lamp', 'WiFi 6'],
      };
    });
    setSeats((prev) => [...prev, ...defaultSeats]);
    confetti({ particleCount: 70, spread: 70 });
  };

  const updateTenant = (tenantId: string, updates: Partial<TenantBranch>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, ...updates } : t))
    );
  };

  const updateTenantStatus = (tenantId: string, status: SubscriptionStatus) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, subscriptionStatus: status } : t))
    );
  };

  const deleteTenant = (tenantId: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    if (activeTenantId === tenantId && tenants.length > 1) {
      const remaining = tenants.filter((t) => t.id !== tenantId);
      setActiveTenantId(remaining[0].id);
    }
  };

  // Student active view summary
  const studentProfile = profiles.student;
  const activeStudentSeat = seats.find(
    (s) => s.tenantId === activeTenantId && s.seatNumber === studentProfile.studentSeatNumber
  );
  const activeStudentOccupant = occupants.find(
    (o) =>
      o.tenantId === activeTenantId &&
      o.studentId === studentProfile.id &&
      o.shift === (studentProfile.studentShift || 'MORNING')
  );
  const activeStudentLedger = feeLedgers.find(
    (l) => l.tenantId === activeTenantId && l.studentId === studentProfile.id
  );
  const studentTodayAttendance = attendanceRecords.find(
    (r) =>
      r.studentId === studentProfile.id &&
      r.type === 'CHECK_IN' &&
      r.timestamp.startsWith(new Date().toISOString().split('T')[0])
  );

  const fireConfetti = () => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeTenantId,
        setActiveTenantId,
        currentProfile,
        updateProfile,
        isDarkMode,
        toggleDarkMode,
        tenants,
        activeTenant,
        addTenant,
        updateTenant,
        updateTenantStatus,
        deleteTenant,
        seats: seats.filter((s) => s.tenantId === activeTenantId),
        occupants: occupants.filter((o) => o.tenantId === activeTenantId),
        activeShift,
        setActiveShift,
        getSeatOccupant,
        assignOccupant,
        vacateSeat,
        updateSeatStatus,
        geoState,
        refreshGPS,
        toggleSimulatedGPS,
        setSimulatedInsideState,
        getGeofenceStatus,
        kycRequests: kycRequests.filter((k) => k.tenantId === activeTenantId),
        submitKYCApplication,
        approveKYC,
        rejectKYC,
        attendanceRecords: attendanceRecords.filter((a) => a.tenantId === activeTenantId),
        markAttendance,
        manualAdminOverrideAttendance,
        getTodayCheckInCount,
        feeLedgers: feeLedgers.filter((l) => l.tenantId === activeTenantId),
        recordPayment,
        addLedgerEntry,
        expenses: expenses.filter((e) => e.tenantId === activeTenantId),
        addExpense,
        deleteExpense,
        activeStudentData: {
          seat: activeStudentSeat,
          occupant: activeStudentOccupant,
          ledger: activeStudentLedger,
          todayCheckedIn: Boolean(studentTodayAttendance),
          lastAttendance: studentTodayAttendance,
        },
        fireConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
