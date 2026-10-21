/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { calculateOpportunityScores } from '../lib/calculations';
import { OpportunityMetrics } from '../types';
import { ChevronDown, ChevronUp, Star, Info, X } from 'lucide-react';

export default function ProductOpportunity() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  // Memoize opportunity metrics calculation
  const opportunityMetrics = useMemo(() => calculateOpportunityScores(), []);

  // Top 5 opportunities for the top horizontal bar chart section
  const top5Opportunities = useMemo(() => opportunityMetrics.slice(0, 5), [opportunityMetrics]);

  const getBadgeStyles = (classification: OpportunityMetrics['classification']) => {
    switch (classification) {
      case 'HIGH PRIORITY':
        return 'bg-[#1F3864] text-white border-[#1F3864]';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MONITOR':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'LOW POTENTIAL':
        return 'bg-slate-100 text-slate-400 border-slate-150';
      default:
        return 'bg-slate-100 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with page label and page title, plus collapsible formula button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">ANALYSIS</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Opportunity</h1>
        </div>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 self-start sm:self-auto shadow-sm"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showFormula ? 'Hide Formula' : 'Formula Explanation'}</span>
        </button>
      </div>

      {/* Collapsible Methodology Explainer Board */}
      {showFormula && (
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-start gap-3 relative animate-fade-in">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed pr-6">
            <p className="font-semibold text-slate-800 text-sm mb-1">Analytical Valuation Formula</p>
            Products are scored from <strong>0 to 100</strong> via a weighted composite index based on survey fields:
            <span className="block mt-1 font-mono text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-500 overflow-x-auto whitespace-pre-wrap">
              Opportunity Score = (Demand Intensity × 30%) + (Pharmacy Reach × 25%) + (Stockout Signal × 20%) + (Switching Readiness × 15%) + (Trial Signal × 10%)
            </span>
          </div>
          <button
            onClick={() => setShowFormula(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Opportunities Horizontal Bar Chart Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
          Top Opportunities by Score
        </h2>
        <div className="space-y-3.5">
          {top5Opportunities.map((product) => (
            <div key={product.productName} className="flex items-center gap-3">
              <div className="w-28 sm:w-44 text-xs font-semibold text-slate-700 truncate" title={product.productName}>
                {product.productName}
              </div>
              <div className="flex-1 bg-slate-100 h-5 rounded overflow-hidden relative shadow-inner">
                <div
                  className="bg-[#1F3864] h-full rounded transition-all duration-500"
                  style={{ width: `${product.opportunityScore}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs font-extrabold text-[#1F3864] font-mono">
                {product.opportunityScore}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Product Opportunity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Ranked List (All {opportunityMetrics.length} Products)</span>
          <span className="hidden sm:inline">Relative Score & Classification</span>
        </div>

        <div className="divide-y divide-slate-100">
          {opportunityMetrics.map((product, idx) => {
            const isExpanded = expandedProduct === product.productName;
            const badgeClass = getBadgeStyles(product.classification);

            return (
              <div key={product.productName} className="transition-all">
                {/* Product Header Row */}
                <div
                  onClick={() => setExpandedProduct(isExpanded ? null : product.productName)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-bold font-mono text-slate-400 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1 sm:flex-initial">
                      <h3 className="font-bold text-sm text-slate-800 truncate">{product.productName}</h3>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal score bar, score number, classification badge and expand icon */}
                  <div className="flex items-center gap-4 justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                    {/* Horizontal score bar showing relative score length */}
                    <div className="hidden md:block w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner shrink-0">
                      <div
                        className="bg-[#1F3864] h-full rounded-full"
                        style={{ width: `${product.opportunityScore}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <span className="text-sm font-extrabold text-[#1F3864] font-mono w-6 text-right">
                        {product.opportunityScore}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeClass} shrink-0`}>
                        {product.classification}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Normalised Factor Analysis */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-slate-50/80 border-t border-slate-100 space-y-4">
                    <span className="font-bold text-[#1F3864] text-xs uppercase tracking-wider block">
                      Weighted Component Valuation Breakdown
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {/* Factor 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">Demand Intensity (30% weight)</span>
                          <span className="font-mono text-slate-400">{Math.round(product.normDemandIntensity * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#1F3864] h-full rounded-full transition-all duration-300" 
                            style={{ width: `${product.normDemandIntensity * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Monthly volume: {product.demandIntensity.toLocaleString()} units demanded across pharmacies.
                        </div>
                      </div>

                      {/* Factor 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">Pharmacy Reach (25% weight)</span>
                          <span className="font-mono text-slate-400">{Math.round(product.normPharmacyReach * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${product.normPharmacyReach * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Invoiced at {product.pharmacyReachCount} of 20 total pharmacies ({Math.round((product.pharmacyReachCount / 20) * 100)}% coverage).
                        </div>
                      </div>

                      {/* Factor 3 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">Stockout Frequency Alert (20% weight)</span>
                          <span className="font-mono text-slate-400">{Math.round(product.normStockoutSignal * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${product.normStockoutSignal * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Occasional or frequent inventory gaps indicate immediate supply vacancies.
                        </div>
                      </div>

                      {/* Factor 4 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">Switching Readiness (15% weight)</span>
                          <span className="font-mono text-slate-400">{Math.round(product.normSwitchingReadiness * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${product.normSwitchingReadiness * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {product.switchingReadinessCount}% of accounts surveyed explicitly state "Yes" to trying a new supplier.
                        </div>
                      </div>

                      {/* Factor 5 */}
                      <div className="space-y-1 md:col-span-2">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">Initial Trial Order Pipeline Volume (10% weight)</span>
                          <span className="font-mono text-slate-400">{Math.round(product.normTrialOrderSignal * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${product.normTrialOrderSignal * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Expressed aggregate trial orders: {product.trialOrderSignalSum.toLocaleString()} pilot units.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
