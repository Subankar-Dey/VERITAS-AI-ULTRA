import { motion } from "motion/react";
import { Link } from "react-router";
import { ShieldCheck, Cpu, Database, CheckCircle, ArrowRight, FileText } from "lucide-react";

interface HeroSectionProps {
  isDark: boolean;
}

export default function HeroSection({ isDark }: HeroSectionProps) {
  const stats = [
    { value: "98.4%", label: "Forensic Detection Accuracy", icon: ShieldCheck, color: "text-cyber-blue" },
    { value: "100K+", label: "Verified Content Analyses", icon: Database, color: "text-cyber-purple" },
    { value: "4 Layers", label: "Ensembled Deep Learning Models", icon: Cpu, color: "text-cyber-green" },
    { value: "99.9%", label: "API Deployment Availability", icon: CheckCircle, color: "text-emerald-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="home"
      className={`relative min-h-screen pt-24 pb-16 flex flex-col justify-center overflow-hidden grid-background-container ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Visual cyber mesh background */}
      <div className={`absolute inset-0 z-0 pointer-events-none opacity-40 ${isDark ? "grid-background" : "grid-background-light"}`}></div>

      {/* Cyber gradient blur glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/10 dark:bg-cyber-blue/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/10 dark:bg-cyber-purple/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Tagline */}
          <motion.div
            variants={itemVariants}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6 ${
              isDark ? "bg-slate-900/80 border border-white/5 text-cyber-blue" : "bg-slate-100 border border-slate-200 text-cyber-blue"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURE ANALYTICS CORE v4.12
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            Detect Fake News & <br />
            <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-pink-500 bg-clip-text text-transparent">
              Deepfakes
            </span>{" "}
            with AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className={`font-sans text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            VeritasAI Ultra uses ensembled multimodal deep learning architectures to identify misinformation, 
            AI-generated imagery, manipulated visuals, fabricated claims, and deceptive neural content
            with pixel-perfect Explainable AI (XAI) mapping.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/detection"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold tracking-wide text-white bg-cyber-blue hover:bg-cyber-blue/90 rounded-xl shadow-lg shadow-cyber-blue/15 transition-all hover:-translate-y-0.5"
            >
              Try Detection
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/research"
              className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold tracking-wide rounded-xl border transition-all hover:-translate-y-0.5 ${
                isDark
                  ? "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Research
            </Link>
          </motion.div>

          {/* Floating Cards (Trusted By and Indicators) */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl text-left border relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? "bg-slate-900/40 border-white/5 hover:border-white/10"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                      <IconComp className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-1">{stat.value}</div>
                  <div className={`text-[11px] font-medium leading-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Trusted By logo rail */}
      <div className={`mt-16 py-6 border-t border-b ${isDark ? "border-white/5 bg-slate-950/20" : "border-slate-200 bg-slate-100/30"}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-[10px] font-bold tracking-widest uppercase mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Engineered to Secure the Digital Frontier
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-55 saturate-50 hover:opacity-80 transition-opacity duration-300">
            <span className="font-display text-sm font-bold tracking-wider">MIT TECHNOLOGY REVIEW</span>
            <span className="font-display text-sm font-bold tracking-wider">IEEE ORG</span>
            <span className="font-display text-sm font-bold tracking-wider">DARPA INSIGHTS</span>
            <span className="font-display text-sm font-bold tracking-wider">STANFORD HAI</span>
            <span className="font-display text-sm font-bold tracking-wider">ACM FORENSICS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
