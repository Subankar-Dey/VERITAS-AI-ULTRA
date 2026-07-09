import ContactSection from "../components/ContactSection";
import { useLayout } from "../Layout";

export default function ContactPage() {
  const { isDark } = useLayout();
  return <ContactSection isDark={isDark} />;
}
