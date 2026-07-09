export interface HighlightedTextSpan {
  text: string;
  type: "manipulation" | "biased" | "authentic";
  reason: string;
}

export interface HeatmapCoordinate {
  x: number; // percentage coordinate (0-100)
  y: number; // percentage coordinate (0-100)
  radius: number; // radius size (percentage)
  label: string; // anomaly description
}

export interface AttentionScore {
  name: string;
  score: number; // 0-100
}

export interface ShapFeature {
  feature: string;
  impact: number; // -100 (supports authentic) to 100 (supports fake/manipulated)
}

export interface EvidenceItem {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface ExplainableAIData {
  riskMeter: number; // 0-100
  heatmapCoordinates?: HeatmapCoordinate[];
  highlightedTextSpans?: HighlightedTextSpan[];
  attentionScores: AttentionScore[];
  shapFeatures?: ShapFeature[];
  evidence?: EvidenceItem[];
  /** Plain-language "where to look" instruction for the Grad-CAM heatmap,
   *  generated only for real (non-demo) image analyses. */
  spatialDirection?: string;
}

export interface VerifiedSource {
  title: string;
  url: string;
}

export interface AnalysisResult {
  verdict: "Authentic" | "Likely Fake";
  confidence: number; // 0-100
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
  detailedAnalysis: string[];
  explainableAI: ExplainableAIData;
  isDemo?: boolean;
  warning?: string;
  rawError?: string;
  /** Human-readable label of whichever backend actually produced this
   *  result (e.g. a Gemini model id, the VeritasAI text engine + its model
   *  version, or the offline simulator) — shown verbatim in the UI. */
  engine?: string;
  /** Real citations returned by live Google Search grounding — omitted or
   *  empty whenever no live cross-reference was actually performed (e.g.
   *  demo mode). Never populated with model-invented URLs. */
  sources?: VerifiedSource[];
}

export type DetectionType = "text" | "image";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TechnologyCard {
  name: string;
  category: "Deep Learning" | "XAI" | "Database & Cache" | "Cloud & Deployment";
  description: string;
  iconName: string;
}
