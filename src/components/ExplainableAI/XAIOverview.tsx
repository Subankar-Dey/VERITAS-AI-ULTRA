import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity, BarChart3, ScanEye, Gauge, TriangleAlert,
  ListTree, BrainCircuit, FileDown, FileText,
  ExternalLink, ShieldCheck, ShieldAlert, Search
} from "lucide-react";
import { AnalysisResult, ShapFeature, EvidenceItem } from "../../types";
import ConfidenceGauge from "./ConfidenceGauge";
import RiskMeter from "./RiskMeter";
import AttentionCard from "./AttentionCard";
import SHAPCard from "./SHAPCard";
import GradCAMCard from "./GradCAMCard";
import EvidencePanel from "./EvidencePanel";
import ReasoningCard from "./ReasoningCard";

type XaiToolId = "attention" | "shap" | "gradcam" | "confidence" | "risk" | "evidence" | "reasoning";

interface XAIOverviewProps {
  isDark: boolean;
  status: "idle" | "processing" | "success" | "error";
  loadingStep: number;
  result: AnalysisResult | null;
  previewUrl: string | null;
  onGoToDetection: () => void;
}

const xaiLoadingTexts = [
  "Calculating Attention...",
  "Generating Explanation...",
  "Rendering Heatmap...",
  "AI Reasoning...",
];

function deriveShapFeatures(result: AnalysisResult): ShapFeature[] {
  if (result.explainableAI.shapFeatures?.length) return result.explainableAI.shapFeatures;

  const isFake = result.verdict !== "Authentic";
  const fromAttention = result.explainableAI.attentionScores.map((s) => ({
    feature: s.name,
    impact: isFake ? s.score - 40 : 40 - s.score,
  }));
  const fromSpans = (result.explainableAI.highlightedTextSpans || []).map((span) => ({
    feature: span.text.length > 28 ? `${span.text.slice(0, 28)}…` : span.text,
    impact: span.type === "authentic" ? -35 : span.type === "manipulation" ? 55 : 30,
  }));
  return [...fromAttention, ...fromSpans].slice(0, 6);
}

function deriveEvidence(result: AnalysisResult): EvidenceItem[] {
  if (result.explainableAI.evidence?.length) return result.explainableAI.evidence;

  const bulletEvidence: EvidenceItem[] = result.detailedAnalysis.map((bullet, i) => ({
    title: `Signal ${String(i + 1).padStart(2, "0")}`,
    detail: bullet,
    severity: result.verdict === "Authentic" ? "low" : i === 0 ? "high" : "medium",
  }));
  const spanEvidence: EvidenceItem[] = (result.explainableAI.highlightedTextSpans || [])
    .filter((s) => s.type !== "authentic")
    .map((s) => ({
      title: s.type === "manipulation" ? "Manipulation Marker" : "Bias Marker",
      detail: s.reason,
      severity: s.type === "manipulation" ? "high" : "medium",
    }));
  return [...bulletEvidence, ...spanEvidence];
}

