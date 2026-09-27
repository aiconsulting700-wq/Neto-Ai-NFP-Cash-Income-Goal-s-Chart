import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';

interface InterestSimulatorSectionProps {
  selectedApy: number;
  onChangeApy: (apy: number) => void;
  optimizedMonthlySavings: number;
  initialPrincipalDefault: number;
}

type CompoundingFreq = 'daily' | 'monthly' | 'quarterly' | 'annually';

const FREQ_PERIODS: Record<CompoundingFreq, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

interface YearlyPoint {
  year: number;
  principalContributed: number;
  traditionalTotal: number; // 0.05%
  hysaTotal: number; // 4.50%
  customTotal: number; // selectedApy
  indexTotal: number; // 8.50%
}

function computeFutureValue(
  initialPrincipal: number,
  monthlyDeposit: number,
  annualRatePercent: number,
  years: number,
  freq: CompoundingFreq,
  adjustInflation: boolean
): number {
  const realRatePct = adjustInflation ? Math.max(-2.5, annualRatePercent - 2.5) : annualRatePercent;
  const r = realRatePct / 100;
  const n = FREQ_PERIODS[freq];

  // Simulate month-by-month with exact effective monthly compounding rate derived from nominal frequency
  const effectiveAnnual = Math.pow(1 + r / n, n) - 1;
  const effectiveMonthly = Math.pow(1 + effectiveAnnual, 1 / 12) - 1;

  let balance = initialPrincipal;
  const totalMonths = years * 12;
  for (let m = 0; m < totalMonths; m++) {
    balance = balance * (1 + effectiveMonthly) + monthlyDeposit;
  }
  return balance;
}

