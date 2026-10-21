/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import BottomNavBar from './components/BottomNavBar';
import MarketOverview from './components/MarketOverview';
import ProductOpportunity from './components/ProductOpportunity';
import ImportSimulator from './components/ImportSimulator';
import PricingSimulator from './components/PricingSimulator';
import GeminiAssistant from './components/GeminiAssistant';
import { Landmark } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'overview':
        return <MarketOverview />;
      case 'opportunity':
        return <ProductOpportunity />;
      case 'import':
        return <ImportSimulator />;
      case 'pricing':
        return <PricingSimulator />;
      case 'assistant':
        return <GeminiAssistant />;
      default:
        return <MarketOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-24">
      {/* Executive Corporate Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-40 select-none">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F3864] flex items-center justify-center text-white shadow-sm">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#1F3864]">Aegis Distribution</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest -mt-0.5">Pilot Program</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            <span>SYS STATUS: ACTIVE</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Screen Content Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {renderActiveScreen()}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
