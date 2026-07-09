import { motion } from "motion/react";
import { Cpu, Terminal, Key, Database, Globe, Layers } from "lucide-react";

interface TechnologySectionProps {
  isDark: boolean;
}

export default function TechnologySection({ isDark }: TechnologySectionProps) {
  const techCategories = [
    {
      title: "Deep Learning Models",
      icon: Cpu,
      techs: [
        { name: "DeBERTa v3", desc: "Fine-tuned transformer with disentangled attention for linguistic authenticity & style polarization." },
        { name: "EfficientNet-B7", desc: "State-of-the-art CNN mapping high-frequency visual patterns, GAN artifacts, and compression noise." },
      ]
    },
    {
      title: "Explainable AI (XAI)",
      icon: Key,
      techs: [
        { name: "SHAP (SHapley Additive exPlanations)", desc: "Quantifies exactly how much weight each linguistic phrase contributes to the final fake news verdict." },
        { name: "Grad-CAM", desc: "Generates visual gradient activation hotspots, plotting physical heatmap overlays where manipulations occur." }
      ]
    },
    {
      title: "Enterprise Infrastructure",
      icon: Database,
      techs: [
        { name: "FastAPI Engine", desc: "Asynchronous Python routing framework delivering sub-500ms model classification latencies." },
        { name: "PostgreSQL", desc: "Relational database structure securing historic forensic tokens and client inquiry tickets." },
        { name: "Redis Cache Layer", desc: "In-memory database storing temporal hot vectors, accelerating high-throughput scanning." }
      ]
    },
    {
      title: "Cloud & Security Deployment",
      icon: Globe,
      techs: [
        { name: "Docker Sandbox", desc: "RAM-only containers hosting sandboxed execution blocks to isolate potentially malicious media metadata." },
        { name: "AWS Cloud Ingress", desc: "High-availability redundant VPC clustering ensuring zero-outage security telemetry worldwide." }
      ]
    }
  ];

  return (
    <section
      id="technology"
      className={`py-24 border-b relative overflow-hidden ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Background visual accents */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-cyber-purple/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Full Architecture</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            Ensembled Deep Learning Framework
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            We fuse custom neural nets and explainable math systems into a unified web runtime to ensure secure forensic telemetry.
          </p>
        </div>

        <div className="space-y-16">
          {techCategories.map((category, idx) => {
            const CategoryIcon = category.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900/5 dark:border-white/5">
                  <CategoryIcon className="w-5 h-5 text-cyber-blue" />
                  <h3 className="font-display font-bold text-base sm:text-lg uppercase tracking-wider">{category.title}</h3>
                </div>

                {/* Sub-grid of Tech cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.techs.map((tech, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border transition-all duration-300 hover:border-cyber-blue/30 hover:shadow-md ${
                        isDark 
                          ? "bg-slate-900/30 border-white/5 hover:bg-slate-900/60" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-3.5 h-3.5 text-cyber-purple" />
                        <span className="font-mono text-xs font-semibold text-cyber-blue">{tech.name}</span>
                      </div>
                      <p className={`font-sans text-xs leading-relaxed font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {tech.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
