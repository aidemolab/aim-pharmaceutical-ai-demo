/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { runImportSimulation, UNIQUE_PRODUCTS, PRODUCT_CATEGORIES } from '../lib/calculations';

export default function ImportSimulator() {
  const [selectedProduct, setSelectedProduct] = useState<string>(UNIQUE_PRODUCTS[0]);
  const [conversionRate, setConversionRate] = useState<number>(42);
  const [safetyStock, setSafetyStock] = useState<number>(20);
  const [targetStockCover, setTargetStockCover] = useState<number>(8);

  // Compute simulation results
  const result = useMemo(() => {
    return runImportSimulation(selectedProduct, conversionRate, safetyStock, targetStockCover);
  }, [selectedProduct, conversionRate, safetyStock, targetStockCover]);

  const productMeta = PRODUCT_CATEGORIES[selectedProduct];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">SIMULATOR</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Import Quantity</h1>
      </div>

      {/* Selector & Product Profile Card */}
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
            <span className="text-slate-400 block font-medium">Type / Classification</span>
            <span className="font-bold text-slate-800 uppercase">{productMeta?.type}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Monthly Segment Demand</span>
            <span className="font-bold text-[#1F3864] text-sm">{result.baseDemand} units</span>
          </div>
        </div>
      </div>

      {/* Sliders Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {/* Slider 1: Conversion Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Conversion Rate</span>
            <span className="font-bold text-blue-600 font-mono">
              {conversionRate}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={conversionRate}
            onChange={(e) => setConversionRate(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
          />
        </div>

        {/* Slider 2: Safety Stock */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Safety Stock %</span>
            <span className="font-bold text-blue-600 font-mono">
              {safetyStock}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={safetyStock}
            onChange={(e) => setSafetyStock(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
          />
        </div>

        {/* Slider 3: Target Stock Cover */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Target Stock Cover</span>
            <span className="font-bold text-blue-600 font-mono">
              {targetStockCover} weeks
            </span>
          </div>
          <p className="text-slate-500 text-[11px] italic leading-tight">
            Tip — increase Safety Stock % to extend stock cover and reduce stock-out risk.
          </p>
          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={targetStockCover}
            onChange={(e) => setTargetStockCover(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1F3864]"
          />
        </div>
      </div>

      {/* Recommended Import Quantity Section */}
      <div className="space-y-3">
        <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block">
          RECOMMENDED IMPORT QUANTITY
        </span>

        <div className="grid grid-cols-3 gap-4">
          {/* LOW Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LOW</span>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800">{result.lowQuantity}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">units</span>
            </div>
          </div>

          {/* EXPECTED Card (Highlighted in Navy) */}
          <div className="bg-[#1F3864] text-white p-5 rounded-xl shadow-md border border-slate-800 flex flex-col justify-between items-center text-center relative overflow-hidden ring-4 ring-blue-500/15">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-blue-500/20 rounded-full blur-md pointer-events-none" />
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">EXPECTED</span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold">{result.expectedQuantity}</span>
              <span className="text-[10px] text-blue-200 block mt-0.5 font-medium">units</span>
            </div>
          </div>

          {/* HIGH Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HIGH</span>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800">{result.highQuantity}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">units</span>
            </div>
          </div>
        </div>

        {/* Stock Cover metrics below the cards */}
        <div className="text-xs text-slate-500 text-center font-medium pt-1">
          Target stock cover: <strong className="text-slate-700">{result.stockCoverWeeks}</strong> weeks at expected demand
        </div>

        {/* Risk flag comparison */}
        <div className="text-center mt-2">
          {safetyStock < 10 ? (
            <span className="inline-block text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 animate-pulse">
              Low safety buffer — consider increasing safety stock
            </span>
          ) : (
            <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Safety buffer is adequate
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
