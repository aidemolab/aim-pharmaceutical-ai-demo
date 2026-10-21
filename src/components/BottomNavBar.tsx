/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, Star, Package, DollarSign, MessageSquare } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunity', label: 'Opportunity', icon: Star },
    { id: 'import', label: 'Import', icon: Package },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'assistant', label: 'Assistant', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-xl z-50 select-none pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
                isActive ? 'text-[#2E75B6]' : 'text-[#1F3864] hover:text-[#2E75B6]'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide mt-0.5">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-[#2E75B6] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
