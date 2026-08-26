import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftType } from '../../types';
import {
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  User,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { compressImage } from '../../utils/helpers';

interface StudentRegistrationFlowProps {
  onComplete: () => void;
}

export const StudentRegistrationFlow: React.FC<StudentRegistrationFlowProps> = ({ onComplete }) => {
  const {
    activeTenant,
    geoState,
    isInsideGeofence,
    currentDistanceMeters,
    submitKYC,
    setSimulatedGPS,
    fireConfetti,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [requestedShift, setRequestedShift] = useState<ShiftType>('MORNING');
  const [seatPreference, setSeatPreference] = useState('Silent Cabin (Zone A)');

  // Document Uploads
  const [selfieUrl, setSelfieUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );
  const [aadharFrontUrl, setAadharFrontUrl] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [aadharBackUrl, setAadharBackUrl] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingField(field);
      try {
        const compressed = await compressImage(file);
        setter(compressed);
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploadingField(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInsideGeofence) return;

    submitKYC({
      tenantId: activeTenant?.id || 'tenant-1',
      fullName,
      email,
      phone,
      aadharNumber: aadharNumber || '5544-2211-9988',
      selfieUrl,
      aadharFrontUrl,
      aadharBackUrl,
      requestedShift,
      requestedSeatPreference: seatPreference,
      submissionLatitude: geoState.userLat,
      submissionLongitude: geoState.userLng,
      submissionDistanceMeters: currentDistanceMeters,
      monthlyFeeProposed: requestedShift === 'FULL_DAY' ? 2600 : 1400,
    });

    setIsSubmitted(true);
    fireConfetti();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Registration Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Library Member Admission & KYC
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Zero SMS OTP Hassle. Registrations are automatically verified through real-time GPS Geofence matching.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[
            { num: 1, label: 'Location' },
            { num: 2, label: 'Profile' },
            { num: 3, label: 'KYC Proofs' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s.num
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-300'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[11px] font-bold hidden sm:inline ${step === s.num ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {s.num < 4 && <div className="w-4 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1"></div>}
            </div>
          ))}
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Application Submitted Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              Your GPS coordinates were verified (<strong>{currentDistanceMeters.toFixed(1)}m</strong> from {activeTenant?.name}). The library admin has received your KYC application.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Applicant:</span>
              <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Selected Shift:</span>
              <span className="font-bold text-indigo-600">{requestedShift}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-amber-600">Pending Admin Review</span>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-3.5 min-h-[44px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Go to Member Portal
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Step 1: Geofence Validation */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1">
                  <MapPin className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Physical Geofence Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  To prevent fraudulent remote registrations, you must be physically present at{' '}
                  <strong>{activeTenant?.name}</strong>.
                </p>
              </div>

              {/* Live Distance Gauge */}
              <div
                className={`p-6 rounded-3xl border-2 text-center transition-all ${
                  isInsideGeofence
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                }`}
              >
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                  {currentDistanceMeters.toFixed(1)} Meters
                </div>
                <div className="text-xs font-bold uppercase mt-1">
                  {isInsideGeofence ? '✓ Inside Allowed Library Geofence' : '⚠ Outside Geofence Perimeter'}
                </div>
                <p className="text-xs mt-2 opacity-80">
                  Target Boundary: Within {activeTenant?.geofenceRadiusMeters} meters of branch GPS
                </p>

                {/* Quick Simulation helper for instant preview */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Test Helper:</span>
                  <button
                    type="button"
                    onClick={() => setSimulatedGPS(activeTenant?.latitude || 28.6315, activeTenant?.longitude || 77.2167)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-xs"
                  >
                    Simulate: Inside Library (0m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedGPS((activeTenant?.latitude || 28.6315) + 0.005, (activeTenant?.longitude || 77.2167) + 0.005)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                  >
                    Simulate: Far Away (550m)
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!isInsideGeofence}
                  onClick={() => setStep(2)}
                  className={`px-6 py-3 min-h-[44px] rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                    isInsideGeofence
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Info & Shift Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step 2: Personal Details & Preferred Study Shift
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Shift Slot *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'] as ShiftType[]).map((sh) => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => setRequestedShift(sh)}
                        className={`p-3 min-h-[44px] rounded-xl border text-center text-xs font-bold transition-all ${
                          requestedShift === sh
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sh.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Desk Type / Seating Zone Preference
                  </label>
                  <select
                    value={seatPreference}
                    onChange={(e) => setSeatPreference(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Silent Cabin (Zone A)">Silent Cabin (Strict Silence, Deep Work)</option>
                    <option value="Window Desk (Zone C)">Natural Daylight Window Desk</option>
                    <option value="Open Pod (Zone B)">Open Study Pod</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!fullName || !phone}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  Next: Upload Documents <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Photo & Aadhar Uploads */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step 3: Identity Verification & KYC Documents
              </h3>
              <p className="text-xs text-slate-500">
                Please provide your 12-digit Aadhar number, a live selfie photo, and clear images of your ID card.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  12-Digit Aadhar ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
                />
              </div>

              {/* Upload Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* 1. Live Selfie */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">1. Member Selfie</span>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img src={selfieUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="inline-block w-full py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-100">
                    <Upload className="w-3 h-3 inline mr-1" /> Replace Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setSelfieUrl, 'selfie')}
                    />
                  </label>
                </div>

                {/* 2. Aadhar Front */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">2. Aadhar Front</span>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img src={aadharFrontUrl} alt="Aadhar front preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="inline-block w-full py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-100">
                    <Upload className="w-3 h-3 inline mr-1" /> Upload Front
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setAadharFrontUrl, 'aadharFront')}
                    />
                  </label>
                </div>

                {/* 3. Aadhar Back */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">3. Aadhar Back</span>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img src={aadharBackUrl} alt="Aadhar back preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="inline-block w-full py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-100">
                    <Upload className="w-3 h-3 inline mr-1" /> Upload Back
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setAadharBackUrl, 'aadharBack')}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  Review Application <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Step 4: Final Verification & Submit Application
              </h3>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> Location Geofence Locked
                </div>
                <p className="text-emerald-700 dark:text-emerald-400">
                  GPS coordinate verified: {currentDistanceMeters.toFixed(1)}m from {activeTenant?.name} center.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fullName || 'Priya Sharma'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span className="text-slate-700 dark:text-slate-300">{phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Shift:</span>
                  <span className="font-bold text-indigo-600">{requestedShift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preference:</span>
                  <span className="text-slate-700 dark:text-slate-300">{seatPreference}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  id="final-submit-kyc-btn"
                  onClick={handleSubmit}
                  className="px-8 py-3 min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Submit KYC Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
