import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Sliders,
  Wifi,
  Clock,
  Save,
  CheckCircle2,
  Navigation,
  Crosshair,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const BranchSettingsView: React.FC = () => {
  const { activeTenant, updateTenant, fireConfetti, geoState, refreshGPS } = useApp();

  if (!activeTenant) return null;

  const [formData, setFormData] = useState({
    name: activeTenant.name,
    address: activeTenant.address,
    city: activeTenant.city,
    latitude: activeTenant.latitude,
    longitude: activeTenant.longitude,
    geofenceRadiusMeters: activeTenant.geofenceRadiusMeters,
    wifiSsid: activeTenant.wifiSsid,
    wifiPassword: activeTenant.wifiPassword,
    shiftHours: { ...activeTenant.shiftHours },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mapType, setMapType] = useState<'STREET' | 'SATELLITE'>('STREET');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant(activeTenant.id, formData);
    setSavedSuccess(true);
    fireConfetti();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        () => {
          // If error or denied, keep simulated
          setFormData((prev) => ({
            ...prev,
            latitude: 28.6315,
            longitude: 77.2167,
          }));
        }
      );
    }
  };

  // Interactive canvas / visual simulation of the library location pin & radius circle
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Branch Geofence & Location Anchor
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              Zero OTP System
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pinpoint the physical location of your study library. Students must be within this GPS radius to submit
            registration and punch attendance.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved Settings!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Interactive Geofence Map Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Interactive Geofence Map Anchor
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMapType('STREET')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    mapType === 'STREET'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Street Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('SATELLITE')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    mapType === 'SATELLITE'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Satellite
                </button>
              </div>

              <button
                type="button"
                id="pin-current-gps-btn"
                onClick={handleUseCurrentLocation}
                className="px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Drop pin at device GPS coordinates"
              >
                <Crosshair className="w-4 h-4 text-teal-600" /> Pin My GPS
              </button>
            </div>
          </div>

          {/* Map Canvas Visualizer */}
          <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center select-none shadow-inner">
            {/* Background Texture representing Street or Satellite */}
            <div
              className={`absolute inset-0 opacity-40 transition-opacity ${
                mapType === 'SATELLITE'
                  ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900'
                  : 'bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:32px_32px] bg-slate-950'
              }`}
            />

            {/* Map Grid Roads / Buildings visual accents */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-1 bg-slate-600 absolute"></div>
              <div className="h-full w-1 bg-slate-600 absolute"></div>
              <div className="w-48 h-48 border border-slate-600 rounded-lg absolute -top-8 -left-8"></div>
              <div className="w-64 h-32 border border-slate-600 rounded-lg absolute bottom-4 right-8"></div>
            </div>

            {/* Geofence Perimeter Pulse Circle */}
            <div
              className="relative rounded-full flex items-center justify-center transition-all duration-300 border-2 border-teal-400/60 bg-teal-500/15 shadow-[0_0_50px_rgba(20,184,166,0.3)] animate-pulse"
              style={{
                width: `${Math.min(280, Math.max(120, formData.geofenceRadiusMeters * 2.8))}px`,
                height: `${Math.min(280, Math.max(120, formData.geofenceRadiusMeters * 2.8))}px`,
              }}
            >
              {/* Inner Concentric Wave */}
              <div className="w-2/3 h-2/3 rounded-full border border-teal-300/40 bg-teal-400/10 flex items-center justify-center">
                {/* Center Library Building Pin */}
                <div className="relative group flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white/30 transform -translate-y-1 hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 fill-white" />
                  </div>
                  <div className="mt-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-extrabold tracking-wide whitespace-nowrap shadow-md border border-slate-700">
                    {formData.name || 'Library Center'}
                  </div>
                </div>
              </div>

              {/* Radius Distance Badge on Edge */}
              <div className="absolute -top-3.5 px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-extrabold shadow-sm">
                Radius: {formData.geofenceRadiusMeters} meters
              </div>
            </div>

            {/* Map HUD Overlays */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-[11px] text-slate-300 border border-slate-800 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>
                Lat: {formData.latitude.toFixed(5)}, Lng: {formData.longitude.toFixed(5)}
              </span>
            </div>

            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-[11px] text-teal-300 border border-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Drag slider below to expand/shrink boundary</span>
            </div>
          </div>

          {/* Radius Slider & Coordinates Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-600" /> Geofence Verification Radius
                </span>
                <span className="text-teal-600 dark:text-teal-400 text-sm font-mono font-extrabold">
                  {formData.geofenceRadiusMeters} Meters
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={150}
                step={5}
                value={formData.geofenceRadiusMeters}
                onChange={(e) =>
                  setFormData({ ...formData, geofenceRadiusMeters: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>15m (Ultra-Strict Inside Hall)</span>
                <span>50m (Standard Building Perimeter)</span>
                <span>150m (Large Campus Compound)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Latitude Coordinate
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Longitude Coordinate
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* WiFi & Address Configuration (Used on Seat Stickers) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Branch Address & Member WiFi Credentials
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These credentials are electronically printed onto the generated Seat QR stickers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Physical Street Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                High-Speed WiFi SSID Name
              </label>
              <input
                type="text"
                required
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                WiFi Password
              </label>
              <input
                type="text"
                required
                value={formData.wifiPassword}
                onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Operational Shift Timings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Shift Timings & Booking Slots
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Morning Shift
              </label>
              <input
                type="text"
                value={formData.shiftHours.MORNING}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shiftHours: { ...formData.shiftHours, MORNING: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Afternoon Shift
              </label>
              <input
                type="text"
                value={formData.shiftHours.AFTERNOON}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shiftHours: { ...formData.shiftHours, AFTERNOON: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Evening Shift
              </label>
              <input
                type="text"
                value={formData.shiftHours.EVENING}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shiftHours: { ...formData.shiftHours, EVENING: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Full Day Slot
              </label>
              <input
                type="text"
                value={formData.shiftHours.FULL_DAY}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shiftHours: { ...formData.shiftHours, FULL_DAY: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="save-branch-settings-btn"
            className="px-8 py-3 min-h-[44px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" /> Save Branch & Geofence Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
