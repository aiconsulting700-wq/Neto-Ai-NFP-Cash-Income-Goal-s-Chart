export type FilingStatus = 'single' | 'married_joint' | 'head_household' | 'married_separate';

export interface TaxBracket {
  rate: number; // e.g., 0.10 for 10%
  min: number;
  max: number | null; // null means infinity
}

export interface IrsYearDataset {
  taxYear: number;
  citation: string;
  effectiveDate: string;
  sourceUrl: string;
  standardDeduction: Record<FilingStatus, number>;
  brackets: Record<FilingStatus, TaxBracket[]>;
  fica: {
    socialSecurityRate: number;
    socialSecurityWageBase: number;
    medicareRate: number;
    additionalMedicareRate: number;
    additionalMedicareThreshold: Record<FilingStatus, number>;
  };
  limits: {
    electiveDeferral401k: number;
    catchUp401k: number;
    hsaSelf: number;
    hsaFamily: number;
    iraLimit: number;
  };
}

export const OFFICIAL_IRS_DATASETS: Record<number, IrsYearDataset> = {
  2026: {
    taxYear: 2026,
    citation: 'IRS Revenue Procedure 2025-32 (IR-2025-106)',
    effectiveDate: 'January 1, 2026',
    sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf',
    standardDeduction: {
      single: 16100,
      married_joint: 32200,
      head_household: 24150,
      married_separate: 16100,
    },
    brackets: {
      single: [
        { rate: 0.10, min: 0, max: 12400 },
        { rate: 0.12, min: 12400, max: 50400 },
        { rate: 0.22, min: 50400, max: 105700 },
        { rate: 0.24, min: 105700, max: 201775 },
        { rate: 0.32, min: 201775, max: 256225 },
        { rate: 0.35, min: 256225, max: 640600 },
        { rate: 0.37, min: 640600, max: null },
      ],
      married_joint: [
        { rate: 0.10, min: 0, max: 24800 },
        { rate: 0.12, min: 24800, max: 100800 },
        { rate: 0.22, min: 100800, max: 211400 },
        { rate: 0.24, min: 211400, max: 403550 },
        { rate: 0.32, min: 403550, max: 512450 },
        { rate: 0.35, min: 512450, max: 768700 },
        { rate: 0.37, min: 768700, max: null },
      ],
      head_household: [
        { rate: 0.10, min: 0, max: 17700 },
        { rate: 0.12, min: 17700, max: 67400 },
        { rate: 0.22, min: 67400, max: 105700 },
        { rate: 0.24, min: 105700, max: 201750 },
        { rate: 0.32, min: 201750, max: 256200 },
        { rate: 0.35, min: 256200, max: 640600 },
        { rate: 0.37, min: 640600, max: null },
      ],
      married_separate: [
        { rate: 0.10, min: 0, max: 12400 },
        { rate: 0.12, min: 12400, max: 50400 },
        { rate: 0.22, min: 50400, max: 105700 },
        { rate: 0.24, min: 105700, max: 201775 },
        { rate: 0.32, min: 201775, max: 256225 },
        { rate: 0.35, min: 256225, max: 384350 },
        { rate: 0.37, min: 384350, max: null },
      ],
    },
    fica: {
      socialSecurityRate: 0.062,
      socialSecurityWageBase: 181800,
      medicareRate: 0.0145,
      additionalMedicareRate: 0.009,
      additionalMedicareThreshold: {
        single: 200000,
        married_joint: 250000,
        head_household: 200000,
        married_separate: 125000,
      },
    },
    limits: {
      electiveDeferral401k: 24500,
      catchUp401k: 7500,
      hsaSelf: 4400,
      hsaFamily: 8750,
      iraLimit: 7500,
    },
  },
  2025: {
    taxYear: 2025,
    citation: 'IRS Revenue Procedure 2024-40 & OBBBA Adjustments',
    effectiveDate: 'January 1, 2025',
    sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
    standardDeduction: {
      single: 15750,
      married_joint: 31500,
      head_household: 23625,
      married_separate: 15750,
    },
    brackets: {
      single: [
        { rate: 0.10, min: 0, max: 11925 },
        { rate: 0.12, min: 11925, max: 48475 },
        { rate: 0.22, min: 48475, max: 103350 },
        { rate: 0.24, min: 103350, max: 197300 },
        { rate: 0.32, min: 197300, max: 250525 },
        { rate: 0.35, min: 250525, max: 626350 },
        { rate: 0.37, min: 626350, max: null },
      ],
      married_joint: [
        { rate: 0.10, min: 0, max: 23850 },
        { rate: 0.12, min: 23850, max: 96950 },
        { rate: 0.22, min: 96950, max: 206700 },
        { rate: 0.24, min: 206700, max: 394600 },
        { rate: 0.32, min: 394600, max: 501050 },
        { rate: 0.35, min: 501050, max: 751600 },
        { rate: 0.37, min: 751600, max: null },
      ],
      head_household: [
        { rate: 0.10, min: 0, max: 17000 },
        { rate: 0.12, min: 17000, max: 64850 },
        { rate: 0.22, min: 64850, max: 103350 },
        { rate: 0.24, min: 103350, max: 197300 },
        { rate: 0.32, min: 197300, max: 250500 },
        { rate: 0.35, min: 250500, max: 626350 },
        { rate: 0.37, min: 626350, max: null },
      ],
      married_separate: [
        { rate: 0.10, min: 0, max: 11925 },
        { rate: 0.12, min: 11925, max: 48475 },
        { rate: 0.22, min: 48475, max: 103350 },
        { rate: 0.24, min: 103350, max: 197300 },
        { rate: 0.32, min: 197300, max: 250525 },
        { rate: 0.35, min: 250525, max: 375800 },
        { rate: 0.37, min: 375800, max: null },
      ],
    },
    fica: {
      socialSecurityRate: 0.062,
      socialSecurityWageBase: 176100,
      medicareRate: 0.0145,
      additionalMedicareRate: 0.009,
      additionalMedicareThreshold: {
        single: 200000,
        married_joint: 250000,
        head_household: 200000,
        married_separate: 125000,
      },
    },
    limits: {
      electiveDeferral401k: 23500,
      catchUp401k: 7500,
      hsaSelf: 4300,
      hsaFamily: 8550,
      iraLimit: 7000,
    },
  },
};

