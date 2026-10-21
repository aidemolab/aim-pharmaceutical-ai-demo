/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PHARMACIES, PRODUCT_DEMAND } from '../data';
import { Filter, Users, Package, TrendingUp, RefreshCw } from 'lucide-react';

export default function MarketOverview() {
  // Filter States
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Unique lists for filters
  const locations = ['All', ...Array.from(new Set(PHARMACIES.map((p) => p.Location)))];
  const types = ['All', ...Array.from(new Set(PHARMACIES.map((p) => p.PharmacyType)))];

  // Apply filters
  const filteredPharmacies = PHARMACIES.filter((p) => {
    const locationMatch = selectedLocation === 'All' || p.Location === selectedLocation;
    const typeMatch = selectedType === 'All' || p.PharmacyType === selectedType;
    return locationMatch && typeMatch;
  });

  const filteredPharmacyIds = new Set(filteredPharmacies.map((p) => p.PharmacyID));

  const filteredDemands = PRODUCT_DEMAND.filter((d) => {
    return filteredPharmacyIds.has(d.PharmacyID);
  });

  // Calculate Pipeline Value (SUM of ExpectedTrialOrderQuantity x CurrentPurchasePrice where WillingToTryNewSupplier === 'Yes')
  const pipelineValue = filteredDemands
    .filter((d) => d.WillingToTryNewSupplier === 'Yes')
    .reduce((sum, d) => sum + d.ExpectedTrialOrderQuantity * d.CurrentPurchasePrice, 0);

  // Card 1: Pharmacies Surveyed
  const totalSurveyedPharmacies = filteredPharmacies.length;

  // Card 2: Products Identified & therapeutic categories
  const uniqueProductsCount = Array.from(new Set(filteredDemands.map((d) => d.ProductName))).length;
  const uniqueCategoriesCount = Array.from(new Set(filteredDemands.map((d) => d.TherapeuticCategory))).length;

  // Card 3: Total Est. Demand
  const totalEstimatedDemand = filteredDemands.reduce((sum, d) => sum + d.EstimatedMonthlyDemand, 0);

  // Card 4: Switching Readiness (percentage of WillingToTryNewSupplier === 'Yes')
  const totalDemandRows = filteredDemands.length;
  const willingRowsCount = filteredDemands.filter((d) => d.WillingToTryNewSupplier === 'Yes').length;
  const switchingReadinessPercent = totalDemandRows > 0 ? (willingRowsCount / totalDemandRows) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Executive Survey Insights</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Overview</h1>
      </div>

      {/* Filter Board */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4 text-blue-500" />
          <span>Executive Segmentation Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Geographic Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Pharmacy Operation Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Option if any active */}
        {(selectedLocation !== 'All' || selectedType !== 'All') && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedLocation('All');
                setSelectedType('All');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear Active Filters
            </button>
          </div>
        )}
      </div>

      {/* Primary Highlighted PIPELINE VALUE Card in Dark Navy */}
      <div className="bg-[#1F3864] text-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-700/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-xs text-blue-200 uppercase font-bold tracking-widest">Pipeline Value</span>
          <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight">
            {pipelineValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
        </div>
        <span className="text-xs text-blue-300 mt-2 font-medium">Estimated trial-order revenue opportunity</span>
      </div>

      {/* Four KPI Cards in Two Columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 1: Pharmacies Surveyed */}
        <div className="bg-white text-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="p-1.5 bg-slate-50 text-[#1F3864] rounded-lg w-fit mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Pharmacies Surveyed</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1F3864]">{totalSurveyedPharmacies}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Active surveyed locations</span>
          </div>
        </div>

        {/* Card 2: Products Identified */}
        <div className="bg-white text-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="p-1.5 bg-slate-50 text-[#1F3864] rounded-lg w-fit mb-2">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Products Identified</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1F3864]">{uniqueProductsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
              across {uniqueCategoriesCount} therapeutic categories
            </span>
          </div>
        </div>

        {/* Card 3: Total Est. Demand */}
        <div className="bg-white text-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="p-1.5 bg-slate-50 text-[#1F3864] rounded-lg w-fit mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total Est. Demand</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1F3864]">
              {totalEstimatedDemand.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium font-sans">
              units per month
            </span>
          </div>
        </div>

        {/* Card 4: Switching Readiness */}
        <div className="bg-blue-50/50 text-blue-900 p-5 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between min-h-[120px]">
          <div>
            <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-lg w-fit mb-2">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-xs text-blue-500/80 uppercase font-bold tracking-wider">Switching Readiness</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {switchingReadinessPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-blue-600/80 block mt-0.5 font-semibold">
              would switch supplier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
