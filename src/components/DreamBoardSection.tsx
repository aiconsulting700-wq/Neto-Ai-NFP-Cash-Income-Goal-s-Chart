import React, { useState } from 'react';
import { Plus, Trash2, Compass, ArrowUpRight, Layers, Sparkles } from 'lucide-react';
import {
  DreamItem,
  calculateMonthsToGoalWithInterest,
} from '../data/irsData';

interface DreamBoardSectionProps {
  dreamItems: DreamItem[];
  onUpdateItems: (items: DreamItem[]) => void;
  baseMonthlySavings: number;
  optimizedMonthlySavings: number;
  selectedApy: number;
  netHourlyRate: number;
  onNavigateToSection: (section: 'budget' | 'simulator') => void;
}

export const DreamBoardSection: React.FC<DreamBoardSectionProps> = ({
  dreamItems,
  onUpdateItems,
  baseMonthlySavings,
  optimizedMonthlySavings,
  selectedApy,
  netHourlyRate,
  onNavigateToSection,
}) => {
  const [fundingStrategy, setFundingStrategy] = useState<'parallel' | 'waterfall'>('parallel');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Milestone');
  const [newCost, setNewCost] = useState(12000);
  const [newSaved, setNewSaved] = useState(1500);
  const [newShare, setNewShare] = useState(15);

  const totalAllocationShare = dreamItems.reduce((acc, item) => acc + item.allocationShare, 0);

  const handleUpdateField = (id: string, field: keyof DreamItem, value: string | number) => {
    onUpdateItems(
      dreamItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleNormalizeShares = () => {
    if (dreamItems.length === 0) return;
    const sum = dreamItems.reduce((s, i) => s + i.allocationShare, 0);
    if (sum === 0) {
      const equal = Math.floor(100 / dreamItems.length);
      onUpdateItems(dreamItems.map((it, idx) => ({
        ...it,
        allocationShare: idx === 0 ? 100 - equal * (dreamItems.length - 1) : equal,
      })));
      return;
    }
    let running = 0;
    const updated = dreamItems.map((it, idx) => {
      if (idx === dreamItems.length - 1) {
        return { ...it, allocationShare: Math.max(0, 100 - running) };
      }
      const normalized = Math.round((it.allocationShare / sum) * 100);
      running += normalized;
      return { ...it, allocationShare: normalized };
    });
    onUpdateItems(updated);
  };

  const handleAddDreamItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: DreamItem = {
      id: `dream-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Milestone',
      targetCost: Math.max(100, Number(newCost) || 5000),
      savedSoFar: Math.max(0, Number(newSaved) || 0),
      allocationShare: Math.max(5, Math.min(100, Number(newShare) || 15)),
      imageUrl: '/src/assets/images/dream_studio_workstation_1790483223180.jpg',
      notes: 'Custom milestone added to personal wealth roadmap',
    };
    onUpdateItems([...dreamItems, item]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(dreamItems.filter((item) => item.id !== id));
  };

  const formatDuration = (months: number): string => {
    if (!Number.isFinite(months)) return 'Requires positive savings';
    if (months <= 0) return 'Funded Today';
    const yrs = Math.floor(months / 12);
    const remMos = Math.round(months % 12);
    if (yrs === 0) return `${remMos} mo`;
    if (remMos === 0) return `${yrs} yr`;
    return `${yrs} yr ${remMos} mo`;
  };

  const formatCompletionDate = (months: number): string => {
    if (!Number.isFinite(months) || months > 600) return 'Unscheduled';
    if (months <= 0) return 'Completed';
    const d = new Date(2026, 8, 26); // Current baseline Sept 2026
    d.setMonth(d.getMonth() + Math.ceil(months));
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Pre-calculate cumulative months if in Sequential Waterfall mode
  let cumulativeWaterfallMonthsOptimized = 0;
  let cumulativeWaterfallMonthsBase = 0;

  const totalDreamTarget = dreamItems.reduce((s, i) => s + i.targetCost, 0);
  const totalDreamSaved = dreamItems.reduce((s, i) => s + i.savedSoFar, 0);
  const totalRemainingGap = Math.max(0, totalDreamTarget - totalDreamSaved);

  return (
    <section className="space-y-8" aria-labelledby="dream-board-heading">
      {/* Header & Strategy Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            <span>Capital Allocation Studio</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Net Take-Home Wage: ${netHourlyRate.toFixed(2)}/hr</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Yield Assumption: {selectedApy.toFixed(2)}% APY</span>
          </p>
          <h2 id="dream-board-heading" className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Dream Board & Milestone Horizons
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Convert your net hourly wage and monthly surplus into concrete completion dates. Compare standard cash accumulation against compound interest and automated budget rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Strategy Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFundingStrategy('parallel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                fundingStrategy === 'parallel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Parallel Split Allocation
            </button>
            <button
              onClick={() => setFundingStrategy('waterfall')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                fundingStrategy === 'waterfall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sequential Waterfall Priority
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Dream Milestone
          </button>
        </div>
      </div>

      {/* Aggregate Portfolio Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white border border-slate-200 rounded-xl">
        <div>
          <span className="text-xs text-slate-500 block">Total Dream Board Value</span>
          <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
            ${totalDreamTarget.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            ${totalDreamSaved.toLocaleString()} already reserved ({totalDreamTarget > 0 ? Math.round((totalDreamSaved / totalDreamTarget) * 100) : 0}%)
          </span>
        </div>

        <div className="sm:border-l sm:border-slate-200 sm:pl-6">
          <span className="text-xs text-slate-500 block">Remaining Work Equivalency</span>
          <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
            {netHourlyRate > 0 ? Math.ceil(totalRemainingGap / netHourlyRate).toLocaleString() : '—'} hrs
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            At ${netHourlyRate.toFixed(2)}/hr after-tax take-home rate
          </span>
        </div>

        <div className="lg:border-l lg:border-slate-200 lg:pl-6">
          <span className="text-xs text-slate-500 block">Base Monthly Savings Pool</span>
          <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
            ${Math.max(0, Math.round(baseMonthlySavings)).toLocaleString()}/mo
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {baseMonthlySavings <= 0 ? '▲ Deficit — reduce expenses or boost hours' : '● Active monthly cash surplus'}
          </span>
        </div>

        <div className="sm:border-l sm:border-slate-200 sm:pl-6">
          <span className="text-xs text-slate-500 block">Optimized Automated Pool</span>
          <span className="text-2xl font-semibold font-mono tabular-nums text-emerald-700 mt-1 block">
            ${Math.max(0, Math.round(optimizedMonthlySavings)).toLocaleString()}/mo
          </span>
          <button
            onClick={() => onNavigateToSection('budget')}
            className="text-xs text-slate-700 underline hover:text-slate-900 mt-1 inline-flex items-center gap-1"
          >
            +${Math.max(0, Math.round(optimizedMonthlySavings - baseMonthlySavings)).toLocaleString()}/mo from automated rules
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Allocation Share Notice if Parallel */}
      {fundingStrategy === 'parallel' && totalAllocationShare !== 100 && dreamItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900">
          <span>
            ▲ Allocation shares currently sum to <strong className="font-mono tabular-nums">{totalAllocationShare}%</strong> of your monthly savings pool.
          </span>
          <button
            onClick={handleNormalizeShares}
            className="px-3 py-1 font-medium bg-white border border-amber-300 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            Auto-Balance Shares to 100%
          </button>
        </div>
      )}

      {/* Add New Milestone Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddDreamItem}
          className="p-6 bg-white border border-slate-300 rounded-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Create Custom Dream Board Milestone</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Milestone Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Culinary Sabbatical in Lyon"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Cost ($)</label>
              <input
                type="number"
                min={100}
                step={100}
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Saved So Far ($)</label>
              <input
                type="number"
                min={0}
                step={100}
                value={newSaved}
                onChange={(e) => setNewSaved(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Save Milestone to Board
            </button>
          </div>
        </form>
      )}

      {/* Dream Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dreamItems.map((item, index) => {
          const remaining = Math.max(0, item.targetCost - item.savedSoFar);
          const progressPct = item.targetCost > 0 ? Math.min(100, (item.savedSoFar / item.targetCost) * 100) : 100;
          const workHoursNeeded = netHourlyRate > 0 ? Math.ceil(remaining / netHourlyRate) : Infinity;

          // Monthly allocation depending on Parallel vs Waterfall
          const normalizedShare =
            totalAllocationShare > 0 ? item.allocationShare / totalAllocationShare : 1 / dreamItems.length;

          const itemMonthlyBase =
            fundingStrategy === 'parallel'
              ? Math.max(0, baseMonthlySavings) * normalizedShare
              : Math.max(0, baseMonthlySavings);

          const itemMonthlyOptimized =
            fundingStrategy === 'parallel'
              ? Math.max(0, optimizedMonthlySavings) * normalizedShare
              : Math.max(0, optimizedMonthlySavings);

          // 0% Cash timeline
          const cashTimeline = calculateMonthsToGoalWithInterest(
            remaining,
            item.savedSoFar,
            item.targetCost,
            itemMonthlyBase,
            0
          );

          // Compound APY timeline (with base savings)
          const compoundBaseTimeline = calculateMonthsToGoalWithInterest(
            remaining,
            item.savedSoFar,
            item.targetCost,
            itemMonthlyBase,
            selectedApy
          );

          // Optimized Budget + Compound APY timeline
          const optimizedTimeline = calculateMonthsToGoalWithInterest(
            remaining,
            item.savedSoFar,
            item.targetCost,
            itemMonthlyOptimized,
            selectedApy
          );

          const displayMonthsBase =
            fundingStrategy === 'waterfall'
              ? (cumulativeWaterfallMonthsBase += compoundBaseTimeline.months)
              : compoundBaseTimeline.months;

          const displayMonthsOptimized =
            fundingStrategy === 'waterfall'
              ? (cumulativeWaterfallMonthsOptimized += optimizedTimeline.months)
              : optimizedTimeline.months;

          const monthsAccelerated =
            Number.isFinite(cashTimeline.months) && Number.isFinite(optimizedTimeline.months)
              ? Math.max(0, cashTimeline.months - optimizedTimeline.months)
              : 0;

          return (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Media Frame with Resilient Zero-Broken-Image Policy */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  {!failedImages[item.id] ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 p-6 text-center">
                      <Compass className="w-8 h-8 mb-2 text-slate-400" />
                      <span className="text-sm font-display">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Top Action Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Scrim Overlay Text */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 text-white">
                    <div>
                      <p className="text-xs text-slate-300">
                        <span>0{index + 1}. {item.category}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>{Math.round(progressPct)}% Funded</span>
                      </p>
                      <h3 className="text-xl font-semibold text-white mt-0.5">{item.title}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-300 block">Target</span>
                      <span className="text-lg font-mono tabular-nums font-semibold">
                        ${item.targetCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100">
                  <div
                    className="h-full bg-slate-900 transition-transform duration-200 origin-left"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5">
                  {/* Interactive Inline Sliders / Inputs for Cost, Saved, and Allocation */}
                  <div className="grid grid-cols-3 gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <label
                        htmlFor={`cost-${item.id}`}
                        className="block text-xs text-slate-500 mb-1"
                      >
                        Target Cost ($)
                      </label>
                      <input
                        id={`cost-${item.id}`}
                        type="number"
                        min={100}
                        step={500}
                        value={item.targetCost}
                        onChange={(e) =>
                          handleUpdateField(item.id, 'targetCost', Math.max(0, Number(e.target.value)))
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`saved-${item.id}`}
                        className="block text-xs text-slate-500 mb-1"
                      >
                        Saved Balance ($)
                      </label>
                      <input
                        id={`saved-${item.id}`}
                        type="number"
                        min={0}
                        step={250}
                        value={item.savedSoFar}
                        onChange={(e) =>
                          handleUpdateField(item.id, 'savedSoFar', Math.max(0, Number(e.target.value)))
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`share-${item.id}`}
                        className="block text-xs text-slate-500 mb-1"
                      >
                        {fundingStrategy === 'parallel' ? 'Savings Share (%)' : 'Waterfall Order'}
                      </label>
                      {fundingStrategy === 'parallel' ? (
                        <input
                          id={`share-${item.id}`}
                          type="number"
                          min={1}
                          max={100}
                          value={item.allocationShare}
                          onChange={(e) =>
                            handleUpdateField(
                              item.id,
                              'allocationShare',
                              Math.max(1, Math.min(100, Number(e.target.value)))
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                        />
                      ) : (
                        <div className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-100 text-slate-700 rounded-md">
                          Priority #{index + 1} (100%)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Three-Column Timeline Comparison */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block">0% Cash Timeline</span>
                      <span className="text-sm font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
                        {formatDuration(cashTimeline.months)}
                      </span>
                      <span className="text-slate-500 font-mono tabular-nums mt-0.5 block">
                        ${Math.round(itemMonthlyBase).toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block">At {selectedApy.toFixed(1)}% APY</span>
                      <span className="text-sm font-semibold font-mono tabular-nums text-slate-900 mt-1 block">
                        {formatDuration(displayMonthsBase)}
                      </span>
                      <span className="text-emerald-700 font-mono tabular-nums mt-0.5 block">
                        +${Math.round(compoundBaseTimeline.interestEarned).toLocaleString()} yield
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                      <span className="text-emerald-900 font-medium block">Optimized Plan</span>
                      <span className="text-sm font-semibold font-mono tabular-nums text-emerald-950 mt-1 block">
                        {formatDuration(displayMonthsOptimized)}
                      </span>
                      <span className="text-emerald-800 font-mono tabular-nums mt-0.5 block">
                        Est. {formatCompletionDate(displayMonthsOptimized)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Summary */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Labor Cost:{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {Number.isFinite(workHoursNeeded) ? `${workHoursNeeded.toLocaleString()} net work hrs` : 'N/A'}
                  </strong>
                </span>
                {monthsAccelerated > 0 ? (
                  <span className="text-emerald-800 font-medium">
                    ● Unlocked {monthsAccelerated} {monthsAccelerated === 1 ? 'month' : 'months'} faster with APY + Budget Rules
                  </span>
                ) : (
                  <span>Remaining: ${remaining.toLocaleString()}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
