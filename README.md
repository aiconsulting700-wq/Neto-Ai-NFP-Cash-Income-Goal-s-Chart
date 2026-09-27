# Meridian Ledger — Income, IRS Tax & Dream Goal Calculator

An interactive financial planning studio that converts hourly wages and weekly hours into IRS-accurate net take-home pay, Dream Board milestone timelines, automated budget tracking rules, multi-rate compound interest projections, and interactive tax literacy modules.

## Key Features

- **Hourly Wage & Goal Yearly Income Calculator**:
  - Calculate gross and net income from base hourly rate, weekly hours worked, paid weeks per year, and FLSA overtime multipliers (`1.0x`, `1.5x`, `2.0x`).
  - **3 Goal Realization Pathways**: Automatically computes the exact hourly rate calibration, weekly overtime schedule expansion, or 50/50 balanced hybrid path required to reach your target annual income.
- **IRS.gov Statutory Tax Engine & Schema Importer**:
  - Built-in official **IRS Revenue Procedure 2025-32 (Tax Year 2026)** and **Revenue Procedure 2024-40 (Tax Year 2025)** parameters.
  - Supports `Single`, `Married Filing Jointly`, `Head of Household`, and `Married Filing Separately` standard deductions, all 7 progressive federal tax brackets (`10%` through `37%`), FICA Social Security wage base caps, Medicare (`1.45%` + `0.9%` Additional Medicare Tax), and pre-tax `401(k)` / `HSA` shields.
  - Includes an interactive **IRS.gov JSON Inspector & Importer** to export or customize statutory tax tables.
- **Dream Board & Milestone Horizons**:
  - Track savings goals with **Parallel Split Allocation** or **Sequential Waterfall Priority** modes.
  - Compares **0% Cash Timeline**, **Compound APY Timeline**, and **Optimized Automated Budget Timeline** alongside net work-hour equivalency.
- **Monthly Expense Breakdown & Automated Budget Tracking**:
  - Audits monthly expenses across **Essential Needs**, **Discretionary Wants**, and **Debt Service** against the 50/30/20 framework.
  - Includes 5 interactive **Zero-Touch Budget Tracking Rules** that dynamically recalculate monthly free cash flow and Dream Board completion dates.
- **Compound Interest & Rate Velocity Simulator**:
  - Interactive SVG multi-curve simulator comparing `0.05% Traditional Bank`, `4.50% HYSA / T-Bills`, `Custom Target APY (0%–15%)`, and `8.50% Equity Index` across daily, monthly, quarterly, or annual compounding with optional CPI inflation adjustment.
- **Interactive Learning Lab & Mastery Quiz**:
  - Hands-on micro-simulations (*IRS Marginal Bracket Myth-Buster*, *Pre-Tax 401(k)/HSA Multiplier*, and *Rule of 72 Explorer*) paired with a 6-question scenario quiz.

## Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```