export const InterestSimulatorSection: React.FC<InterestSimulatorSectionProps> = ({
  selectedApy,
  onChangeApy,
  optimizedMonthlySavings,
  initialPrincipalDefault,
}) => {
  const [startingBalance, setStartingBalance] = useState<number>(initialPrincipalDefault);
  const [useCustomDeposit, setUseCustomDeposit] = useState<boolean>(false);
  const [customDeposit, setCustomDeposit] = useState<number>(Math.max(500, Math.round(optimizedMonthlySavings)));
  const [horizonYears, setHorizonYears] = useState<number>(15);
  const [compoundingFreq, setCompoundingFreq] = useState<CompoundingFreq>('monthly');
  const [adjustForInflation, setAdjustForInflation] = useState<boolean>(false);
  const [inspectedYear, setInspectedYear] = useState<number | null>(null);

  const activeMonthlyDeposit = useCustomDeposit
    ? customDeposit
    : Math.max(0, Math.round(optimizedMonthlySavings));

  const seriesData: YearlyPoint[] = useMemo(() => {
    const pts: YearlyPoint[] = [];
    for (let y = 0; y <= horizonYears; y++) {
      const principalContributed = startingBalance + activeMonthlyDeposit * 12 * y;
      pts.push({
        year: y,
        principalContributed,
        traditionalTotal: computeFutureValue(
          startingBalance,
          activeMonthlyDeposit,
          0.05,
          y,
          compoundingFreq,
          adjustForInflation
        ),
        hysaTotal: computeFutureValue(
          startingBalance,
          activeMonthlyDeposit,
          4.5,
          y,
          compoundingFreq,
          adjustForInflation
        ),
        customTotal: computeFutureValue(
          startingBalance,
          activeMonthlyDeposit,
          selectedApy,
          y,
          compoundingFreq,
          adjustForInflation
        ),
        indexTotal: computeFutureValue(
          startingBalance,
          activeMonthlyDeposit,
          8.5,
          y,
          compoundingFreq,
          adjustForInflation
        ),
      });
    }
    return pts;
  }, [
    startingBalance,
    activeMonthlyDeposit,
    horizonYears,
    selectedApy,
    compoundingFreq,
    adjustForInflation,
  ]);

  const finalPoint = seriesData[seriesData.length - 1] || {
    year: horizonYears,
    principalContributed: startingBalance,
    traditionalTotal: startingBalance,
    hysaTotal: startingBalance,
    customTotal: startingBalance,
    indexTotal: startingBalance,
  };

  const activePoint =
    inspectedYear !== null && seriesData[inspectedYear]
      ? seriesData[inspectedYear]
      : finalPoint;

  const customInterestEarned = Math.max(0, activePoint.customTotal - activePoint.principalContributed);
  const interestSharePct =
    activePoint.customTotal > 0 ? (customInterestEarned / activePoint.customTotal) * 100 : 0;

  // SVG Chart Geometry
  const chartWidth = 760;
  const chartHeight = 320;
  const padLeft = 68;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 36;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const maxY = Math.max(
    10000,
    ...seriesData.map((d) =>
      Math.max(d.principalContributed, d.traditionalTotal, d.hysaTotal, d.customTotal, d.indexTotal)
    )
  );

  const getX = (yr: number) =>
    horizonYears > 0 ? padLeft + (yr / horizonYears) * plotW : padLeft;
  const getY = (val: number) =>
    padTop + plotH - Math.min(1, Math.max(0, val / maxY)) * plotH;

  const buildPath = (accessor: (d: YearlyPoint) => number) =>
    seriesData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year).toFixed(1)} ${getY(accessor(d)).toFixed(1)}`)
      .join(' ');

  const buildAreaPath = (accessor: (d: YearlyPoint) => number) => {
    const line = buildPath(accessor);
    const lastX = getX(horizonYears).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const formatCompactCurrency = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
    return `$${Math.round(v)}`;
  };

  return (
    <section className="space-y-8" aria-labelledby="interest-simulator-heading">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            <span>Yield & Compounding Lab</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Multi-Environment Curve Comparison</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Rule of 72 Doubling Period: {selectedApy > 0 ? `${(72 / selectedApy).toFixed(1)} yrs` : 'N/A'}</span>
          </p>
          <h2 id="interest-simulator-heading" className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Interest Rate & Compound Growth Simulator
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Simulate how different Annual Percentage Yields (APY), compounding frequencies, and inflation affect your total wealth accumulation over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onChangeApy(5.25);
              setStartingBalance(initialPrincipalDefault);
              setUseCustomDeposit(false);
              setHorizonYears(15);
              setCompoundingFreq('monthly');
              setAdjustForInflation(false);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Two-Zone Simulation Layout (Left 8 cols Stage, Right 4 cols Control Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Interactive Stage & Curve Comparison */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          {/* Top KPI Row for Active Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">
                Year {activePoint.year} Principal
              </span>
              <span className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-0.5 block">
                ${Math.round(activePoint.principalContributed).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">Out-of-pocket deposits</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">
                Compound Interest ({selectedApy.toFixed(2)}%)
              </span>
              <span className="text-lg font-semibold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                +${Math.round(customInterestEarned).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                {interestSharePct.toFixed(1)}% of total balance
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">
                Your Projected Total
              </span>
              <span className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-0.5 block">
                ${Math.round(activePoint.customTotal).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                At {selectedApy.toFixed(2)}% APY ({compoundingFreq})
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">
                Advantage vs 0.05% Bank
              </span>
              <span className="text-lg font-semibold font-mono tabular-nums text-sky-700 mt-0.5 block">
                +${Math.round(activePoint.customTotal - activePoint.traditionalTotal).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                Extra wealth from rate delta
              </span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-900 inline-block" />
                  <strong>Your Target ({selectedApy.toFixed(2)}% APY)</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                  Equity Benchmark (8.5% APY)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-600 inline-block" />
                  HYSA / T-Bills (4.5% APY)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 border-b border-dashed inline-block" />
                  0.05% Traditional Bank
                </span>
              </div>
              <span className="text-slate-500">Hover or click year nodes to inspect</span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Multi-rate compound interest projection chart"
            >
              <defs>
                <linearGradient id="customCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const val = maxY * ratio;
                const y = getY(val);
                return (
                  <g key={ratio}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={ratio === 0 ? undefined : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[11px] font-mono"
                    >
                      {formatCompactCurrency(val)}
                    </text>
                  </g>
                );
              })}

              {/* Area fill under Custom Rate */}
              <path d={buildAreaPath((d) => d.customTotal)} fill="url(#customCurveGrad)" />

              {/* 0.05% Traditional Bank Line */}
              <path
                d={buildPath((d) => d.traditionalTotal)}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.75"
                strokeDasharray="4 4"
              />

              {/* 4.5% HYSA Line */}
              <path
                d={buildPath((d) => d.hysaTotal)}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
              />

              {/* 8.5% Equity Benchmark Line */}
              <path
                d={buildPath((d) => d.indexTotal)}
                fill="none"
                stroke="#059669"
                strokeWidth="2"
              />

              {/* Custom Selected APY Line */}
              <path
                d={buildPath((d) => d.customTotal)}
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
              />

              {/* Interactive Year Columns & Nodes */}
              {seriesData.map((d) => {
                const cx = getX(d.year);
                const cy = getY(d.customTotal);
                const isSelected = activePoint.year === d.year;
                const showLabel =
                  horizonYears <= 10 ||
                  d.year === 0 ||
                  d.year === horizonYears ||
                  d.year % Math.ceil(horizonYears / 6) === 0;

                return (
                  <g
                    key={d.year}
                    className="cursor-pointer"
                    onMouseEnter={() => setInspectedYear(d.year)}
                    onClick={() => setInspectedYear(d.year)}
                  >
                    {isSelected && (
                      <line
                        x1={cx}
                        y1={padTop}
                        x2={cx}
                        y2={padTop + plotH}
                        stroke="#0F172A"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5.5 : 3}
                      className={
                        isSelected
                          ? 'fill-slate-900 stroke-white stroke-2'
                          : 'fill-slate-900 opacity-75 hover:opacity-100'
                      }
                    />
                    {showLabel && (
                      <text
                        x={cx}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className="fill-slate-500 text-[11px] font-mono"
                      >
                        Yr {d.year}
                      </text>
                    )}
                    {/* Invisible hit rect for smooth scrubbing */}
                    <rect
                      x={cx - plotW / (horizonYears * 2 + 2)}
                      y={padTop}
                      width={plotW / (horizonYears + 1)}
                      height={plotH}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Comparative Rate Table at Horizon */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Side-by-Side Rate Environment Comparison (Year {activePoint.year} Snapshot)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="text-left py-2 font-medium">Rate Environment</th>
                    <th className="text-right py-2 font-medium">APY</th>
                    <th className="text-right py-2 font-medium">Principal Deposited</th>
                    <th className="text-right py-2 font-medium">Interest Earned</th>
                    <th className="text-right py-2 font-medium">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  <tr className="text-slate-600">
                    <td className="py-2.5 font-sans">Traditional Checking / Savings</td>
                    <td className="py-2.5 text-right">0.05%</td>
                    <td className="py-2.5 text-right">${Math.round(activePoint.principalContributed).toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      +${Math.max(0, Math.round(activePoint.traditionalTotal - activePoint.principalContributed)).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      ${Math.round(activePoint.traditionalTotal).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="text-slate-700">
                    <td className="py-2.5 font-sans">High-Yield Savings / Treasury Bills</td>
                    <td className="py-2.5 text-right">4.50%</td>
                    <td className="py-2.5 text-right">${Math.round(activePoint.principalContributed).toLocaleString()}</td>
                    <td className="py-2.5 text-right text-sky-700">
                      +${Math.max(0, Math.round(activePoint.hysaTotal - activePoint.principalContributed)).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      ${Math.round(activePoint.hysaTotal).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-semibold text-slate-900">
                    <td className="py-2.5 font-sans">● Your Selected Target Rate</td>
                    <td className="py-2.5 text-right">{selectedApy.toFixed(2)}%</td>
                    <td className="py-2.5 text-right">${Math.round(activePoint.principalContributed).toLocaleString()}</td>
                    <td className="py-2.5 text-right text-emerald-700">
                      +${Math.round(customInterestEarned).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right">${Math.round(activePoint.customTotal).toLocaleString()}</td>
                  </tr>
                  <tr className="text-slate-700">
                    <td className="py-2.5 font-sans">S&P 500 Historical Equity Index</td>
                    <td className="py-2.5 text-right">8.50%</td>
                    <td className="py-2.5 text-right">${Math.round(activePoint.principalContributed).toLocaleString()}</td>
                    <td className="py-2.5 text-right text-emerald-700">
                      +${Math.max(0, Math.round(activePoint.indexTotal - activePoint.principalContributed)).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      ${Math.round(activePoint.indexTotal).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Parameter Control Deck */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Simulation Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag sliders to stress-test interest rates and compounding intervals.
            </p>
          </div>

          {/* Target APY Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-apy-slider" className="font-medium text-slate-700">
                Target Interest Rate (APY)
              </label>
              <span className="font-mono tabular-nums font-semibold text-slate-900 text-sm">
                {selectedApy.toFixed(2)}%
              </span>
            </div>
            <input
              id="sim-apy-slider"
              type="range"
              min={0}
              max={15}
              step={0.25}
              value={selectedApy}
              onChange={(e) => onChangeApy(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0.0%</span>
              <span>4.5% HYSA</span>
              <span>8.5% Index</span>
              <span>15.0%</span>
            </div>
          </div>

          {/* Starting Principal */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-principal-slider" className="font-medium text-slate-700">
                Initial Principal Balance
              </label>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${startingBalance.toLocaleString()}
              </span>
            </div>
            <input
              id="sim-principal-slider"
              type="range"
              min={0}
              max={150000}
              step={1000}
              value={startingBalance}
              onChange={(e) => setStartingBalance(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-deposit-slider" className="font-medium text-slate-700">
                Monthly Savings Contribution
              </label>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${activeMonthlyDeposit.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-2">
              <button
                type="button"
                onClick={() => setUseCustomDeposit(false)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  !useCustomDeposit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sync Budget (${Math.max(0, Math.round(optimizedMonthlySavings))})
              </button>
              <button
                type="button"
                onClick={() => setUseCustomDeposit(true)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  useCustomDeposit ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Custom Slider
              </button>
            </div>

            {useCustomDeposit && (
              <input
                id="sim-deposit-slider"
                type="range"
                min={0}
                max={10000}
                step={50}
                value={customDeposit}
                onChange={(e) => setCustomDeposit(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            )}
          </div>

          {/* Time Horizon */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-horizon-slider" className="font-medium text-slate-700">
                Time Horizon
              </label>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {horizonYears} {horizonYears === 1 ? 'Year' : 'Years'}
              </span>
            </div>
            <input
              id="sim-horizon-slider"
              type="range"
              min={1}
              max={30}
              step={1}
              value={horizonYears}
              onChange={(e) => {
                const yr = Number(e.target.value);
                setHorizonYears(yr);
                setInspectedYear(null);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Compounding Frequency */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="block text-xs font-medium text-slate-700">Compounding Frequency</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {(['daily', 'monthly', 'quarterly', 'annually'] as CompoundingFreq[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setCompoundingFreq(freq)}
                  className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    compoundingFreq === freq
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Inflation Adjustment Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-medium text-slate-900 block">
                  Real Purchasing Power (Inflation-Adjusted)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Discounts nominal returns by 2.5% annual CPI inflation
                </span>
              </div>
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => setAdjustForInflation(e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
