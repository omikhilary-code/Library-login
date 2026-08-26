import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  QrCode,
  Wifi,
  Building2,
  Armchair,
  SlidersHorizontal,
  CheckCircle,
  Sparkles,
  Download,
} from 'lucide-react';
import { generateQrSvgUrl } from '../../utils/helpers';

export const SeatStickerGenerator: React.FC = () => {
  const { seats, activeTenant } = useApp();

  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [stickersPerRow, setStickersPerRow] = useState<number>(2);

  const sections = Array.from(new Set(seats.map((s) => s.section)));

  const filteredSeats = seats.filter(
    (s) => selectedSection === 'ALL' || s.section === selectedSection
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls (Hidden during actual print) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Seat Sticker & QR Code Generator
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Batch Printable PDF
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export physical desk stickers containing your Library Logo, Seat Number, Shift Timings, and WiFi QR details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="ALL">All Zones ({seats.length} Seats)</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* Print / Export Button */}
          <button
            id="print-stickers-btn"
            onClick={handlePrint}
            className="px-5 py-2.5 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Export Printable PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet Grid Container */}
      <div
        id="printable-stickers-container"
        className={`grid gap-4 print:gap-3 ${
          stickersPerRow === 2
            ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3 print:grid-cols-3'
        }`}
      >
        {filteredSeats.map((seat) => {
          const qrPayload = `WIFI:T:WPA;S:${activeTenant?.wifiSsid};P:${activeTenant?.wifiPassword};;SEAT:${seat.seatNumber};BRANCH:${activeTenant?.code}`;
          const qrUrl = generateQrSvgUrl(qrPayload);

          return (
            <div
              key={seat.id}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-5 shadow-xs flex flex-col justify-between space-y-4 print:border-solid print:border-slate-800 print:shadow-none print:break-inside-avoid text-slate-900"
            >
              {/* Sticker Header: Logo & Branch Code */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-black text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight text-slate-900 leading-tight">
                      {activeTenant?.name || 'LibriSpace Study Lounge'}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeTenant?.code} • {seat.section}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {seat.type.replace('_', ' ')}
                </span>
              </div>

              {/* Center Stage: Giant Seat Number & QR Code */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Desk</span>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-indigo-950 font-mono">
                    {seat.seatNumber}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">GPS Geofence Protected Desk</p>
                </div>

                {/* WiFi QR Code */}
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <img src={qrUrl} alt={`QR for ${seat.seatNumber}`} className="w-20 h-20 rounded-md" />
                  <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase">Scan for WiFi</span>
                </div>
              </div>

              {/* Footer: WiFi Credentials & Shift Rules */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-3.5 rounded-b-2xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Wifi className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    SSID: <strong>{activeTenant?.wifiSsid}</strong>
                  </span>
                </div>
                <div className="font-mono text-slate-600">
                  Pass: <strong>{activeTenant?.wifiPassword}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
