import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { IrsYearDataset, FilingStatus } from '../data/irsData';

interface LearningAndQuizSectionProps {
  irsDataset: IrsYearDataset;
  filingStatus: FilingStatus;
  currentTaxableIncome: number;
  currentMarginalRate: number;
  currentEffectiveFederalRate: number;
}

interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  formulaProof: string;
  explanation: string;
}

export const LearningAndQuizSection: React.FC<LearningAndQuizSectionProps> = ({
  irsDataset,
  currentTaxableIncome,
  currentMarginalRate,
  currentEffectiveFederalRate,
}) => {
  const [activeLesson, setActiveLesson] = useState<1 | 2 | 3>(1);

  // Interactive Sandbox State for Lesson 1 (Bracket Myth-Buster)
  const [simulatedRaise, setSimulatedRaise] = useState<number>(5000);

  // Interactive Sandbox State for Lesson 2 (Pre-Tax Multiplier)
  const [simulatedPreTaxMonthly, setSimulatedPreTaxMonthly] = useState<number>(400);

  // Interactive Sandbox State for Lesson 3 (Rule of 72 & Crossover)
  const [lessonApy, setLessonApy] = useState<number>(7.2);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  const single12Max = irsDataset.brackets.single[1].max ?? 50400;
  const singleStdDed = irsDataset.standardDeduction.single;

  const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
      id: 'q1-marginal-myth',
      topic: `IRS Rev. Proc. 2025-32 · Marginal Brackets`,
      question: `In ${irsDataset.taxYear}, the 12% Single bracket ends at $${single12Max.toLocaleString()} of taxable income, where the 22% bracket begins. If your taxable income is $${single12Max.toLocaleString()} and you earn a $1,000 raise, how much extra federal income tax do you pay?`,
      options: [
        `$220 — only the $1,000 above the threshold is taxed at 22%`,
        `$5,260 — your entire $${(single12Max + 1000).toLocaleString()} income shifts into the 22% rate`,
        `$120 — raises are taxed at your previous bracket rate for 12 months`,
        `$0 — raises under $2,500 are exempt from federal withholding`,
      ],
      correctIndex: 0,
      formulaProof: `ΔTax = $1,000 × 22% = $220 (Net Take-Home Gain = +$780 before FICA)`,
      explanation: `Federal tax brackets in the United States are progressive buckets. Crossing into the 22% bracket never retroactively taxes the money sitting in your 10% and 12% buckets—only the dollars above $${single12Max.toLocaleString()} are taxed at 22%.`,
    },
    {
      id: 'q2-standard-deduction',
      topic: `IRS Standard Deduction (${irsDataset.taxYear})`,
      question: `Under ${irsDataset.citation}, a Single filer claims a $${singleStdDed.toLocaleString()} standard deduction. If a freelancer earns $66,100 in Adjusted Gross Income and takes the standard deduction, what is their IRS Taxable Income?`,
      options: [
        `$${(66100 - singleStdDed).toLocaleString()}`,
        `$66,100`,
        `$${singleStdDed.toLocaleString()}`,
        `$33,900`,
      ],
      correctIndex: 0,
      formulaProof: `Taxable Income = $66,100 AGI − $${singleStdDed.toLocaleString()} Standard Deduction = $${(66100 - singleStdDed).toLocaleString()}`,
      explanation: `The Standard Deduction is subtracted directly from your Adjusted Gross Income (AGI) before any IRS marginal tax brackets are applied. Effectively, your first $${singleStdDed.toLocaleString()} of income is taxed at 0% for federal income tax.`,
    },
    {
      id: 'q3-pretax-shield',
      topic: `Pre-Tax 401(k) & HSA Optimization`,
      question: `Suppose you are in the 22% federal marginal tax bracket and a 5% state tax bracket (27% combined marginal rate). If you automate a $500/month contribution into a traditional pre-tax 401(k), how much does your monthly net take-home paycheck actually shrink?`,
      options: [
        `$365 — because you immediately save $135 in federal and state taxes`,
        `$500 — pre-tax deductions only refund taxes when you retire at age 65`,
        `$445 — only half of 401(k) deposits qualify for tax deferral`,
        `$135 — the employer pays the remaining $365 by law`,
      ],
      correctIndex: 0,
      formulaProof: `Net Paycheck Cost = $500 × (1 − 0.27) = $365 (Immediate Tax Shield = $135/mo)`,
      explanation: `Traditional 401(k) and HSA contributions come off the very top of your gross income, shielding those dollars from your highest marginal tax bracket. You add $500 to your net worth while giving up only $365 of spendable cash.`,
    },
    {
      id: 'q4-overtime-math',
      topic: `FLSA Hourly & Overtime Economics`,
      question: `You earn $30/hr and currently work 40 hours/week for 52 weeks ($62,400/yr). Under standard 1.5x overtime rules for hours over 40, how much additional gross annual income do you generate by adding just 5 overtime hours per week?`,
      options: [
        `+$11,700/year ($45/hr overtime rate × 5 hrs × 52 weeks)`,
        `+$7,800/year ($30/hr × 5 hrs × 52 weeks)`,
        `+$5,850/year (overtime is taxed at 50% flat rate)`,
        `+$15,600/year`,
      ],
      correctIndex: 0,
      formulaProof: `OT Rate = $30 × 1.5 = $45/hr → $45 × 5 hrs/wk × 52 wks = +$11,700/yr`,
      explanation: `Because hours above 40/week command a 1.5x statutory multiplier for non-exempt workers, increasing weekly hours by 12.5% (from 40 to 45 hrs) boosts gross annual income by 18.75% (+$11,700/yr).`,
    },
    {
      id: 'q5-rule-of-72',
      topic: `Compound Interest & The Rule of 72`,
      question: `Using the financial Rule of 72, approximately how long does it take a lump sum to double at an 8.0% annual compound return compared to a 1.0% savings account?`,
      options: [
        `9 years at 8.0% APY vs. 72 years at 1.0% APY`,
        `8 years at 8.0% APY vs. 16 years at 1.0% APY`,
        `12.5 years at 8.0% APY vs. 36 years at 1.0% APY`,
        `6 years at 8.0% APY vs. 48 years at 1.0% APY`,
      ],
      correctIndex: 0,
      formulaProof: `Years to Double ≈ 72 ÷ Annual Rate → 72 ÷ 8 = 9 yrs vs. 72 ÷ 1 = 72 yrs`,
      explanation: `An 8% compound return doubles capital roughly every 9 years (meaning 36 years yields 4 doublings, or 16x initial principal), whereas a 1% rate requires a human lifetime (72 years) for a single doubling.`,
    },
    {
      id: 'q6-fica-cap',
      topic: `IRS FICA Payroll Tax Architecture (${irsDataset.taxYear})`,
      question: `Why do even workers whose income is below the $${singleStdDed.toLocaleString()} Standard Deduction still see taxes withheld on their paycheck stub?`,
      options: [
        `FICA payroll taxes (6.2% Social Security + 1.45% Medicare) apply from the first dollar of wages with no standard deduction`,
        `Employers withhold a mandatory 10% federal minimum tax regardless of filing status`,
        `The Standard Deduction only applies to investment capital gains`,
        `State unemployment taxes always equal 15.3% for W-2 employees`,
      ],
      correctIndex: 0,
      formulaProof: `FICA = 6.2% OASDI (up to $${irsDataset.fica.socialSecurityWageBase.toLocaleString()}) + 1.45% Medicare = 7.65% from Dollar $1`,
      explanation: `While the IRS Standard Deduction shields your first $${singleStdDed.toLocaleString()} from federal income tax, FICA payroll taxes (7.65% for W-2 employees) have no standard deduction and begin on the very first dollar earned.`,
    },
  ];

  const activeQuiz = QUIZ_QUESTIONS[currentQuestionIdx];
  const userChoice = selectedAnswers[currentQuestionIdx];
  const isAnswered = userChoice !== undefined;

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return acc + (QUIZ_QUESTIONS[Number(qIdx)]?.correctIndex === ansIdx ? 1 : 0);
  }, 0);

  // Lesson 1 Math: Incremental tax on simulatedRaise
  const raiseMarginalTax = Math.round(simulatedRaise * currentMarginalRate);
  const raiseFicaTax = Math.round(simulatedRaise * 0.0765);
  const raiseNetKeep = Math.max(0, simulatedRaise - raiseMarginalTax - raiseFicaTax);

  // Lesson 2 Math: Pre-tax multiplier
  const monthlyTaxSaved = Math.round(simulatedPreTaxMonthly * currentMarginalRate);
  const netPaycheckReduction = simulatedPreTaxMonthly - monthlyTaxSaved;

  return (
    <section className="space-y-10" aria-labelledby="learning-quiz-heading">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            <span>Interactive Financial Literacy Lab</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Grounded in {irsDataset.citation}</span>
          </p>
          <h2 id="learning-quiz-heading" className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Interactive Tax & Compounding Lab + Mastery Quiz
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Explore three interactive financial concepts using your live tax profile, then test your intuition across six IRS and wealth-building scenarios.
          </p>
        </div>

        {/* Stage Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto">
          <button
            onClick={() => setActiveLesson(1)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLesson === 1
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            01. Bracket Myth-Buster
          </button>
          <button
            onClick={() => setActiveLesson(2)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLesson === 2
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            02. Pre-Tax Multiplier
          </button>
          <button
            onClick={() => setActiveLesson(3)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLesson === 3
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            03. Rule of 72 Explorer
          </button>
        </div>
      </div>

      {/* Part 1: Interactive Concept Stage */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {activeLesson === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs text-slate-500">
                <span>Stage 01</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Progressive Bucket Architecture</span>
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Why a Raise Into a Higher IRS Tax Bracket Never Reduces Take-Home Pay
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A widespread financial myth claims that earning overtime or a raise can "push all your income into a higher bracket" and leave you with less money. In reality, your current effective federal tax rate is only{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {(currentEffectiveFederalRate * 100).toFixed(1)}%
                </strong>
                , while your top marginal bracket is{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {(currentMarginalRate * 100).toFixed(0)}%
                </strong>
                . Only incremental new dollars face the marginal rate.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="raise-sim-slider" className="font-medium text-slate-700">
                    Simulate an Overtime / Bonus Raise on Top of Your Income:
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 text-sm">
                    +${simulatedRaise.toLocaleString()}
                  </span>
                </div>
                <input
                  id="raise-sim-slider"
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  value={simulatedRaise}
                  onChange={(e) => setSimulatedRaise(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-xl space-y-4">
              <span className="text-xs text-slate-400 block">
                Live Marginal Breakdown on +${simulatedRaise.toLocaleString()} Extra Earnings
              </span>
              <div className="space-y-2.5 text-xs border-b border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-300">Your Existing Taxable Income</span>
                  <span className="font-mono tabular-nums">${Math.round(currentTaxableIncome).toLocaleString()} (Untouched)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">
                    Federal Marginal Tax ({(currentMarginalRate * 100).toFixed(0)}% on raise only)
                  </span>
                  <span className="font-mono tabular-nums text-amber-400">−${raiseMarginalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">FICA Payroll Tax (7.65%)</span>
                  <span className="font-mono tabular-nums text-amber-400">−${raiseFicaTax.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-emerald-400">● Net Cash Added to Your Pocket</span>
                <span className="text-2xl font-semibold font-mono tabular-nums text-white">
                  +${raiseNetKeep.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeLesson === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs text-slate-500">
                <span>Stage 02</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>IRS Section 401(k) & Section 223 HSA</span>
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                How Pre-Tax Contributions Let You Invest Dollars Before the IRS Taxes Them
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you save in a standard checking account, you save with post-tax dollars that have already been reduced by your{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {(currentMarginalRate * 100).toFixed(0)}%
                </strong>{' '}
                marginal bracket. When you route money into a pre-tax 401(k) or HSA (up to ${irsDataset.limits.electiveDeferral401k.toLocaleString()}/yr in {irsDataset.taxYear}), every dollar deposited reduces your taxable income immediately.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="pretax-sim-slider" className="font-medium text-slate-700">
                    Monthly Pre-Tax 401(k) / HSA Contribution:
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 text-sm">
                    ${simulatedPreTaxMonthly.toLocaleString()}/mo
                  </span>
                </div>
                <input
                  id="pretax-sim-slider"
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={simulatedPreTaxMonthly}
                  onChange={(e) => setSimulatedPreTaxMonthly(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-xl space-y-4">
              <span className="text-xs text-slate-400 block">
                Monthly Paycheck Impact at Your {(currentMarginalRate * 100).toFixed(0)}% Bracket
              </span>
              <div className="space-y-2.5 text-xs border-b border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Added to Your Investment Account</span>
                  <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                    +${simulatedPreTaxMonthly.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Immediate Federal Tax Reduction</span>
                  <span className="font-mono tabular-nums text-sky-400">
                    +${monthlyTaxSaved.toLocaleString()}/mo saved
                  </span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-200">Actual Reduction in Take-Home Pay</span>
                <span className="text-2xl font-semibold font-mono tabular-nums text-white">
                  −${netPaycheckReduction.toLocaleString()}/mo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Annual tax shield: ${(monthlyTaxSaved * 12).toLocaleString()}/year kept in your net worth instead of paid in taxes.
              </p>
            </div>
          </div>
        )}

        {activeLesson === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs text-slate-500">
                <span>Stage 03</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Exponential Doubling Mechanics</span>
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                The Rule of 72: Why Small Interest Rate Differences Create Massive Horizons
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Divide <strong className="font-mono">72</strong> by your annual compound return to find how many years it takes for every saved dollar to double without any extra effort. Moving idle cash from a 0.5% checking account into a higher-yield instrument compresses decades of waiting into years.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="rule72-slider" className="font-medium text-slate-700">
                    Test Compound Annual Return (APY):
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 text-sm">
                    {lessonApy.toFixed(1)}% APY
                  </span>
                </div>
                <input
                  id="rule72-slider"
                  type="range"
                  min={0.5}
                  max={14}
                  step={0.5}
                  value={lessonApy}
                  onChange={(e) => setLessonApy(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-xl space-y-4">
              <span className="text-xs text-slate-400 block">
                Rule of 72 Telemetry at {lessonApy.toFixed(1)}% APY
              </span>
              <div className="space-y-2.5 text-xs border-b border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-300">Years to Double Principal (72 ÷ {lessonApy.toFixed(1)})</span>
                  <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                    {(72 / lessonApy).toFixed(1)} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">$10,000 Grown Over 20 Years</span>
                  <span className="font-mono tabular-nums">
                    ${Math.round(10000 * Math.pow(1 + lessonApy / 100, 20)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">$10,000 Grown Over 30 Years</span>
                  <span className="font-mono tabular-nums">
                    ${Math.round(10000 * Math.pow(1 + lessonApy / 100, 30)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-200">30-Year Growth Multiplier</span>
                <span className="text-2xl font-semibold font-mono tabular-nums text-white">
                  {Math.pow(1 + lessonApy / 100, 30).toFixed(2)}×
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Part 2: Interactive 6-Question Scenario Quiz */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              <span>Assessment Progress: {totalAnswered} of {QUIZ_QUESTIONS.length} Completed</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Score: {totalCorrect}/{QUIZ_QUESTIONS.length} Correct</span>
            </p>
            <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
              IRS Tax & Wealth Velocity Mastery Quiz
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const ans = selectedAnswers[idx];
              const isCurr = idx === currentQuestionIdx;
              const isCorr = ans !== undefined && ans === q.correctIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  aria-label={`Question ${idx + 1}`}
                  className={`w-8 h-8 text-xs font-mono tabular-nums font-medium rounded-lg border transition-colors ${
                    isCurr
                      ? 'bg-slate-900 text-white border-slate-900'
                      : ans === undefined
                      ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      : isCorr
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}

            {totalAnswered > 0 && (
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setCurrentQuestionIdx(0);
                }}
                className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Quiz
              </button>
            )}
          </div>
        </div>

        {/* Active Question Card */}
        <div className="space-y-5">
          <div>
            <span className="text-xs text-slate-500 block">
              Question 0{currentQuestionIdx + 1} of 0{QUIZ_QUESTIONS.length} · {activeQuiz.topic}
            </span>
            <h4 className="text-base sm:text-lg font-semibold text-slate-900 mt-1 leading-snug">
              {activeQuiz.question}
            </h4>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeQuiz.options.map((opt, optIdx) => {
              const isSelected = userChoice === optIdx;
              const isCorrectOption = activeQuiz.correctIndex === optIdx;

              let btnStyle = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-400';
              if (isAnswered) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-medium';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle = 'bg-rose-50/90 border-rose-400 text-rose-950';
                } else {
                  btnStyle = 'bg-slate-50/40 border-slate-200 text-slate-500 opacity-75';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [currentQuestionIdx]: optIdx,
                    }))
                  }
                  className={`p-4 text-left text-xs sm:text-sm rounded-xl border transition-colors flex items-start justify-between gap-3 ${btnStyle}`}
                >
                  <span className="leading-relaxed">
                    <strong className="font-mono mr-2">{String.fromCharCode(65 + optIdx)}.</strong>
                    {opt}
                  </span>
                  {isAnswered && isCorrectOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Formula Callout */}
          {isAnswered && (
            <div
              className={`p-5 rounded-xl border space-y-2 ${
                userChoice === activeQuiz.correctIndex
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold">
                  {userChoice === activeQuiz.correctIndex
                    ? '● Correct — Mathematical Proof Verified'
                    : '▲ Not Quite — Review the Statutory Math Below'}
                </span>
                <span className="text-xs font-mono tabular-nums bg-white/90 px-2.5 py-1 rounded border border-slate-200 text-slate-800">
                  {activeQuiz.formulaProof}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeQuiz.explanation}
              </p>
              <div className="pt-2 flex justify-end">
                {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-900">
                    Final Score: {totalCorrect} / {QUIZ_QUESTIONS.length} ({Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
