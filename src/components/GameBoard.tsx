/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameBoardProps {
  selectedNumbers: Set<number>;
  drawnNumbers: number[];
  isDrawing: boolean;
  onToggleNumber: (num: number) => void;
  maxSelections: number;
}

export default function GameBoard({
  selectedNumbers,
  drawnNumbers,
  isDrawing,
  onToggleNumber,
  maxSelections
}: GameBoardProps) {
  
  // Create array from 1 to 80
  const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
  
  // Convert drawnNumbers to a set for O(1) lookups
  const drawnSet = new Set(drawnNumbers);

  return (
    <div className="w-full max-w-md mx-auto px-4 select-none">
      <div className="grid grid-cols-8 gap-1.5 justify-center py-2" id="kenoBoard">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.has(num);
          const isDrawn = drawnSet.has(num);
          const isHit = isSelected && isDrawn;
          
          // Determine tile appearance states:
          let tileClass = "";
          let textClass = "font-display text-sm font-bold";
          let glowStyles: React.CSSProperties = {};
          
          if (isHit) {
            // Gold/Green HIT State — high contrast
            tileClass = "bg-[#10b981] border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.55)] text-[#0b1326] scale-[1.03] tile-pulse z-10";
            textClass += " font-extrabold";
          } else if (isDrawn && !isSelected) {
            // Unselected drawn state (Cyan/Blue neon indicator)
            tileClass = "bg-[#2d3449]/40 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]";
          } else if (isSelected && !isDrawn) {
            // Selected but not yet drawn state (Electric Blue highlighted state)
            tileClass = "bg-[#8ed5ff] border-[#8ed5ff] text-[#00354a] shadow-[0_0_12px_rgba(142,213,255,0.45)] font-semibold";
          } else {
            // Default unselected state
            tileClass = "bg-transparent border-[#3e484f]/40 text-[#dae2fd] hover:border-[#8ed5ff]/60 hover:bg-[#8ed5ff]/5 active:scale-95";
          }

          // Let's also display the position in sequence of DRAWN numbers (e.g. 1st drawn, 20th drawn)
          const drawIndex = drawnNumbers.indexOf(num);

          return (
            <motion.button
              key={num}
              id={`keno-tile-${num}`}
              onClick={() => {
                if (!isDrawing) {
                  onToggleNumber(num);
                }
              }}
              disabled={isDrawing}
              style={glowStyles}
              whileTap={!isDrawing ? { scale: 0.93 } : {}}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border transition-all duration-150 cursor-pointer ${tileClass}`}
            >
              {/* Outer expand rings when newly drawn */}
              {isDrawn && drawIndex === drawnNumbers.length - 1 && (
                <div className={`absolute inset-0 rounded-lg border-2 ${isHit ? 'border-[#10b981]' : 'border-[#38bdf8]'} draw-ring pointer-events-none`} />
              )}

              {/* Number centered */}
              <span className={textClass}>{num}</span>

              {/* Draw order index helper (tiny super-script at top-right for authentic draws) */}
              {isDrawn && (
                <span className={`absolute top-0.5 right-1 text-[8px] font-mono leading-none ${
                  isHit ? 'text-[#0b1326]/85 font-bold' : 'text-[#38bdf8]/70'
                }`}>
                  {drawIndex + 1}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
