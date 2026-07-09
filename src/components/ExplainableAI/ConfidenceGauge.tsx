import { motion } from "motion/react";

interface ConfidenceGaugeProps {
  isDark: boolean;
  confidence: number; // 0-100
  verdict: "Authentic" | "Likely Fake";
}

export default function ConfidenceGauge({ isDark, confidence, verdict }: ConfidenceGaugeProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const isAuthentic = verdict === "Authentic";
  const ringColor = isAuthentic ? "stroke-emerald-500" : "stroke-cyber-blue";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Model Certainty</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Confidence Score &amp; Probability Distribution</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          The classifier&apos;s calibrated certainty in its verdict, alongside the underlying probability split across both outcome classes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full -rotate-90 origin-center [transform-box:fill-box]">
            <circle cx="80" cy="80" r={radius} className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="10" />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              className={`${ringColor} fill-none [filter:drop-shadow(0_0_8px_rgba(14,165,233,0.4))]`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - confidence / 100) }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="text-center">
            <div className="font-display font-bold text-3xl">{confidence.toFixed(1)}%</div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Confidence</div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-sans font-medium text-slate-600 dark:text-slate-300">Authentic</span>
              <span className="text-emerald-500 font-bold">{(isAuthentic ? confidence : 100 - confidence).toFixed(1)}%</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${isAuthentic ? confidence : 100 - confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-sans font-medium text-slate-600 dark:text-slate-300">Likely Fake</span>
              <span className="text-rose-500 font-bold">{(isAuthentic ? 100 - confidence : confidence).toFixed(1)}%</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${isAuthentic ? 100 - confidence : confidence}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                className="h-full rounded-full bg-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center">
        * Calibrated via temperature-scaled softmax over the fused ensemble logits.
      </div>
    </div>
  );
}
