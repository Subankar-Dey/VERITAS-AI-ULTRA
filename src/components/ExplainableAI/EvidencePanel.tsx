import { motion } from "motion/react";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { EvidenceItem } from "../../types";

interface EvidencePanelProps {
  isDark: boolean;
  items: EvidenceItem[];
}

const severityConfig = {
  high: { icon: ShieldAlert, color: "text-rose-500", dot: "bg-rose-500", ring: "ring-rose-500/20" },
  medium: { icon: AlertTriangle, color: "text-amber-500", dot: "bg-amber-500", ring: "ring-amber-500/20" },
  low: { icon: Info, color: "text-emerald-500", dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
} as const;

export default function EvidencePanel({ isDark, items }: EvidencePanelProps) {
  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Forensic Evidence Timeline</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Evidence Summary</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          A chronological ledger of the forensic signals collected during the classification pass, ranked by severity.
        </p>
      </div>

      <div className="relative my-4 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
        <div className={`absolute left-[13px] top-1 bottom-1 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
        <div className="space-y-5">
          {items.map((item, i) => {
            const cfg = severityConfig[item.severity];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative pl-9"
              >
                <div className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center ring-4 ${cfg.ring} ${
                  isDark ? "bg-slate-900" : "bg-white"
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h5 className="font-display font-bold text-xs">{item.title}</h5>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                </div>
                <p className={`font-sans text-[11px] font-light leading-normal ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {item.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center">
        * Evidence is cross-referenced against the fused ensemble decision boundary.
      </div>
    </div>
  );
}
