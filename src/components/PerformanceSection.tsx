import { motion } from "motion/react";
import { Shield, Target, Zap, RotateCcw, Award } from "lucide-react";

interface PerformanceSectionProps {
  isDark: boolean;
}

export default function PerformanceSection({ isDark }: PerformanceSectionProps) {
  const benchmarks = [
    { name: "Forensic Classification Accuracy", value: "98.4%", icon: Shield, desc: "Ensembled convolutional and linguistic pipeline accuracy validated across Stanford/DARPA benchmarks." },
    { name: "Surgical Pattern Precision", value: "95.2%", icon: Target, desc: "Integrity validation for highly localized deepfake patches, preventing false positive alarms." },
    { name: "Adversarial Content Recall", value: "96.4%", icon: Zap, desc: "Captures heavily compressed, low-bitrate, and laundered social media fake-shares." },
    { name: "Core Model F1 Statistical Score", value: "98.1%", icon: Award, desc: "Harmonic mean validating overall mathematical consistency across multi-modal assets." },
    { name: "Forensic Ingress Latency", value: "500ms", icon: RotateCcw, desc: "Average end-to-end model pipeline execution delay per scan, backed by Redis hot caching layers." }
  ];

  return (
    <section
      id="performance"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Benchmarks</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            Forensic Benchmark Standards
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Mathematical and latency audits validating industrial-grade model consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {benchmarks.map((bench, idx) => {
            const Icon = bench.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isDark
                    ? "bg-slate-900/30 border-white/5 hover:border-white/10 hover:bg-slate-900/55"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/30"
                }`}
              >
                <div className={`p-2.5 rounded-lg w-fit mb-4 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <Icon className="w-5 h-5 text-cyber-blue" />
                </div>
                <div className="font-display font-bold text-2xl sm:text-3xl mb-1 text-cyber-blue">{bench.value}</div>
                <h4 className="font-display font-bold text-xs sm:text-sm tracking-wide mb-2 leading-snug">{bench.name}</h4>
                <p className={`font-sans text-[11px] leading-relaxed font-light ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  {bench.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
