import Features from "../components/Features";
import { useLayout } from "../Layout";

export default function FeaturesPage() {
  const { isDark } = useLayout();
  return <Features isDark={isDark} />;
}
