"use client";

import { cn } from "@/lib/utils";

interface AIOrbProps {
  state?: "idle" | "listening" | "speaking";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AIOrb({ state = "idle", size = "lg", className }: AIOrbProps) {
  const sizeClasses = {
    sm:  "w-20 h-20",
    md:  "w-28 h-28",
    lg:  "w-44 h-44",
    xl:  "w-60 h-60",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>

      {/* ── Layer 0: Wide nebula aurora halo ─────────────────────────── */}
      <div
        className={cn(
          "absolute rounded-full pointer-events-none transition-all duration-1000",
          state === "idle"      && "orb-aurora-idle",
          state === "listening" && "orb-aurora-listen",
          state === "speaking"  && "orb-aurora-speak",
        )}
        style={{ inset: "-55%", filter: "blur(48px)" }}
      />

      {/* ── Layer 1: Conic-gradient chromatic spin ring ───────────────── */}
      <div
        className={cn(
          "absolute rounded-full pointer-events-none",
          state === "idle"      && "orb-conic-idle",
          state === "listening" && "orb-conic-listen",
          state === "speaking"  && "orb-conic-speak",
        )}
        style={{ inset: "-12%", filter: "blur(3px)" }}
      />

      {/* ── Layer 2: Thin counter-rotating orbital ring ───────────────── */}
      <div
        className={cn(
          "absolute rounded-full border pointer-events-none transition-all duration-700",
          state === "idle"      && "inset-[2%] border-indigo-400/35 orb-orbit-idle",
          state === "listening" && "inset-[2%] border-emerald-400/45 orb-orbit-listen",
          state === "speaking"  && "inset-[1%] border-violet-400/55 orb-orbit-speak",
        )}
      />

      {/* ── Layer 3: Core glass sphere ────────────────────────────────── */}
      <div
        className={cn(
          "absolute rounded-full overflow-hidden transition-all duration-700 pointer-events-none",
          state === "idle"      && "inset-[14%] orb-sphere-idle",
          state === "listening" && "inset-[12%] orb-sphere-listen",
          state === "speaking"  && "inset-[10%] orb-sphere-speak",
        )}
      >
        {/* Liquid morphing blob inside */}
        <div
          className={cn(
            "absolute inset-0 opacity-70 mix-blend-screen",
            state === "idle"      && "orb-blob-idle",
            state === "listening" && "orb-blob-listen",
            state === "speaking"  && "orb-blob-speak",
          )}
        />

        {/* Glass top-left highlight — realistic sphere lighting */}
        <div
          className="absolute bg-white/28 blur-[2px]"
          style={{
            width: "48%", height: "36%",
            top: "9%", left: "12%",
            borderRadius: "50%",
            transform: "rotate(-25deg)",
          }}
        />
        {/* Bright specular dot */}
        <div
          className="absolute bg-white/50 blur-[1px]"
          style={{
            width: "18%", height: "14%",
            top: "14%", left: "20%",
            borderRadius: "50%",
          }}
        />
        {/* Bottom depth shadow */}
        <div
          className="absolute bg-black/35 blur-sm"
          style={{
            width: "65%", height: "24%",
            bottom: "7%", left: "17%",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ── Layer 4a: Listening ripple rings ──────────────────────────── */}
      {state === "listening" && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-emerald-400/55 orb-ripple-1" />
          <div className="absolute inset-0 rounded-full border   border-emerald-300/35 orb-ripple-2" />
          <div className="absolute inset-0 rounded-full border   border-cyan-400/20    orb-ripple-3" />
        </>
      )}

      {/* ── Layer 4b: Speaking frequency arc rings ────────────────────── */}
      {state === "speaking" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full orb-freq"
              style={{
                inset: `${-8 - i * 8}%`,
                animationDelay: `${i * 0.13}s`,
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: i % 2 === 0
                  ? "rgba(167,139,250,0.30)"
                  : "rgba(236,72,153,0.22)",
              }}
            />
          ))}
        </>
      )}

      {/* ── Layer 5: Orbital micro-particles ─────────────────────────── */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const r = 54;
        return (
          <div
            key={i}
            className={cn(
              "absolute w-[3px] h-[3px] rounded-full pointer-events-none transition-all duration-500",
              state === "idle"      && "bg-indigo-300/55  orb-dot-idle",
              state === "listening" && "bg-emerald-300/75 orb-dot-listen",
              state === "speaking"  && "bg-violet-300/80  orb-dot-speak",
            )}
            style={{
              left: `calc(50% + ${Math.cos(angle) * r}px)`,
              top:  `calc(50% + ${Math.sin(angle) * r}px)`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        );
      })}

      <style jsx>{`

        /* ═══════════════════════════════════════════════════════════════
           LAYER 0 — Nebula aurora halo
        ═══════════════════════════════════════════════════════════════ */

        .orb-aurora-idle {
          background: radial-gradient(ellipse at 40% 40%,
            rgba(99,102,241,0.55) 0%,
            rgba(139,92,246,0.40) 40%,
            rgba(168,85,247,0.20) 70%,
            transparent 100%);
          animation: aurora-idle 9s ease-in-out infinite;
        }
        .orb-aurora-listen {
          background: radial-gradient(ellipse at 40% 40%,
            rgba(16,185,129,0.60) 0%,
            rgba(6,182,212,0.42) 40%,
            rgba(52,211,153,0.20) 70%,
            transparent 100%);
          animation: aurora-listen 4.5s ease-in-out infinite;
        }
        .orb-aurora-speak {
          background: radial-gradient(ellipse at 40% 40%,
            rgba(139,92,246,0.65) 0%,
            rgba(236,72,153,0.48) 35%,
            rgba(245,158,11,0.22) 65%,
            transparent 100%);
          animation: aurora-speak 2.8s ease-in-out infinite;
        }

        @keyframes aurora-idle {
          0%,100% { opacity:0.75; transform:scale(1) rotate(0deg); filter:hue-rotate(0deg) blur(48px); }
          50%      { opacity:0.90; transform:scale(1.06) rotate(180deg); filter:hue-rotate(25deg) blur(44px); }
        }
        @keyframes aurora-listen {
          0%,100% { opacity:0.80; transform:scale(1); filter:hue-rotate(0deg) blur(48px); }
          50%      { opacity:1.00; transform:scale(1.10); filter:hue-rotate(-18deg) blur(40px); }
        }
        @keyframes aurora-speak {
          0%,100% { opacity:0.85; transform:scale(1)   rotate(0deg);   filter:hue-rotate(0deg) blur(46px); }
          33%     { opacity:1.00; transform:scale(1.12) rotate(120deg); filter:hue-rotate(35deg) blur(38px); }
          66%     { opacity:0.90; transform:scale(1.06) rotate(240deg); filter:hue-rotate(-22deg) blur(42px); }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 1 — Conic-gradient chromatic orbit ring
        ═══════════════════════════════════════════════════════════════ */

        .orb-conic-idle {
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(99,102,241,0.55) 18%,
            rgba(139,92,246,0.65) 36%,
            rgba(196,181,253,0.40) 50%,
            transparent 64%,
            rgba(99,102,241,0.35) 82%,
            transparent 100%
          );
          animation: conic-spin 14s linear infinite;
        }
        .orb-conic-listen {
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(16,185,129,0.55) 16%,
            rgba(6,182,212,0.65) 34%,
            rgba(167,243,208,0.40) 50%,
            transparent 64%,
            rgba(16,185,129,0.35) 82%,
            transparent 100%
          );
          animation: conic-spin 7s linear infinite;
        }
        .orb-conic-speak {
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(139,92,246,0.60) 12%,
            rgba(236,72,153,0.55) 28%,
            rgba(245,158,11,0.45) 44%,
            rgba(196,181,253,0.35) 58%,
            transparent 70%,
            rgba(139,92,246,0.40) 88%,
            transparent 100%
          );
          animation: conic-spin 4s linear infinite;
        }

        @keyframes conic-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 2 — Thin orbital border ring (counter-spin)
        ═══════════════════════════════════════════════════════════════ */

        .orb-orbit-idle   { animation: orbit-ccw 28s linear infinite; }
        .orb-orbit-listen { animation: orbit-ccw 14s linear infinite; }
        .orb-orbit-speak  { animation: orbit-ccw  6s linear infinite; }

        @keyframes orbit-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 3 — Core glass sphere
        ═══════════════════════════════════════════════════════════════ */

        .orb-sphere-idle {
          background: linear-gradient(135deg,
            #4f46e5 0%, #7c3aed 40%, #6d28d9 70%, #312e81 100%);
          box-shadow:
            inset 0 -10px 28px rgba(0,0,0,0.45),
            inset 0  5px 14px rgba(255,255,255,0.18),
            0 0 32px rgba(99,102,241,0.50),
            0 0 60px rgba(139,92,246,0.25);
          animation: sphere-breathe-idle 8s ease-in-out infinite;
        }
        .orb-sphere-listen {
          background: linear-gradient(135deg,
            #059669 0%, #0d9488 35%, #0891b2 65%, #065f46 100%);
          box-shadow:
            inset 0 -10px 28px rgba(0,0,0,0.45),
            inset 0  5px 14px rgba(255,255,255,0.20),
            0 0 36px rgba(16,185,129,0.60),
            0 0 70px rgba(6,182,212,0.28);
          animation: sphere-breathe-listen 3.5s ease-in-out infinite;
        }
        .orb-sphere-speak {
          background: linear-gradient(135deg,
            #7c3aed 0%, #c026d3 30%, #db2777 55%, #b45309 85%, #7c3aed 100%);
          background-size: 200% 200%;
          box-shadow:
            inset 0 -10px 28px rgba(0,0,0,0.50),
            inset 0  5px 14px rgba(255,255,255,0.22),
            0 0 40px rgba(139,92,246,0.65),
            0 0 75px rgba(236,72,153,0.35);
          animation: sphere-breathe-speak 2s ease-in-out infinite, sphere-hue-cycle 4s linear infinite;
        }

        @keyframes sphere-breathe-idle {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.03); }
        }
        @keyframes sphere-breathe-listen {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.06); }
        }
        @keyframes sphere-breathe-speak {
          0%,100% { transform:scale(1); }
          30%      { transform:scale(1.08); }
          60%      { transform:scale(0.96); }
        }
        @keyframes sphere-hue-cycle {
          0%   { filter:hue-rotate(0deg); }
          100% { filter:hue-rotate(360deg); }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 3 inner — Liquid morphing blob
        ═══════════════════════════════════════════════════════════════ */

        .orb-blob-idle {
          background: radial-gradient(ellipse at 35% 30%,
            rgba(196,181,253,0.85) 0%,
            rgba(167,139,250,0.55) 45%,
            transparent 75%);
          animation: blob-idle 10s ease-in-out infinite;
        }
        .orb-blob-listen {
          background: radial-gradient(ellipse at 35% 30%,
            rgba(167,243,208,0.85) 0%,
            rgba(94,234,212,0.55) 45%,
            transparent 75%);
          animation: blob-listen 4s ease-in-out infinite;
        }
        .orb-blob-speak {
          background: radial-gradient(ellipse at 35% 30%,
            rgba(251,207,232,0.90) 0%,
            rgba(253,186,116,0.55) 40%,
            transparent 72%);
          animation: blob-speak 2.2s ease-in-out infinite;
        }

        @keyframes blob-idle {
          0%,100% { transform:translate(0,0) scale(1);      border-radius:50%; }
          33%      { transform:translate(6%,-5%) scale(1.06); border-radius:60% 40% 55% 45%/45% 55% 45% 55%; }
          66%      { transform:translate(-5%,5%) scale(0.96); border-radius:40% 60% 45% 55%/55% 45% 55% 45%; }
        }
        @keyframes blob-listen {
          0%,100% { transform:scale(1)    translate(0,0);    border-radius:50%; }
          25%      { transform:scale(1.10) translate(4%,-4%); border-radius:58% 42% 62% 38%/38% 62% 38% 62%; }
          75%      { transform:scale(0.93) translate(-4%,4%); border-radius:42% 58% 38% 62%/62% 38% 62% 38%; }
        }
        @keyframes blob-speak {
          0%,100% { transform:scale(1)    rotate(0deg);   border-radius:50%; opacity:0.70; }
          20%      { transform:scale(1.12) rotate(40deg);  border-radius:62% 38% 56% 44%/44% 62% 38% 56%; opacity:0.85; }
          40%      { transform:scale(0.90) rotate(90deg);  border-radius:38% 62% 44% 56%/56% 38% 62% 44%; opacity:0.68; }
          60%      { transform:scale(1.10) rotate(135deg); border-radius:56% 44% 62% 38%/38% 56% 44% 62%; opacity:0.80; }
          80%      { transform:scale(0.94) rotate(180deg); border-radius:44% 56% 38% 62%/62% 44% 56% 38%; opacity:0.72; }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 4a — Listening ripples
        ═══════════════════════════════════════════════════════════════ */

        .orb-ripple-1 { animation: ripple-out 2.4s ease-out infinite 0s; }
        .orb-ripple-2 { animation: ripple-out 2.4s ease-out infinite 0.5s; }
        .orb-ripple-3 { animation: ripple-out 2.4s ease-out infinite 1.0s; }

        @keyframes ripple-out {
          0%   { transform:scale(0.88); opacity:0.9; }
          100% { transform:scale(2.40); opacity:0; }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 4b — Speaking frequency arcs
        ═══════════════════════════════════════════════════════════════ */

        .orb-freq { animation: freq-pulse 1.7s ease-out infinite; }

        @keyframes freq-pulse {
          0%   { transform:scale(1);    opacity:0.50; }
          50%  {                        opacity:0.20; }
          100% { transform:scale(1.45); opacity:0; }
        }

        /* ═══════════════════════════════════════════════════════════════
           LAYER 5 — Orbital micro-particles
        ═══════════════════════════════════════════════════════════════ */

        .orb-dot-idle   { animation: dot-float  3.8s ease-in-out infinite; }
        .orb-dot-listen { animation: dot-pulse  1.5s ease-in-out infinite; }
        .orb-dot-speak  { animation: dot-burst  1.9s ease-out    infinite; }

        @keyframes dot-float {
          0%,100% { transform:translateY(0)    scale(1);   opacity:0.50; }
          50%      { transform:translateY(-5px) scale(1.4); opacity:0.80; }
        }
        @keyframes dot-pulse {
          0%,100% { transform:scale(0.7); opacity:0.30; }
          50%      { transform:scale(1.7); opacity:1.00; }
        }
        @keyframes dot-burst {
          0%   { transform:translate(0,0)        scale(1);   opacity:0.85; }
          100% { transform:translate(7px,-11px)  scale(0);   opacity:0; }
        }

      `}</style>
    </div>
  );
}
