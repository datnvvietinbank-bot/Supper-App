import React, { useState } from 'react';
import { 
  KeyRound, 
  CreditCard, 
  ScanFace, 
  Fingerprint, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  Play, 
  LogOut,
  ChevronRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { FaqTopic } from '../types';
import contentData from '../data/contentData.json';
import { ImageWithFallback } from './ImageWithFallback';

interface FaqSectionProps {
  onSelectOtherTab?: (tab: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = () => {
  const { faq, brand } = contentData;
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'none' | 'ok' | 'not_ok'>('none');
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  const selectedTopic = faq.topics.find((t) => t.id === selectedTopicId) as FaqTopic | undefined;

  const topicIcons: Record<string, React.ElementType> = {
    'quen-mat-khau': KeyRound,
    'dong-the': CreditCard,
    'xac-thuc-cccd': ScanFace,
    'cap-nhat-sinh-trac-hoc': Fingerprint
  };

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setFeedbackStatus('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMenu = () => {
    setSelectedTopicId(null);
    setFeedbackStatus('none');
  };

  const handleEndConversation = () => {
    setShowExitModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* View 1: 4 Cards Selection */}
      {!selectedTopic ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#005baa] text-xs font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Hỗ trợ thao tác số VietinBank iPay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {faq.question}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              {faq.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            {faq.topics.map((topic, index) => {
              const Icon = topicIcons[topic.id] || HelpCircle;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.id)}
                  className="group text-left p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-[#005baa] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005baa] flex items-center justify-center group-hover:bg-[#005baa] group-hover:text-white transition-colors duration-200">
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400 group-hover:text-[#005baa] transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#005baa] transition-colors mb-2">
                      {topic.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {topic.shortDesc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#005baa]">
                    <span>Xem hướng dẫn {topic.steps.length} bước</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Counter Advisor Banner */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#005baa] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-blue-900/20">
                TH
              </div>
              <div>
                <p className="text-xs font-semibold text-[#005baa] uppercase tracking-wider">Cần hỗ trợ trực tiếp tại quầy?</p>
                <p className="text-sm font-bold text-slate-800">
                  {brand.advisor.title}: {brand.advisor.name}
                </p>
              </div>
            </div>
            <a
              href={`tel:${brand.advisor.phoneClean}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#005baa] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#004785] transition-all shadow-sm active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Gọi tư vấn: {brand.advisor.phone}</span>
            </a>
          </div>
        </div>
      ) : (
        /* View 2: Step-by-Step Visual Guide */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top navigation actions inside guide */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <button
              onClick={handleBackToMenu}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#005baa] bg-blue-50/80 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại menu chính</span>
            </button>

            <button
              onClick={handleEndConversation}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Kết thúc cuộc trò chuyện</span>
            </button>
          </div>

          {/* Guide Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005baa] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Hướng Dẫn Thao Tác Trực Quan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {selectedTopic.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Thực hiện theo các bước chi tiết bên dưới. Nhấp vào nút "Phóng to ảnh" để xem rõ chi tiết giao diện trên App.
            </p>
          </div>

          {/* Step Cards with Images */}
          <div className="space-y-6">
            {selectedTopic.steps.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-200 transition-all"
              >
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#005baa] text-white flex items-center justify-center text-xs font-extrabold">
                      {step.step}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Bước {step.step}/{selectedTopic.steps.length}</span>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                      {step.desc}
                    </p>
                    <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      💡 Mẹo: Khách hàng cần giữ kết nối internet 4G/Wifi ổn định trong suốt quá trình thao tác.
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                      <ImageWithFallback
                        src={step.image}
                        alt={`${step.title} - ${selectedTopic.title}`}
                        fallbackTitle={step.title}
                        className="w-full h-auto max-h-[380px] object-contain mx-auto"
                        allowZoom={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* YouTube Video Link Callout */}
          {selectedTopic.videoUrl && (
            <div className="p-6 bg-gradient-to-r from-red-500/10 via-rose-50 to-orange-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Xem video hướng dẫn chi tiết trên YouTube
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Xem toàn bộ video quay màn hình thực tế trên ứng dụng YouTube
                  </p>
                </div>
              </div>
              <a
                href={selectedTopic.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Video YouTube</span>
              </a>
            </div>
          )}

          {/* Feedback Section: Hỏi khách hàng đã thực hiện ổn hay chưa */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 text-center">
              {faq.feedbackPrompt}
            </h3>

            {feedbackStatus === 'none' && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setFeedbackStatus('ok')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tôi đã thực hiện ổn</span>
                </button>
                <button
                  onClick={() => setFeedbackStatus('not_ok')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Chưa ổn, cần hỗ trợ</span>
                </button>
              </div>
            )}

            {/* If OK */}
            {feedbackStatus === 'ok' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                <p className="text-sm font-semibold text-emerald-800">
                  {faq.feedbackOk}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleBackToMenu}
                    className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    Quay lại menu chính
                  </button>
                  <button
                    onClick={handleEndConversation}
                    className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 transition-colors"
                  >
                    Kết thúc cuộc trò chuyện
                  </button>
                </div>
              </div>
            )}

            {/* If NOT OK */}
            {feedbackStatus === 'not_ok' && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                <div className="text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
                  {faq.feedbackNotOk}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={`tel:${brand.advisor.phoneClean}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#005baa] hover:bg-[#004886] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Gọi {brand.advisor.name}: {brand.advisor.phone}</span>
                  </a>
                  <button
                    onClick={handleBackToMenu}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Quay lại menu chính
                  </button>
                  <button
                    onClick={handleEndConversation}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Kết thúc cuộc trò chuyện
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dual Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleBackToMenu}
              className="px-6 py-3 bg-[#005baa] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#004785] transition-all shadow-sm active:scale-95"
            >
              Quay lại menu chính
            </button>
            <button
              onClick={handleEndConversation}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-200 transition-all active:scale-95"
            >
              Kết thúc cuộc trò chuyện
            </button>
          </div>
        </div>
      )}

      {/* Exit Modal: "Cảm ơn Quý khách đã sử dụng dịch vụ của VietinBank..." */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#005baa] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-[#005baa]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                VietinBank Kính Chào Quý Khách
              </h3>
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
                {faq.goodbyeMessage}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              Rất hân hạnh được đồng hành và phục vụ Quý khách tại quầy giao dịch!
            </div>

            <button
              onClick={() => {
                setShowExitModal(false);
                setSelectedTopicId(null);
                setFeedbackStatus('none');
              }}
              className="w-full py-3 bg-[#005baa] text-white font-bold text-sm rounded-xl hover:bg-[#004785] transition-transform active:scale-95 shadow-md shadow-blue-900/10"
            >
              Về trang chủ dịch vụ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
