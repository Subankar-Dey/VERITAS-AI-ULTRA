import TechnologySection from "../components/TechnologySection";
import PerformanceSection from "../components/PerformanceSection";
import { useLayout } from "../Layout";

export default function TechnologyPage() {
  const { isDark } = useLayout();
  // Performance benchmarks have no dedicated navbar tab, so they live
  // alongside the AI Technology stack they describe.
  return (
    <>
      <TechnologySection isDark={isDark} />
      <PerformanceSection isDark={isDark} />
    </>
  );
}
