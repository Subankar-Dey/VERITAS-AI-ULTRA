import { motion } from "motion/react";

interface RiskMeterProps {
  isDark: boolean;
  riskMeter: number; // 0-100
  riskLevel: "Low" | "Medium" | "High";
}

export default function RiskMeter({ isDark, riskMeter, riskLevel }: RiskMeterProps) {
  const riskColor = riskLevel === "High" ? "text-rose-500" : riskLevel === "Medium" ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Bayesian Threat Probability</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Threat Probability Distribution</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Linear classification risk index compiled across global verification layers.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="w-full relative h-10 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 flex items-center shadow-lg">
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${riskMeter}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-6 h-12 bg-white rounded-full border-4 border-slate-950 shadow-2xl -translate-x-1/2 flex items-center justify-center z-10 cursor-pointer"
          >
            <div className="w-1 h-4 bg-slate-950 rounded-full"></div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center w-full text-[11px] font-mono text-slate-500">
          <span>LOW THREAT (0-35)</span>
          <span>MEDIUM MODERATION (36-70)</span>
          <span>CRITICAL MANIPULATION (71-100)</span>
        </div>

        <div className="text-center pt-4">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Compiled Risk Weight</div>
          <div className={`font-display font-bold text-3xl sm:text-4xl ${riskColor}`}>{riskMeter}% Probability Index</div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center">
        * Compiles local and global feature attribution weights.
      </div>
    </div>
  );
}
