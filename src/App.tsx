import { Routes, Route } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home";
import FeaturesPage from "./pages/FeaturesPage";
import DetectionPage from "./pages/DetectionPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import TechnologyPage from "./pages/TechnologyPage";
import ExplainableAIPage from "./pages/ExplainableAIPage";
import ResearchPage from "./pages/ResearchPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="detection" element={<DetectionPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="technology" element={<TechnologyPage />} />
        <Route path="explainable-ai" element={<ExplainableAIPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="contact" element={<ContactPage />} />
        {/* Unknown paths fall back to Home */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
