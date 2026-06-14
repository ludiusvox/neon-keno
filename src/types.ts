/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  githubUrl: string;
}

export interface KenoRound {
  id: string; // unique round id
  timestamp: string; // format HH:MM:SS
  picked: number[]; // user's selected numbers (1-80)
  drawn: number[]; // drawn numbers by the game (1-80)
  hits: number[]; // matching numbers
  bet: number; // wager amount
  multiplier: number; // multiplier won
  payout: number; // amount paid out
  profit: number; // payout - bet
}

export interface KenoStats {
  totalRounds: number;
  totalBets: number;
  totalPayouts: number;
  maxWinMultiplier: number;
  netProfit: number;
}

export interface PaytableEntry {
  hits: number;
  multiplier: number;
}
