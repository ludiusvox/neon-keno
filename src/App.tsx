/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  History as HistoryIcon,
  Grid, 
  Trash2, 
  Sparkles, 
  Plus, 
  Minus, 
  Zap, 
  Trophy, 
  Flame, 
  AlertCircle,
  Undo
} from 'lucide-react';

import TopBar from './components/TopBar';
import GameBoard from './components/GameBoard';
import PaytableTab from './components/PaytableTab';
import HistoryTab from './components/HistoryTab';

import { KenoRound, KenoStats, User } from './types';
import { playClick, playDraw, playWinResult, setMutedState, getMutedState } from './utils/audio';
import { getPayoutMultiplier } from './utils/paytables';

// Local storage key constants
const KEY_BALANCE = 'keno_bankroll_balance';
const KEY_HISTORY = 'keno_history_logs_v1';
const KEY_STATS = 'keno_cumulative_stats_v1';
const KEY_MUTED = 'keno_muted_state';
const KEY_USER = 'keno_user_profile';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export default function App() {
  // Navigation: 'play' | 'history' | 'paytable'
  const [activeTab, setActiveTab] = useState<'play' | 'history' | 'paytable'>('play');

  // --- USER STATE ---
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // --- CORE GAME STATES ---
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(KEY_BALANCE);
    return saved ? parseFloat(saved) : 100.00;
  });

  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [bet, setBet] = useState<number>(1);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(KEY_MUTED);
    if (saved !== null) {
      const mute = saved === 'true';
      setMutedState(mute);
      return mute;
    }
    return false;
  });

  const [history, setHistory] = useState<KenoRound[]>(() => {
    const saved = localStorage.getItem(KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<KenoStats>(() => {
    const saved = localStorage.getItem(KEY_STATS);
    return saved ? JSON.parse(saved) : {
      totalRounds: 0,
      totalBets: 0,
      totalPayouts: 0,
      maxWinMultiplier: 0,
      netProfit: 0
    };
  });

  // --- CELEBRATION FEEDBACK STATES ---
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    multiplier: number;
    payout: number;
    hits: number;
  } | null>(null);

  // --- TOAST NOTIFICATIONS ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Ref to track sequential draw timer
  const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize storage
  useEffect(() => {
    localStorage.setItem(KEY_BALANCE, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(KEY_MUTED, isMuted.toString());
    setMutedState(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY_USER);
    }
  }, [user]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    };
  }, []);

  // --- AUTH HANDLERS ---
  const handleLogin = () => {
    playClick();
    // Simulate GitHub OAuth flow
    triggerToast("Connecting to GitHub...", "info");

    setTimeout(() => {
      const mockUser: User = {
        id: '12345',
        name: 'Neon Player',
        avatarUrl: 'https://github.com/identicons/neon.png',
        githubUrl: 'https://github.com/ludiusvox'
      };
      setUser(mockUser);
      triggerToast(`Welcome back, ${mockUser.name}!`, "success");
    }, 1500);
  };

  const handleLogout = () => {
    playClick();
    setUser(null);
    triggerToast("Logged out successfully.", "info");
  };

  // Custom Toast trigger
  const triggerToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Sound play helper
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    playClick();
  };

  // Tile Selection Toggle
  const handleToggleNumber = (num: number) => {
    if (isDrawing) return;
    
    // Auto shift to play tab if clicking board in other tabs
    if (activeTab !== 'play') {
      setActiveTab('play');
    }

    const next = new Set(selectedNumbers);
    if (next.has(num)) {
      next.delete(num);
      playClick();
      setSelectedNumbers(next);
    } else {
      if (next.size < 10) {
        next.add(num);
        playClick();
        setSelectedNumbers(next);
      } else {
        // Feedback if exceeding max 10
        triggerToast("Maximum of 10 selections permitted!", "error");
        // Trigger tile specific shake feedback
        const el = document.getElementById(`keno-tile-${num}`);
        if (el) {
          el.classList.add('animate-shake');
          setTimeout(() => el.classList.remove('animate-shake'), 400);
        }
      }
    }
  };

  // Clear selections
  const handleClear = () => {
    if (isDrawing) return;
    playClick();
    setSelectedNumbers(new Set());
    setDrawnNumbers([]);
    setShowCelebration(false);
  };

  // Generate Auto-10 Random Selections (Quick Pick)
  const handleQuickPick = () => {
    if (isDrawing) return;
    playClick();
    
    // Choose 10 random numbers uniformly from 1 to 80
    const pool = Array.from({ length: 80 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picks = pool.slice(0, 10);
    setSelectedNumbers(new Set(picks));
    setDrawnNumbers([]);
    setShowCelebration(false);
    triggerToast("Quick Pick: 10 numbers randomly chosen!", "success");
  };

  // Bet Increments
  const increaseBet = () => {
    if (isDrawing) return;
    playClick();
    setBet((prev) => {
      let next = prev;
      if (prev < 5) next = prev + 1;
      else if (prev < 20) next = prev + 2;
      else if (prev < 50) next = prev + 5;
      else if (prev < 100) next = prev + 10;
      return Math.min(next, 100);
    });
  };

  const decreaseBet = () => {
    if (isDrawing) return;
    playClick();
    setBet((prev) => {
      let next = prev;
      if (prev <= 5) next = prev - 1;
      else if (prev <= 20) next = prev - 2;
      else if (prev <= 50) next = prev - 5;
      else next = prev - 10;
      return Math.max(next, 1);
    });
  };

  // Free Credit Replenish
  const handleAddCredits = (amount: number) => {
    setBalance((prev) => prev + amount);
    triggerToast(`Replenished account with $${amount.toFixed(2)} in free credits!`, "success");
  };

  const handleResetBalance = () => {
    setBalance(100.00);
    triggerToast("Bankroll balance reset to $100.00!", "info");
  };

  const handleResetStats = () => {
    setStats({
      totalRounds: 0,
      totalBets: 0,
      totalPayouts: 0,
      maxWinMultiplier: 0,
      netProfit: 0
    });
    triggerToast("Game statistics reset!", "info");
  };

  const handleClearHistory = () => {
    setHistory([]);
    triggerToast("Round history logs cleared!", "info");
  };

  // Trigger Draw Sequence
  const handleDraw = () => {
    if (isDrawing) return;

    // Direct user validation checks
    if (selectedNumbers.size === 0) {
      triggerToast("Minimum of 1 selection required to start extraction!", "error");
      return;
    }

    if (balance < bet) {
      triggerToast("Insufficient budget! Hit the Wallet header block to acquire free credits.", "error");
      // Flash balance
      const balEl = document.getElementById('btn-balance');
      if (balEl) {
        balEl.classList.add('text-red-400');
        setTimeout(() => balEl.classList.remove('text-red-400'), 1000);
      }
      return;
    }

    // Deduct wager
    setBalance((prev) => prev - bet);
    setIsDrawing(true);
    setDrawnNumbers([]);
    setShowCelebration(false);
    setCelebrationDetails(null);

    // Swap to Play tab to watch draw if currently elsewhere
    if (activeTab !== 'play') {
      setActiveTab('play');
    }

    // Durstenfeld Shuffle to generate 20 perfectly unique balls
    const pool = Array.from({ length: 80 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const targetDraws = pool.slice(0, 20);

    // Sequential Extraction timing params
    const drawDelay = isTurbo ? 35 : 220;
    let drawIndex = 0;
    const currentMatches: number[] = [];

    const drawNextBall = () => {
      if (drawIndex >= 20) {
        // --- DRAW SETTLED ---
        const finalHits = targetDraws.filter(num => selectedNumbers.has(num));
        const multiplier = getPayoutMultiplier(selectedNumbers.size, finalHits.length);
        const payout = multiplier * bet;
        const profit = payout - bet;

        // Apply payouts
        if (payout > 0) {
          setBalance((prev) => prev + payout);
        }

        // Add round to logs
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newRound: KenoRound = {
          id: (Math.floor(Math.random() * 90000) + 10000).toString(),
          timestamp,
          picked: Array.from(selectedNumbers),
          drawn: targetDraws,
          hits: finalHits,
          bet,
          multiplier,
          payout,
          profit
        };

        setHistory((prev) => [newRound, ...prev]);

        // Accumulate statistics
        setStats((prev) => ({
          totalRounds: prev.totalRounds + 1,
          totalBets: prev.totalBets + bet,
          totalPayouts: prev.totalPayouts + payout,
          maxWinMultiplier: Math.max(prev.maxWinMultiplier, multiplier),
          netProfit: prev.netProfit + profit
        }));

        // Celebrations & Sound synthesis
        playWinResult(multiplier);
        
        setCelebrationDetails({
          multiplier,
          payout,
          hits: finalHits.length
        });
        setShowCelebration(true);
        setIsDrawing(false);
        return;
      }

      const nextBall = targetDraws[drawIndex];
      const isHit = selectedNumbers.has(nextBall);
      if (isHit) {
        currentMatches.push(nextBall);
      }

      // Add to sequence list
      setDrawnNumbers((prev) => [...prev, nextBall]);
      
      // Synthesize beep
      playDraw(isHit);

      drawIndex++;
      drawIntervalRef.current = setTimeout(drawNextBall, drawDelay);
    };

    // Trigger timer chain
    drawIntervalRef.current = setTimeout(drawNextBall, drawDelay);
  };

  // Live hits math count
  const activeHitsCount = drawnNumbers.filter(n => selectedNumbers.has(n)).length;

  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd] font-sans flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Top Header */}
      <TopBar 
        balance={balance}
        stats={stats}
        isMuted={isMuted}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleMute={handleToggleMute}
        onResetStats={handleResetStats}
        onAddCredits={handleAddCredits}
        onResetBalance={handleResetBalance}
      />

      {/* DESKTOP SIDEBAR NAVIGATION (Hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#171f33] border-r border-[#3e484f]/25 p-4 pt-24 gap-3 z-40 fixed left-0 top-0 bottom-0">
        <div className="font-display font-semibold text-xs tracking-wider text-[#bdc8d1]/50 uppercase px-3 pb-2 mb-2 border-b border-[#3e484f]/15">
          Main Console
        </div>
        <button
          onClick={() => setActiveTab('play')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left ${
            activeTab === 'play'
              ? 'bg-[#8ed5ff]/10 border border-[#8ed5ff]/40 text-[#8ed5ff] font-bold shadow-[0_0_12px_rgba(142,213,255,0.08)]'
              : 'text-[#bdc8d1] border border-transparent hover:bg-[#31394d]/25 hover:text-white'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Play Cabinet
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left ${
            activeTab === 'history'
              ? 'bg-[#8ed5ff]/10 border border-[#8ed5ff]/40 text-[#8ed5ff] font-bold shadow-[0_0_12px_rgba(142,213,255,0.08)]'
              : 'text-[#bdc8d1] border border-transparent hover:bg-[#31394d]/25 hover:text-white'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          Extraction Logs
        </button>
        <button
          onClick={() => setActiveTab('paytable')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left ${
            activeTab === 'paytable'
              ? 'bg-[#8ed5ff]/10 border border-[#8ed5ff]/40 text-[#8ed5ff] font-bold shadow-[0_0_12px_rgba(142,213,255,0.08)]'
              : 'text-[#bdc8d1] border border-transparent hover:bg-[#31394d]/25 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          Paytables
        </button>

        <div className="mt-auto p-4 bg-[#0b1326]/60 border border-[#3e484f]/25 rounded-2xl flex flex-col items-center text-center gap-2">
          <Trophy className="w-8 h-8 text-[#ffc42f]" />
          <div>
            <span className="text-[10px] text-[#bdc8d1]/60 uppercase font-mono">Max Multiplier</span>
            <span className="block text-lg font-bold font-display text-white">{stats.maxWinMultiplier}x</span>
          </div>
        </div>
      </aside>

      {/* Main Container Core */}
      <main className="flex-1 flex flex-col md:pl-64 min-h-screen pt-20 pb-[280px]">
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          
          {/* Active Drawing Stats Banner (floating above board) */}
          {isDrawing && (
            <div className="mx-4 mb-2 bg-[#38bdf8]/10 border border-[#38bdf8]/35 p-3 rounded-2xl text-center flex flex-col items-center justify-center gap-1">
              <span className="text-[11px] uppercase tracking-widest font-mono text-[#38bdf8] flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                Drawn {drawnNumbers.length} / 20 Balls
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white text-xs">Hits Extracted:</span>
                <span className="bg-[#10b981] text-[#0b1326] px-2.5 py-0.5 rounded-full font-bold text-xs shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  {activeHitsCount} Hits
                </span>
              </div>
            </div>
          )}

          {/* CELEBRATION DISPLAYS (WIN / LOSS BANNERS) */}
          <AnimatePresence>
            {showCelebration && celebrationDetails && activeTab === 'play' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mx-4 mb-3"
              >
                {celebrationDetails.multiplier > 0 ? (
                  <div className={`border rounded-2xl p-4 relative overflow-hidden flex flex-col items-center text-center shadow-xl ${
                    celebrationDetails.multiplier >= 15 
                      ? 'bg-gradient-to-br from-[#131b2e] to-[#ffc42f]/10 border-[#ffc42f] shadow-[0_0_20px_rgba(255,196,47,0.25)]'
                      : 'bg-[#10b981]/10 border-[#10b981]/35 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}>
                    {/* Golden sparkles */}
                    {celebrationDetails.multiplier >= 15 && (
                      <Flame className="w-8 h-8 text-[#ffc42f] mb-1 animate-bounce" />
                    )}
                    
                    <span className="text-xs uppercase font-bold tracking-widest text-[#bdc8d1]/80">
                      {celebrationDetails.multiplier >= 15 ? '🔥 JACKPOT CHIME!' : '🎉 WE HAVE HITS!'}
                    </span>

                    <h4 className={`text-xl font-display font-extrabold mt-1 tracking-tight ${
                      celebrationDetails.multiplier >= 15 ? 'text-[#ffc42f] neon-text-glow-gold' : 'text-[#10b981] neon-text-glow-success'
                    }`}>
                      {celebrationDetails.multiplier >= 15 ? 'BIG WINNING OUTCOME' : 'PAID OUT'}
                    </h4>

                    <p className="text-sm mt-1.5 text-[#bdc8d1]">
                      Matched <strong className="text-white">{celebrationDetails.hits}</strong> of <strong className="text-[#8ed5ff]">{selectedNumbers.size} picks</strong>, returning a colossal wagers payout of:
                    </p>

                    <div className={`text-3xl font-mono font-bold mt-2 ${
                      celebrationDetails.multiplier >= 15 ? 'text-[#ffc42f] neon-text-glow-gold' : 'text-[#10b981]'
                    }`}>
                      +${celebrationDetails.payout.toFixed(2)}
                    </div>
                    
                    <span className="text-[10px] font-mono text-[#bdc8d1]/50 mt-1 uppercase">
                      ({celebrationDetails.multiplier}x Multiplier multiplier)
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#222a3d]/45 border border-[#3e484f]/25 rounded-2xl p-4 text-center">
                    <span className="text-xs uppercase font-semibold text-[#bdc8d1]/60 tracking-wider">No matching multiplier</span>
                    <p className="text-xs text-[#bdc8d1] mt-1">
                      Matched {celebrationDetails.hits} of {selectedNumbers.size} picks. Good luck on the next extraction!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SWITCH VIEW CONTROLLER */}
          <div className="flex-1 flex flex-col justify-center">
            {activeTab === 'play' && (
              <GameBoard 
                selectedNumbers={selectedNumbers}
                drawnNumbers={drawnNumbers}
                isDrawing={isDrawing}
                onToggleNumber={handleToggleNumber}
                maxSelections={10}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab 
                history={history}
                stats={stats}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'paytable' && (
              <PaytableTab 
                currentPicksCount={selectedNumbers.size}
                activeHitsCount={activeHitsCount}
                betAmount={bet}
                isDrawing={isDrawing}
              />
            )}
          </div>

        </div>
      </main>

      {/* CONTROL UNIT - STICKY GLASS BOTTOM PANEL */}
      <section className="fixed bottom-[72px] md:bottom-0 md:left-64 left-0 right-0 z-40 glass-panel rounded-t-3xl border-t border-[#3e484f]/40 p-4 pb-6 shadow-[0_-12px_420px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          
          {/* Row 1: Active Picks + Turbo controls */}
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-[#bdc8d1]">
              <div className={`w-2 h-2 rounded-full ${selectedNumbers.size > 0 ? 'bg-[#8ed5ff] animate-pulse shadow-[0_0_6px_#8ed5ff]' : 'bg-[#3e484f]'}`} />
              <span className={`text-xs font-semibold ${selectedNumbers.size > 0 ? 'text-[#8ed5ff]' : 'text-[#bdc8d1]/60'}`}>
                {selectedNumbers.size}/10 Numbers Selected
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#bdc8d1]/70">Turbo</span>
              <button
                disabled={isDrawing}
                onClick={() => {
                  playClick();
                  setIsTurbo(!isTurbo);
                }}
                className={`w-12 h-6.5 rounded-full p-0.5 border transition-all relative ${
                  isTurbo 
                    ? 'bg-[#8ed5ff] border-[#8ed5ff]' 
                    : 'bg-[#171f33] border-[#3e484f]/50'
                }`}
              >
                <div 
                  className={`w-5.5 h-5.5 rounded-full shadow-md flex items-center justify-center transition-transform duration-200 ${
                    isTurbo 
                      ? 'translate-x-5.5 bg-[#0b1326]' 
                      : 'translate-x-0 bg-[#bdc8d1]'
                  }`}
                >
                  <Zap className={`w-3 h-3 ${isTurbo ? 'text-[#8ed5ff] fill-current' : 'text-[#171f33]'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Row 2: Increments Adjusters + Actions */}
          <div className="flex items-center gap-3">
            
            {/* Bet Multipliers controls */}
            <div className="flex items-center bg-[#171f33] rounded-2xl border border-[#3e484f]/40 p-1.5 shadow-inner">
              <button
                disabled={isDrawing || bet <= 1}
                onClick={decreaseBet}
                className="w-9 h-9 flex items-center justify-center text-[#bdc8d1] hover:text-white hover:bg-[#31394d]/40 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="w-14 text-center font-display font-bold text-base text-white">
                ${bet}
              </div>

              <button
                disabled={isDrawing || bet >= 100 || bet >= balance}
                onClick={increaseBet}
                className="w-9 h-9 flex items-center justify-center text-[#8ed5ff] hover:text-white hover:bg-[#31394d]/40 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Clear Board Action */}
            <button
              disabled={isDrawing || selectedNumbers.size === 0}
              onClick={handleClear}
              className="h-12 w-12 flex items-center justify-center border border-[#3e484f]/40 hover:border-[#ffb4ab]/40 rounded-2xl text-[#bdc8d1] hover:text-red-400 hover:bg-red-500/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent duration-150"
              title="Clear Board Selections"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Auto Pick 10 Action */}
            <button
              disabled={isDrawing}
              onClick={handleQuickPick}
              className="h-12 px-3 flex items-center justify-center gap-1.5 border border-[#8ed5ff]/40 hover:border-[#8ed5ff] rounded-2xl text-[#8ed5ff] hover:bg-[#8ed5ff]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent font-medium text-xs duration-150"
              title="Quick pick 10 numbers randomly"
            >
              <Sparkles className="w-4 h-4 text-[#8ed5ff]" />
              Quick 10
            </button>

            {/* DRAW ACTION BUTTON (Grand marquee trigger) */}
            <button
              disabled={isDrawing}
              onClick={handleDraw}
              className={`flex-1 h-12 rounded-2xl font-display font-black text-sm text-[#402d00] tracking-wider relative overflow-hidden transition-all duration-150 shadow-[0_0_20px_rgba(255,196,47,0.25)] ${
                isDrawing
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-600 text-gray-400 cursor-not-allowed shadow-none'
                  : selectedNumbers.size === 0
                  ? 'bg-gradient-to-r from-[#e1a800]/50 to-[#ffdf9f]/50 text-white/50 border border-transparent'
                  : 'bg-gradient-to-r from-[#ffc42f] to-[#f9bd22] active:scale-97 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(255,196,47,0.4)]'
              }`}
            >
              {isDrawing ? (
                <span className="flex items-center justify-center gap-1.5">
                  DRAWING...
                </span>
              ) : selectedNumbers.size === 0 ? (
                "PICK NUMBERS"
              ) : (
                "DRAW WAGER"
              )}
            </button>
          </div>

        </div>
      </section>

      {/* TOAST PANEL (Renders elegant state messages on bottom margin) */}
      <div className="fixed bottom-36 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm mx-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border shadow-lg flex items-center gap-2.5 pointer-events-auto text-xs ${
                toast.type === 'error'
                  ? 'bg-red-950/95 border-red-800 text-red-200'
                  : toast.type === 'success'
                  ? 'bg-[#10b981]/95 border-[#10b981] text-[#0b1326] font-bold'
                  : 'bg-[#131b2e]/95 border-[#3e484f] text-[#dae2fd]'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3 bg-[#060e20]/95 backdrop-blur-2xl border-t border-[#3e484f]/25 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] md:hidden">
        
        {/* Play Column */}
        <button
          onClick={() => {
            playClick();
            setActiveTab('play');
          }}
          className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
            activeTab === 'play'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.2)] font-bold'
              : 'text-[#bdc8d1] opacity-75 hover:text-[#38bdf8]'
          }`}
        >
          <Play className="w-5 h-5" />
          <span className="font-display text-[10px] tracking-wide mt-1">Play</span>
        </button>

        {/* History Column */}
        <button
          onClick={() => {
            playClick();
            setActiveTab('history');
          }}
          className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
            activeTab === 'history'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.2)] font-bold'
              : 'text-[#bdc8d1] opacity-75 hover:text-[#38bdf8]'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="font-display text-[10px] tracking-wide mt-1">History</span>
        </button>

        {/* Paytable Column */}
        <button
          onClick={() => {
            playClick();
            setActiveTab('paytable');
          }}
          className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
            activeTab === 'paytable'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.2)] font-bold'
              : 'text-[#bdc8d1] opacity-75 hover:text-[#38bdf8]'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="font-display text-[10px] tracking-wide mt-1">Paytable</span>
        </button>

      </nav>
    </div>
  );
}
