import { motion } from "motion/react";
import { ShapFeature } from "../../types";

interface SHAPCardProps {
  isDark: boolean;
  features: ShapFeature[];
}

export default function SHAPCard({ isDark, features }: SHAPCardProps) {
  const maxAbs = Math.max(1, ...features.map((f) => Math.abs(f.impact)));

  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">SHAP Additive Attribution</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Feature Impact Breakdown</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Shapley values quantify how much each detected feature pushed the model&apos;s output toward <span className="text-rose-500 font-medium">Likely Fake</span> or <span className="text-emerald-500 font-medium">Authentic</span>.
        </p>
      </div>

      <div className="space-y-3 my-6">
        {features.map((f, i) => {
          const isPositive = f.impact >= 0;
          const widthPct = (Math.abs(f.impact) / maxAbs) * 50;
          return (
            <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs">
              <div className="relative h-6 flex items-center">
                <div className={`absolute left-1/2 top-0 bottom-0 w-px ${isDark ? "bg-white/10" : "bg-slate-300"}`} />
                <div className="relative w-1/2 h-full flex justify-end pr-px">
                  {!isPositive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                      className="h-full rounded-l bg-emerald-500/80"
                    />
                  )}
                </div>
                <div className="relative w-1/2 h-full flex justify-start pl-px">
                  {isPositive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                      className="h-full rounded-r bg-rose-500/80"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-[140px] justify-between">
                <span className="font-sans font-medium text-slate-600 dark:text-slate-300 truncate">{f.feature}</span>
                <span className={`font-mono font-bold shrink-0 ${isPositive ? "text-rose-500" : "text-emerald-500"}`}>
                  {isPositive ? "+" : ""}{f.impact.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>Supports Authentic</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>Supports Manipulation</span>
      </div>
    </div>
  );
}
