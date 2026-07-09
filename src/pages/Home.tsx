import HeroSection from "../components/HeroSection";
import { useLayout } from "../Layout";

export default function Home() {
  const { isDark } = useLayout();
  return <HeroSection isDark={isDark} />;
}
