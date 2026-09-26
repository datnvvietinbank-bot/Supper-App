import React, { useState } from 'react';
import { 
  HelpCircle, 
  Smartphone, 
  Gamepad2, 
  Calculator, 
  Calendar, 
  Sparkles, 
  MapPin, 
  PhoneCall, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from './types';
import contentData from './data/contentData.json';
import { Navbar } from './components/Navbar';
import { FaqSection } from './components/FaqSection';
import { DownloadAppSection } from './components/DownloadAppSection';
import { MiniGameSection } from './components/MiniGameSection';
import { InterestCalculatorSection } from './components/InterestCalculatorSection';
import { LoanScheduleSection } from './components/LoanScheduleSection';
import { FeaturedProductsSection } from './components/FeaturedProductsSection';
import { BranchLocatorSection } from './components/BranchLocatorSection';
import { AdvisorContactModal } from './components/AdvisorContactModal';

export default function App() {
  const { brand } = contentData;
  const [activeTab, setActiveTab] = useState<ActiveTab>('faq');
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState<boolean>(false);

  // Bottom navigation items for mobile touch-first ergonomics
  const bottomNavItems = [
    { id: 'faq' as ActiveTab, label: 'Giải đáp', icon: HelpCircle },
    { id: 'game' as ActiveTab, label: 'Chơi game', icon: Gamepad2 },
    { id: 'interest' as ActiveTab, label: 'Tính lãi', icon: Calculator },
    { id: 'loan' as ActiveTab, label: 'Lịch vay', icon: Calendar },
    { id: 'branches' as ActiveTab, label: 'Điểm GD', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-[#005baa] selection:text-white">
      {/* 3-Zone Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdvisor={() => setIsAdvisorModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        {activeTab === 'faq' && <FaqSection />}
        {activeTab === 'download' && <DownloadAppSection />}
        {activeTab === 'game' && <MiniGameSection />}
        {activeTab === 'interest' && <InterestCalculatorSection />}
        {activeTab === 'loan' && <LoanScheduleSection />}
        {activeTab === 'products' && <FeaturedProductsSection />}
        {activeTab === 'branches' && <BranchLocatorSection />}
      </main>

      {/* Floating Fast Consultation Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30">
        <button
          onClick={() => setIsAdvisorModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#ed1b24] hover:bg-[#c9121a] text-white rounded-full shadow-xl shadow-red-900/20 font-bold text-xs sm:text-sm transition-transform active:scale-95 group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
          <PhoneCall className="w-4 h-4" />
          <span className="hidden sm:inline">Hỗ trợ tại quầy:</span>
          <span>{brand.advisor.name}</span>
        </button>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile guidelines) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-5 items-center">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
                  isActive ? 'text-[#005baa]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={brand.logoUrl} 
              alt="VietinBank" 
              referrerPolicy="no-referrer"
              className="h-8 w-auto brightness-200 invert object-contain"
            />
            <div className="border-l border-slate-700 pl-3">
              <p className="font-semibold text-white">{brand.fullName}</p>
              <p className="text-[11px] text-slate-500">{brand.slogan}</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>© 2026 Ngân hàng TMCP Công Thương Việt Nam - VietinBank. All rights reserved.</p>
            <p className="text-[11px] text-slate-500">
              Ứng dụng tương tác số tại Quầy giao dịch khách hàng
            </p>
          </div>
        </div>
      </footer>

      {/* Advisor Contact Modal */}
      <AdvisorContactModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
      />
    </div>
  );
}
