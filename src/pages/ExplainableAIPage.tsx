import ExplainableAISection from "../components/ExplainableAISection";
import { useLayout } from "../Layout";

export default function ExplainableAIPage() {
  const { isDark, activeResult, activePreviewUrl } = useLayout();
  return (
    <ExplainableAISection
      isDark={isDark}
      activeResult={activeResult}
      activePreviewUrl={activePreviewUrl}
    />
  );
}
