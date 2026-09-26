import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Table, 
  FileSpreadsheet, 
  Printer, 
  ChevronRight, 
  X, 
  ArrowDownUp, 
  Info,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { LoanScheduleRow } from '../types';

export const LoanScheduleSection: React.FC = () => {
  const { loanSchedule } = contentData;

  // Form states (Inputs are strictly typed text/number, NO SLIDER as requested!)
  const [loanAmountInput, setLoanAmountInput] = useState<string>('200.000.000');
  const [loanTermMonths, setLoanTermMonths] = useState<number>(loanSchedule.defaultTermMonths);
  const [annualRate, setAnnualRate] = useState<number>(loanSchedule.defaultAnnualRate);
  const [disbursementDate, setDisbursementDate] = useState<string>('2026-01-10');
  const [payDay, setPayDay] = useState<number>(loanSchedule.defaultPayDay);
  const [cycleId, setCycleId] = useState<string>('monthly');
  const [roundingMode, setRoundingMode] = useState<'thousand' | 'exact'>('thousand');
  
  // Modal for "Xem chi tiết"
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Raw loan amount
  const rawLoanAmount = useMemo(() => {
    const cleaned = loanAmountInput.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }, [loanAmountInput]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setLoanAmountInput('');
      return;
    }
    const num = parseInt(val, 10);
    setLoanAmountInput(new Intl.NumberFormat('vi-VN').format(num));
  };

  const selectedCycle = useMemo(() => {
    return loanSchedule.cycles.find((c) => c.id === cycleId) || loanSchedule.cycles[0];
  }, [cycleId, loanSchedule.cycles]);

  // Total periods
  const totalPeriods = useMemo(() => {
    const step = selectedCycle.monthsStep;
    return Math.max(1, Math.floor(loanTermMonths / step));
  }, [loanTermMonths, selectedCycle]);

  // Periodic interest rate
  const periodicRate = useMemo(() => {
    return (annualRate / 100) / selectedCycle.divisor;
  }, [annualRate, selectedCycle]);

  // Rounding helper
  const roundValue = (val: number, mode: 'thousand' | 'exact') => {
    if (mode === 'thousand') {
      return Math.round(val / 1000) * 1000;
    }
    return Math.round(val);
  };

  // Generate date based on disbursement date, step months, and chosen fixed pay day
  const calculatePaymentDate = (periodIndex: number): string => {
    const start = new Date(disbursementDate);
    if (isNaN(start.getTime())) return `Kỳ ${periodIndex}`;

    // Target month: start month + periodIndex * step
    const targetMonth = start.getMonth() + periodIndex * selectedCycle.monthsStep;
    const targetYear = start.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    // Days in target month
    const daysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    const actualDay = Math.min(payDay, daysInMonth);

    const d = new Date(targetYear, normalizedMonth, actualDay);
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    return `${dayStr}/${monthStr}/${d.getFullYear()}`;
  };

  // Calculation schedule
  const scheduleData = useMemo<LoanScheduleRow[]>(() => {
    if (rawLoanAmount <= 0 || totalPeriods <= 0) return [];

    const rows: LoanScheduleRow[] = [];
    let currentBalance = rawLoanAmount;
    const basePrincipalPerPeriod = rawLoanAmount / totalPeriods;
    let accumulatedPrincipal = 0;

    for (let p = 1; p <= totalPeriods; p++) {
      const begBalance = currentBalance;
      let pPrincipal = roundValue(basePrincipalPerPeriod, roundingMode);

      // Last period adjustment rule (2.3: Sai lệch do làm tròn được điều chỉnh vào kỳ trả nợ cuối cùng)
      if (p === totalPeriods) {
        pPrincipal = rawLoanAmount - accumulatedPrincipal;
      }

      accumulatedPrincipal += pPrincipal;

      // Periodic interest = Dư nợ đầu kỳ * Lãi suất kỳ
      const rawInterest = begBalance * periodicRate;
      const pInterest = roundValue(rawInterest, roundingMode);
      const pTotal = pPrincipal + pInterest;
      const endBalance = Math.max(0, begBalance - pPrincipal);

      rows.push({
        period: p,
        paymentDate: calculatePaymentDate(p),
        beginningBalance: begBalance,
        principal: pPrincipal,
        interest: pInterest,
        totalPayment: pTotal,
        endingBalance: endBalance
      });

      currentBalance = endBalance;
    }

    return rows;
  }, [rawLoanAmount, totalPeriods, periodicRate, roundingMode, disbursementDate, payDay, selectedCycle]);

  // Aggregate totals
  const totals = useMemo(() => {
    const totalPrincipal = scheduleData.reduce((acc, r) => acc + r.principal, 0);
    const totalInterest = scheduleData.reduce((acc, r) => acc + r.interest, 0);
    const totalPayment = totalPrincipal + totalInterest;
    const firstPeriodPayment = scheduleData.length > 0 ? scheduleData[0].totalPayment : 0;
    const lastPeriodPayment = scheduleData.length > 0 ? scheduleData[scheduleData.length - 1].totalPayment : 0;

    return {
      totalPrincipal,
      totalInterest,
      totalPayment,
      firstPeriodPayment,
      lastPeriodPayment
    };
  }, [scheduleData]);

  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN').format(Math.round(v));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Kỳ', 'Ngày trả nợ', 'Dư nợ đầu kỳ', 'Gốc phải trả', 'Lãi phải trả', 'Tổng tiền trả', 'Dư nợ còn lại'];
    const rows = scheduleData.map((r) => [
      r.period,
      r.paymentDate,
      r.beginningBalance,
      r.principal,
      r.interest,
      r.totalPayment,
      r.endingBalance
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_tra_no_VietinBank_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#005baa] text-xs font-semibold">
          <Calendar className="w-4 h-4" />
          <span>Công cụ quản lý dư nợ khoản vay</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {loanSchedule.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {loanSchedule.subtitle}
        </p>
      </div>

      {/* Bước 1: Form Inputs & Summary Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form: Strictly text inputs (No Slider!) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span>Thông số khoản vay</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Số tiền vay (dạng nhập số, không kéo thả) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="loan-amount" className="text-xs sm:text-sm font-bold text-slate-800">
                Số tiền vay (VND) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="loan-amount"
                  type="text"
                  inputMode="numeric"
                  value={loanAmountInput}
                  onChange={handleAmountChange}
                  className="w-full px-4 py-2.5 text-base sm:text-lg font-bold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  VND
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[100000000, 300000000, 500000000, 1000000000, 2000000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmountInput(new Intl.NumberFormat('vi-VN').format(amt))}
                    className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                      rawLoanAmount === amt ? 'bg-blue-50 border-[#005baa] text-[#005baa] font-bold' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {amt >= 1000000000 ? `${amt / 1000000000} Tỷ` : `${amt / 1000000} Tr`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Thời gian vay (tháng) */}
            <div className="space-y-1.5">
              <label htmlFor="loan-term" className="text-xs sm:text-sm font-bold text-slate-800">
                Thời gian vay (Tháng) <span className="text-red-500">*</span>
              </label>
              <input
                id="loan-term"
                type="number"
                min="1"
                max="360"
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
              />
            </div>

            {/* 3. Lãi suất (%/năm) */}
            <div className="space-y-1.5">
              <label htmlFor="annual-rate" className="text-xs sm:text-sm font-bold text-slate-800">
                Lãi suất (%/Năm) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="annual-rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %/Năm
                </span>
              </div>
            </div>

            {/* 4. Ngày giải ngân */}
            <div className="space-y-1.5">
              <label htmlFor="disburse-date" className="text-xs sm:text-sm font-bold text-slate-800">
                Ngày giải ngân
              </label>
              <input
                id="disburse-date"
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
              />
            </div>

            {/* 5. Chu kỳ trả nợ */}
            <div className="space-y-1.5">
              <label htmlFor="cycle-select" className="text-xs sm:text-sm font-bold text-slate-800">
                Chu kỳ trả nợ
              </label>
              <select
                id="cycle-select"
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="w-full px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
              >
                {loanSchedule.cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Ngày trả nợ định kỳ */}
            <div className="space-y-1.5">
              <label htmlFor="pay-day" className="text-xs sm:text-sm font-bold text-slate-800">
                Ngày trả nợ định kỳ
              </label>
              <select
                id="pay-day"
                value={payDay}
                onChange={(e) => setPayDay(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
              >
                {[5, 10, 15, 20, 25, 28].map((d) => (
                  <option key={d} value={d}>
                    Ngày {d} hàng tháng
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Quy tắc làm tròn */}
            <div className="space-y-1.5">
              <label htmlFor="rounding-mode" className="text-xs sm:text-sm font-bold text-slate-800">
                Quy tắc làm tròn
              </label>
              <select
                id="rounding-mode"
                value={roundingMode}
                onChange={(e) => setRoundingMode(e.target.value as 'thousand' | 'exact')}
                className="w-full px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005baa]/20 focus:border-[#005baa]"
              >
                {loanSchedule.roundingModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Summary: Matching the design from PDF Screenshot */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-[#002f5a] text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tóm tắt nghĩa vụ trả nợ
              </span>
              <span className="text-xs text-white/70">
                Tổng cộng {totalPeriods} kỳ
              </span>
            </div>

            {/* Số tiền trả kỳ đầu */}
            <div>
              <span className="text-xs text-slate-300 block mb-1">
                Số tiền trả kỳ đầu (cao nhất):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatVND(totals.firstPeriodPayment)}
                </span>
                <span className="text-xs text-white/70">VND</span>
              </div>
            </div>

            {/* Số tiền trả kỳ cuối */}
            <div>
              <span className="text-xs text-slate-300 block mb-1">
                Số tiền trả kỳ cuối (thấp nhất):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
                  {formatVND(totals.lastPeriodPayment)}
                </span>
                <span className="text-xs text-white/70">VND</span>
              </div>
            </div>

            {/* Grid 2 stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-300 block">Tổng lãi phải trả</span>
                <span className="text-sm sm:text-base font-bold font-mono text-amber-300">
                  {formatVND(totals.totalInterest)}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-300 block">Tổng tiền gốc + lãi</span>
                <span className="text-sm sm:text-base font-bold font-mono text-white">
                  {formatVND(totals.totalPayment)}
                </span>
              </div>
            </div>
          </div>

          {/* Bước 2: Nút "Xem chi tiết" theo PDF */}
          <div className="pt-6">
            <button
              onClick={() => setShowDetailModal(true)}
              className="w-full py-3.5 bg-[#005baa] hover:bg-[#004886] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-transform active:scale-95 border border-white/20"
            >
              <Table className="w-4 h-4" />
              <span>Xem chi tiết lịch trả nợ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rules explanation box from PDF Page 1 & 2 */}
      <div className="bg-blue-50/70 rounded-2xl border border-blue-200/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005baa]">
          <Info className="w-4 h-4" />
          <span>Nguyên tắc tính toán dư nợ giảm dần tại ngân hàng</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
          {loanSchedule.rulesText.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#005baa] shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BƯỚC 2: MODAL BẢNG TÍNH LỊCH TRẢ NỢ VỚI DƯ NỢ GIẢM DẦN (Matching PDF Page 1 Screenshot) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#003b73] to-[#005baa] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Bảng tính lịch trả nợ với dư nợ giảm dần
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Khoản vay: {loanAmountInput} VND | Thời hạn: {loanTermMonths} tháng | Lãi suất: {annualRate}%/năm
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Action Bar (Export CSV / Print) */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 font-medium">
                <span>Tổng số kỳ: <strong>{totalPeriods}</strong></span>
                <span>Chu kỳ: <strong>{selectedCycle.name}</strong></span>
                <span>Ngày trả định kỳ: <strong>Ngày {payDay}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất file Excel/CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#005baa]" />
                  <span>In bảng tính</span>
                </button>
              </div>
            </div>

            {/* Table Content (Exact Column Structure from Screenshot) */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="p-3 text-center w-12">Kỳ</th>
                      <th className="p-3 text-center">Kỳ trả nợ</th>
                      <th className="p-3 text-right">Số gốc còn lại</th>
                      <th className="p-3 text-right">Gốc</th>
                      <th className="p-3 text-right">Lãi</th>
                      <th className="p-3 text-right font-bold text-slate-900">Tổng gốc + Lãi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {/* Period 0 row: Disbursement */}
                    <tr className="bg-slate-50/60 text-slate-500">
                      <td className="p-3 text-center font-bold">0</td>
                      <td className="p-3 text-center">{calculatePaymentDate(0)}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">{formatVND(rawLoanAmount)}</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right">-</td>
                    </tr>

                    {/* Periods 1..N */}
                    {scheduleData.map((row) => (
                      <tr key={row.period} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-700">{row.period}</td>
                        <td className="p-3 text-center text-slate-600">{row.paymentDate}</td>
                        <td className="p-3 text-right text-slate-600">{formatVND(row.beginningBalance)}</td>
                        <td className="p-3 text-right font-medium text-slate-800">{formatVND(row.principal)}</td>
                        <td className="p-3 text-right text-amber-700">{formatVND(row.interest)}</td>
                        <td className="p-3 text-right font-bold text-[#005baa]">{formatVND(row.totalPayment)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* Total Row matching screenshot */}
                    <tr className="bg-[#003b73] text-white font-bold text-xs uppercase tracking-wider">
                      <td colSpan={3} className="p-3 text-center">TỔNG CỘNG</td>
                      <td className="p-3 text-right font-mono text-sm">{formatVND(totals.totalPrincipal)}</td>
                      <td className="p-3 text-right font-mono text-sm text-amber-300">{formatVND(totals.totalInterest)}</td>
                      <td className="p-3 text-right font-mono text-sm text-white">{formatVND(totals.totalPayment)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Đóng bảng tính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
