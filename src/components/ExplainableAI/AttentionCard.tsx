import { motion } from "motion/react";
import { AttentionScore } from "../../types";

interface AttentionCardProps {
  isDark: boolean;
  scores: AttentionScore[];
}

export default function AttentionCard({ isDark, scores }: AttentionCardProps) {
  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Feature Attention Distribution</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Model Attention Attribution Map</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Displays the mathematical attention weightings calculated across individual forensic sub-classifiers during ensembled classification.
        </p>
      </div>

      <div className="space-y-4 my-6">
        {scores.map((score, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-sans font-medium text-slate-600 dark:text-slate-300">{score.name}</span>
              <span className="text-cyber-blue font-bold">{score.score}% Attribution</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.score}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  score.score > 75 ? "bg-rose-500" : score.score > 35 ? "bg-amber-500" : "bg-cyber-blue"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center">
        * Multi-modal attention pooling fuses textual, acoustic, and convolutional vectors dynamically.
      </div>
    </div>
  );
}
