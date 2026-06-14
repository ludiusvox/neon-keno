/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaytableEntry } from "../types";

// Standard, realistic, high-RTP (Return-To-Player) Keno Paytables for Selects 1 to 10
export const PAYTABLE_MAP: Record<number, PaytableEntry[]> = {
  1: [
    { hits: 1, multiplier: 3 },
  ],
  2: [
    { hits: 1, multiplier: 1 },
    { hits: 2, multiplier: 9 },
  ],
  3: [
    { hits: 2, multiplier: 2 },
    { hits: 3, multiplier: 16 },
  ],
  4: [
    { hits: 2, multiplier: 1 },
    { hits: 3, multiplier: 4 },
    { hits: 4, multiplier: 55 },
  ],
  5: [
    { hits: 2, multiplier: 1 },
    { hits: 3, multiplier: 2 },
    { hits: 4, multiplier: 15 },
    { hits: 5, multiplier: 250 },
  ],
  6: [
    { hits: 3, multiplier: 2 },
    { hits: 4, multiplier: 5 },
    { hits: 5, multiplier: 75 },
    { hits: 6, multiplier: 1000 },
  ],
  7: [
    { hits: 3, multiplier: 1 },
    { hits: 4, multiplier: 3 },
    { hits: 5, multiplier: 12 },
    { hits: 6, multiplier: 125 },
    { hits: 7, multiplier: 3500 },
  ],
  8: [
    { hits: 4, multiplier: 2 },
    { hits: 5, multiplier: 7 },
    { hits: 6, multiplier: 40 },
    { hits: 7, multiplier: 450 },
    { hits: 8, multiplier: 8000 },
  ],
  9: [
    { hits: 4, multiplier: 1 },
    { hits: 5, multiplier: 4 },
    { hits: 6, multiplier: 20 },
    { hits: 7, multiplier: 150 },
    { hits: 8, multiplier: 1500 },
    { hits: 9, multiplier: 15000 },
  ],
  10: [
    { hits: 0, multiplier: 2 }, // Classic 10-pick consolation prize! Getting nothing is hard!
    { hits: 5, multiplier: 3 },
    { hits: 6, multiplier: 18 },
    { hits: 7, multiplier: 95 },
    { hits: 8, multiplier: 600 },
    { hits: 9, multiplier: 3000 },
    { hits: 10, multiplier: 20000 },
  ],
};

/**
 * Calculates the payout multiplier given how many numbers were picked and how many hitted.
 */
export function getPayoutMultiplier(pickedCount: number, hitCount: number): number {
  const entries = PAYTABLE_MAP[pickedCount];
  if (!entries) return 0;
  
  const match = entries.find(e => e.hits === hitCount);
  return match ? match.multiplier : 0;
}
