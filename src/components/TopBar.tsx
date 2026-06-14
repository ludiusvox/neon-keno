/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Settings, Volume2, VolumeX, RotateCcw, BarChart3, HelpCircle, X, Coins, Github, LogOut } from 'lucide-react';
import { KenoStats, User } from '../types';

interface TopBarProps {
  balance: number;
  stats: KenoStats;
  isMuted: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onToggleMute: () => void;
  onResetStats: () => void;
  onAddCredits: (amount: number) => void;
  onResetBalance: () => void;
}

export default function TopBar({
  balance,
  stats,
  isMuted,
  user,
  onLogin,
  onLogout,
  onToggleMute,
  onResetStats,
  onAddCredits,
  onResetBalance
}: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0b1326]/85 backdrop-blur-xl border-b border-[#3e484f]/35 shadow-[0_0_20px_rgba(123,208,255,0.08)] px-5 h-16 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          {/* Wallet action - prompt to top up or immediately trigger top-up */}
          <button
            onClick={() => onAddCredits(50)}
            className="flex items-center gap-2 text-[#8ed5ff] hover:bg-[#31394d]/40 rounded-full p-2.5 transition-all duration-200 active:scale-90 relative group"
            title="Top up $50 credits"
            id="btn-wallet"
          >
            <Wallet className="w-6 h-6" />
            <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all text-[10px] bg-brand-surface-light text-white px-2 py-0.5 rounded whitespace-nowrap border border-white/15">
              + $50 Free Credits
            </span>
          </button>

          {/* GitHub Login/User Profile */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-[#8ed5ff]/50"
              />
              <button
                onClick={onLogout}
                className="text-[#bdc8d1] hover:text-red-400 p-2 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 text-[#bdc8d1] hover:text-white hover:bg-[#31394d]/40 rounded-full px-3 py-1.5 ml-2 border border-[#3e484f]/30 transition-all duration-200 active:scale-90"
              title="Login with GitHub"
            >
              <Github className="w-5 h-5" />
              <span className="text-xs font-semibold hidden sm:inline">GitHub Login</span>
            </button>
          )}
        </div>

        {/* Liquid Gold/Neon Bankroll */}
        <div 
          onClick={() => setIsOpen(true)}
          className="font-display text-2xl font-bold text-[#8ed5ff] tracking-tight neon-text-glow cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Click to manage bankroll"
          id="btn-balance"
        >
          ${balance.toFixed(2)}
        </div>

        {/* Settings button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-[#bdc8d1] hover:bg-[#31394d]/40 hover:text-white rounded-full p-2.5 transition-all duration-200 active:scale-90"
          id="btn-settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Persistent Settings / Wallet Drawer (Glassmorphic Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#131b2e] border border-[#3e484f]/50 p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8ed5ff]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#ddb7ff]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#8ed5ff]" />
                Cabinet Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#bdc8d1] hover:text-white p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Audio and Quick Controls */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-[#bdc8d1]/60 tracking-wider">Sound & Volume</h4>
                <div className="flex items-center justify-between bg-[#171f33] p-3 rounded-xl border border-[#3e484f]/25">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#8ed5ff]" />}
                    Sound Effects
                  </span>
                  <button
                    onClick={onToggleMute}
                    className={`w-14 h-7 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      !isMuted ? 'bg-[#8ed5ff]' : 'bg-[#2d3449]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-[#131b2e] shadow-md transform duration-200 ${
                        !isMuted ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Bankroll Management */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-semibold text-[#bdc8d1]/60 tracking-wider">Bankroll Operations</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onAddCredits(100);
                      playSFX();
                    }}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#171f33] to-[#222a3d] hover:to-[#2d3449] border border-[#3e484f]/35 rounded-xl transition-all hover:scale-[1.02] active:scale-95 group text-center"
                  >
                    <Coins className="w-6 h-6 text-[#ffc42f] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-white">Add $100.00</span>
                    <span className="text-[10px] text-[#bdc8d1]/60">Free credits</span>
                  </button>

                  <button
                    onClick={() => {
                      onResetBalance();
                    }}
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#171f33] to-[#222a3d] hover:to-[#2d3449] border border-[#3e484f]/35 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-center"
                  >
                    <RotateCcw className="w-6 h-6 text-red-400 mb-1" />
                    <span className="text-xs font-semibold text-white">Reset Balance</span>
                    <span className="text-[10px] text-red-400/80">To $100.00</span>
                  </button>
                </div>
              </div>

              {/* Game Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-semibold text-[#bdc8d1]/60 tracking-wider flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-[#ddb7ff]" />
                    Tactical Statistics
                  </h4>
                  <button
                    onClick={onResetStats}
                    className="text-[10px] uppercase font-semibold text-[#8ed5ff] hover:underline"
                  >
                    Reset Stats
                  </button>
                </div>
                <div className="bg-[#171f33] p-4 rounded-xl border border-[#3e484f]/25 text-xs space-y-2.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#bdc8d1]">Rounds Played</span>
                    <span className="text-white font-semibold">{stats.totalRounds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bdc8d1]">Total Wagers</span>
                    <span className="text-white font-semibold">${stats.totalBets.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bdc8d1]">Total Returns</span>
                    <span className={`font-semibold ${stats.totalPayouts > 0 ? 'text-[#10b981]' : 'text-white'}`}>
                      ${stats.totalPayouts.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#3e484f]/20 pt-2 mt-1">
                    <span className="text-[#bdc8d1]">Net Position</span>
                    <span className={`font-semibold ${stats.netProfit >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                      {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#bdc8d1]">Max Multiplier</span>
                    <span className="text-[#ffc42f] font-semibold">{stats.maxWinMultiplier}x</span>
                  </div>
                </div>
              </div>

              {/* Rules Trigger */}
              <button
                onClick={() => setShowRules(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-[#8ed5ff]/25 text-[#8ed5ff] hover:bg-[#8ed5ff]/5 rounded-xl font-medium text-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                How to Play & RTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Explainer Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/90 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#131b2e] border border-[#3e484f]/50 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar relative">
            <div className="flex justify-between items-center border-b border-[#3e484f]/25 pb-3">
              <h3 className="font-display font-semibold text-lg text-white">How To Play Keno</h3>
              <button
                onClick={() => setShowRules(false)}
                className="text-[#bdc8d1] hover:text-white p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-[#bdc8d1] space-y-3 font-sans leading-relaxed">
              <p>
                Keno is an exciting virtual lottery-style game. Our custom cabinet features <strong className="text-[#8ed5ff]">80 numbers</strong> on a digital grid:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs">
                <li>
                  <strong className="text-white">Choose your Numbers:</strong> Select between <strong className="text-[#8ed5ff]">1 and 10 numbers</strong> on the game grid. Selecting more numbers increases both the volatility and potential payout.
                </li>
                <li>
                  <strong className="text-white">Wager Size:</strong> Adjust your bet amount using the <strong className="text-white">-</strong> and <strong className="text-white">+</strong> controls. Wagers range from $1 to $100.
                </li>
                <li>
                  <strong className="text-white">Select Turbo:</strong> Enable <strong className="text-[#8ed5ff]">Turbo Mode</strong> for instantaneous drawing speeds, or leave it off to watch the numbers land under a digital ticker!
                </li>
                <li>
                  <strong className="text-white">Execute Draw:</strong> Click <strong className="text-[#ffc42f]">DRAW</strong>. The system will randomly extract <strong className="text-white">20 winning balls</strong> from 1 to 80.
                </li>
                <li>
                  <strong className="text-white">Match & Cash:</strong> Matches between your numbers and the drawn balls are called <strong className="text-[#10b981]">Hits</strong>. Match multipliers are rewarded as per the dynamic Paytable.
                </li>
              </ol>

              <div className="bg-[#171f33] p-3 rounded-xl border border-[#3e484f]/25 space-y-1 text-xs">
                <span className="font-display font-semibold text-white block">Jackpot Highlights:</span>
                <p>🚀 Pick 10 offers a grand payout of <strong className="text-[#ffc42f]">20,000x</strong> for getting all 10 hits!</p>
                <p>⭐️ Pick 10 also pays <strong className="text-[#ddb7ff]">2x consolation prize</strong> if you get <strong className="text-white">0 hits</strong>!</p>
              </div>

              <p className="text-xs text-white/50 text-center font-mono pt-2">
                Simulated payouts | Theoretical RTP 96.5% | No real money needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function playSFX() {
    // Standard audio context safety trigger
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const temp = new AudioContextClass();
        const o = temp.createOscillator();
        const g = temp.createGain();
        o.connect(g);
        g.connect(temp.destination);
        o.frequency.setValueAtTime(440, temp.currentTime);
        g.gain.setValueAtTime(0.01, temp.currentTime);
        o.start();
        o.stop(temp.currentTime + 0.05);
      }
    } catch (e) {}
  }
}
