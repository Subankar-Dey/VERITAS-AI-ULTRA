import { motion } from "motion/react";
import { UploadCloud, Cpu, Eye, FileSpreadsheet, Download } from "lucide-react";

interface HowItWorksProps {
  isDark: boolean;
}

export default function HowItWorks({ isDark }: HowItWorksProps) {
  const steps = [
    {
      title: "Upload & Preprocess",
      desc: "Raw news text or image files are ingested into secure RAM-only sandboxed virtual environments for forensic extraction.",
      icon: UploadCloud,
      color: "text-cyber-blue",
      glow: "shadow-cyber-blue/10"
    },
    {
      title: "Ensembled Neural Scanning",
      desc: "Our model pipeline executes specialised scans. Image pixels undergo convolutional classification while texts evaluate linguistic polarization, bias, and source credibility.",
      icon: Cpu,
      color: "text-cyber-purple",
      glow: "shadow-cyber-purple/10"
    },
    {
      title: "XAI Diagnostic Mapping",
      desc: "Explainable AI (XAI) models like SHAP and Grad-CAM compute activation coordinates to render visual hotspot boundaries and pinpoint loaded linguistic terms.",
      icon: Eye,
      color: "text-amber-500",
      glow: "shadow-amber-500/10"
    },
    {
      title: "Final Verdict Issuance",
      desc: "A cryptographic forensic verdict (Authentic or Likely Fake) is generated, compiling classification confidence intervals, risk meters, and explanations.",
      icon: FileSpreadsheet,
      color: "text-emerald-500",
      glow: "shadow-emerald-500/10"
    },
    {
      title: "Download Cryptographic Report",
      desc: "A detailed PDF forensic brief containing exact timestamp telemetry, neural activation indices, and XAI maps is generated for local storage.",
      icon: Download,
      color: "text-sky-500",
      glow: "shadow-sky-500/10"
    }
  ];

  return (
    <section
      id="how-it-works"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Lifecycle</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            How VeritasAI Computes Truth
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Our step-by-step pipeline ensures mathematical traceability and complete explainability for every piece of audited content.
          </p>
        </div>

        {/* Timeline Line */}
        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-900 -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`flex flex-col md:flex-row relative items-start md:items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon Anchor node */}
                  <div className="absolute left-8 md:left-1/2 top-1.5 md:top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center shadow-lg ${step.glow} ${
                      isDark ? "border-slate-800" : "border-slate-100"
                    }`}>
                      <StepIcon className={`w-4 h-4 ${step.color}`} />
                    </div>
                  </div>

                  {/* Empty space for grid on desktop */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Content card */}
                  <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/40"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-cyber-blue">0{idx + 1}.</span>
                        <h3 className="font-display font-semibold text-base sm:text-lg">{step.title}</h3>
                      </div>
                      <p className={`font-sans text-xs sm:text-sm leading-relaxed font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
