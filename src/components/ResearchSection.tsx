import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, FileText, Download, Check, HelpCircle } from "lucide-react";

interface ResearchSectionProps {
  isDark: boolean;
}

export default function ResearchSection({ isDark }: ResearchSectionProps) {
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "done">("idle");

  const researchBriefs = [
    {
      title: "Problem Statement",
      desc: "Mass availability of generative diffusion and GAN pipelines has collapsed public information consensus. Malicious state actors and fraudsters weaponize synthetic facial swaps and polarized news text, creating severe security threats that traditional firewalls fail to isolate."
    },
    {
      title: "Framework Objectives",
      desc: "Our framework establishes a mathematically traceable, ensembled multimodal scan system. By combining convolutional edge filters, vision transformers, and large scale linguistic models, we isolate fake news and image deepfakes under a unified web ingress node."
    },
    {
      title: "Datasets Utilized",
      desc: "Our models were pre-trained and ensembled using world-class benchmark repositories, including FaceForensics++ and the Deepfake Detection Challenge for imagery, and LIAR/Constraint21/FEVER for linguistic fact-matching vectors."
    },
    {
      title: "Core Algorithms",
      desc: "We utilize multi-modal attention fusion, Bayesian threat pooling, Grad-CAM neural gradients for visual heatmaps, and SHAP Shapley additive values for linguistic phrase weight attribution."
    },
    {
      title: "Future Scope",
      desc: "Expanding framework capability into real-time cryptographic watermarking and ledger-backed immutable media registration, establishing absolute chain-of-custody for public press briefs."
    }
  ];

  const handleDownload = () => {
    setDownloadState("loading");
    setTimeout(() => {
      setDownloadState("done");
      setTimeout(() => setDownloadState("idle"), 3000);
    }, 1500);
  };

  return (
    <section
      id="research"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Academic Standards
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Deep Learning Research Foundation
            </h2>
            <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Our detection models are built upon academic peer-reviewed architectures designed to secure the digital commons.
            </p>
          </div>

          <button
            onClick={handleDownload}
            className={`w-full lg:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs font-semibold tracking-wide rounded-xl border transition-all ${
              downloadState === "done" 
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-cyber-blue text-white hover:bg-cyber-blue/90 shadow-lg shadow-cyber-blue/10 hover:shadow-cyber-blue/20"
            }`}
          >
            {downloadState === "idle" && (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download VeritasAI Whitepaper (PDF)
              </>
            )}
            {downloadState === "loading" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Assembling Cryptographic Whitepaper...
              </>
            )}
            {downloadState === "done" && (
              <>
                <Check className="w-4 h-4 mr-2" />
                Forensic Whitepaper Compiled!
              </>
            )}
          </button>
        </div>

        {/* Academic Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchBriefs.map((brief, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:shadow-sm ${
                isDark 
                  ? "bg-slate-900/30 border-white/5 hover:bg-slate-900/50" 
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/30"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-cyber-blue" />
                  <h3 className="font-display font-bold text-sm tracking-wide uppercase text-slate-500">{brief.title}</h3>
                </div>
                <p className={`font-sans text-xs sm:text-sm leading-relaxed font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {brief.desc}
                </p>
              </div>
            </div>
          ))}
          
          {/* IEEE Mock Citation card */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
            isDark ? "bg-cyber-blue/5 border-cyber-blue/20" : "bg-indigo-50/20 border-indigo-100"
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-cyber-purple" />
                <h3 className="font-display font-bold text-sm tracking-wide uppercase text-cyber-purple">How to Cite</h3>
              </div>
              <p className={`font-mono text-[10px] leading-relaxed p-3.5 rounded-xl border font-light ${
                isDark ? "bg-slate-950/80 border-white/5 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}>
                VeritasAI, &ldquo;VeritasAI Ultra: A Multimodal Deep Learning Framework for Fake News & Deepfake Detection,&rdquo; IEEE Forensics, vol. 14, pp. 204-219, 2026.
              </p>
            </div>
            <div className="text-[9px] font-sans font-light text-slate-400 flex items-center gap-1 mt-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Pre-print index: DOI-10.1109/IEEE.VAI.2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
