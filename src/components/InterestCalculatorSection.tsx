import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  ExternalLink, 
  Play, 
  Coins, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Percent
} from 'lucide-react';
import contentData from '../data/contentData.json';

export const InterestCalculatorSection: React.FC = () => {
  const { interestCalculator } = contentData;

  // Form states
  const [depositAmountInput, setDepositAmountInput] = useState<string>('100.000.000');
  const [selectedTerm, setSelectedTerm] = useState<number>(interestCalculator.defaultTerm);
  const [customRate, setCustomRate] = useState<string>('5.0');
  const [hasInteracted, setHasInteracted] = useState<boolean>(true);

  // Parse raw numeric amount
  const rawDepositAmount = useMemo(() => {
    const cleaned = depositAmountInput.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }, [depositAmountInput]);

  // Sync rate when term changes (unless user typed custom)
  const handleTermChange = (termMonths: number) => {
    setSelectedTerm(termMonths);
    const matched = interestCalculator.termRates.find((t) => t.months === termMonths);
    if (matched) {
      setCustomRate(matched.rate.toString());
    }
  };

  // Format currency display
  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val));
  };

  // Handle amount text input strictly numbers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      setDepositAmountInput('');
      return;
    }
    const num = parseInt(value, 10);
    setDepositAmountInput(new Intl.NumberFormat('vi-VN').format(num));
  };

  // Preset quick fill amounts
  const handlePresetAmount = (amount: number) => {
    setHasInteracted(true);
    setDepositAmountInput(new Intl.NumberFormat('vi-VN').format(amount));
  };

  // Validations based on rules
  const isAmountValid = rawDepositAmount >= interestCalculator.minAmount;
  const isTermValid = selectedTerm > 0;
  const parsedRate = parseFloat(customRate);
  const isRateValid = !isNaN(parsedRate) && parsedRate >= 0 && parsedRate <= 20;

  // Calculations
  const calculatedInterest = useMemo(() => {
    if (!isAmountValid || !isTermValid || !isRateValid) return 0;
    // Bank formula: Tiền lãi = (Số tiền * Lãi suất%/năm * số tháng) / 12
    return (rawDepositAmount * (parsedRate / 100) * selectedTerm) / 12;
  }, [rawDepositAmount, selectedTerm, parsedRate, isAmountValid, isTermValid, isRateValid]);

  const totalReceived = useMemo(() => {
    if (!isAmountValid) return 0;
    return rawDepositAmount + calculatedInterest;
  }, [rawDepositAmount, calculatedInterest, isAmountValid]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#005baa] text-xs font-semibold">
          <Calculator className="w-4 h-4" />
          <span>Biểu lãi suất tiết kiệm VietinBank</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {interestCalculator.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {interestCalculator.subtitle}
        </p>
      </div>

      {/* Main Calculator Grid (matching PDF layout: Inputs on Left, Results on Right) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Input Fields */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              Thông tin tiền gửi
            </h2>
            <button
              onClick={() => {
                setDepositAmountInput('100.000.000');
                setSelectedTerm(12);
                setCustomRate('5.0');
              }}
              className="text-xs text-[#005baa] hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* 1. Số tiền gửi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-amount" className="text-xs sm:text-sm font-bold text-slate-800">
                Tổng tiền gửi (VND) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Tối thiểu: 1.000.000 VND</span>
            </div>

            <div className="relative">
              <input
                id="deposit-amount"
                type="text"
                inputMode="numeric"
                value={depositAmountInput}
                onChange={handleAmountChange}
                placeholder="Nhập số tiền gửi"
                className={`w-full px-4 py-3 text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  !isAmountValid && hasInteracted
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#005baa]/20 focus:border-[#005baa]'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VND
              </span>
            </div>

            {/* Error Message for Amount */}
            {!isAmountValid && hasInteracted && (
              <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{rawDepositAmount === 0 ? interestCalculator.messages.invalidAmount : interestCalculator.messages.minAmountWarning}</span>
              </p>
            )}

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[20000000, 50000000, 100000000, 500000000, 1000000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetAmount(amt)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    rawDepositAmount === amt
                      ? 'bg-blue-50 border-[#005baa] text-[#005baa] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {amt >= 1000000000 ? `${amt / 1000000000} Tỷ` : `${amt / 1000000} Triệu`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Kỳ hạn gửi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-term" className="text-xs sm:text-sm font-bold text-slate-800">
                Kỳ hạn gửi <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Chọn kỳ hạn phù hợp</span>
            </div>

            <select
              id="deposit-term"
              value={selectedTerm}
              onChange={(e) => handleTermChange(parseInt(e.target.value, 10))}
              className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
            >
              {interestCalculator.termRates.map((term) => (
                <option key={term.months} value={term.months}>
                  {term.label} (Lãi suất niêm yết: {term.rate}%/năm)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lãi suất */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-rate" className="text-xs sm:text-sm font-bold text-slate-800">
                Lãi suất (%/năm) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Có thể điều chỉnh theo thỏa thuận quầy</span>
            </div>

            <div className="relative">
              <input
                id="deposit-rate"
                type="number"
                step="0.05"
                min="0"
                max="20"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className={`w-full px-4 py-3 text-sm sm:text-base font-bold font-mono text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 ${
                  !isRateValid
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-[#005baa]/20 focus:border-[#005baa]'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %/năm
              </span>
            </div>

            {!isRateValid && (
              <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{interestCalculator.messages.invalidRate}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Results Display (matching PDF Layout) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005baa]">
              <TrendingUp className="w-4 h-4" />
              <span>Tiền lãi dự tính</span>
            </div>

            {/* Box 1: Tiền gửi dự tính */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">
                Tiền gửi dự tính
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg sm:text-xl font-bold font-mono text-slate-900">
                  {formatCurrency(rawDepositAmount)}
                </span>
                <span className="text-xs font-semibold text-slate-400">VND</span>
              </div>
            </div>

            {/* Box 2: Số tiền lãi */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[#005baa]/30 shadow-xs">
              <span className="text-xs text-[#005baa] font-bold block">
                Số tiền lãi dự tính
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#005baa]">
                  {formatCurrency(calculatedInterest)}
                </span>
                <span className="text-xs font-bold text-[#005baa]">VND</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Áp dụng cho kỳ hạn {selectedTerm} tháng ({customRate}%/năm)
              </span>
            </div>

            {/* Box 3: Tổng tiền (Gốc + Lãi) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">
                Tổng tiền nhận được khi đến hạn
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                  {formatCurrency(totalReceived)}
                </span>
                <span className="text-xs font-semibold text-slate-400">VND</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p>• Tiền lãi thực tế có thể thay đổi tùy thuộc vào ngày thực gửi và số ngày thực tế trong kỳ gửi.</p>
            <p>• Khách hàng có thể mở sổ tiết kiệm online trên VietinBank iPay để hưởng thêm lãi suất ưu đãi.</p>
          </div>
        </div>
      </div>

      {/* TikTok Video Guide Banner (From PDF Page 2) */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#003b73] to-slate-900 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-rose-400 flex items-center justify-center shrink-0 border border-white/20">
            <Play className="w-7 h-7 fill-current" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold">
              <span>Video TikTok Hướng Dẫn</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Bí quyết gửi tiết kiệm sinh lời tối đa tại VietinBank
            </h3>
            <p className="text-xs text-slate-300">
              Xem video chia sẻ cách chọn kỳ hạn và tối ưu hóa nguồn tiền nhàn rỗi
            </p>
          </div>
        </div>

        <a
          href={interestCalculator.videoGuideUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full md:w-auto px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shrink-0"
        >
          <span>Xem Video TikTok</span>
          <ExternalLink className="w-4 h-4 text-slate-600" />
        </a>
      </div>
    </div>
  );
};
