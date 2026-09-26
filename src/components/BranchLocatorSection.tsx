import React, { useState } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  ExternalLink, 
  Search, 
  Building2, 
  Navigation, 
  ShieldAlert,
  CalendarCheck
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { BranchLocation } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

export const BranchLocatorSection: React.FC = () => {
  const { branches } = contentData;
  const [selectedRegion, setSelectedRegion] = useState<string>('TP.HCM');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLocations = branches.locations.filter((loc) => {
    const matchesRegion = selectedRegion === 'all' || loc.branchRegion === selectedRegion;
    const matchesQuery = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesQuery;
  }) as BranchLocation[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#005baa] text-xs font-semibold">
          <MapPin className="w-4 h-4" />
          <span>Mạng lưới 155 Chi nhánh VietinBank toàn quốc</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {branches.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {branches.subtitle}
        </p>
      </div>

      {/* Working Hours Box (Exact content from PDF Page 2) */}
      <div className="bg-gradient-to-r from-blue-900 via-[#003b73] to-[#005baa] text-white p-5 sm:p-6 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>{branches.workingHours.title}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
            <span className="font-bold text-white block mb-1">Thứ 2 đến Thứ 6</span>
            <p className="text-white/90">
              {branches.workingHours.weekdays}
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
            <span className="font-bold text-amber-300 block mb-1">Cuối tuần</span>
            <p className="text-white/90">
              {branches.workingHours.weekends}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Regions tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedRegion === 'all'
                ? 'bg-[#005baa] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          {branches.regions.map((reg) => {
            const isActive = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#005baa] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                {reg.name}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên PGD, đường..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
          />
        </div>
      </div>

      {/* Branch Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLocations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="h-48 sm:h-52 bg-slate-100 relative overflow-hidden">
                <ImageWithFallback
                  src={loc.image}
                  alt={loc.name}
                  fallbackTitle={loc.name}
                  className="w-full h-full object-cover"
                  allowZoom={true}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-[#005baa]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-xs">
                    {loc.type}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {loc.name}
                </h3>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-[#ed1b24] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loc.address}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Hotline:</span>
                  <a
                    href={`tel:${loc.phoneClean}`}
                    className="font-bold text-[#005baa] hover:underline"
                  >
                    {loc.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Action Bar: Direct Call + Google Maps link with icon */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <a
                href={`tel:${loc.phoneClean}`}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#005baa] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi hotline</span>
              </a>

              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">Không tìm thấy điểm giao dịch phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thử từ khóa khác hoặc chọn tất cả khu vực</p>
          </div>
        )}
      </div>
    </div>
  );
};
