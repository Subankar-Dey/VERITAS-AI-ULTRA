import DetectionSection from "../components/DetectionSection";
import ExplainableAISection from "../components/ExplainableAISection";
import { useLayout } from "../Layout";
import { AnalysisResult } from "../types";

export default function DetectionPage() {
  const { isDark, activeResult, activePreviewUrl, setAnalysis } = useLayout();

  const handleAnalysisComplete = (result: AnalysisResult, previewUrl: string | null) => {
    // Lifted to Layout so the Explainable AI diagnostics panel rendered
    // below stays in sync with the latest scan, in place on this page.
    setAnalysis(result, previewUrl);
  };

  return (
    <>
      <DetectionSection isDark={isDark} onAnalysisComplete={handleAnalysisComplete} />
      <ExplainableAISection
        isDark={isDark}
        activeResult={activeResult}
        activePreviewUrl={activePreviewUrl}
        embedded
      />
    </>
  );
}
