import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Eye, Compass, Sliders, FileText, CheckCircle, 
  HelpCircle, ShieldAlert, Sparkles, TrendingUp
} from "lucide-react";
import { AnalysisResult } from "../types";

interface ExplainableAISectionProps {
  isDark: boolean;
  activeResult: AnalysisResult | null;
  activePreviewUrl: string | null;
  /** True when rendered directly beneath another section on the same page
   *  (e.g. the Detection page), so it doesn't need top navbar clearance or
   *  its own bottom divider. */
  embedded?: boolean;
}

// Default high-fidelity deepfake example case to showcase XAI when no file is uploaded yet
const DEFAULT_XAI_CASE: AnalysisResult = {
  verdict: "Likely Fake",
  confidence: 94.2,
  riskLevel: "High",
  explanation: "Surgical deepfake manipulation identified. Localized spectral frequency anomalies confirm GAN/Diffusion overlays surrounding the ocular and perioral facial patches.",
  detailedAnalysis: [
    "Ocular Landmark Splicing: Eye corneal reflections show physical raytracing inconsistencies with the primary ambient light vectors.",
    "Blink-rate Temporal Flicker: Frequency is 82% below standard human physiological intervals, showing frame loop repetition.",
    "Compression Divergence: Error Level Analysis (ELA) isolates a high-frequency mismatch boundary bordering the nose bridge."
  ],
  explainableAI: {
    riskMeter: 94,
    heatmapCoordinates: [
      { x: 52, y: 35, radius: 18, label: "Perioral Alignment Mismatch" },
      { x: 35, y: 58, radius: 14, label: "Ocular Frame Interpolation Jitter" }
    ],
    highlightedTextSpans: [],
    attentionScores: [
      { name: "Spatio-Temporal Jitter", score: 92 },
      { name: "Corneal Raytrace Divergence", score: 88 },
      { name: "Boundary Compression Noise", score: 95 },
      { name: "Physiological Blink Rate", score: 18 }
    ]
  }
};

const DEFAULT_PREVIEW_IMAGE = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop";