export interface StateTaxPreset {
  code: string;
  name: string;
  effectiveRate: number; // e.g., 0.045 for 4.5%
  notes: string;
}

export const STATE_TAX_PRESETS: StateTaxPreset[] = [
  { code: 'NONE', name: 'Zero Income Tax State (TX, FL, WA, NV, TN)', effectiveRate: 0.0, notes: '0% state income tax' },
  { code: 'LOW', name: 'Low Flat / Tier State (CO, AZ, NC, PA, IN)', effectiveRate: 0.038, notes: '~3.8% avg effective state tax' },
  { code: 'MOD', name: 'Moderate Progressive State (IL, MI, VA, GA, MA)', effectiveRate: 0.05, notes: '~5.0% avg effective state tax' },
  { code: 'HIGH', name: 'High Progressive State (CA, NY, OR, NJ, MN)', effectiveRate: 0.078, notes: '~7.8% avg effective state tax' },
];

export interface BracketBreakdownRow {
  rate: number;
  min: number;
  max: number | null;
  taxableInBracket: number;
  taxOwedInBracket: number;
  fillPercentage: number;
}

export interface TaxCalculationResult {
  grossAnnualIncome: number;
  regularAnnualIncome: number;
  overtimeAnnualIncome: number;
  preTax401kAnnual: number;
  preTaxHsaAnnual: number;
  totalPreTaxDeductions: number;
  adjustedGrossIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  marginalRate: number;
  effectiveFederalRate: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalFicaTax: number;
  stateIncomeTax: number;
  totalTaxLiability: number;
  effectiveTotalTaxRate: number;
  netAnnualIncome: number;
  netMonthlyIncome: number;
  netWeeklyIncome: number;
  netHourlyRate: number;
  bracketBreakdown: BracketBreakdownRow[];
}

