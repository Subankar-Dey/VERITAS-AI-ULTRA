import { useState, useEffect } from "react";
import { Outlet, useOutletContext, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AnalysisResult } from "./types";

/** Shared context threaded to every routed page via <Outlet>. */
export interface LayoutContext {
  isDark: boolean;
  activeResult: AnalysisResult | null;
  activePreviewUrl: string | null;
  setAnalysis: (result: AnalysisResult, previewUrl: string | null) => void;
}

/** Typed accessor so pages don't repeat the generic. */
export function useLayout(): LayoutContext {
  return useOutletContext<LayoutContext>();
}

/** Reset scroll position to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or default to dark mode for a sleek cybersecurity design
    const saved = localStorage.getItem("veritas_theme");
    return saved ? saved === "dark" : true;
  });

  // Analysis result is lifted here so it survives navigation between
  // the Detection page and the Explainable AI page.
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  // Sync theme with document class list
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("veritas_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("veritas_theme", "light");
    }
  }, [isDark]);

  const setAnalysis = (result: AnalysisResult, previewUrl: string | null) => {
    setActiveResult(result);
    setActivePreviewUrl(previewUrl);
  };

  const context: LayoutContext = { isDark, activeResult, activePreviewUrl, setAnalysis };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      <ScrollToTop />

      {/* Dynamic ambient grid overlay across background */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${
        isDark ? "grid-background" : "grid-background-light"
      }`}></div>

      {/* Header / Navigation */}
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      {/* Routed page content. Each section carries its own top padding
          (Hero `pt-24`, others `py-24`), which clears the fixed navbar. */}
      <main className="relative z-10">
        <Outlet context={context} />
      </main>

      {/* Footer Details */}
      <Footer isDark={isDark} />
    </div>
  );
}
