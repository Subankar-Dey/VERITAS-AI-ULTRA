import { motion } from "motion/react";
import { FileText, Image, Key, FileCheck2, Eye } from "lucide-react";

interface FeaturesProps {
  isDark: boolean;
}

export default function Features({ isDark }: FeaturesProps) {
  const featuresList = [
    {
      title: "Fake News Detection",
      desc: "Scans articles, feeds, and claims for semantic polarization, lack of source attribution, and clickbait anomalies.",
      icon: FileText,
      color: "text-cyber-blue",
    },
    {
      title: "Image Deepfake Detection",
      desc: "Uncovers surgical facial warping, GAN grid patterns, pixel color anomalies, and artificial diffusion signs.",
      icon: Image,
      color: "text-cyber-purple",
    },
    {
      title: "Explainable AI (XAI)",
      desc: "Provides visual heatmap overlays, highlighted phrasing, attention map scores, and simple summaries.",
      icon: Key,
      color: "text-indigo-500",
    },
    {
      title: "AI Reports",
      desc: "Generates detailed forensic reports with verdicts, confidence, risk scoring, and exportable audit trails.",
      icon: FileCheck2,
      color: "text-teal-500",
    },
    {
      title: "Evidence Viewer",
      desc: "Inspect the exact spans, regions, and signals behind every verdict in an interactive forensic evidence panel.",
      icon: Eye,
      color: "text-sky-500",
    },
  ];

  return (
    <section
      id="features"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Advanced Cybersecurity Core Capabilities
          </h2>
          <p className={`font-sans text-sm sm:text-base font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Our framework utilizes specialized convolutional networks, large language models, and explainable metrics
            to isolate fake news and image deepfakes across text and visual modalities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-2">{feat.title}</h3>
                <p className={`font-sans text-xs sm:text-sm leading-relaxed font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