export default function ExplainableAISection({ isDark, activeResult, activePreviewUrl, embedded = false }: ExplainableAISectionProps) {
  const [activeXaiTab, setActiveXaiTab] = useState<"heatmap" | "attention" | "highlight" | "risk">("heatmap");
  const [hoveredCoordinate, setHoveredCoordinate] = useState<string | null>(null);

  // Use active user result if available, otherwise show high-fidelity simulation
  const result = activeResult || DEFAULT_XAI_CASE;
  const isDemoCase = !activeResult;
  const previewToUse = activePreviewUrl || (activeResult ? null : DEFAULT_PREVIEW_IMAGE);

  // Render text highlighting if active result was a text type, otherwise fallback to mock highlighted news article
  const hasHighlightData = (result.explainableAI.highlightedTextSpans && result.explainableAI.highlightedTextSpans.length > 0) || !activeResult;

  const demoTextSpans = [
    { text: "BREAKING: Secret intelligence report confirms", type: "biased", reason: "Loaded phrase designed to trigger rapid consensus, lacking verifiable regulatory reference indices." },
    { text: "atmospheric chemical formulas have been altered", type: "manipulation", reason: "Drastic scientific declaration with absolute divergence from global meteorological agency data." },
    { text: "by regional administrative authorities.", type: "biased", reason: "Vague structural pinning designed to evoke distrust of administrative bodies." },
    { text: "Local atmospheric experts have verified the reading.", type: "manipulation", reason: "Uncorroborated semantic claim citing unnamed authorities." },
    { text: "The official standard document was signed on Monday.", type: "authentic", reason: "Standard grammatical declarative clause matching common reporting standards." }
  ];

  const textSpans = (result.explainableAI.highlightedTextSpans && result.explainableAI.highlightedTextSpans.length > 0)
    ? result.explainableAI.highlightedTextSpans
    : demoTextSpans;

  return (
    <section
      id="explainable-ai"
      className={`relative ${embedded ? "pt-8 pb-24" : "py-24 border-b"} ${
        isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
      } ${embedded ? "" : isDark ? "border-white/5" : "border-slate-200"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Model Transparency</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            Explainable AI (XAI) Diagnostics
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            We bridge mathematical neural classifications into transparent, human-readable forensic layouts.
          </p>
        </div>

        {/* Informative interactive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* LEFT: Diagnostic workspace controls & explanation (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyber-blue" />
                <h3 className="font-display font-bold text-lg">Forensic Diagnostic Desk</h3>
              </div>

              {isDemoCase ? (
                <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? "bg-slate-900/40 border-white/5" : "bg-slate-50 border-slate-200"
                }`}>
                  <HelpCircle className="w-5 h-5 text-cyber-blue mt-0.5 shrink-0" />
                  <div className="text-xs leading-normal font-light">
                    <strong className="font-semibold text-cyber-blue">Showcase Mode Active:</strong> Paste some text or upload a media file in the <strong>AI Analysis Lab</strong> above to generate real-time visual coordinate overlays!
                  </div>
                </div>
              ) : (
                <div className="p-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Active Scan Workspace Loaded
                </div>
              )}

              {/* Selector buttons */}
              <div className="space-y-2">
                {[
                  { id: "heatmap", label: "Grad-CAM Spatial Heatmap", desc: "Plots coordinates of anomalies directly on the media payload.", disabled: activeResult && activeResult.explainableAI.heatmapCoordinates?.length === 0 },
                  { id: "attention", label: "Attention Weight Scores", desc: "Isolates which forensic features contributed most to the model's judgment.", disabled: false },
                  { id: "highlight", label: "Linguistic Span Highlights", desc: "Scans phrases to isolate manipulative or emotional wording styles.", disabled: activeResult && activeResult.explainableAI.highlightedTextSpans?.length === 0 },
                  { id: "risk", label: "Threat Probability Meter", desc: "A linear distribution graph displaying risk level gradients.", disabled: false }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveXaiTab(tab.id as any)}
                    disabled={tab.disabled}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                      activeXaiTab === tab.id
                        ? "border-cyber-blue bg-cyber-blue/5 shadow-md"
                        : "border-slate-900/5 dark:border-white/5 bg-transparent hover:border-slate-300 dark:hover:border-white/10"
                    } disabled:opacity-30 disabled:pointer-events-none`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      activeXaiTab === tab.id ? "bg-cyber-blue text-white" : "bg-slate-900/5 dark:bg-slate-900/40"
                    }`}>
                      {tab.id === "heatmap" ? <Compass className="w-4 h-4" /> :
                       tab.id === "attention" ? <TrendingUp className="w-4 h-4" /> :
                       tab.id === "highlight" ? <FileText className="w-4 h-4" /> :
                       <Sliders className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs sm:text-sm tracking-wide leading-none mb-1">{tab.label}</h4>
                      <p className={`font-sans text-[11px] font-light leading-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>{tab.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-slate-900/20 border-white/5" : "bg-slate-50 border-slate-200"
            }`}>
              <h4 className="font-display font-bold text-xs tracking-wider uppercase text-slate-500 mb-2">Diagnostic Summary</h4>
              <p className={`font-sans text-xs leading-relaxed font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {result.explanation}
              </p>
            </div>
          </div>

          {/* RIGHT: Visual Interactive Canvas area (7 cols) */}
          <div className="lg:col-span-7">
            <div className={`h-full rounded-3xl border overflow-hidden p-6 sm:p-8 flex flex-col justify-between relative min-h-[400px] ${
              isDark ? "glass-card-dark" : "glass-card-light"
            }`}>
              <AnimatePresence mode="wait">
                {/* SPATIAL HEATMAP OVERLAY */}
                {activeXaiTab === "heatmap" && (
                  <motion.div
                    key="heatmap"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4 h-full flex flex-col justify-between w-full"
                  >
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Grad-CAM Spatial Layer</span>
                      <h4 className="font-display font-bold text-base sm:text-lg mb-1">Spatial Artifact Pinpointing</h4>
                      <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Interactive heatmap circles identify the precise spatial regions where CNN models detected synthetic overlay patterns. Hover over anchors to inspect model activation readouts.
                      </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border bg-slate-950 flex items-center justify-center max-h-[280px] my-4 shadow-inner">
                      {previewToUse ? (
                        <div className="relative w-full max-h-[280px] flex items-center justify-center">
                          <img src={previewToUse} alt="Payload preview" className="object-contain max-h-[280px] w-full" />
                          
                          {/* Absolute coordinate overlays */}
                          {result.explainableAI.heatmapCoordinates?.map((coord, i) => (
                            <div
                              key={i}
                              onMouseEnter={() => setHoveredCoordinate(`coord-${i}`)}
                              onMouseLeave={() => setHoveredCoordinate(null)}
                              className="absolute rounded-full border-2 border-rose-500 bg-rose-500/20 cursor-pointer animate-pulse transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
                              style={{
                                left: `${coord.x}%`,
                                top: `${coord.y}%`,
                                width: `${coord.radius * 2}%`,
                                height: `${coord.radius * 2}%`,
                                transform: "translate(-50%, -50%)"
                              }}
                            >
                              {/* Anchor dot */}
                              <div className="w-2 h-2 rounded-full bg-rose-500"></div>

                              {/* Coord label tooltip */}
                              <AnimatePresence>
                                {hoveredCoordinate === `coord-${i}` && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: -45 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute bg-slate-900 border border-white/10 text-[10px] text-white p-2.5 rounded shadow-xl w-48 text-center pointer-events-none z-30"
                                  >
                                    <div className="font-mono font-bold text-[9px] text-rose-500 uppercase tracking-widest mb-0.5">FORENSIC SPIKE</div>
                                    <div className="font-semibold leading-normal font-sans">{coord.label}</div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                          <Compass className="w-10 h-10 text-cyber-blue mb-3 animate-spin" style={{ animationDuration: "15s" }} />
                          <p>Upload an image to render visual hotspot overlays.</p>
                        </div>
                      )}
                    </div>

                    {result.explainableAI.spatialDirection && (
                      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-normal ${
                        isDark ? "bg-cyber-blue/5 border-cyber-blue/20 text-slate-200" : "bg-cyber-blue/5 border-cyber-blue/20 text-slate-700"
                      }`}>
                        <Eye className="w-4 h-4 text-cyber-blue mt-0.5 shrink-0" />
                        <span><strong className="font-semibold">Where to look:</strong> {result.explainableAI.spatialDirection}</span>
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-slate-500 text-center">
                      * Grad-CAM calculates spatial feature weights over final convolutional feature layers.
                    </div>
                  </motion.div>
                )}

                {/* ATTENTION WEIGHT SCORES */}
                {activeXaiTab === "attention" && (
                  <motion.div
                    key="attention"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4 h-full flex flex-col justify-between w-full"
                  >
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Feature Attention Distribution</span>
                      <h4 className="font-display font-bold text-base sm:text-lg mb-1">Ensemble Feature Attribution Map</h4>
                      <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Displays the mathematical attention weightings calculated across individual forensic sub-classifiers during ensembled classification.
                      </p>
                    </div>

                    <div className="space-y-4 my-6">
                      {result.explainableAI.attentionScores.map((score, i) => (
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
                            ></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 text-center">
                      * Multi-modal attention pooling fuses textual, acoustic, and convolutional vectors dynamically.
                    </div>
                  </motion.div>
                )}

                {/* LINGUISTIC HIGHLIGHTS */}
                {activeXaiTab === "highlight" && (
                  <motion.div
                    key="highlight"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4 h-full flex flex-col justify-between w-full"
                  >
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">SHAP Textual Saliency</span>
                      <h4 className="font-display font-bold text-base sm:text-lg mb-1">Linguistic Bias & Manipulation Spans</h4>
                      <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Hover over highlighted blocks to read the natural language explanation of linguistic risks compiled by our transformer networks.
                      </p>
                    </div>

                    <div className={`p-5 rounded-2xl border font-sans text-xs sm:text-sm leading-relaxed font-light my-4 ${
                      isDark ? "bg-slate-950/40 border-white/5" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                        {textSpans.map((span, i) => (
                          <span
                            key={i}
                            onMouseEnter={() => setHoveredCoordinate(`text-${i}`)}
                            onMouseLeave={() => setHoveredCoordinate(null)}
                            className={`px-1 py-0.5 rounded cursor-help transition-all relative inline-block ${
                              span.type === "manipulation" 
                                ? "bg-rose-500/15 border-b-2 border-rose-500 text-rose-600 dark:text-rose-400" 
                                : span.type === "biased"
                                  ? "bg-amber-500/15 border-b-2 border-amber-500 text-amber-600 dark:text-amber-400"
                                  : "bg-emerald-500/10 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {span.text}

                            <AnimatePresence>
                              {hoveredCoordinate === `text-${i}` && (
                                <motion.span
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: -45 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bg-slate-900 border border-white/10 text-[10px] text-white p-3 rounded shadow-xl w-64 text-center pointer-events-none z-30 font-sans"
                                  style={{ left: "50%", transform: "translateX(-50%)" }}
                                >
                                  <span className={`font-bold font-mono text-[9px] uppercase tracking-wider block mb-0.5 ${
                                    span.type === "manipulation" ? "text-rose-500" : span.type === "biased" ? "text-amber-500" : "text-emerald-500"
                                  }`}>{span.type} marker</span>
                                  <span className="font-light leading-normal text-slate-200">{span.reason}</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* High contrast key */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-mono text-slate-500 pt-2">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500"></span>Synthetic/Manipulated</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500"></span>Polarized/Loaded Language</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500"></span>Authentic Standard</span>
                    </div>
                  </motion.div>
                )}

                {/* THREAT RISK METER */}
                {activeXaiTab === "risk" && (
                  <motion.div
                    key="risk"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-4 h-full flex flex-col justify-between w-full"
                  >
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Bayesian Threat Probability</span>
                      <h4 className="font-display font-bold text-base sm:text-lg mb-1">Threat Probability Distribution</h4>
                      <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Linear classification risk index compiled across global verification layers.
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      {/* Interactive Risk Bar */}
                      <div className="w-full relative h-10 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 flex items-center shadow-lg">
                        {/* Dynamic Marker Node */}
                        <motion.div
                          initial={{ left: 0 }}
                          animate={{ left: `${result.explainableAI.riskMeter}%` }}
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
                        <div className={`font-display font-bold text-3xl sm:text-4xl ${
                          result.explainableAI.riskMeter > 70 ? "text-rose-500" :
                          result.explainableAI.riskMeter > 35 ? "text-amber-500" :
                          "text-emerald-500"
                        }`}>{result.explainableAI.riskMeter}% Probability Index</div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 text-center">
                      * Compiles local and global feature attribution weights.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
