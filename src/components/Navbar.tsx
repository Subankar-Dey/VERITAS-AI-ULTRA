import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { motion } from "motion/react";
import { ShieldCheck, Sun, Moon, Github, LogIn } from "lucide-react";

interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function Navbar({ isDark, setIsDark }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      const delta = currentY - lastScrollY.current;
      if (currentY < 80) {
        setHidden(false);
      } else if (delta > 4) {
        setHidden(true); // scrolling down — tuck the bar away
      } else if (delta < -4) {
        setHidden(false); // scrolling up — bring it back
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/features" },
    { name: "Detection", to: "/detection" },
    { name: "How It Works", to: "/how-it-works" },
    { name: "AI Technology", to: "/technology" },
    { name: "Research", to: "/research" },
    { name: "FAQ", to: "/faq" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <motion.nav
      id="navbar"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? isDark
            ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3"
            : "bg-white/80 backdrop-blur-md border-b border-slate-900/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <ShieldCheck className="w-8 h-8 text-cyber-blue relative z-10 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyber-blue/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className={`font-display font-bold text-lg sm:text-xl tracking-tight transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-600"
            }`}>
              VERITASAI <span className="text-cyber-blue">ULTRA</span>
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `font-sans text-xs font-medium tracking-wide transition-colors hover:text-cyber-blue ${
                    isActive
                      ? "text-cyber-blue"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Utility buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-all border ${
                isDark
                  ? "bg-slate-900 border-white/5 text-slate-300 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950"
              }`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* GitHub Mock Button */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={`p-2 rounded-lg transition-all border hidden sm:inline-flex ${
                isDark
                  ? "bg-slate-900 border-white/5 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200"
              }`}
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Get Started / Login CTA */}
            <Link
              to="/detection"
              className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-wide text-white rounded-lg bg-cyber-blue transition-all hover:bg-cyber-blue/90 shadow-lg shadow-cyber-blue/10 hover:shadow-cyber-blue/20 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Get Started
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