export function calculateTaxAndIncome(params: {
  hourlyRate: number;
  weeklyHours: number;
  weeksPerYear: number;
  overtimeMultiplier: number;
  filingStatus: FilingStatus;
  irsDataset: IrsYearDataset;
  preTax401kPercent: number;
  preTaxHsaAnnual: number;
  stateEffectiveRate: number;
}): TaxCalculationResult {
  const {
    hourlyRate,
    weeklyHours,
    weeksPerYear,
    overtimeMultiplier,
    filingStatus,
    irsDataset,
    preTax401kPercent,
    preTaxHsaAnnual,
    stateEffectiveRate,
  } = params;

  const regularWeeklyHours = Math.min(40, Math.max(0, weeklyHours));
  const overtimeWeeklyHours = Math.max(0, weeklyHours - 40);

  const regularAnnualIncome = regularWeeklyHours * hourlyRate * weeksPerYear;
  const overtimeAnnualIncome = overtimeWeeklyHours * hourlyRate * overtimeMultiplier * weeksPerYear;
  const grossAnnualIncome = regularAnnualIncome + overtimeAnnualIncome;

  // Cap 401(k) at official IRS elective deferral limit
  const raw401k = grossAnnualIncome * (preTax401kPercent / 100);
  const preTax401kAnnual = Math.min(raw401k, irsDataset.limits.electiveDeferral401k);
  const cappedHsa = Math.min(preTaxHsaAnnual, irsDataset.limits.hsaFamily);

  const totalPreTaxDeductions = Math.min(grossAnnualIncome, preTax401kAnnual + cappedHsa);
  const adjustedGrossIncome = Math.max(0, grossAnnualIncome - totalPreTaxDeductions);

  const standardDeduction = irsDataset.standardDeduction[filingStatus];
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

  const brackets = irsDataset.brackets[filingStatus];
  let federalIncomeTax = 0;
  let marginalRate = brackets[0].rate;

  const bracketBreakdown: BracketBreakdownRow[] = brackets.map((b) => {
    const upper = b.max ?? Infinity;
    const width = upper === Infinity ? Math.max(100000, taxableIncome - b.min) : upper - b.min;
    const taxableInBracket = Math.max(0, Math.min(taxableIncome, upper) - b.min);
    const taxOwedInBracket = taxableInBracket * b.rate;
    federalIncomeTax += taxOwedInBracket;

    if (taxableIncome > b.min) {
      marginalRate = b.rate;
    }

    const fillPercentage =
      taxableInBracket <= 0
        ? 0
        : b.max === null
        ? 100
        : Math.min(100, (taxableInBracket / width) * 100);

    return {
      rate: b.rate,
      min: b.min,
      max: b.max,
      taxableInBracket,
      taxOwedInBracket,
      fillPercentage,
    };
  });

  // FICA is calculated on Gross Wages (minus HSA, though 401k is still subject to FICA per IRS rules)
  const ficaTaxableWages = Math.max(0, grossAnnualIncome - cappedHsa);
  const socialSecurityTax =
    Math.min(ficaTaxableWages, irsDataset.fica.socialSecurityWageBase) *
    irsDataset.fica.socialSecurityRate;

  const baseMedicareTax = ficaTaxableWages * irsDataset.fica.medicareRate;
  const addMedicareThreshold = irsDataset.fica.additionalMedicareThreshold[filingStatus];
  const additionalMedicareTax =
    Math.max(0, ficaTaxableWages - addMedicareThreshold) *
    irsDataset.fica.additionalMedicareRate;
  const medicareTax = baseMedicareTax + additionalMedicareTax;
  const totalFicaTax = socialSecurityTax + medicareTax;

  // State tax on AGI
  const stateIncomeTax = adjustedGrossIncome * stateEffectiveRate;

  const totalTaxLiability = federalIncomeTax + totalFicaTax + stateIncomeTax;
  const effectiveFederalRate = grossAnnualIncome > 0 ? federalIncomeTax / grossAnnualIncome : 0;
  const effectiveTotalTaxRate = grossAnnualIncome > 0 ? totalTaxLiability / grossAnnualIncome : 0;

  const netAnnualIncome = Math.max(0, grossAnnualIncome - totalPreTaxDeductions - totalTaxLiability);
  const netMonthlyIncome = netAnnualIncome / 12;
  const netWeeklyIncome = weeksPerYear > 0 ? netAnnualIncome / weeksPerYear : 0;
  const totalAnnualHours = weeklyHours * weeksPerYear;
  const netHourlyRate = totalAnnualHours > 0 ? netAnnualIncome / totalAnnualHours : 0;

  return {
    grossAnnualIncome,
    regularAnnualIncome,
    overtimeAnnualIncome,
    preTax401kAnnual,
    preTaxHsaAnnual: cappedHsa,
    totalPreTaxDeductions,
    adjustedGrossIncome,
    standardDeduction,
    taxableIncome,
    federalIncomeTax,
    marginalRate,
    effectiveFederalRate,
    socialSecurityTax,
    medicareTax,
    totalFicaTax,
    stateIncomeTax,
    totalTaxLiability,
    effectiveTotalTaxRate,
    netAnnualIncome,
    netMonthlyIncome,
    netWeeklyIncome,
    netHourlyRate,
    bracketBreakdown,
  };
}

