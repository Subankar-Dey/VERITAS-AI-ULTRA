import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, ImageOff } from "lucide-react";
import { HeatmapCoordinate } from "../../types";

interface GradCAMCardProps {
  isDark: boolean;
  previewUrl: string | null;
  coordinates: HeatmapCoordinate[];
  isImagePayload: boolean;
}

export default function GradCAMCard({ isDark, previewUrl, coordinates, isImagePayload }: GradCAMCardProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Grad-CAM Spatial Layer</span>
        <h4 className="font-display font-bold text-base sm:text-lg mb-1">Spatial Artifact Pinpointing</h4>
        <p className={`font-sans text-xs font-light ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Interactive heatmap circles identify the precise spatial regions where CNN models detected synthetic overlay patterns.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-slate-950 flex items-center justify-center max-h-[280px] min-h-[220px] my-4 shadow-inner">
        {isImagePayload && previewUrl ? (
          <div className="relative w-full max-h-[280px] flex items-center justify-center">
            <img src={previewUrl} alt="Payload preview" className="object-contain max-h-[280px] w-full" />
            {coordinates.map((coord, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="absolute rounded-full border-2 border-rose-500 bg-rose-500/20 cursor-pointer animate-pulse transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  width: `${coord.radius * 2}%`,
                  height: `${coord.radius * 2}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: -45 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bg-slate-900 border border-white/10 text-[10px] text-white p-2.5 rounded shadow-xl w-48 text-center pointer-events-none z-30"
                    >
                      <div className="font-mono font-bold text-[9px] text-rose-500 uppercase tracking-widest mb-0.5">FORENSIC SPIKE</div>
                      <div className="font-semibold leading-normal font-sans">{coord.label}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center px-6">
            {isImagePayload ? (
              <>
                <Compass className="w-10 h-10 text-cyber-blue mb-3 animate-spin" style={{ animationDuration: "15s" }} />
                <p>Upload an image to render visual hotspot overlays.</p>
              </>
            ) : (
              <>
                <ImageOff className="w-10 h-10 text-slate-600 mb-3" />
                <p>Grad-CAM applies to image payloads only &mdash; the last analyzed item was text. Switch to Attention or SHAP to inspect linguistic evidence.</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-[10px] font-mono text-slate-500 text-center">
        * Grad-CAM calculates spatial feature weights over final convolutional feature layers.
      </div>
    </div>
  );
}
