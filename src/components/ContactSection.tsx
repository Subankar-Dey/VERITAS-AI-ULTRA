import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Github, Linkedin, Send, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactSectionProps {
  isDark: boolean;
}

export default function ContactSection({ isDark }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ticketHash, setTicketHash] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitState("error");
      setStatusMsg("Please fill out all required fields.");
      return;
    }

    setSubmitState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register inquiry.");

      setTicketHash(data.message || "VA-X9031L");
      setSubmitState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error(err);
      setSubmitState("error");
      setStatusMsg(err.message || "Service encountered a network transport error.");
    }
  };

  return (
    <section
      id="contact"
      className={`py-24 border-b relative ${
        isDark ? "bg-slate-950 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* LEFT COLUMN: Info details & socials (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase">Get in Touch</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-none">
                Contact Our Forensic Team
              </h2>
              <p className={`font-sans text-sm font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Interested in deploying VeritasAI Ultra on-premise, securing custom enterprise model licenses, 
                or collaborating on deep learning research? Reach out to our specialist group.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
                    <Mail className="w-4 h-4 text-cyber-blue" />
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-slate-500 font-mono uppercase">Direct Inquiries</div>
                    <div className="text-xs sm:text-sm font-medium hover:text-cyber-blue transition-colors">
                      <a href="mailto:contact@veritasai.ultra">contact@veritasai.ultra</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
                    <ShieldCheck className="w-4 h-4 text-cyber-purple" />
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider text-slate-500 font-mono uppercase">Incident Room</div>
                    <div className="text-xs sm:text-sm font-medium hover:text-cyber-blue transition-colors">
                      <a href="mailto:forensics@veritasai.ultra">forensics@veritasai.ultra</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media anchors */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500">Global Network Connect</h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: Mail, url: "mailto:contact@veritasai.ultra", label: "Email Support" },
                  { icon: Github, url: "https://github.com", label: "Github Core" },
                  { icon: Linkedin, url: "https://linkedin.com", label: "LinkedIn Team" }
                ].map((item, idx) => {
                  const SocialIcon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className={`p-3 rounded-xl border transition-all hover:scale-105 hover:border-cyber-blue hover:text-cyber-blue ${
                        isDark 
                          ? "bg-slate-900/60 border-white/5 text-slate-400" 
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <SocialIcon className="w-4.5 h-4.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Modern Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-8 rounded-3xl border ${isDark ? "glass-card-dark" : "glass-card-light"}`}>
              {submitState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="inline-flex p-3.5 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-emerald-500">Inquiry Authenticated</h3>
                  <p className={`font-sans text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Your forensic contact ticket has been successfully compiled and registered in our queue.
                  </p>
                  <div className={`p-3.5 rounded-xl border text-xs font-mono inline-block ${
                    isDark ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
                  }`}>
                    Hash ID: <span className="text-cyber-blue font-bold">{ticketHash}</span>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitState("idle")}
                      className="px-5 py-2 text-xs font-semibold text-white bg-cyber-blue rounded-lg"
                    >
                      New Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-cyber-blue ${
                          isDark 
                            ? "bg-slate-950/80 border-white/5 text-slate-100" 
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-cyber-blue ${
                          isDark 
                            ? "bg-slate-950/80 border-white/5 text-slate-100" 
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-cyber-blue ${
                        isDark 
                          ? "bg-slate-950/80 border-white/5 text-slate-100" 
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-cyber-blue resize-none ${
                        isDark 
                          ? "bg-slate-950/80 border-white/5 text-slate-100" 
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  {submitState === "error" && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {statusMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === "loading"}
                    className="w-full inline-flex items-center justify-center px-5 py-3.5 text-xs font-semibold tracking-wide text-white bg-cyber-blue hover:bg-cyber-blue/90 rounded-xl shadow-lg shadow-cyber-blue/10 transition-all disabled:opacity-55"
                  >
                    {submitState === "loading" ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Verifying Message Buffer...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Transmit Encrypted Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
