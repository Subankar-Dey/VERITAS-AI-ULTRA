import ResearchSection from "../components/ResearchSection";
import { useLayout } from "../Layout";

export default function ResearchPage() {
  const { isDark } = useLayout();
  return <ResearchSection isDark={isDark} />;
}