export default function XAIOverview({ isDark, status, loadingStep, result, previewUrl, onGoToDetection }: XAIOverviewProps) {
  const navigate = useNavigate();
  const isImagePayload = previewUrl !== null;
  const defaultTool: XaiToolId = isImagePayload ? "gradcam" : "shap";
  const [activeTool, setActiveTool] = useState<XaiToolId>(defaultTool);

  const shapFeatures = useMemo(() => (result ? deriveShapFeatures(result) : []), [result]);
  const evidence = useMemo(() => (result ? deriveEvidence(result) : []), [result]);

  const tools: { id: XaiToolId; label: string; desc: string; icon: typeof Activity }[] = [
    { id: "attention", label: "Attention Map", desc: "Feature-level attention weights across the ensemble.", icon: Activity },
    { id: "shap", label: "SHAP Analysis", desc: "Additive feature attribution toward the final verdict.", icon: BarChart3 },
    { id: "gradcam", label: "Grad-CAM Heatmap", desc: "Spatial activation regions on the media payload.", icon: ScanEye },
    { id: "confidence", label: "Confidence Score", desc: "Calibrated certainty and class probability split.", icon: Gauge },
    { id: "risk", label: "Risk Meter", desc: "Compiled threat probability across risk bands.", icon: TriangleAlert },
    { id: "evidence", label: "Evidence Summary", desc: "Ranked forensic signals collected during the scan.", icon: ListTree },
    { id: "reasoning", label: "AI Reasoning", desc: "Narrative trace behind the model's decision.", icon: BrainCircuit },
  ];

  const handleDownloadPdf = () => {
    if (!result) return;
    const printWindow = window.open("", "_blank", "width=820,height=1040");
    if (!printWindow) return;
    const recommendation =
      result.verdict === "Authentic"
        ? "No further action required. Content passed forensic verification within acceptable confidence bounds."
        : "Flag content for manual review before distribution. Escalate to trust & safety if published externally.";
    printWindow.document.write(`<!doctype html><html><head><title>VeritasAI Explainability Report</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;padding:32px;max-width:760px;margin:0 auto;}
        h1{font-size:20px;margin-bottom:4px;} h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#0ea5e9;margin-top:28px;margin-bottom:8px;}
        p,li{font-size:13px;line-height:1.6;} .badge{display:inline-block;padding:4px 10px;border-radius:6px;font-weight:bold;font-size:12px;}
        .badge.fake{background:#fee2e2;color:#b91c1c;} .badge.auth{background:#dcfce7;color:#15803d;}
      </style></head><body>
      <h1>VeritasAI Ultra &mdash; Explainability Report</h1>
      <p style="color:#64748b;font-size:12px;">Generated ${new Date().toLocaleString()}</p>
      <h2>Model Decision</h2>
      <p><span class="badge ${result.verdict === "Authentic" ? "auth" : "fake"}">${result.verdict}</span>&nbsp; Confidence: <b>${result.confidence}%</b>&nbsp; Risk Level: <b>${result.riskLevel}</b></p>
      <h2>Summary</h2><p>${result.explanation}</p>
      <h2>Reasoning</h2><ul>${result.detailedAnalysis.map((b) => `<li>${b}</li>`).join("")}</ul>
      <h2>Evidence</h2><ul>${evidence.map((e) => `<li><b>${e.title}:</b> ${e.detail}</li>`).join("")}</ul>
      <h2>Recommendation</h2><p>${recommendation}</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veritasai-explainability-report.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- LOADING STATE ----------
  if (status === "processing") {
    return (
      <div className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {tools.map((t, i) => (
              <div
                key={t.id}
                className={`h-16 rounded-xl border animate-pulse ${isDark ? "border-white/5 bg-slate-900/40" : "border-slate-200 bg-slate-100"}`}
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <div className="lg:col-span-7">
            <div className={`h-full min-h-[360px] rounded-3xl border flex flex-col items-center justify-center gap-4 ${
              isDark ? "glass-card-dark" : "glass-card-light"
            }`}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <BrainCircuit className="w-10 h-10 text-cyber-blue" />
              </motion.div>
              <h3 className="font-display font-bold text-base tracking-wide h-6">{xaiLoadingTexts[loadingStep] ?? xaiLoadingTexts[0]}</h3>
              <p className="text-[10px] tracking-widest text-slate-500 font-mono uppercase">Compiling forensic explainability layers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- EMPTY STATE ----------
  if (!result) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
        <div className={`p-5 rounded-full ${isDark ? "bg-slate-900/60" : "bg-slate-100"}`}>
          <Search className="w-10 h-10 text-cyber-blue" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-lg">No Explainable AI Results Yet</h3>
          <p className={`font-sans text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Analyze text or image first to generate explainable insights.
          </p>
        </div>
        <button
          onClick={onGoToDetection}
          className="px-5 py-2.5 text-xs font-semibold tracking-wide text-white bg-cyber-blue hover:bg-cyber-blue/90 rounded-lg"
        >
          Go to Detection
        </button>
      </div>
    );
  }

  // ---------- LOADED DASHBOARD ----------
  return (
    <div className="space-y-8 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: control cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                aria-pressed={isActive}
                className={`text-left p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3 group ${
                  isActive
                    ? "border-cyber-blue bg-cyber-blue/5 shadow-md"
                    : "border-slate-900/5 dark:border-white/5 bg-transparent hover:border-slate-300 dark:hover:border-white/10 hover:-translate-y-0.5"
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 transition-colors ${
                  isActive ? "bg-cyber-blue text-white" : "bg-slate-900/5 dark:bg-slate-900/40 group-hover:bg-cyber-blue/10"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-xs sm:text-sm tracking-wide leading-none mb-1 truncate">{tool.label}</h4>
                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${isActive ? "bg-cyber-blue animate-pulse" : "bg-emerald-500"}`} />
                  </div>
                  <p className={`font-sans text-[11px] font-light leading-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: visualization */}
        <div className="lg:col-span-7">
          <div className={`h-full rounded-3xl border overflow-hidden p-6 sm:p-8 flex flex-col justify-between relative min-h-[420px] ${
            isDark ? "glass-card-dark" : "glass-card-light"
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {activeTool === "attention" && <AttentionCard isDark={isDark} scores={result.explainableAI.attentionScores} />}
                {activeTool === "shap" && <SHAPCard isDark={isDark} features={shapFeatures} />}
                {activeTool === "gradcam" && (
                  <GradCAMCard
                    isDark={isDark}
                    previewUrl={previewUrl}
                    coordinates={result.explainableAI.heatmapCoordinates || []}
                    isImagePayload={isImagePayload}
                  />
                )}
                {activeTool === "confidence" && <ConfidenceGauge isDark={isDark} confidence={result.confidence} verdict={result.verdict} />}
                {activeTool === "risk" && <RiskMeter isDark={isDark} riskMeter={result.explainableAI.riskMeter} riskLevel={result.riskLevel} />}
                {activeTool === "evidence" && <EvidencePanel isDark={isDark} items={evidence} />}
                {activeTool === "reasoning" && <ReasoningCard isDark={isDark} explanation={result.explanation} steps={result.detailedAnalysis} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* BOTTOM: Explainability Report */}
      <div className={`rounded-3xl border p-6 sm:p-8 ${isDark ? "glass-card-dark" : "glass-card-light"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${result.verdict === "Authentic" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
              {result.verdict === "Authentic" ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">Compiled Output</div>
              <h3 className="font-display font-bold text-lg">Explainability Report</h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportReport}
              className={`px-3.5 py-2 text-[11px] font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
                isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Export Report
            </button>
            <button
              onClick={handleDownloadPdf}
              className={`px-3.5 py-2 text-[11px] font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
                isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileDown className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={() => navigate("/explainable-ai")}
              className="px-3.5 py-2 text-[11px] font-semibold rounded-lg bg-cyber-blue text-white hover:bg-cyber-blue/90 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Full Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Summary</h5>
            <p className={`text-xs font-light leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{result.explanation}</p>
          </div>
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Reasoning</h5>
            <ul className="space-y-1">
              {result.detailedAnalysis.slice(0, 3).map((b, i) => (
                <li key={i} className={`text-xs font-light leading-normal flex items-start gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <span className="inline-block w-1 h-1 rounded-full bg-cyber-blue mt-1.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Evidence</h5>
            <p className={`text-xs font-light leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {evidence.length} forensic signal{evidence.length === 1 ? "" : "s"} collected, {evidence.filter((e) => e.severity === "high").length} flagged high severity.
            </p>
          </div>
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Model Decision</h5>
            <p className={`text-xs font-bold ${result.verdict === "Authentic" ? "text-emerald-500" : "text-rose-500"}`}>{result.verdict}</p>
          </div>
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Confidence</h5>
            <p className="text-xs font-bold text-cyber-blue">{result.confidence}%</p>
          </div>
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Recommendation</h5>
            <p className={`text-xs font-light leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {result.verdict === "Authentic"
                ? "No further action required; content passed verification."
                : "Flag for manual review before distribution."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
