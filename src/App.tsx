import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  ArrowUpRight,
  Check,
  Sliders,
  Calculator,
  Compass,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import {
  FilingStatus,
  IrsYearDataset,
  OFFICIAL_IRS_DATASETS,
  STATE_TAX_PRESETS,
  INITIAL_DREAM_ITEMS,
  INITIAL_EXPENSES,
  DreamItem,
  ExpenseItem,
  calculateTaxAndIncome,
  calculateGoalPathways,
} from './data/irsData';
import { IrsDataModal } from './components/IrsDataModal';
import { DreamBoardSection } from './components/DreamBoardSection';
import { BudgetAndAdviceSection, ActiveAutomations } from './components/BudgetAndAdviceSection';
import { InterestSimulatorSection } from './components/InterestSimulatorSection';
import { LearningAndQuizSection } from './components/LearningAndQuizSection';

interface CareerPreset {
  id: string;
  label: string;
  hourlyRate: number;
  weeklyHours: number;
  goalIncome: number;
  filingStatus: FilingStatus;
  preTax401k: number;
}

const CAREER_PRESETS: CareerPreset[] = [
  {
    id: 'tech',
    label: 'Product Technologist ($44/hr · 40h)',
    hourlyRate: 44,
    weeklyHours: 40,
    goalIncome: 115000,
    filingStatus: 'single',
    preTax401k: 8,
  },
  {
    id: 'nurse',
    label: 'Clinical RN ($52/hr · 44h w/ OT)',
    hourlyRate: 52,
    weeklyHours: 44,
    goalIncome: 135000,
    filingStatus: 'head_household',
    preTax401k: 10,
  },
  {
    id: 'designer',
    label: 'Industrial Designer ($32/hr · 40h)',
    hourlyRate: 32,
    weeklyHours: 40,
    goalIncome: 85000,
    filingStatus: 'single',
    preTax401k: 6,
  },
  {
    id: 'household',
    label: 'Dual-Earner Household ($68/hr · 40h)',
    hourlyRate: 68,
    weeklyHours: 40,
    goalIncome: 175000,
    filingStatus: 'married_joint',
    preTax401k: 12,
  },
];

