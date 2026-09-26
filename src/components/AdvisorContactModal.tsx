import React from 'react';
import { PhoneCall, UserCheck, Clock, X, MessageSquare, ShieldCheck } from 'lucide-react';
import contentData from '../data/contentData.json';

interface AdvisorContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisorContactModal: React.FC<AdvisorContactModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;
  const { brand } = contentData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-[#005baa]/20 text-[#005baa] flex items-center justify-center mx-auto shadow-inner">
            <UserCheck className="w-8 h-8 text-[#005baa]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#005baa]">
              Bộ phận Hỗ trợ khách hàng tại quầy
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {brand.advisor.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {brand.advisor.title} - VietinBank
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Số điện thoại hotline:</span>
            <span className="font-mono font-bold text-base text-[#005baa]">
              {brand.advisor.phone}
            </span>
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              {brand.counterHours.weekday}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={`tel:${brand.advisor.phoneClean}`}
            className="w-full py-3.5 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/15 transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Gọi trực tiếp ngay</span>
          </a>
          <a
            href={`sms:${brand.advisor.phoneClean}`}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Gửi tin nhắn SMS hỗ trợ</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VietinBank cam kết bảo mật tuyệt đối thông tin khách hàng</span>
        </div>
      </div>
    </div>
  );
};
