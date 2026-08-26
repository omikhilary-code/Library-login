export type UserRole = 'SUPER_ADMIN' | 'LIBRARY_ADMIN' | 'STUDENT';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';

export type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_DUE' | 'MAINTENANCE';

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED';

export interface TenantBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number; // e.g. 50
  subscriptionStatus: SubscriptionStatus;
  monthlySubscriptionFee: number;
  totalSeats: number;
  logoUrl?: string;
  wifiSsid: string;
  wifiPassword: string;
  shiftHours: {
    MORNING: string;   // "06:00 AM - 12:00 PM"
    AFTERNOON: string; // "12:00 PM - 05:00 PM"
    EVENING: string;   // "05:00 PM - 11:00 PM"
    FULL_DAY: string;  // "06:00 AM - 11:00 PM"
  };
  createdAt: string;
}

export interface Seat {
  id: string;
  tenantId: string;
  seatNumber: string; // e.g., "A-01", "B-12"
  section: string;    // "Zone A - Silent Study", "Zone B - Open Pods", "Zone C - Window Cubicles"
  row: number;
  col: number;
  type: 'STANDARD' | 'ERGONOMIC_PRO' | 'WINDOW_VIEW' | 'CORNER_QUIET';
  amenities: string[]; // ["AC Vent", "Power Socket", "LAN Port", "LED Lamp", "Locker"]
}

export interface ShiftOccupant {
  id: string;
  seatId: string;
  tenantId: string;
  shift: ShiftType;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentPhoto?: string;
  status: SeatStatus;
  planName: string;
  monthlyFee: number;
  paidAmount: number;
  dueAmount: number;
  startDate: string;
  expiryDate: string;
  notes?: string;
}

export interface StudentKYC {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  aadharNumber: string;
  selfieUrl: string;
  aadharFrontUrl: string;
  aadharBackUrl: string;
  submissionLat: number;
  submissionLng: number;
  submissionDistanceMeters: number;
  isLocationVerified: boolean;
  requestedShift: ShiftType;
  requestedSeatPreference?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  assignedSeatId?: string;
  monthlyFeeProposed?: number;
  appliedAt: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  seatNumber: string;
  shift: ShiftType;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  deviceLat?: number;
  deviceLng?: number;
  distanceMeters?: number;
  isGeofenceVerified: boolean;
  isManualOverride: boolean;
  overrideAdminName?: string;
  notes?: string;
}

export interface FeeLedgerEntry {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  seatNumber: string;
  shift: ShiftType;
  invoiceNumber: string;
  billingMonth: string;
  billingDate: string;
  dueDate: string;
  totalBilled: number;
  totalPaid: number;
  pendingBalance: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'PENDING';
  paymentMethod?: 'UPI' | 'CASH' | 'CREDIT_CARD' | 'NET_BANKING';
  lastPaymentDate?: string;
}

export interface ExpenseItem {
  id: string;
  tenantId: string;
  title: string;
  category: 'RENT' | 'ELECTRICITY' | 'WIFI_INTERNET' | 'CLEANING_HYGIENE' | 'STAFF_SALARY' | 'MAINTENANCE' | 'OTHER';
  amount: number;
  date: string;
  paymentStatus: 'PAID' | 'PENDING';
  receiptNumber?: string;
  vendorName?: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  tenantId?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  emergencyContact?: string;
  password?: string;
  // If role is Student:
  studentSeatNumber?: string;
  studentShift?: ShiftType;
  planExpiryDate?: string;
  bio?: string;
}

export interface GeolocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  isSimulated: boolean;
  simulatedInside: boolean;
}
