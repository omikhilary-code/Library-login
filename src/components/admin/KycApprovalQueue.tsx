import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentKYC, Seat } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Eye,
  Armchair,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/helpers';

export const KycApprovalQueue: React.FC = () => {
  const { kycRequests, approveKYC, rejectKYC, seats, getSeatOccupant, activeTenant } = useApp();

  const [selectedKyc, setSelectedKyc] = useState<StudentKYC | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string>('');
  const [proposedFee, setProposedFee] = useState<number>(1400);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const pendingRequests = kycRequests.filter((k) => k.status === 'PENDING');
  const processedRequests = kycRequests.filter((k) => k.status !== 'PENDING');

  // Available seats for the applicant's requested shift
  const availableSeats = selectedKyc
    ? seats.filter((s) => !getSeatOccupant(s.id, selectedKyc.requestedShift))
    : [];

  const handleOpenDetail = (kyc: StudentKYC) => {
    setSelectedKyc(kyc);
    setProposedFee(kyc.monthlyFeeProposed || (kyc.requestedShift === 'FULL_DAY' ? 2600 : 1400));
    // Pick first available seat by default
    const avail = seats.filter((s) => !getSeatOccupant(s.id, kyc.requestedShift));
    if (avail.length > 0) {
      setSelectedSeatId(avail[0].id);
    }
  };

  const handleApprove = () => {
    if (!selectedKyc) return;
    const seatIdToAssign = selectedSeatId || seats[0]?.id;
    approveKYC(selectedKyc.id, seatIdToAssign, proposedFee);
    setSelectedKyc(null);
  };

  const handleReject = () => {
    if (!selectedKyc) return;
    rejectKYC(selectedKyc.id, rejectReason || 'Document verification failed or seat unavailable');
    setIsRejectModalOpen(false);
    setSelectedKyc(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">KYC Verification & Seat Assignment</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> GPS Geofence Enforced
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student selfies, government Aadhar IDs, and location-verified coordinates before granting admission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-100 dark:border-indigo-900">
            {pendingRequests.length} Pending Approval
          </span>
        </div>
      </div>

      {/* Main Queue Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Pending Verification Queue ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">All Caught Up!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              There are no pending KYC applications waiting in the queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((kyc) => (
              <div
                key={kyc.id}
                id={`kyc-card-${kyc.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <MapPin className="w-3 h-3" /> GPS Verified ({kyc.submissionDistanceMeters.toFixed(1)}m)
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDateTime(kyc.appliedAt)}
                    </span>
                  </div>

                  {/* Applicant Details */}
                  <div className="flex items-center gap-3">
                    <img
                      src={kyc.selfieUrl}
                      alt={kyc.fullName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                        {kyc.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{kyc.phone}</p>
                    </div>
                  </div>

                  {/* Shift & Preference */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Shift Request:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {kyc.requestedShift}
                      </span>
                    </div>
                    {kyc.requestedSeatPreference && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Preference:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {kyc.requestedSeatPreference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  id={`review-kyc-${kyc.id}-btn`}
                  onClick={() => handleOpenDetail(kyc)}
                  className="w-full py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Review Application & KYC
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History / Processed Queue Table */}
      {processedRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Approvals & KYC History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Shift</th>
                  <th className="py-2.5 px-4">GPS Verification</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedRequests.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={k.selfieUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span>{k.fullName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{k.phone}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{k.requestedShift}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-600 font-semibold">
                        ✓ {k.submissionDistanceMeters.toFixed(1)}m from center
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          k.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDateTime(k.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Detailed Review Modal */}
      {selectedKyc && (
        <div
          id="kyc-review-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedKyc(null)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  KYC Verification: {selectedKyc.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Location Verified ({selectedKyc.submissionDistanceMeters.toFixed(1)}m from library center)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedKyc(null)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Document Images View (Selfie, Aadhar Front & Back) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Uploaded Identity & KYC Proofs (Click to expand)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Selfie */}
                  <div
                    onClick={() => setLightboxImage(selectedKyc.selfieUrl)}
                    className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-indigo-400 transition-colors text-center"
                  >
                    <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative">
                      <img
                        src={selectedKyc.selfieUrl}
                        alt="Live Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> Zoom
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Selfie</span>
                  </div>

                  {/* Aadhar Front */}
                  <div
                    onClick={() => setLightboxImage(selectedKyc.aadharFrontUrl)}
                    className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-indigo-400 transition-colors text-center"
                  >
                    <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative">
                      <img
                        src={selectedKyc.aadharFrontUrl}
                        alt="Aadhar Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> Zoom
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Aadhar Card (Front)</span>
                  </div>

                  {/* Aadhar Back */}
                  <div
                    onClick={() => setLightboxImage(selectedKyc.aadharBackUrl)}
                    className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-indigo-400 transition-colors text-center"
                  >
                    <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2 relative">
                      <img
                        src={selectedKyc.aadharBackUrl}
                        alt="Aadhar Back"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> Zoom
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Aadhar Card (Back)</span>
                  </div>
                </div>
              </div>

              {/* Applicant Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Email Address:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedKyc.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Phone Number:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedKyc.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Aadhar Number:</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {selectedKyc.aadharNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Requested Shift:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedKyc.requestedShift}
                  </span>
                </div>
              </div>

              {/* Seat Assignment & Fee Settings */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs uppercase text-slate-800 dark:text-slate-200">
                    Assign Desk & Set Membership Fee
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Choose Available Seat ({selectedKyc.requestedShift} Shift)
                    </label>
                    <select
                      value={selectedSeatId}
                      onChange={(e) => setSelectedSeatId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-semibold"
                    >
                      {availableSeats.map((seat) => (
                        <option key={seat.id} value={seat.id}>
                          Desk {seat.seatNumber} ({seat.section})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Membership Fee (INR)
                    </label>
                    <input
                      type="number"
                      value={proposedFee}
                      onChange={(e) => setProposedFee(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-5 py-2.5 min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold"
              >
                Reject Application
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedKyc(null)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-approve-kyc-btn"
                  onClick={handleApprove}
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Request Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedKyc && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Reject Application</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State the reason for rejection (e.g. Blurry photo, mismatching Aadhar, invalid address proof).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Selfie photo is blurred or Aadhar image details not legible."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for zooming photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={lightboxImage} alt="Enlarged Document" className="w-full h-full object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
