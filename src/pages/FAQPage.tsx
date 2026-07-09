import FAQSection from "../components/FAQSection";
import { useLayout } from "../Layout";

export default function FAQPage() {
  const { isDark } = useLayout();
  return <FAQSection isDark={isDark} />;
}
