import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import {
  X,
  User,
  KeyRound,
  Camera,
  Phone,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { compressImage } from '../utils/helpers';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentProfile, updateProfile, currentRole, activeTenant, fireConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PASSWORD'>('DETAILS');
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: currentProfile.name,
    email: currentProfile.email,
    phone: currentProfile.phone,
    avatarUrl: currentProfile.avatarUrl,
    emergencyContact: currentProfile.emergencyContact || '',
    bio: currentProfile.bio || '',
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImage(file, 400, 400, 0.8);
      setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
      setFeedback({ type: 'success', message: 'Photo uploaded and compressed!' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to process image file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setFeedback({ type: 'success', message: 'Profile details updated successfully.' });
    fireConfetti();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.currentPassword) {
      setFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    updateProfile({ password: passwordState.newPassword });
    setFeedback({ type: 'success', message: 'Password changed successfully.' });
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    fireConfetti();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const roleBadgeLabel =
    currentRole === 'SUPER_ADMIN'
      ? 'SaaS Super Admin'
      : currentRole === 'LIBRARY_ADMIN'
      ? 'Library Admin (Tenant)'
      : 'Student Member';

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="profile-modal-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Profile Settings</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                  {roleBadgeLabel}
                </span>
                {currentRole !== 'SUPER_ADMIN' && activeTenant && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {activeTenant.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50/50 dark:bg-slate-800/20">
          <button
            id="tab-details-btn"
            onClick={() => {
              setActiveTab('DETAILS');
              setFeedback(null);
            }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <User className="w-4 h-4" /> Personal Details & Photo
          </button>
          <button
            id="tab-password-btn"
            onClick={() => {
              setActiveTab('PASSWORD');
              setFeedback(null);
            }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'PASSWORD'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className="px-6 pt-4">
            <div
              className={`p-3 rounded-xl flex items-center gap-2.5 text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'DETAILS' ? (
            <form id="profile-details-form" onSubmit={handleSaveDetails} className="space-y-5">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="relative group">
                  <img
                    src={formData.avatarUrl || currentProfile.avatarUrl}
                    alt={formData.name || 'User'}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                  />
                  <label
                    htmlFor="avatar-file-input"
                    className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Upload</span>
                  </label>
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Profile Picture / Avatar
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: preset }))}
                        className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform hover:scale-110 ${
                          formData.avatarUrl === preset
                            ? 'border-indigo-600 ring-2 ring-indigo-400'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Tap a preset or click photo to upload camera selfie.</p>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Vikram Malhotra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. user@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Emergency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Contact
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.emergencyContact || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+91 98111 99999 (Guardian)"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Aspirations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  About / Bio / Exam Target
                </label>
                <textarea
                  rows={2}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. UPSC Aspirant / Software Engineer / Library Operations Manager"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-profile-details-btn"
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          ) : (
            <form id="profile-password-form" onSubmit={handlePasswordChange} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Passwords protect access across web app check-ins, fee ledgers, and membership approvals. Minimum 6
                  characters.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordState.currentPassword}
                  onChange={(e) => setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="update-password-submit-btn"
                  className="px-6 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
