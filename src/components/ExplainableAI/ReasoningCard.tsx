import { motion } from "motion/react";
import { Brain, Sparkles } from "lucide-react";

interface ReasoningCardProps {
  isDark: boolean;
  explanation: string;
  steps: string[];
}

export default function ReasoningCard({ isDark, explanation, steps }: ReasoningCardProps) {
  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Chain-of-Evidence Reasoning</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">AI Reasoning Trace</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          The narrative synthesis the fused model produced while weighing each forensic signal toward its final verdict.
        </p>
      </div>

      <div className="space-y-4 my-4 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
        <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? "bg-slate-950/60" : "bg-slate-50"}`}>
          <Sparkles className="w-4 h-4 text-cyber-blue mt-0.5 shrink-0" />
          <p className="font-sans text-xs sm:text-sm font-light leading-relaxed">{explanation}</p>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                isDark ? "border-white/5 bg-slate-900/30" : "border-slate-200 bg-white"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-cyber-blue/10 text-cyber-blue text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="font-sans text-xs font-light leading-normal text-slate-600 dark:text-slate-300">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center flex items-center justify-center gap-1.5">
        <Brain className="w-3 h-3" />
        Reasoning trace generated post-hoc from ensemble attribution weights.
      </div>
    </div>
  );
}