export default function App() {
  // Primary Income & Work Inputs
  const [hourlyRate, setHourlyRate] = useState<number>(44);
  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [goalAnnualIncome, setGoalAnnualIncome] = useState<number>(115000);

  // IRS Tax & Deduction Inputs
  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(2026);
  const [customIrsDataset, setCustomIrsDataset] = useState<IrsYearDataset | null>(null);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [preTax401kPercent, setPreTax401kPercent] = useState<number>(8);
  const [preTaxHsaAnnual, setPreTaxHsaAnnual] = useState<number>(1800);
  const [statePresetCode, setStatePresetCode] = useState<string>('MOD');
  const [isIrsModalOpen, setIsIrsModalOpen] = useState<boolean>(false);

  // Dream Board, Expenses, Automations & Interest Rate
  const [dreamItems, setDreamItems] = useState<DreamItem[]>(() => {
    try {
      const saved = localStorage.getItem('meridian_dream_items_v1');
      return saved ? JSON.parse(saved) : INITIAL_DREAM_ITEMS;
    } catch {
      return INITIAL_DREAM_ITEMS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('meridian_expenses_v1');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [automations, setAutomations] = useState<ActiveAutomations>({
    discretionaryTrim15: true,
    subscriptionAudit: true,
    preTaxBracketShield: false,
    weeklyMicroSweep: true,
    overtimeEscalator: false,
  });

  const [selectedApy, setSelectedApy] = useState<number>(5.25);
  const [paycheckPeriodView, setPaycheckPeriodView] = useState<'annual' | 'monthly' | 'biweekly' | 'weekly'>('monthly');

  useEffect(() => {
    try {
      localStorage.setItem('meridian_dream_items_v1', JSON.stringify(dreamItems));
    } catch {
      // ignore storage errors
    }
  }, [dreamItems]);

  useEffect(() => {
    try {
      localStorage.setItem('meridian_expenses_v1', JSON.stringify(expenses));
    } catch {
      // ignore storage errors
    }
  }, [expenses]);

  const activeIrsDataset: IrsYearDataset =
    customIrsDataset ?? OFFICIAL_IRS_DATASETS[selectedTaxYear] ?? OFFICIAL_IRS_DATASETS[2026];

  const activeStatePreset =
    STATE_TAX_PRESETS.find((s) => s.code === statePresetCode) ?? STATE_TAX_PRESETS[2];

  // Core IRS Tax & Net Income Calculation
  const taxResult = useMemo(
    () =>
      calculateTaxAndIncome({
        hourlyRate,
        weeklyHours,
        weeksPerYear,
        overtimeMultiplier,
        filingStatus,
        irsDataset: activeIrsDataset,
        preTax401kPercent,
        preTaxHsaAnnual,
        stateEffectiveRate: activeStatePreset.effectiveRate,
      }),
    [
      hourlyRate,
      weeklyHours,
      weeksPerYear,
      overtimeMultiplier,
      filingStatus,
      activeIrsDataset,
      preTax401kPercent,
      preTaxHsaAnnual,
      activeStatePreset.effectiveRate,
    ]
  );

  // Goal Yearly Income Pathway Analysis
  const goalPathways = useMemo(
    () =>
      calculateGoalPathways({
        goalAnnualIncome,
        hourlyRate,
        weeklyHours,
        weeksPerYear,
        overtimeMultiplier,
        currentGrossAnnual: taxResult.grossAnnualIncome,
      }),
    [
      goalAnnualIncome,
      hourlyRate,
      weeklyHours,
      weeksPerYear,
      overtimeMultiplier,
      taxResult.grossAnnualIncome,
    ]
  );

  // Monthly Expenses & Automated Budget Savings Calculations
  const totalMonthlyExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.monthlyAmount, 0),
    [expenses]
  );

  const wantsTotal = useMemo(
    () =>
      expenses
        .filter((e) => e.category === 'wants')
        .reduce((sum, item) => sum + item.monthlyAmount, 0),
    [expenses]
  );

  const baseMonthlySavings = taxResult.netMonthlyIncome - totalMonthlyExpenses;

  const automationMonthlyBoost = useMemo(() => {
    let boost = 0;
    const grossMonthly = taxResult.grossAnnualIncome / 12;
    if (automations.discretionaryTrim15) {
      boost += Math.round(wantsTotal * 0.15);
    }
    if (automations.subscriptionAudit) {
      const subItem = expenses.find((e) => e.id === 'exp-subscriptions')?.monthlyAmount ?? 150;
      boost += Math.round(subItem * 0.35);
    }
    if (automations.preTaxBracketShield) {
      const shiftGross = grossMonthly * 0.03;
      boost += Math.round(
        shiftGross * (taxResult.marginalRate + activeStatePreset.effectiveRate)
      );
    }
    if (automations.weeklyMicroSweep) {
      boost += Math.round(Math.max(45, taxResult.netMonthlyIncome * 0.025));
    }
    if (automations.overtimeEscalator) {
      boost += Math.round(Math.max(75, grossMonthly * 0.03));
    }
    return boost;
  }, [
    automations,
    wantsTotal,
    expenses,
    taxResult.grossAnnualIncome,
    taxResult.marginalRate,
    taxResult.netMonthlyIncome,
    activeStatePreset.effectiveRate,
  ]);

  const optimizedMonthlySavings = Math.max(0, baseMonthlySavings) + automationMonthlyBoost;

  const totalDreamSaved = useMemo(
    () => dreamItems.reduce((sum, item) => sum + item.savedSoFar, 0),
    [dreamItems]
  );

  const handleToggleAutomation = (key: keyof ActiveAutomations) => {
    setAutomations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyPreset = (presetId: string) => {
    const found = CAREER_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setHourlyRate(found.hourlyRate);
    setWeeklyHours(found.weeklyHours);
    setGoalAnnualIncome(found.goalIncome);
    setFilingStatus(found.filingStatus);
    setPreTax401kPercent(found.preTax401k);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const periodDivisor =
    paycheckPeriodView === 'annual'
      ? 1
      : paycheckPeriodView === 'monthly'
      ? 12
      : paycheckPeriodView === 'biweekly'
      ? 26
      : 52;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Mandatory 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#income-taxes"
            className="text-lg font-semibold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            Meridian Ledger
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#income-taxes"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Income & Taxes
            </a>
            <a
              href="#dream-board"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Dream Board
            </a>
            <a
              href="#budget-advice"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Budget & Advice
            </a>
            <a
              href="#rate-simulator"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Rate Simulator
            </a>
            <a
              href="#learn-quiz"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Learn & Quiz
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <select
              aria-label="Load career income preset"
              onChange={(e) => handleApplyPreset(e.target.value)}
              defaultValue="tech"
              className="hidden sm:block px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            >
              {CAREER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsIrsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              IRS.gov {activeIrsDataset.taxYear} Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-16">
        {/* SECTION 01: Hourly-to-Goal Income Studio & IRS Tax Breakdown */}
        <section id="income-taxes" className="space-y-8 scroll-mt-20">
          {/* Editorial Intro Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                <span>{activeIrsDataset.citation}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>FLSA Overtime & Progressive Tax Engine</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <button
                  onClick={() => setIsIrsModalOpen(true)}
                  className="underline hover:text-slate-900"
                >
                  Inspect Official IRS Tables
                </button>
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Hourly Wage, Goal Income & IRS Tax Architecture
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                Submit your hourly rate, weekly hours, and target annual income to calculate exact pathways to your goal alongside a statutory breakdown of federal, FICA, and state taxes.
              </p>
            </div>

            {/* Quick Year Switcher */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <span className="text-xs text-slate-500">Tax Schedule:</span>
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                {[2026, 2025].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setCustomIrsDataset(null);
                      setSelectedTaxYear(yr);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeIrsDataset.taxYear === yr && !customIrsDataset
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    IRS {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary 12-Column Split: Left 5 cols = Wage & Tax Inputs, Right 7 cols = Goal Realization & IRS Waterfall */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Columns: Interactive Input Deck */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  01. Compensation & Work Schedule
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust sliders or type exact figures to model your gross and net earning power.
                </p>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="hourly-rate-input" className="text-xs font-medium text-slate-700">
                    Base Hourly Rate ($/hr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      $
                    </span>
                    <input
                      id="hourly-rate-input"
                      type="number"
                      min={7.25}
                      max={500}
                      step={0.5}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Math.max(1, Number(e.target.value)))}
                      className="w-28 pl-6 pr-2.5 py-1 text-right text-sm font-mono tabular-nums font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={12}
                  max={150}
                  step={0.5}
                  aria-label="Base Hourly Rate Slider"
                  value={Math.min(150, hourlyRate)}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>$15/hr</span>
                  <span>$45/hr</span>
                  <span>$85/hr</span>
                  <span>$150/hr</span>
                </div>
              </div>

              {/* Weekly Hours Worked */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="weekly-hours-input" className="text-xs font-medium text-slate-700 block">
                      Weekly Hours Worked
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {weeklyHours > 40
                        ? `Includes ${(weeklyHours - 40).toFixed(1)} hrs/wk at ${overtimeMultiplier}x overtime ($${(hourlyRate * overtimeMultiplier).toFixed(2)}/hr)`
                        : 'Standard regular hours (≤40 hrs/wk)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="weekly-hours-input"
                      type="number"
                      min={1}
                      max={84}
                      step={1}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Math.max(1, Math.min(100, Number(e.target.value))))}
                      className="w-20 px-2.5 py-1 text-right text-sm font-mono tabular-nums font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    <span className="text-xs text-slate-500 font-mono">hrs</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={65}
                  step={1}
                  aria-label="Weekly Hours Worked Slider"
                  value={Math.min(65, weeklyHours)}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Overtime Rule (&gt;40 hrs/wk):</span>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                    {[
                      { label: '1.0x Flat', val: 1.0 },
                      { label: '1.5x FLSA', val: 1.5 },
                      { label: '2.0x Double', val: 2.0 },
                    ].map((ot) => (
                      <button
                        key={ot.val}
                        type="button"
                        onClick={() => setOvertimeMultiplier(ot.val)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                          overtimeMultiplier === ot.val
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {ot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weeks Worked Per Year */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="weeks-year-slider" className="font-medium text-slate-700">
                    Paid Weeks per Year
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {weeksPerYear} weeks ({weeksPerYear * weeklyHours} hrs/yr)
                  </span>
                </div>
                <input
                  id="weeks-year-slider"
                  type="range"
                  min={26}
                  max={52}
                  step={1}
                  value={weeksPerYear}
                  onChange={(e) => setWeeksPerYear(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Target Yearly Income Goal */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="goal-income-input" className="text-xs font-semibold text-slate-900 block">
                      Target Yearly Income Goal ($/yr)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Your desired annual gross earnings milestone
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      $
                    </span>
                    <input
                      id="goal-income-input"
                      type="number"
                      min={10000}
                      max={1000000}
                      step={1000}
                      value={goalAnnualIncome}
                      onChange={(e) => setGoalAnnualIncome(Math.max(1000, Number(e.target.value)))}
                      className="w-32 pl-6 pr-2.5 py-1 text-right text-sm font-mono tabular-nums font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={2500}
                  aria-label="Target Yearly Income Goal Slider"
                  value={Math.min(300000, goalAnnualIncome)}
                  onChange={(e) => setGoalAnnualIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* IRS Tax Filing & Pre-Tax Deductions */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">
                  02. IRS Filing Status & Pre-Tax Shields
                </h3>

                <div>
                  <label htmlFor="filing-status-select" className="block text-xs font-medium text-slate-700 mb-1">
                    IRS Filing Status (Std. Deduction: ${activeIrsDataset.standardDeduction[filingStatus].toLocaleString()})
                  </label>
                  <select
                    id="filing-status-select"
                    value={filingStatus}
                    onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  >
                    <option value="single">Single Filer (${activeIrsDataset.standardDeduction.single.toLocaleString()} Std Deduction)</option>
                    <option value="married_joint">Married Filing Jointly (${activeIrsDataset.standardDeduction.married_joint.toLocaleString()} Std Deduction)</option>
                    <option value="head_household">Head of Household (${activeIrsDataset.standardDeduction.head_household.toLocaleString()} Std Deduction)</option>
                    <option value="married_separate">Married Filing Separately (${activeIrsDataset.standardDeduction.married_separate.toLocaleString()} Std Deduction)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="state-tax-select" className="block text-xs font-medium text-slate-700 mb-1">
                    State Income Tax Profile
                  </label>
                  <select
                    id="state-tax-select"
                    value={statePresetCode}
                    onChange={(e) => setStatePresetCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  >
                    {STATE_TAX_PRESETS.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="k401-slider" className="font-medium text-slate-700">
                        401(k) Deferral
                      </label>
                      <span className="font-mono tabular-nums font-semibold">
                        {preTax401kPercent}% (${Math.round(taxResult.preTax401kAnnual).toLocaleString()}/yr)
                      </span>
                    </div>
                    <input
                      id="k401-slider"
                      type="range"
                      min={0}
                      max={25}
                      step={1}
                      value={preTax401kPercent}
                      onChange={(e) => setPreTax401kPercent(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor="hsa-slider" className="font-medium text-slate-700">
                        Pre-Tax HSA
                      </label>
                      <span className="font-mono tabular-nums font-semibold">
                        ${preTaxHsaAnnual.toLocaleString()}/yr
                      </span>
                    </div>
                    <input
                      id="hsa-slider"
                      type="range"
                      min={0}
                      max={activeIrsDataset.limits.hsaFamily}
                      step={200}
                      value={preTaxHsaAnnual}
                      onChange={(e) => setPreTaxHsaAnnual(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Goal Realization Pathways + Paycheck Breakdown + IRS Bracket Waterfall */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Goal Yearly Income Realization Studio */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Annual Gross Earnings vs. Target Goal
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900">
                        ${Math.round(taxResult.grossAnnualIncome).toLocaleString()}/yr
                      </span>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        of ${goalAnnualIncome.toLocaleString()} goal
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {goalPathways.isGoalMet ? (
                      <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        ● Target Achieved (+${Math.abs(Math.round(goalPathways.incomeGap)).toLocaleString()} surplus)
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-mono tabular-nums">
                        ▲ Gap to Goal: ${Math.round(goalPathways.incomeGap).toLocaleString()}/yr (${Math.round(goalPathways.incomeGap / 12).toLocaleString()}/mo)
                      </div>
                    )}
                  </div>
                </div>

                {/* Three Actionable Goal Pathways */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-3">
                    {goalPathways.isGoalMet
                      ? 'Current Schedule Exceeds Your Target Yearly Income Goal — Explore Optimization Paths:'
                      : `3 Concrete Pathways to Realize Your $${goalAnnualIncome.toLocaleString()}/yr Goal:`}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Pathway A: Rate Path */}
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-lg flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-slate-500 block">01. Rate Calibration</span>
                        <span className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
                          ${goalPathways.requiredHourlyRateAtCurrentHours.toFixed(2)}/hr
                        </span>
                        <p className="text-xs text-slate-600 mt-1">
                          {goalPathways.hourlyRateDelta > 0
                            ? `Requires +$${goalPathways.hourlyRateDelta.toFixed(2)}/hr raise at your current ${weeklyHours} hrs/wk.`
                            : `Maintains target at ${weeklyHours} hrs/wk.`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setHourlyRate(Number(goalPathways.requiredHourlyRateAtCurrentHours.toFixed(2)))
                        }
                        className="w-full py-1.5 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        Apply ${goalPathways.requiredHourlyRateAtCurrentHours.toFixed(2)}/hr Rate
                      </button>
                    </div>

                    {/* Pathway B: Hours / Overtime Path */}
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-lg flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-slate-500 block">02. Schedule Expansion</span>
                        <span className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
                          {goalPathways.requiredWeeklyHoursAtCurrentRate.toFixed(1)} hrs/wk
                        </span>
                        <p className="text-xs text-slate-600 mt-1">
                          {goalPathways.weeklyHoursDelta > 0
                            ? `Add +${goalPathways.weeklyHoursDelta.toFixed(1)} hrs/wk (${overtimeMultiplier}x OT >40h) at $${hourlyRate.toFixed(2)}/hr.`
                            : `Target met within ${goalPathways.requiredWeeklyHoursAtCurrentRate.toFixed(1)} hrs/wk.`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWeeklyHours(
                            Math.min(84, Number(goalPathways.requiredWeeklyHoursAtCurrentRate.toFixed(1)))
                          )
                        }
                        className="w-full py-1.5 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        Apply {goalPathways.requiredWeeklyHoursAtCurrentRate.toFixed(1)} hrs/wk
                      </button>
                    </div>

                    {/* Pathway C: Balanced 50/50 Hybrid */}
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-lg flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs text-slate-500 block">03. Balanced Hybrid</span>
                        <span className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
                          +${goalPathways.hybridRateIncrease.toFixed(2)}/hr & +{goalPathways.hybridExtraWeeklyHours.toFixed(1)}h
                        </span>
                        <p className="text-xs text-slate-600 mt-1">
                          Combine a ${(hourlyRate + goalPathways.hybridRateIncrease).toFixed(2)}/hr wage with {(weeklyHours + goalPathways.hybridExtraWeeklyHours).toFixed(1)} hrs/wk.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHourlyRate(Number((hourlyRate + goalPathways.hybridRateIncrease).toFixed(2)));
                          setWeeklyHours(Number((weeklyHours + goalPathways.hybridExtraWeeklyHours).toFixed(1)));
                        }}
                        className="w-full py-1.5 px-3 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
                      >
                        Apply Hybrid Path
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Statutory Paycheck & Tax Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Net Paycheck & Statutory Tax Ledger ({activeIrsDataset.taxYear})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Effective Total Tax Rate:{' '}
                      <strong className="font-mono tabular-nums text-slate-800">
                        {(taxResult.effectiveTotalTaxRate * 100).toFixed(1)}%
                      </strong>{' '}
                      · IRS Marginal Bracket:{' '}
                      <strong className="font-mono tabular-nums text-slate-800">
                        {(taxResult.marginalRate * 100).toFixed(0)}%
                      </strong>
                    </p>
                  </div>

                  {/* Period Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {(['annual', 'monthly', 'biweekly', 'weekly'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPaycheckPeriodView(p)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                          paycheckPeriodView === p
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Rows */}
                <div className="divide-y divide-slate-100 text-xs font-mono tabular-nums">
                  <div className="py-2.5 flex justify-between items-center text-slate-800">
                    <span className="font-sans font-medium">
                      Gross Compensation ({weeklyHours} hrs/wk × {weeksPerYear} wks)
                    </span>
                    <span className="font-semibold text-sm">
                      ${Math.round(taxResult.grossAnnualIncome / periodDivisor).toLocaleString()}
                    </span>
                  </div>

                  {taxResult.overtimeAnnualIncome > 0 && (
                    <div className="py-2 flex justify-between items-center text-slate-500 pl-3">
                      <span className="font-sans">
                        ↳ Includes {overtimeMultiplier}x Overtime Earnings ({(weeklyHours - 40).toFixed(1)} OT hrs/wk)
                      </span>
                      <span>
                        ${Math.round(taxResult.overtimeAnnualIncome / periodDivisor).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="py-2.5 flex justify-between items-center text-sky-800">
                    <span className="font-sans">
                      Pre-Tax Retirement & HSA Deductions (Tax-Shielded Wealth)
                    </span>
                    <span>
                      −${Math.round(taxResult.totalPreTaxDeductions / periodDivisor).toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-slate-700">
                    <span className="font-sans">
                      Federal Income Tax (Eff. {(taxResult.effectiveFederalRate * 100).toFixed(1)}% after ${taxResult.standardDeduction.toLocaleString()} Std. Deduction)
                    </span>
                    <span className="text-rose-700">
                      −${Math.round(taxResult.federalIncomeTax / periodDivisor).toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-slate-700">
                    <span className="font-sans">
                      FICA Payroll Tax (6.2% Social Security + 1.45% Medicare)
                    </span>
                    <span className="text-rose-700">
                      −${Math.round(taxResult.totalFicaTax / periodDivisor).toLocaleString()}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-slate-700">
                    <span className="font-sans">
                      State Income Tax ({(activeStatePreset.effectiveRate * 100).toFixed(1)}% Effective Rate)
                    </span>
                    <span className="text-rose-700">
                      −${Math.round(taxResult.stateIncomeTax / periodDivisor).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3.5 pb-1 flex justify-between items-baseline text-slate-900">
                    <span className="font-sans text-sm font-semibold">
                      Net Take-Home Pay ({paycheckPeriodView}) · (${taxResult.netHourlyRate.toFixed(2)}/hr net)
                    </span>
                    <span className="text-xl font-semibold text-emerald-700">
                      ${Math.round(taxResult.netAnnualIncome / periodDivisor).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Interactive IRS.gov Progressive Tax Bracket Waterfall */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      IRS.gov Progressive Tax Bracket Waterfall (Taxable Income: ${Math.round(taxResult.taxableIncome).toLocaleString()})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Visualizing how your Adjusted Gross Income minus the ${taxResult.standardDeduction.toLocaleString()} Standard Deduction fills each statutory bucket.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsIrsModalOpen(true)}
                    className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
                  >
                    Edit / Import IRS JSON
                  </button>
                </div>

                <div className="space-y-2.5">
                  {taxResult.bracketBreakdown.map((row, idx) => {
                    const isActive = row.taxableInBracket > 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isActive ? 'font-medium text-slate-900' : 'text-slate-400'}>
                            <strong className="font-mono tabular-nums">{(row.rate * 100).toFixed(0)}%</strong> Bracket
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              ${row.min.toLocaleString()} – {row.max !== null ? `$${row.max.toLocaleString()}` : 'Above'}
                            </span>
                          </span>
                          <span className="font-mono tabular-nums text-slate-700">
                            {isActive ? (
                              <>
                                ${Math.round(row.taxableInBracket).toLocaleString()} taxed →{' '}
                                <strong className="text-slate-900">
                                  ${Math.round(row.taxOwedInBracket).toLocaleString()} tax
                                </strong>
                              </>
                            ) : (
                              <span className="text-slate-400">$0 in bracket</span>
                            )}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-200 ${
                              row.fillPercentage >= 100
                                ? 'bg-slate-900'
                                : row.fillPercentage > 0
                                ? 'bg-emerald-600'
                                : 'bg-transparent'
                            }`}
                            style={{ width: `${row.fillPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: Dream Board & Milestone Savings Horizons */}
        <div id="dream-board" className="scroll-mt-20">
          <DreamBoardSection
            dreamItems={dreamItems}
            onUpdateItems={setDreamItems}
            baseMonthlySavings={baseMonthlySavings}
            optimizedMonthlySavings={optimizedMonthlySavings}
            selectedApy={selectedApy}
            netHourlyRate={taxResult.netHourlyRate}
            onNavigateToSection={(sec) =>
              scrollToSection(sec === 'budget' ? 'budget-advice' : 'rate-simulator')
            }
          />
        </div>

        {/* SECTION 03: Monthly Expense Breakdown & Automated Budget Tracking Engine */}
        <div id="budget-advice" className="scroll-mt-20">
          <BudgetAndAdviceSection
            expenses={expenses}
            onUpdateExpenses={setExpenses}
            netMonthlyIncome={taxResult.netMonthlyIncome}
            grossMonthlyIncome={taxResult.grossAnnualIncome / 12}
            marginalTaxRate={taxResult.marginalRate}
            stateTaxRate={activeStatePreset.effectiveRate}
            automations={automations}
            onToggleAutomation={handleToggleAutomation}
            baseMonthlySavings={baseMonthlySavings}
            optimizedMonthlySavings={optimizedMonthlySavings}
            onNavigateToDreams={() => scrollToSection('dream-board')}
          />
        </div>

        {/* SECTION 04: Interest Rate & Compound Growth Simulator */}
        <div id="rate-simulator" className="scroll-mt-20">
          <InterestSimulatorSection
            selectedApy={selectedApy}
            onChangeApy={setSelectedApy}
            optimizedMonthlySavings={optimizedMonthlySavings}
            initialPrincipalDefault={totalDreamSaved}
          />
        </div>

        {/* SECTION 05: Interactive Learning Lab & IRS Mastery Quiz */}
        <div id="learn-quiz" className="scroll-mt-20">
          <LearningAndQuizSection
            irsDataset={activeIrsDataset}
            filingStatus={filingStatus}
            currentTaxableIncome={taxResult.taxableIncome}
            currentMarginalRate={taxResult.marginalRate}
            currentEffectiveFederalRate={taxResult.effectiveFederalRate}
          />
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>Meridian Ledger Financial Planning Studio</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Tax parameters grounded in {activeIrsDataset.citation}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsIrsModalOpen(true)}
              className="hover:text-slate-900 underline"
            >
              Inspect IRS.gov Dataset
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                localStorage.removeItem('meridian_dream_items_v1');
                localStorage.removeItem('meridian_expenses_v1');
                setDreamItems(INITIAL_DREAM_ITEMS);
                setExpenses(INITIAL_EXPENSES);
              }}
              className="hover:text-slate-900 underline"
            >
              Restore Default Ledger Data
            </button>
          </div>
        </div>
      </footer>

      {/* IRS.gov Data Inspector & Importer Modal */}
      <IrsDataModal
        isOpen={isIrsModalOpen}
        onClose={() => setIsIrsModalOpen(false)}
        activeDataset={activeIrsDataset}
        selectedYear={selectedTaxYear}
        onSelectYear={(yr) => {
          setCustomIrsDataset(null);
          setSelectedTaxYear(yr);
        }}
        onImportCustomDataset={(ds) => setCustomIrsDataset(ds)}
        filingStatus={filingStatus}
      />
    </div>
  );
}
