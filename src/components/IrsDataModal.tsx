import React, { useState } from 'react';
import { X, Check, Download, Upload, FileSpreadsheet, ExternalLink, RefreshCw } from 'lucide-react';
import { IrsYearDataset, FilingStatus, OFFICIAL_IRS_DATASETS } from '../data/irsData';

interface IrsDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: IrsYearDataset;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  onImportCustomDataset: (dataset: IrsYearDataset) => void;
  filingStatus: FilingStatus;
}

const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single Filer',
  married_joint: 'Married Filing Jointly',
  head_household: 'Head of Household',
  married_separate: 'Married Filing Separately',
};

export const IrsDataModal: React.FC<IrsDataModalProps> = ({
  isOpen,
  onClose,
  activeDataset,
  selectedYear,
  onSelectYear,
  onImportCustomDataset,
  filingStatus,
}) => {
  const [viewTab, setViewTab] = useState<'tables' | 'json'>('tables');
  const [jsonInput, setJsonInput] = useState<string>(() => JSON.stringify(activeDataset, null, 2));
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  const handleSwitchYear = (year: number) => {
    onSelectYear(year);
    const target = OFFICIAL_IRS_DATASETS[year];
    if (target) {
      setJsonInput(JSON.stringify(target, null, 2));
      setImportStatus({
        type: 'success',
        message: `Loaded IRS.gov ${target.citation} tables.`,
      });
    }
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput) as IrsYearDataset;
      if (!parsed.standardDeduction || !parsed.brackets || !parsed.fica) {
        throw new Error('Missing required IRS schema fields (standardDeduction, brackets, fica).');
      }
      onImportCustomDataset(parsed);
      setImportStatus({
        type: 'success',
        message: `Imported custom IRS tax table for Tax Year ${parsed.taxYear}.`,
      });
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Invalid JSON structure.',
      });
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(activeDataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irs-rev-proc-${activeDataset.taxYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="irs-modal-title"
        className="w-full max-w-4xl max-h-[88vh] flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 id="irs-modal-title" className="text-xl font-semibold text-slate-900">
              IRS.gov Statutory Tax Parameters & Schema Importer
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              <span>{activeDataset.citation}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Effective {activeDataset.effectiveDate}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <a
                href={activeDataset.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-900 inline-flex items-center gap-1"
              >
                Official IRS Publication <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close IRS Data Inspector"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">IRS Tax Year:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[2026, 2025].map((yr) => (
                <button
                  key={yr}
                  onClick={() => handleSwitchYear(yr)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedYear === yr
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {yr} Statutory Tables
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewTab('tables')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  viewTab === 'tables'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structured Tables
              </button>
              <button
                onClick={() => {
                  setJsonInput(JSON.stringify(activeDataset, null, 2));
                  setViewTab('json');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  viewTab === 'json'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Import / Edit IRS JSON
              </button>
            </div>

            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Status Message */}
        {importStatus.type !== 'idle' && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              importStatus.type === 'success'
                ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
                : 'bg-red-50/80 text-red-900 border-red-200'
            }`}
          >
            <span>
              {importStatus.type === 'success' ? '● VERIFIED: ' : '▲ ERROR: '}
              {importStatus.message}
            </span>
            <button
              onClick={() => setImportStatus({ type: 'idle', message: '' })}
              className="text-xs underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {viewTab === 'tables' ? (
            <>
              {/* Standard Deductions & FICA Thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Standard Deduction Amounts ({activeDataset.taxYear})
                  </h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="text-left py-2 font-medium">Filing Status</th>
                        <th className="text-right py-2 font-medium">Deduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Object.keys(FILING_LABELS) as FilingStatus[]).map((status) => (
                        <tr
                          key={status}
                          className={status === filingStatus ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'}
                        >
                          <td className="py-2">
                            {FILING_LABELS[status]}
                            {status === filingStatus ? ' (Active)' : ''}
                          </td>
                          <td className="py-2 text-right font-mono tabular-nums">
                            ${activeDataset.standardDeduction[status].toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    FICA Payroll & Pre-Tax Statutory Caps ({activeDataset.taxYear})
                  </h3>
                  <dl className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-600">Social Security Rate (OASDI)</dt>
                      <dd className="font-mono tabular-nums font-medium text-slate-900">
                        {(activeDataset.fica.socialSecurityRate * 100).toFixed(2)}%
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-600">Social Security Wage Base Cap</dt>
                      <dd className="font-mono tabular-nums font-medium text-slate-900">
                        ${activeDataset.fica.socialSecurityWageBase.toLocaleString()}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-600">Medicare Hospital Insurance Rate</dt>
                      <dd className="font-mono tabular-nums font-medium text-slate-900">
                        {(activeDataset.fica.medicareRate * 100).toFixed(2)}% (+0.9% Surtax)
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-600">401(k) / 403(b) Elective Deferral Limit</dt>
                      <dd className="font-mono tabular-nums font-medium text-slate-900">
                        ${activeDataset.limits.electiveDeferral401k.toLocaleString()}
                      </dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-slate-600">HSA Contribution Limit (Self / Family)</dt>
                      <dd className="font-mono tabular-nums font-medium text-slate-900">
                        ${activeDataset.limits.hsaSelf.toLocaleString()} / ${activeDataset.limits.hsaFamily.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* All 7 Brackets Table for Active Filing Status */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Federal Marginal Income Tax Brackets — {FILING_LABELS[filingStatus]} ({activeDataset.taxYear})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Applied after ${activeDataset.standardDeduction[filingStatus].toLocaleString()} standard deduction
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="text-left py-2 font-medium">Marginal Rate</th>
                      <th className="text-right py-2 font-medium">Taxable Income Floor</th>
                      <th className="text-right py-2 font-medium">Taxable Income Ceiling</th>
                      <th className="text-right py-2 font-medium">Max Tax in Bracket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDataset.brackets[filingStatus].map((b, idx) => {
                      const maxTax = b.max !== null ? (b.max - b.min) * b.rate : null;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 text-slate-700">
                          <td className="py-2.5 font-mono tabular-nums font-semibold text-slate-900">
                            {(b.rate * 100).toFixed(0)}%
                          </td>
                          <td className="py-2.5 text-right font-mono tabular-nums">
                            ${b.min.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right font-mono tabular-nums">
                            {b.max !== null ? `$${b.max.toLocaleString()}` : 'No Limit'}
                          </td>
                          <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">
                            {maxTax !== null ? `$${Math.round(maxTax).toLocaleString()}` : 'Uncapped'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Paste or modify IRS Revenue Procedure JSON parameters below to immediately recalculate all tax, take-home pay, and Dream Board timelines.
                </p>
                <button
                  onClick={() => setJsonInput(JSON.stringify(OFFICIAL_IRS_DATASETS[selectedYear], null, 2))}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 underline"
                >
                  <RefreshCw className="w-3 h-3" /> Reset to Official {selectedYear} Defaults
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={16}
                aria-label="IRS JSON Dataset Editor"
                className="w-full p-4 font-mono text-xs bg-slate-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleApplyJson}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Apply Custom IRS Dataset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Source: Internal Revenue Service (irs.gov/newsroom) · Statutory inflation adjustments</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