export interface GoalPathwayAnalysis {
  incomeGap: number; // positive if goal > current gross
  isGoalMet: boolean;
  requiredHourlyRateAtCurrentHours: number;
  hourlyRateDelta: number;
  requiredWeeklyHoursAtCurrentRate: number;
  weeklyHoursDelta: number;
  hybridRateIncrease: number;
  hybridExtraWeeklyHours: number;
}

export function calculateGoalPathways(params: {
  goalAnnualIncome: number;
  hourlyRate: number;
  weeklyHours: number;
  weeksPerYear: number;
  overtimeMultiplier: number;
  currentGrossAnnual: number;
}): GoalPathwayAnalysis {
  const {
    goalAnnualIncome,
    hourlyRate,
    weeklyHours,
    weeksPerYear,
    overtimeMultiplier,
    currentGrossAnnual,
  } = params;

  const incomeGap = goalAnnualIncome - currentGrossAnnual;
  const isGoalMet = incomeGap <= 0;

  // Effective annual hours accounting for overtime multiplier
  const regHours = Math.min(40, weeklyHours);
  const otHours = Math.max(0, weeklyHours - 40);
  const effectiveWeeklyUnits = regHours + otHours * overtimeMultiplier;
  const totalAnnualUnits = effectiveWeeklyUnits * weeksPerYear;

  const requiredHourlyRateAtCurrentHours =
    totalAnnualUnits > 0 ? goalAnnualIncome / totalAnnualUnits : 0;
  const hourlyRateDelta = Math.max(0, requiredHourlyRateAtCurrentHours - hourlyRate);

  // Required weekly hours at current hourly rate
  let requiredWeeklyHoursAtCurrentRate = 0;
  if (hourlyRate > 0 && weeksPerYear > 0) {
    const neededWeeklyGross = goalAnnualIncome / weeksPerYear;
    const maxRegularWeeklyGross = 40 * hourlyRate;
    if (neededWeeklyGross <= maxRegularWeeklyGross) {
      requiredWeeklyHoursAtCurrentRate = neededWeeklyGross / hourlyRate;
    } else {
      const overtimeGrossNeeded = neededWeeklyGross - maxRegularWeeklyGross;
      const overtimeHoursNeeded = overtimeGrossNeeded / (hourlyRate * overtimeMultiplier);
      requiredWeeklyHoursAtCurrentRate = 40 + overtimeHoursNeeded;
    }
  }
  const weeklyHoursDelta = Math.max(0, requiredWeeklyHoursAtCurrentRate - weeklyHours);

  // Hybrid path: Cover 50% of the gap via rate bump, 50% via extra hours
  const halfGap = Math.max(0, incomeGap / 2);
  const hybridRateIncrease = totalAnnualUnits > 0 ? halfGap / totalAnnualUnits : 0;
  const newRate = hourlyRate + hybridRateIncrease;
  const overtimeUnitRate = (weeklyHours >= 40 ? newRate * overtimeMultiplier : newRate) * weeksPerYear;
  const hybridExtraWeeklyHours = overtimeUnitRate > 0 ? halfGap / overtimeUnitRate : 0;

  return {
    incomeGap,
    isGoalMet,
    requiredHourlyRateAtCurrentHours,
    hourlyRateDelta,
    requiredWeeklyHoursAtCurrentRate,
    weeklyHoursDelta,
    hybridRateIncrease,
    hybridExtraWeeklyHours,
  };
}

export interface DreamItem {
  id: string;
  title: string;
  category: string;
  targetCost: number;
  savedSoFar: number;
  allocationShare: number; // percentage of monthly savings (e.g. 40%)
  imageUrl: string;
  notes: string;
}

