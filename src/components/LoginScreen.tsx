/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Github, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0b1326] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8ed5ff]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ddb7ff]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#131b2e]/50 backdrop-blur-2xl border border-[#3e484f]/30 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-[#8ed5ff]/10 border border-[#8ed5ff]/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(142,213,255,0.15)]">
            <Sparkles className="w-10 h-10 text-[#8ed5ff]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-black text-white tracking-tight">
              NEON <span className="text-[#8ed5ff]">KENO</span>
            </h1>
            <p className="text-[#bdc8d1] text-sm">
              The ultimate high-stakes digital lottery experience.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button
              onClick={onLogin}
              className="w-full bg-white text-[#0b1326] hover:bg-[#8ed5ff] transition-all duration-300 font-display font-bold py-4 rounded-2xl flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <Github className="w-6 h-6 transition-transform group-hover:rotate-12" />
              Sign in with GitHub
            </button>

            <p className="text-[10px] text-[#bdc8d1]/50 uppercase tracking-[0.2em]">
              Secure Authentication via GitHub OAuth
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-[#3e484f]/20">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-[#10b981]" />
              <span className="text-[10px] text-[#bdc8d1]">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-5 h-5 text-[#ffc42f]" />
              <span className="text-[10px] text-[#bdc8d1]">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 text-[#ddb7ff]" />
              <span className="text-[10px] text-[#bdc8d1]">Premium</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
