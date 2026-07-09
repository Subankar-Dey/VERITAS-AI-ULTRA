import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Image as ImageIcon,
  UploadCloud, AlertTriangle, CheckCircle2, RefreshCw, Trash2,
  Cpu, FileSpreadsheet, ShieldAlert, Globe, ExternalLink
} from "lucide-react";
import { AnalysisResult, DetectionType } from "../types";

interface DetectionSectionProps {
  isDark: boolean;
  onAnalysisComplete: (result: AnalysisResult, previewUrl: string | null) => void;
}

export default function DetectionSection({ isDark, onAnalysisComplete }: DetectionSectionProps) {
  const [activeTab, setActiveTab] = useState<DetectionType>("text");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form inputs
  const [textInput, setTextInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Loading animation sequence state
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resultData, setResultData] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingIntervalRef = useRef<any>(null);

  const handleTabChange = (tab: DetectionType) => {
    setActiveTab(tab);
    resetForm();
  };

  const resetForm = () => {
    setTextInput("");
    setUploadedFile(null);
    setFilePreview(null);
    setStatus("idle");
    setErrorMessage("");
    setResultData(null);
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage("");
    const typeMap: Record<DetectionType, string[]> = {
      text: [],
      image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    };

    const allowedTypes = typeMap[activeTab];
    if (activeTab !== "text") {
      const isValid = allowedTypes.some(t => file.type.toLowerCase().includes(t.split("/")[1]) || file.type === t);
      if (!isValid) {
        setErrorMessage(`Invalid file type. Please upload a supported ${activeTab.toUpperCase()} format.`);
        return;
      }
      setUploadedFile(file);

      // Create a visual URL preview
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Launch core forensic analysis pipeline
  const runForensicAnalysis = async () => {
    setStatus("processing");
    setLoadingStep(0);
    setLoadingProgress(0);

    // Simulate multi-tier loading logs
    const loadingTexts = [
      "Checking Authenticity...",
      "Running AI Models...",
      "Analyzing Content...",
      "Generating Explainability..."
    ];

    let currentProgress = 0;
    loadingIntervalRef.current = setInterval(() => {
      currentProgress += Math.round(Math.random() * 8 + 3);
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(loadingIntervalRef.current);
      }
      setLoadingProgress(currentProgress);
      
      const step = Math.min(3, Math.floor(currentProgress / 25));
      setLoadingStep(step);
    }, 120);

    try {
      const formData = new FormData();
      formData.append("type", activeTab);

      if (activeTab === "text") {
        formData.append("text", textInput);
      } else if (uploadedFile) {
        formData.append("file", uploadedFile);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("VeritasAI server reported an unexpected classification issue.");
      }

      const report: AnalysisResult = await response.json();
      
      // Delay slightly if the model responded too quickly, ensuring visual animation completes for user feedback
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 2400 - currentProgress * 15)));
      
      clearInterval(loadingIntervalRef.current);
      setLoadingProgress(100);
      setResultData(report);
      setStatus("success");
      onAnalysisComplete(report, activeTab === "text" ? null : filePreview);
    } catch (err: any) {
      console.error(err);
      clearInterval(loadingIntervalRef.current);
      setErrorMessage(err.message || "Forensic node returned a critical computing failure.");
      setStatus("error");
    }
  };

  const loadingTexts = [
    "Checking Authenticity...",
    "Running AI Models...",
    "Analyzing Content...",
    "Generating Explainability..."
  ];

  return (
    <section
      id="detection"
      className={`py-24 relative ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Cyber Glow background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Forensic Analyzer</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-4">
            Interactive AI Analysis Lab
          </h2>
          <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Select a target format, feed the forensic buffer with claims or media files, and initiate neural scanning.
          </p>
        </div>

        {/* Central Glass Card container */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
          isDark ? "glass-card-dark" : "glass-card-light"
        }`}>
          {/* Modality Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900/10 dark:bg-slate-900/40 mb-8 border border-slate-900/5 dark:border-white/5">
            {[
              { id: "text", label: "Text Detection", icon: FileText },
              { id: "image", label: "Image Detection", icon: ImageIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as DetectionType)}
                  disabled={status === "processing"}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold tracking-wide rounded-lg transition-all ${
                    isActive
                      ? "bg-cyber-blue text-white shadow-md shadow-cyber-blue/15"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  } disabled:opacity-50`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* TEXT INPUT TAB */}
                {activeTab === "text" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value.slice(0, 5000))}
                        placeholder="Paste a news article, social media post, or sensitive statement here to audit (min 10 characters)..."
                        maxLength={5000}
                        rows={6}
                        className={`w-full p-4 rounded-2xl border text-sm focus:outline-none focus:ring-1 focus:ring-cyber-blue font-sans resize-none transition-all ${
                          isDark 
                            ? "bg-slate-950/80 border-white/5 text-slate-100 placeholder-slate-600" 
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                        }`}
                      />
                      <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-500">
                        {textInput.length}/5000 Characters
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={resetForm}
                        disabled={!textInput}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          isDark 
                            ? "bg-slate-900 border-white/5 text-slate-400 hover:text-white" 
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={runForensicAnalysis}
                        disabled={textInput.trim().length < 10}
                        className="px-6 py-2.5 text-xs font-semibold tracking-wide text-white bg-cyber-blue rounded-lg shadow-lg shadow-cyber-blue/10 hover:bg-cyber-blue/90 disabled:opacity-50 disabled:shadow-none"
                      >
                        Analyze Text
                      </button>
                    </div>
                  </div>
                )}

                {/* MEDIA UPLOAD (Image) */}
                {activeTab !== "text" && (
                  <div className="space-y-6">
                    {!uploadedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-cyber-blue group flex flex-col items-center justify-center ${
                          isDark 
                            ? "border-white/5 bg-slate-950/20 hover:bg-slate-900/20" 
                            : "border-slate-200 bg-slate-100/10 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".png,.jpg,.jpeg,.webp"
                        />
                        <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-105 ${
                          isDark ? "bg-slate-900" : "bg-slate-100"
                        }`}>
                          <UploadCloud className="w-8 h-8 text-cyber-blue" />
                        </div>
                        <h4 className="font-display font-medium text-sm mb-1">
                          Drag & Drop or <span className="text-cyber-blue group-hover:underline">Browse</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mb-2 font-sans">
                          Supported types: PNG, JPG, JPEG, WEBP (Max 15MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${
                          isDark ? "bg-slate-950 border-white/5" : "bg-slate-100/50 border-slate-200"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? "bg-slate-900" : "bg-white"}`}>
                              <ImageIcon className="w-5 h-5 text-cyber-blue" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold max-w-[200px] sm:max-w-sm truncate">{uploadedFile.name}</div>
                              <div className="text-[10px] font-mono text-slate-500">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                            </div>
                          </div>
                          <button
                            onClick={resetForm}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* File preview container */}
                        {filePreview && (
                          <div className={`relative overflow-hidden rounded-2xl border max-h-[300px] flex items-center justify-center ${
                            isDark ? "bg-slate-950 border-white/5" : "bg-slate-100 border-slate-200"
                          }`}>
                            <img src={filePreview} alt="Upload preview" className="object-contain max-h-[300px] w-full" />
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={runForensicAnalysis}
                            className="px-6 py-2.5 text-xs font-semibold tracking-wide text-white bg-cyber-blue rounded-lg shadow-lg shadow-cyber-blue/10 hover:bg-cyber-blue/90"
                          >
                            Analyze {activeTab.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ERROR VIEW */}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-500 mb-2">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-lg text-rose-500">Forensic Scan Aborted</h3>
                <p className={`font-sans text-xs max-w-md mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {errorMessage}
                </p>
                <button
                  onClick={resetForm}
                  className="px-5 py-2 text-xs font-semibold tracking-wide text-white bg-cyber-blue rounded-lg"
                >
                  Reset Buffer
                </button>
              </motion.div>
            )}

            {/* PROCESSING LOADER WITH FLOATING NEURAL GRAPH */}
            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                {/* SVG Neural Network Scanners */}
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                  <svg
                    viewBox="0 0 160 160"
                    className="absolute inset-0 w-full h-full -rotate-90 origin-center [transform-box:fill-box]"
                  >
                    {/* Background track circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                      strokeWidth="5"
                    />
                    {/* Animated scanning progress ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-cyber-blue fill-none transition-[stroke-dashoffset] duration-300 ease-out [filter:drop-shadow(0_0_6px_rgba(14,165,233,0.5))]"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={(2 * Math.PI * 70) * (1 - loadingProgress / 100)}
                    />
                  </svg>

                  {/* Inner floating neural nodes */}
                  <div className="absolute flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 flex items-center justify-center"
                    >
                      <Cpu className="w-7 h-7 text-cyber-blue animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-xl font-bold font-mono text-cyber-blue">{loadingProgress}%</div>
                  <h3 className="font-display font-bold text-base tracking-wide h-6">
                    {loadingTexts[loadingStep]}
                  </h3>
                  <p className="text-[10px] tracking-widest text-slate-500 font-mono uppercase">
                    Ensembling neural features...
                  </p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS VERDICT CARD */}
            {status === "success" && resultData && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-900/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${
                      resultData.verdict === "Authentic" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {resultData.verdict === "Authentic" ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">Analysis Complete</div>
                      <h3 className="font-display font-bold text-xl sm:text-2xl flex items-center gap-2">
                        Verdict:{" "}
                        <span className={resultData.verdict === "Authentic" ? "text-emerald-500" : "text-rose-500"}>
                          {resultData.verdict}
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">Confidence</div>
                      <div className="font-display font-bold text-2xl text-cyber-blue">{resultData.confidence}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">Risk Level</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${
                        resultData.riskLevel === "Low" ? "bg-emerald-500/10 text-emerald-500" :
                        resultData.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-rose-500/10 text-rose-500"
                      }`}>{resultData.riskLevel}</div>
                    </div>
                  </div>
                </div>

                {/* Explanation text */}
                <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isDark ? "bg-slate-950/60" : "bg-slate-50"
                }`}>
                  <p className="font-light">{resultData.explanation}</p>
                </div>

                {/* Detailed Analysis Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-xs tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-cyber-blue" />
                    Neural Classification Audit logs
                  </h4>
                  <ul className="space-y-2.5">
                    {resultData.detailedAnalysis.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-sans font-light leading-normal text-slate-600 dark:text-slate-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-blue mt-1.5"></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Verified Reputable Sources — only rendered when live Google
                    Search grounding actually returned real citations */}
                {resultData.sources && resultData.sources.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-xs tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyber-blue" />
                      Verified Reputable Sources
                    </h4>
                    <ul className="space-y-2">
                      {resultData.sources.map((source, i) => (
                        <li key={i}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-start gap-2 text-xs font-sans leading-normal hover:text-cyber-blue transition-colors ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyber-blue" />
                            <span className="underline decoration-slate-400/40 underline-offset-2">{source.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status bar warnings */}
                {resultData.warning && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <strong>System Status Note:</strong> {resultData.warning}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Forensic engine: {resultData.engine || "unknown"}
                  </span>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={resetForm}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold tracking-wide text-white bg-cyber-blue hover:bg-cyber-blue/90 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Scan Another Item
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
