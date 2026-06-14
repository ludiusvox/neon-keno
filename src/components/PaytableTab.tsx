/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PAYTABLE_MAP } from '../utils/paytables';
import { Trophy, HelpCircle, Eye, Calculator } from 'lucide-react';

interface PaytableTabProps {
  currentPicksCount: number;
  activeHitsCount: number;
  betAmount: number;
  isDrawing: boolean;
}

export default function PaytableTab({
  currentPicksCount,
  activeHitsCount,
  betAmount,
  isDrawing
}: PaytableTabProps) {
  // Allow inspecting other pick quantities (1 to 10)
  const [selectedPicksTab, setSelectedPicksTab] = useState<number>(10);

  // Sync state with active selections, but don't force change if drawing
  useEffect(() => {
    if (currentPicksCount > 0 && currentPicksCount <= 10) {
      setSelectedPicksTab(currentPicksCount);
    }
  }, [currentPicksCount]);

  const activePicks = selectedPicksTab;
  const paytableEntries = PAYTABLE_MAP[activePicks] || [];
  
  // Sort entries by hit count ascending
  const sortedEntries = [...paytableEntries].sort((a, b) => a.hits - b.hits);
  
  // We can also fill in the blanks (e.g., hits from 0 up to activePicks) so the table is extremely comprehensive
  const completeRows = Array.from({ length: activePicks + 1 }, (_, hitVal) => {
    const matchedMultiplier = sortedEntries.find(e => e.hits === hitVal)?.multiplier || 0;
    return {
      hits: hitVal,
      multiplier: matchedMultiplier,
      payout: matchedMultiplier * betAmount
    };
  });

  const isCurrentSelectionView = currentPicksCount === activePicks;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4 text-[#dae2fd] select-none">
      {/* Selector pills 1..10 to browse structures */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#bdc8d1]/65 pl-1 block">
          Analyze Paytables (Picks 1 to 10)
        </label>
        <div className="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
            const isActive = val === activePicks;
            const isUserSelection = val === currentPicksCount;
            return (
              <button
                key={val}
                disabled={isDrawing}
                onClick={() => setSelectedPicksTab(val)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold font-display border transition-all ${
                  isActive
                    ? 'bg-[#8ed5ff] text-[#00354a] border-[#8ed5ff] shadow-[0_0_10px_rgba(142,213,255,0.3)]'
                    : isUserSelection
                    ? 'bg-[#8ed5ff]/10 text-[#8ed5ff] border-[#8ed5ff]/40'
                    : 'bg-[#171f33]/60 text-[#bdc8d1] border-[#3e484f]/20 hover:border-[#8ed5ff]/30'
                }`}
              >
                Pick {val}
                {isUserSelection && (
                  <span className="ml-1 text-[9px] bg-[#8ed5ff] text-[#00354a] px-1 rounded-full font-sans">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paytable Grid Card */}
      <div className="bg-[#131b2e] border border-[#3e484f]/35 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-[#3e484f]/25 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffc42f]" />
            <h3 className="font-display font-bold text-sm text-white">
              Payouts for Pick {activePicks}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#bdc8d1]/70 bg-[#2d3449]/40 px-2.5 py-1 rounded-full font-mono">
            <Calculator className="w-3 h-3 text-[#8ed5ff]" />
            Wager: ${betAmount.toFixed(2)}
          </div>
        </div>

        {/* Display Info if viewing active selections */}
        {isCurrentSelectionView ? (
          <div className="text-[11px] text-[#8ed5ff]/80 bg-[#8ed5ff]/5 border border-[#8ed5ff]/15 px-3 py-2 rounded-xl mb-3 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 flex-shrink-0 text-[#8ed5ff]" />
            <span>
              This matches your active selection of <strong>{currentPicksCount}</strong> picks. Multiplier values adjust dynamically.
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[#ddb7ff]/80 bg-[#ddb7ff]/5 border border-[#ddb7ff]/15 px-3 py-2 rounded-xl mb-3 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 flex-shrink-0 text-[#ddb7ff]" />
            <span>
              You are exploring the Pick {activePicks} paytable. Click <strong>Pick {currentPicksCount || 10}</strong> to return to your current pool.
            </span>
          </div>
        )}

        {/* List of complete hits with columns */}
        <div className="space-y-1 pb-1">
          <div className="grid grid-cols-3 text-[11px] uppercase font-bold tracking-wider text-[#bdc8d1]/50 px-3 py-1 font-display">
            <span>Hits Matched</span>
            <span className="text-center">Multiplier</span>
            <span className="text-right">Payout Realized</span>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
            {completeRows.map((row) => {
              // Row highlighting conditions:
              // 1. Is this row representing the ACTIVE hits of the current drawing?
              const isUserActiveHits = isDrawing && isCurrentSelectionView && activeHitsCount === row.hits;
              // 2. Does this row have a winning multiplier?
              const hasPayoutValue = row.multiplier > 0;

              let bgClass = "bg-[#171f33]/40 border-transparent";
              let textHitsColor = "text-white/80";
              let textMultColor = "text-[#bdc8d1]";
              let textPayoutColor = "text-[#bdc8d1]";
              
              if (isUserActiveHits) {
                // Flash neon highlight for active drawing hits
                bgClass = "bg-[#10b981]/20 border-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-[1.01]";
                textHitsColor = "text-[#10b981] font-bold";
                textMultColor = "text-[#10b981] font-bold";
                textPayoutColor = "text-[#10b981] font-bold";
              } else if (hasPayoutValue) {
                bgClass = "bg-[#222a3d]/45 border-[#3e484f]/20";
                textHitsColor = "text-white font-medium";
                textMultColor = "text-[#ffc42f] font-semibold";
                textPayoutColor = "text-white/90";
              }

              return (
                <div
                  key={row.hits}
                  className={`grid grid-cols-3 text-xs items-center px-3 py-2.5 rounded-xl border transition-all duration-150 ${bgClass}`}
                >
                  <span className={`font-mono flex items-center gap-1.5 ${textHitsColor}`}>
                    {row.hits} / {activePicks}
                    {isUserActiveHits && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                    )}
                  </span>
                  
                  <span className={`text-center font-display font-semibold ${textMultColor}`}>
                    {row.multiplier > 0 ? `${row.multiplier}x` : '-'}
                  </span>

                  <span className={`text-right font-semibold font-mono ${textPayoutColor}`}>
                    {row.multiplier > 0 ? `$${row.payout.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
