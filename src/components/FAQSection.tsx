import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { FAQItem } from "../types";

interface FAQSectionProps {
  isDark: boolean;
}

export default function FAQSection({ isDark }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How accurate is VeritasAI Ultra?",
      answer: "VeritasAI Ultra achieves an ensembled forensic classification accuracy of 98.4% across unified visual and linguistic validation databases (including LIAR and FaceForensics++). We train models with specialized convolutional layer weights to detect synthetic pattern irregularities."
    },
    {
      question: "Which file types are supported by the system?",
      answer: "The AI Analysis Lab handles text and image modalities. You can paste article text or claims for linguistic analysis, and upload images (PNG, JPG, JPEG, WEBP) with a maximum transfer size of 15MB."
    },
    {
      question: "Is my personal content or uploaded media stored on servers?",
      answer: "No. VeritasAI Ultra is engineered to ensure absolute privacy under standard SOC2 frameworks. Scanned files are ingested into RAM-only sandboxed virtual zones, analyzed in real time, and immediately shredded. We never store raw visual or textual assets."
    },
    {
      question: "How is Explainable AI (XAI) used in the reports?",
      answer: "Our diagnostic map generates mathematical proof behind every classification verdict. We utilize Grad-CAM to overlay bounding heatmaps highlighting manipulated facial landmarks, while SHAP computes and marks specific sentences that have a high rate of linguistic bias."
    }
  ];

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase flex items-center justify-center gap-1.5 mb-1">
            <HelpCircle className="w-4 h-4" />
            Support Core
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Got technical questions about our deep learning pipeline or privacy policies? Read our briefs below.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? isDark ? "bg-slate-900/40 border-cyber-blue/30" : "bg-slate-100/40 border-cyber-blue/20"
                    : isDark ? "bg-slate-900/10 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-display font-semibold text-xs sm:text-sm tracking-wide">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyber-blue shrink-0 animate-bounce" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`px-5 pb-5 pt-1 font-sans text-xs sm:text-sm leading-relaxed font-light ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
