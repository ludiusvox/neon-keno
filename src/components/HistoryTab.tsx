/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KenoRound, KenoStats } from '../types';
import { History, Search, Calendar, ChevronRight, X, Info, TrendingUp, Sparkles } from 'lucide-react';

interface HistoryTabProps {
  history: KenoRound[];
  stats: KenoStats;
  onClearHistory: () => void;
}

export default function HistoryTab({ history, stats, onClearHistory }: HistoryTabProps) {
  const [inspectedRound, setInspectedRound] = useState<KenoRound | null>(null);

  // Simple statistics totals
  const averageWinMultiplier = stats.totalRounds > 0 
    ? (history.reduce((acc, r) => acc + r.multiplier, 0) / stats.totalRounds).toFixed(1)
    : '0.0';

  const hitSuccessRate = stats.totalRounds > 0
    ? ((history.filter(r => r.hits.length > 0).length / stats.totalRounds) * 100).toFixed(0)
    : '0';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4 text-[#dae2fd] select-none">
      {/* Quick Visual Performance Dashboard */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#131b2e] border border-[#3e484f]/25 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#bdc8d1]/60">Avg multiplier</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-display text-[#ddb7ff]">{averageWinMultiplier}x</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#ddb7ff]" />
          </div>
        </div>
        <div className="bg-[#131b2e] border border-[#3e484f]/25 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#bdc8d1]/60">Match Success Rate</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold font-display text-[#10b981]">{hitSuccessRate}%</span>
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
        </div>
      </div>

      {/* History Log Container */}
      <div className="bg-[#131b2e] border border-[#3e484f]/35 rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#3e484f]/25 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#8ed5ff]" />
            <h3 className="font-display font-bold text-sm text-white">Extract Logs</h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[10px] uppercase font-bold text-red-400 hover:underline"
            >
              Clear Logs
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#bdc8d1]/50 space-y-2">
            <History className="w-8 h-8 mx-auto stroke-[1.5] text-[#3e484f]" />
            <p>No extractions found in log.</p>
            <p className="text-[10px] text-[#bdc8d1]/30">Pick numbers and trigger DRAW to record.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
            {history.map((round) => {
              const isProfit = round.profit > 0;
              const isConsolation = round.profit === 0 && round.multiplier > 0; // like 10 selection 0 hits
              const isBreakEven = round.profit === 0 && !isConsolation;

              let profitClass = "text-red-400";
              let prefix = "";
              if (round.profit > 0) {
                profitClass = "text-[#10b981] font-bold";
                prefix = "+";
              } else if (isConsolation) {
                profitClass = "text-[#8ed5ff] font-bold";
                prefix = "=";
              } else if (isBreakEven) {
                profitClass = "text-white";
                prefix = "=";
              }

              return (
                <div
                  key={round.id}
                  onClick={() => setInspectedRound(round)}
                  className="bg-[#171f33]/50 border border-[#3e484f]/15 hover:border-[#8ed5ff]/40 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01] active:scale-99"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        Round {round.id.substring(0, 4)}
                      </span>
                      <span className="text-[9px] text-[#bdc8d1]/45 flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {round.timestamp}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#bdc8d1]/75">
                      Picks: <strong className="text-white">{round.picked.length}</strong> | Hits: <strong className="text-[#10b981]">{round.hits.length}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono space-y-0.5">
                      <div className={`text-xs ${profitClass}`}>
                        {prefix}${Math.abs(round.profit).toFixed(2)}
                      </div>
                      <div className="text-[9px] text-[#bdc8d1]/60">
                        {round.multiplier > 0 ? `${round.multiplier}x Payout` : 'No Match'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#3e484f]/80" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deep Match Inspector Modal */}
      {inspectedRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/90 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#131b2e] border border-[#3e484f]/50 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#3e484f]/25 pb-3">
              <div>
                <h3 className="font-display font-semibold text-sm text-white">
                  Round {inspectedRound.id.substring(0, 5)} Details
                </h3>
                <span className="text-[10px] text-[#bdc8d1]/50">Executed at {inspectedRound.timestamp}</span>
              </div>
              <button
                onClick={() => setInspectedRound(null)}
                className="text-[#bdc8d1] hover:text-white p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats on round */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#171f33] p-2.5 rounded-xl border border-[#3e484f]/20 font-mono">
              <div>
                <span className="text-[#bdc8d1]/65 text-[9px] block uppercase">Wagered</span>
                <span className="font-semibold text-white">${inspectedRound.bet.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#bdc8d1]/65 text-[9px] block uppercase">Multiplier</span>
                <span className="font-semibold text-[#ffc42f]">{inspectedRound.multiplier}x</span>
              </div>
              <div>
                <span className="text-[#bdc8d1]/65 text-[9px] block uppercase">Net Return</span>
                <span className={`font-semibold ${inspectedRound.profit >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                  {inspectedRound.profit >= 0 ? '+' : ''}${inspectedRound.profit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Micro Grid showing draw & picks */}
            <div>
              <span className="text-[10px] font-bold text-[#bdc8d1]/70 uppercase tracking-wide block mb-1.5 pl-1">
                Visual Hit Board (1 - 80)
              </span>
              <div className="grid grid-cols-10 gap-0.5 p-1 bg-[#0b1326] rounded-lg border border-[#3e484f]/25">
                {Array.from({ length: 80 }, (_, i) => i + 1).map((val) => {
                  const isUserPick = inspectedRound.picked.includes(val);
                  const isDrawn = inspectedRound.drawn.includes(val);

                  let blockClass = "bg-[#131b2e]/30 border-transparent";
                  if (isUserPick && isDrawn) {
                    // Match hit
                    blockClass = "bg-[#10b981] border-[#10b981]";
                  } else if (isUserPick) {
                    // Pick but missed matching
                    blockClass = "bg-[#8ed5ff] border-[#8ed5ff]";
                  } else if (isDrawn) {
                    // Drawn but missed user picks
                    blockClass = "bg-[#38bdf8]/40 border-[#38bdf8]";
                  }

                  return (
                    <div
                      key={val}
                      title={`Num ${val} - ${isUserPick ? 'Selected' : ''} ${isDrawn ? 'Drawn' : ''}`}
                      className={`aspect-square w-full rounded flex items-center justify-center text-[7px] font-bold border ${blockClass}`}
                    >
                      {isUserPick && isDrawn ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0b1326]" />
                      ) : (
                        <span className="opacity-90">{val}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#bdc8d1]/60 px-1 mt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#8ed5ff]" />
                  <span>Pick</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#38bdf8]/50" />
                  <span>Drawn</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#10b981]" />
                  <span>Hit Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
