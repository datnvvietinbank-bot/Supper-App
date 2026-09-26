import React from 'react';
import { 
  HelpCircle, 
  Smartphone, 
  Gamepad2, 
  Calculator, 
  Calendar, 
  Sparkles, 
  MapPin, 
  PhoneCall, 
  Clock 
} from 'lucide-react';
import { ActiveTab } from '../types';
import contentData from '../data/contentData.json';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdvisor
}) => {
  const { brand } = contentData;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'faq', label: 'Giải đáp thắc mắc', icon: HelpCircle },
    { id: 'download', label: 'Tải App iPay', icon: Smartphone },
    { id: 'game', label: 'Thử thách Game', icon: Gamepad2, badge: 'Nhận quà' },
    { id: 'interest', label: 'Tính lãi tiền gửi', icon: Calculator },
    { id: 'loan', label: 'Lịch trả nợ vay', icon: Calendar },
    { id: 'products', label: 'Sản phẩm nổi bật', icon: Sparkles },
    { id: 'branches', label: 'Điểm giao dịch', icon: MapPin }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for Bank counter status */}
      <div className="bg-gradient-to-r from-[#003b73] via-[#005baa] to-[#0072ce] text-white px-4 py-1 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-2xl truncate">
          <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">Giờ giao dịch: {brand.counterHours.weekday}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] shrink-0">
          <span className="hidden sm:inline text-white/80">Hỗ trợ tại quầy: {brand.advisor.name}</span>
          <a 
            href={`tel:${brand.advisor.phoneClean}`}
            className="flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{brand.advisor.phone}</span>
          </a>
        </div>
      </div>

      {/* Main 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark & Logo */}
        <button 
          onClick={() => setActiveTab('faq')}
          className="flex items-center gap-2.5 shrink-0 text-left hover:opacity-90 transition-opacity"
        >
          <img 
            src={brand.logoUrl} 
            alt="VietinBank Logo" 
            referrerPolicy="no-referrer"
            className="h-9 sm:h-10 w-auto object-contain"
          />
          <div className="hidden lg:block border-l border-slate-200 pl-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#005baa]">
              Quầy Dịch Vụ Khách Hàng
            </span>
            <span className="block text-[11px] text-slate-500">
              Chăm sóc & Tương tác số
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Scrollable on small screens) */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#005baa] text-white shadow-sm shadow-[#005baa]/25'
                    : 'text-slate-600 hover:text-[#005baa] hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive ? 'bg-[#ed1b24] text-white' : 'bg-red-100 text-[#ed1b24]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (Advisor Assistance) */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={onOpenAdvisor}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#005baa] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition-all active:scale-95 whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Tư vấn viên</span>
          </button>
        </div>
      </div>
    </header>
  );
};