export const INITIAL_DREAM_ITEMS: DreamItem[] = [
  {
    id: 'dream-home',
    title: 'Architectural Home Down Payment',
    category: 'Real Estate Equity',
    targetCost: 85000,
    savedSoFar: 18500,
    allocationShare: 45,
    imageUrl: '/src/assets/images/dream_home_downpayment_1790483193167.jpg',
    notes: '20% conventional down payment + closing reserve for modern craftsman residence',
  },
  {
    id: 'dream-ev',
    title: 'Electric Touring Crossover',
    category: 'Mobility & Transport',
    targetCost: 46000,
    savedSoFar: 9200,
    allocationShare: 25,
    imageUrl: '/src/assets/images/dream_ev_roadster_1790483203672.jpg',
    notes: 'Debt-free cash purchase of long-range dual-motor electric touring vehicle',
  },
  {
    id: 'dream-kyoto',
    title: 'Kyoto Autumn Sabbatical',
    category: 'Experiential Milestone',
    targetCost: 14500,
    savedSoFar: 3800,
    allocationShare: 18,
    imageUrl: '/src/assets/images/dream_kyoto_sabbatical_1790483214039.jpg',
    notes: '30-day cultural & architectural sabbatical across Kyoto, Kanazawa, and Naoshima',
  },
  {
    id: 'dream-studio',
    title: 'Solid Walnut Studio Workstation',
    category: 'Career Infrastructure',
    targetCost: 6400,
    savedSoFar: 2100,
    allocationShare: 12,
    imageUrl: '/src/assets/images/dream_studio_workstation_1790483223180.jpg',
    notes: 'Reference-grade 6K display, custom walnut desk, and acoustic treatment',
  },
];

export interface ExpenseItem {
  id: string;
  name: string;
  category: 'needs' | 'wants' | 'debt';
  monthlyAmount: number;
  isOptimizable: boolean;
  optimizationTip?: string;
}

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-housing',
    name: 'Primary Residence Rent / Mortgage',
    category: 'needs',
    monthlyAmount: 1950,
    isOptimizable: false,
  },
  {
    id: 'exp-groceries',
    name: 'Groceries & Household Essentials',
    category: 'needs',
    monthlyAmount: 540,
    isOptimizable: true,
    optimizationTip: 'Automated weekly meal-plan inventory cuts impulse grocery spend by ~12%',
  },
  {
    id: 'exp-utilities',
    name: 'Utilities, Fiber Internet & Mobile',
    category: 'needs',
    monthlyAmount: 260,
    isOptimizable: true,
    optimizationTip: 'Annual carrier & ISP rate negotiation saves ~$35/mo',
  },
  {
    id: 'exp-transport',
    name: 'Transit, Fuel & Auto Insurance',
    category: 'needs',
    monthlyAmount: 380,
    isOptimizable: false,
  },
  {
    id: 'exp-dining',
    name: 'Dining Out, Coffee & Delivery',
    category: 'wants',
    monthlyAmount: 480,
    isOptimizable: true,
    optimizationTip: 'Cap delivery apps with an automated weekly category alert',
  },
  {
    id: 'exp-subscriptions',
    name: 'Digital Subscriptions & Memberships',
    category: 'wants',
    monthlyAmount: 185,
    isOptimizable: true,
    optimizationTip: 'Consolidate overlapping streaming & SaaS renewals',
  },
  {
    id: 'exp-leisure',
    name: 'Apparel, Hobbies & Weekend Travel',
    category: 'wants',
    monthlyAmount: 360,
    isOptimizable: true,
    optimizationTip: '72-hour automated cooling-off rule for non-essential purchases',
  },
  {
    id: 'exp-debt',
    name: 'Student Loan / Credit Line Payments',
    category: 'debt',
    monthlyAmount: 290,
    isOptimizable: false,
  },
];

export interface AutomationRule {
  id: string;
  title: string;
  mechanism: string;
  category: 'cashflow' | 'tax_shield' | 'yield_boost';
  active: boolean;
  monthlySavingsBoost: number; // dynamic or fixed
  apyBoostPercent: number;
}

export function calculateMonthsToGoalWithInterest(
  remainingPrincipal: number,
  currentSaved: number,
  targetCost: number,
  monthlyContribution: number,
  annualApyPercent: number
): { months: number; interestEarned: number } {
  if (currentSaved >= targetCost) {
    return { months: 0, interestEarned: 0 };
  }
  if (monthlyContribution <= 0 && (currentSaved <= 0 || annualApyPercent <= 0)) {
    return { months: Infinity, interestEarned: 0 };
  }

  const monthlyRate = annualApyPercent / 100 / 12;
  if (monthlyRate <= 0.00001) {
    if (monthlyContribution <= 0) return { months: Infinity, interestEarned: 0 };
    const months = Math.ceil((targetCost - currentSaved) / monthlyContribution);
    return { months, interestEarned: 0 };
  }

  // Simulate month-by-month up to 600 months (50 years) for exact interest & month tally
  let balance = currentSaved;
  let months = 0;
  let totalInterest = 0;
  while (balance < targetCost && months < 600) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance += interest + monthlyContribution;
    months += 1;
  }

  return {
    months: months >= 600 ? Infinity : months,
    interestEarned: totalInterest,
  };
}
