import HowItWorks from "../components/HowItWorks";
import { useLayout } from "../Layout";

export default function HowItWorksPage() {
  const { isDark } = useLayout();
  return <HowItWorks isDark={isDark} />;
}
