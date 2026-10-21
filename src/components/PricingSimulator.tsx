/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { runPricingSimulation, UNIQUE_PRODUCTS, PRODUCT_CATEGORIES } from '../lib/calculations';

export default function PricingSimulator() {
  const [selectedProduct, setSelectedProduct] = useState<string>(UNIQUE_PRODUCTS[0]);
  const [acquisitionCost, setAcquisitionCost] = useState<number>(2.40);
  const [freightCost, setFreightCost] = useState<number>(0.35); // Default is £0.35 as requested
  const [proposedPrice, setProposedPrice] = useState<number>(5.20);
  const [discountPercent, setDiscountPercent] = useState<number>(8);

  // Compute pricing outputs
  const result = useMemo(() => {
    return runPricingSimulation(selectedProduct, acquisitionCost, freightCost, proposedPrice, discountPercent);
  }, [selectedProduct, acquisitionCost, freightCost, proposedPrice, discountPercent]);

  const productMeta = PRODUCT_CATEGORIES[selectedProduct];

  // Adjust default values based on selected product to ensure realistic initial states
  useEffect(() => {
    const avgPrice = result.marketAvgPrice;
    if (avgPrice > 0) {
      setAcquisitionCost(Math.round(avgPrice * 0.45 * 100) / 100);
      setProposedPrice(Math.round(avgPrice * 1.05 * 100) / 100);
      setFreightCost(0.35); // Set Freight Cost default explicitly to £0.35
      setDiscountPercent(8);
    }
  }, [selectedProduct]);

  const isBelowThreshold = result.grossMarginPercent < 15;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section with Pricing and Margin Simulator title */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing and Margin Simulator</h1>
      </div>

      {/* Selector and Product profile */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Target Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full text-base font-bold text-[#1F3864] bg-slate-50 border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {UNIQUE_PRODUCTS.map((prod) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Therapeutic Group</span>
            <span className="font-bold text-slate-800">{productMeta?.category}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Segment Competitor Avg Price</span>
            <span className="font-bold text-slate-800">£{result.marketAvgPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Two column controls / metrics layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Unit Economic Controls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
            Unit Economic Controls
          </h2>
          
          {/* Acquisition Cost Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Acquisition Cost</span>
              <span className="font-bold text-blue-600 font-mono">
                £{acquisitionCost.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="15.00"
              step="0.10"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
            />
          </div>

          {/* Freight Cost Slider - default £0.35 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Freight Cost</span>
              <span className="font-bold text-blue-600 font-mono">
                £{freightCost.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="12.00"
              step="0.05"
              value={freightCost}
              onChange={(e) => setFreightCost(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
            />
          </div>

          {/* Proposed Selling Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Proposed Selling Price</span>
              <span className="font-bold text-blue-600 font-mono">
                £{proposedPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="1.00"
              max="30.00"
              step="0.10"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
            />
          </div>

          {/* Discount Percent Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Discount</span>
              <span className="font-bold text-blue-600 font-mono">
                {discountPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
            />
          </div>
        </div>

        {/* Right Panel: Pilot Break-Even Metrics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2 mb-3">
              Pilot Break-Even Metrics
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              This model calculates the minimum sales volume required to recover a fixed £1,000 setup cost.
            </p>
            
            {/* Prominent Break-Even display */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BREAK-EVEN VOLUME</span>
              <span className="text-3xl font-extrabold text-[#1F3864] font-mono mt-1 block">
                {result.breakEvenVolume === Infinity ? '∞' : result.breakEvenVolume.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">units to recover £1,000 pilot cost</span>
            </div>
          </div>

          {/* Three Detail Lines */}
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Landed Cost per Unit</span>
              <span className="font-bold text-slate-800 font-mono">£{result.landedCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Effective Selling Price</span>
              <span className="font-bold text-slate-800 font-mono">£{result.effectivePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Profit per Unit</span>
              <span className={`font-bold font-mono ${result.grossProfitUnit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                £{result.grossProfitUnit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Three Output Cards (Landed Cost, Gross Margin, Break-Even) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: LANDED COST */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LANDED COST</span>
          <span className="text-2xl font-extrabold text-[#1F3864] font-mono mt-2">
            £{result.landedCost.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">per unit</span>
        </div>

        {/* Card 2: GROSS MARGIN */}
        <div className={`p-5 rounded-xl shadow-sm flex flex-col justify-between items-center text-center text-white transition-all ${
          isBelowThreshold ? 'bg-rose-600' : 'bg-[#1F3864]'
        }`}>
          <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">GROSS MARGIN</span>
          <div className="flex flex-col items-center mt-2">
            <span className="text-3xl font-extrabold font-mono">
              {result.grossMarginPercent.toFixed(1)}%
            </span>
            {isBelowThreshold && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-700/65 px-2 py-0.5 rounded mt-1.5 animate-pulse">
                Below Viability Threshold
              </span>
            )}
          </div>
          <span className="text-[10px] opacity-80 mt-1">
            {isBelowThreshold ? 'Corporate target: 15%+' : 'Target met (15%+)'}
          </span>
        </div>

        {/* Card 3: BREAK-EVEN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BREAK-EVEN</span>
          <span className="text-2xl font-extrabold text-[#1F3864] font-mono mt-2">
            {result.breakEvenVolume === Infinity ? '∞' : result.breakEvenVolume.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">units to recover £1,000 setup cost</span>
        </div>

      </div>

      {/* Profitability Performance Output banner at the bottom */}
      <div className={`p-5 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        result.grossMarginPercent >= 15 
          ? 'bg-[#1F3864] border-slate-800 text-white' 
          : 'bg-rose-50 border-rose-200 text-rose-950'
      }`}>
        <div className="space-y-1 text-center sm:text-left">
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            result.grossMarginPercent >= 15 ? 'text-blue-200' : 'text-rose-500'
          }`}>
            Profitability Performance Output
          </span>
          <h3 className="font-bold text-lg">
            {result.grossMarginPercent >= 15 ? 'Financially Viable Import Profile' : 'Below Viability Threshold'}
          </h3>
          <p className={`text-xs ${result.grossMarginPercent >= 15 ? 'text-slate-300' : 'text-rose-700/90'}`}>
            {result.grossMarginPercent >= 15 
              ? 'This product margin meets the minimum corporate threshold of 15% for trial imports.' 
              : 'Margin is insufficient. Increase the selling price, negotiate a lower acquisition cost, or reduce freight.'}
          </p>
        </div>
        <div className="text-center sm:text-right shrink-0">
          <span className={`text-3xl font-extrabold font-mono block ${
            result.grossMarginPercent >= 15 ? 'text-white' : 'text-rose-600'
          }`}>
            {result.grossMarginPercent.toFixed(1)}%
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            result.grossMarginPercent >= 15 ? 'text-blue-200' : 'text-rose-500'
          }`}>
            Gross Margin
          </span>
        </div>
      </div>
    </div>
  );
}
