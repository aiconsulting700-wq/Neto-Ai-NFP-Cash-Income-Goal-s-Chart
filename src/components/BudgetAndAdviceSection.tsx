import React, { useState } from 'react';
import { Plus, Trash2, Check, Sliders, ArrowRight } from 'lucide-react';
import { ExpenseItem } from '../data/irsData';

export interface ActiveAutomations {
  discretionaryTrim15: boolean;
  subscriptionAudit: boolean;
  preTaxBracketShield: boolean;
  weeklyMicroSweep: boolean;
  overtimeEscalator: boolean;
}

interface BudgetAndAdviceSectionProps {
  expenses: ExpenseItem[];
  onUpdateExpenses: (items: ExpenseItem[]) => void;
  netMonthlyIncome: number;
  grossMonthlyIncome: number;
  marginalTaxRate: number;
  stateTaxRate: number;
  automations: ActiveAutomations;
  onToggleAutomation: (key: keyof ActiveAutomations) => void;
  baseMonthlySavings: number;
  optimizedMonthlySavings: number;
  onNavigateToDreams: () => void;
}

export const BudgetAndAdviceSection: React.FC<BudgetAndAdviceSectionProps> = ({
  expenses,
  onUpdateExpenses,
  netMonthlyIncome,
  grossMonthlyIncome,
  marginalTaxRate,
  stateTaxRate,
  automations,
  onToggleAutomation,
  baseMonthlySavings,
  optimizedMonthlySavings,
  onNavigateToDreams,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'needs' | 'wants' | 'debt'>('all');
  const [newExpName, setNewExpName] = useState('');
  const [newExpCat, setNewExpCat] = useState<'needs' | 'wants' | 'debt'>('wants');
  const [newExpAmount, setNewExpAmount] = useState(120);

  const needsTotal = expenses
    .filter((e) => e.category === 'needs')
    .reduce((sum, e) => sum + e.monthlyAmount, 0);
  const wantsTotal = expenses
    .filter((e) => e.category === 'wants')
    .reduce((sum, e) => sum + e.monthlyAmount, 0);
  const debtTotal = expenses
    .filter((e) => e.category === 'debt')
    .reduce((sum, e) => sum + e.monthlyAmount, 0);

  const totalExpenses = needsTotal + wantsTotal + debtTotal;

  const needsPct = netMonthlyIncome > 0 ? (needsTotal / netMonthlyIncome) * 100 : 0;
  const wantsPct = netMonthlyIncome > 0 ? (wantsTotal / netMonthlyIncome) * 100 : 0;
  const debtPct = netMonthlyIncome > 0 ? (debtTotal / netMonthlyIncome) * 100 : 0;
  const savingsPct = netMonthlyIncome > 0 ? (Math.max(0, baseMonthlySavings) / netMonthlyIncome) * 100 : 0;
  const optimizedSavingsPct =
    netMonthlyIncome > 0 ? (Math.max(0, optimizedMonthlySavings) / netMonthlyIncome) * 100 : 0;

  const handleUpdateAmount = (id: string, amount: number) => {
    onUpdateExpenses(
      expenses.map((item) =>
        item.id === id ? { ...item, monthlyAmount: Math.max(0, amount) } : item
      )
    );
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim()) return;
    const item: ExpenseItem = {
      id: `exp-${Date.now()}`,
      name: newExpName.trim(),
      category: newExpCat,
      monthlyAmount: Math.max(0, Number(newExpAmount) || 0),
      isOptimizable: newExpCat === 'wants',
    };
    onUpdateExpenses([...expenses, item]);
    setNewExpName('');
    setNewExpAmount(100);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateExpenses(expenses.filter((item) => item.id !== id));
  };

  // Compute exact dollar impact of each Automated Budget Tracking rule
  const trim15Gain = Math.round(wantsTotal * 0.15);
  const subExpense = expenses.find((e) => e.id === 'exp-subscriptions')?.monthlyAmount ?? 150;
  const subAuditGain = Math.round(subExpense * 0.35);
  const preTaxShiftGross = grossMonthlyIncome * 0.03; // 3% additional pre-tax deferral
  const taxSavedOnShift = Math.round(preTaxShiftGross * (marginalTaxRate + stateTaxRate));
  const microSweepGain = Math.round(Math.max(45, netMonthlyIncome * 0.025));
  const overtimeEscalatorGain = Math.round(Math.max(75, grossMonthlyIncome * 0.03));

  const automationPlaybooks: Array<{
    key: keyof ActiveAutomations;
    title: string;
    ruleType: string;
    description: string;
    monthlyImpact: number;
    annualImpact: number;
  }> = [
    {
      key: 'discretionaryTrim15',
      title: 'Automated 15% Discretionary Category Cap',
      ruleType: 'Spend Velocity Guardrail',
      description:
        'Sets hard weekly push-notification thresholds on dining, delivery, and impulse retail categories once 85% of your historical baseline is reached.',
      monthlyImpact: trim15Gain,
      annualImpact: trim15Gain * 12,
    },
    {
      key: 'subscriptionAudit',
      title: 'Recurring Subscription & Membership Purge',
      ruleType: 'Automated Bill Scanner',
      description:
        'Flags duplicate streaming, dormant SaaS trials, and auto-renewing memberships, routing 35% of recurring digital spend back into your Dream Board.',
      monthlyImpact: subAuditGain,
      annualImpact: subAuditGain * 12,
    },
    {
      key: 'preTaxBracketShield',
      title: `IRS Marginal Bracket Shield (+3% Pre-Tax 401k/HSA)`,
      ruleType: `Tax-Advantaged Routing (${((marginalTaxRate + stateTaxRate) * 100).toFixed(1)}% Marginal Shield)`,
      description: `Routes an extra 3% of gross pay ($${Math.round(preTaxShiftGross)}/mo) into IRS pre-tax accounts, immediately recapturing $${taxSavedOnShift}/mo that would otherwise go to federal and state tax collectors.`,
      monthlyImpact: taxSavedOnShift,
      annualImpact: taxSavedOnShift * 12,
    },
    {
      key: 'weeklyMicroSweep',
      title: 'Friday Payday Checking-to-HYSA Auto-Sweep',
      ruleType: 'Zero-Touch Liquidity Rule',
      description:
        'Automatically transfers unspent checking buffer every Friday afternoon into a ring-fenced High-Yield Savings sub-account before weekend spending begins.',
      monthlyImpact: microSweepGain,
      annualImpact: microSweepGain * 12,
    },
    {
      key: 'overtimeEscalator',
      title: 'Split-Deposit Paycheck Escalator',
      ruleType: 'Direct Deposit Rule',
      description:
        'Configures employer payroll direct deposit to send a fixed top-off slice directly to your investment custodian before your primary checking account sees the funds.',
      monthlyImpact: overtimeEscalatorGain,
      annualImpact: overtimeEscalatorGain * 12,
    },
  ];

  const filteredExpenses =
    filterCategory === 'all'
      ? expenses
      : expenses.filter((item) => item.category === filterCategory);

  return (
    <section className="space-y-8" aria-labelledby="budget-advice-heading">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            <span>Cash Flow Diagnostics</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>50/30/20 Institutional Framework</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Automated Rules Engine</span>
          </p>
          <h2 id="budget-advice-heading" className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Monthly Expense Breakdown & Automated Budget Tracking
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Audit your monthly commitments against your IRS net take-home pay and activate automated budget tracking rules to accelerate your savings velocity.
          </p>
        </div>

        <button
          onClick={onNavigateToDreams}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap self-start lg:self-auto"
        >
          View Impact on Dream Board
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 50 / 30 / 20 Allocation Bar & Ratio Telemetry */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Net Monthly Cash Flow Allocation (${Math.round(netMonthlyIncome).toLocaleString()}/mo After-Tax)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmark target: ≤50% Essential Needs · ≤30% Discretionary Wants · ≥20% Savings & Wealth Building
            </p>
          </div>
          <div className="text-right font-mono tabular-nums">
            <span className="text-xs text-slate-500 block">Optimized Savings Rate</span>
            <span className="text-lg font-semibold text-emerald-700">
              {optimizedSavingsPct.toFixed(1)}% (${Math.max(0, Math.round(optimizedMonthlySavings)).toLocaleString()}/mo)
            </span>
          </div>
        </div>

        {/* Stacked Horizontal Ratio Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, needsPct)}%` }}
            className="bg-slate-900 h-full transition-all duration-200"
            title={`Essential Needs: ${needsPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${Math.min(100 - Math.min(100, needsPct), wantsPct)}%` }}
            className="bg-amber-500 h-full transition-all duration-200"
            title={`Discretionary Wants: ${wantsPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${Math.min(100 - Math.min(100, needsPct + wantsPct), debtPct)}%` }}
            className="bg-rose-600 h-full transition-all duration-200"
            title={`Debt Service: ${debtPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${Math.max(0, 100 - Math.min(100, needsPct + wantsPct + debtPct))}%` }}
            className="bg-emerald-600 h-full transition-all duration-200"
            title={`Net Savings Surplus: ${savingsPct.toFixed(1)}%`}
          />
        </div>

        {/* 4 Ratio Breakdown Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>■ Essential Needs</span>
              <span className="font-mono tabular-nums font-medium">{needsPct.toFixed(1)}%</span>
            </div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
              ${needsTotal.toLocaleString()}/mo
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {needsPct <= 50 ? '● Within 50% benchmark' : '▲ Exceeds 50% target'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-amber-800">■ Discretionary Wants</span>
              <span className="font-mono tabular-nums font-medium">{wantsPct.toFixed(1)}%</span>
            </div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
              ${wantsTotal.toLocaleString()}/mo
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {wantsPct <= 30 ? '● Within 30% benchmark' : '▲ High optimization potential'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-rose-800">■ Debt Service</span>
              <span className="font-mono tabular-nums font-medium">{debtPct.toFixed(1)}%</span>
            </div>
            <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 mt-1">
              ${debtTotal.toLocaleString()}/mo
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {debtPct <= 10 ? '● Low debt drag' : '▲ Prioritize high-APR payoff'}
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between text-xs text-emerald-900">
              <span>● Base Monthly Surplus</span>
              <span className="font-mono tabular-nums font-medium">{savingsPct.toFixed(1)}%</span>
            </div>
            <div className="text-lg font-semibold font-mono tabular-nums text-emerald-950 mt-1">
              ${Math.round(baseMonthlySavings).toLocaleString()}/mo
            </div>
            <div className="text-xs text-emerald-800 mt-0.5">
              {savingsPct >= 20 ? '● Exceeds 20% wealth target' : '▲ Activate rules below to reach 20%'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Interactive Monthly Expense Ledger, Right = Automated Budget Tracking Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Expense Ledger */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Monthly Expense Ledger</h3>
                <p className="text-xs text-slate-500">
                  Adjust sliders or amounts to model changes in your monthly cost of living.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['all', 'needs', 'wants', 'debt'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                      filterCategory === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expense Items Table/List */}
            <div className="divide-y divide-slate-100">
              {filteredExpenses.map((item) => (
                <div key={item.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-slate-900 block truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {item.category}
                        {item.optimizationTip ? ` · ${item.optimizationTip}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                          $
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          aria-label={`${item.name} monthly amount`}
                          value={item.monthlyAmount}
                          onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                          className="w-24 pl-6 pr-2 py-1 text-right text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={Math.max(2500, item.monthlyAmount * 1.5)}
                    step={10}
                    aria-label={`${item.name} slider`}
                    value={item.monthlyAmount}
                    onChange={(e) => handleUpdateAmount(item.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add Expense Inline Bar */}
          <form onSubmit={handleAddExpense} className="pt-4 border-t border-slate-200">
            <span className="text-xs font-medium text-slate-700 block mb-2">
              Add Monthly Expense Line
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                placeholder="Expense name (e.g., Gym & Climbing)"
                value={newExpName}
                onChange={(e) => setNewExpName(e.target.value)}
                className="sm:col-span-5 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
              <select
                value={newExpCat}
                onChange={(e) => setNewExpCat(e.target.value as 'needs' | 'wants' | 'debt')}
                aria-label="Expense category"
                className="sm:col-span-3 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="needs">Essential Need</option>
                <option value="wants">Discretionary Want</option>
                <option value="debt">Debt Payment</option>
              </select>
              <input
                type="number"
                min={0}
                step={10}
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(Number(e.target.value))}
                aria-label="Monthly dollar amount"
                className="sm:col-span-2 px-2.5 py-1.5 text-xs font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Columns: Automated Budget Tracking & Savings Potential Playbooks */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-emerald-800 font-medium">
                ● Automated Savings Potential Engine
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                Zero-Touch Budget Tracking Rules
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Toggle automated banking and payroll rules below to see how systemic tracking increases your monthly surplus without manual spreadsheet friction.
              </p>
            </div>

            <div className="space-y-3">
              {automationPlaybooks.map((rule) => {
                const isActive = automations[rule.key];
                return (
                  <div
                    key={rule.key}
                    onClick={() => onToggleAutomation(rule.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleAutomation(rule.key);
                      }
                    }}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                            isActive
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isActive && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">{rule.ruleType}</span>
                          <h4 className="text-sm font-semibold text-slate-900">{rule.title}</h4>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono tabular-nums">
                        <span
                          className={`text-xs font-semibold block ${
                            isActive ? 'text-emerald-800' : 'text-slate-700'
                          }`}
                        >
                          +${rule.monthlyImpact.toLocaleString()}/mo
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          +${rule.annualImpact.toLocaleString()}/yr
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Box of Active Automations */}
          <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Base Unoptimized Monthly Surplus</span>
              <span className="font-mono tabular-nums">${Math.round(baseMonthlySavings).toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400">
              <span>Automated Rules Recaptured Cash Flow</span>
              <span className="font-mono tabular-nums">
                +${Math.round(optimizedMonthlySavings - baseMonthlySavings).toLocaleString()}/mo
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium">New Automated Monthly Savings</span>
              <span className="text-lg font-semibold font-mono tabular-nums text-white">
                ${Math.round(optimizedMonthlySavings).toLocaleString()}/mo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
