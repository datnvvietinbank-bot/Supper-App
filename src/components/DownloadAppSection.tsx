import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Apple, 
  Smartphone, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  QrCode 
} from 'lucide-react';
import contentData from '../data/contentData.json';

export const DownloadAppSection: React.FC = () => {
  const { downloadApp, brand } = contentData;
  const [iosQrUrl, setIosQrUrl] = useState<string>('');
  const [androidQrUrl, setAndroidQrUrl] = useState<string>('');
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    // Generate QR codes for iOS and Android
    QRCode.toDataURL(downloadApp.iosUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#003b73',
        light: '#ffffff'
      }
    }).then(setIosQrUrl).catch(console.error);

    QRCode.toDataURL(downloadApp.androidUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#005baa',
        light: '#ffffff'
      }
    }).then(setAndroidQrUrl).catch(console.error);
  }, [downloadApp]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#005baa] text-xs font-semibold">
          <Smartphone className="w-4 h-4" />
          <span>Ứng dụng Ngân hàng số VietinBank iPay</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {downloadApp.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {downloadApp.subtitle}
        </p>
      </div>

      {/* Main Dual Card: Download Box with Real QR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Side: QR Code Kiosk Scanner */}
        <div className="lg:col-span-6 p-6 sm:p-8 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center gap-2 mb-4 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActivePlatform('ios')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'ios'
                  ? 'bg-[#005baa] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Apple iOS (iPhone)</span>
            </button>
            <button
              onClick={() => setActivePlatform('android')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activePlatform === 'android'
                  ? 'bg-[#005baa] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android (Samsung/Oppo/...)</span>
            </button>
          </div>

          <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-[#005baa]/30 shadow-md mb-4 group">
            {activePlatform === 'ios' ? (
              iosQrUrl ? (
                <img 
                  src={iosQrUrl} 
                  alt="QR Code tải VietinBank iPay cho iPhone" 
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-300 animate-spin" />
                </div>
              )
            ) : (
              androidQrUrl ? (
                <img 
                  src={androidQrUrl} 
                  alt="QR Code tải VietinBank iPay cho Android" 
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-300 animate-spin" />
                </div>
              )
            )}
            
            <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
              <span className="px-3 py-1 bg-white/95 backdrop-blur-xs text-[11px] font-bold text-[#005baa] rounded-full border border-blue-100 shadow-xs">
                Mở camera quét ngay
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mb-5 font-medium">
            Hướng camera điện thoại vào mã QR để chuyển thẳng đến kho ứng dụng chính thức
          </p>

          {/* Store direct buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={downloadApp.iosUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <Apple className="w-4 h-4 fill-current" />
              <span>Tải trên App Store</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href={downloadApp.androidUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#005baa] hover:bg-[#004785] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải trên Google Play</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Right Side: Key Features & Benefits */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005baa]">
              <Sparkles className="w-4 h-4" />
              <span>Đặc quyền khách hàng iPay</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Trải nghiệm ngân hàng thế hệ mới
            </h3>

            <div className="space-y-4 pt-2">
              {downloadApp.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#005baa] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{feat.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Support Note */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800">
              <span className="font-bold">Bảo mật chuẩn quốc tế PCI-DSS & Sinh trắc học.</span>
              <p className="text-emerald-700/90 mt-0.5">
                Nhân viên tại quầy sẵn sàng hỗ trợ Quý khách kích hoạt tài khoản trong vòng 2 phút.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
