import { Link } from "react-router";
import { ShieldCheck, Mail, Github, Linkedin } from "lucide-react";

interface FooterProps {
  isDark: boolean;
}

export default function Footer({ isDark }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`py-12 relative overflow-hidden ${
        isDark ? "bg-slate-950 text-white border-t border-white/5" : "bg-white text-slate-900 border-t border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900/5 dark:border-white/5">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyber-blue" />
            <span className="font-display font-bold text-base tracking-tight">
              VERITASAI <span className="text-cyber-blue">ULTRA</span>
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-cyber-blue transition-colors">Home</Link>
            <Link to="/features" className="hover:text-cyber-blue transition-colors">Features</Link>
            <Link to="/detection" className="hover:text-cyber-blue transition-colors">Detection</Link>
            <Link to="/how-it-works" className="hover:text-cyber-blue transition-colors">Process</Link>
            <Link to="/technology" className="hover:text-cyber-blue transition-colors">Tech Stack</Link>
            <Link to="/explainable-ai" className="hover:text-cyber-blue transition-colors">XAI Diagnostic</Link>
            <Link to="/research" className="hover:text-cyber-blue transition-colors">Research Paper</Link>
            <Link to="/faq" className="hover:text-cyber-blue transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-cyber-blue transition-colors">Contact</Link>
          </div>

          {/* Icon lists */}
          <div className="flex items-center gap-4 text-slate-400">
            <a href="mailto:contact@veritasai.ultra" aria-label="Mail Link" className="hover:text-cyber-blue transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub Link" className="hover:text-cyber-blue transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn Link" className="hover:text-cyber-blue transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Copyright claims */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] font-mono text-slate-500">
          <div>
            &copy; {currentYear} VeritasAI Ultra Inc. All forensic analytical rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:underline">Privacy Regulation Policy</a>
            <a href="#terms" className="hover:underline">Terms of Diagnostic Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
