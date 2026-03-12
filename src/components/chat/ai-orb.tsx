"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface AIOrbProps {
  state: OrbState;
  size?: number;
  className?: string;
  audioLevel?: number;
}

/* ════════════════════════════════════════════════════════════
   PARTICLE ENGINE — Canvas-based orbital particle system
   ════════════════════════════════════════════════════════════ */

interface Particle {
  x: number; y: number; vx: number; vy: number;
  baseR: number; r: number; angle: number; orbit: number;
  speed: number; brightness: number; alpha: number; hue: number;
  trail: { x: number; y: number }[];
}

function spawnParticle(cx: number, cy: number, orbR: number, i: number, n: number): Particle {
  const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
  const orbit = orbR * (0.45 + Math.random() * 0.8);
  return {
    x: cx + Math.cos(a) * orbit, y: cy + Math.sin(a) * orbit,
    vx: 0, vy: 0,
    baseR: 0.8 + Math.random() * 2.2, r: 1.2,
    angle: a, orbit,
    speed: (0.0015 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
    brightness: 0.5 + Math.random() * 0.5,
    alpha: 0.25 + Math.random() * 0.75,
    hue: 220 + Math.random() * 60,
    trail: [],
  };
}

function useParticleCanvas(
  ref: React.RefObject<HTMLCanvasElement | null>,
  size: number,
  stateRef: React.RefObject<OrbState>,
  audioLevelRef: React.RefObject<number>,
) {
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const t = useRef(0);
  const initialized = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cs = size * 2;
    c.width = cs * dpr; c.height = cs * dpr;
    c.style.width = cs + "px"; c.style.height = cs + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = cs / 2, cy = cs / 2, orbR = size * 0.42;
    const N = 60;

    if (!initialized.current) {
      particles.current = Array.from({ length: N }, (_, i) => spawnParticle(cx, cy, orbR, i, N));
      initialized.current = true;
    }

    const palette: Record<OrbState, { h: number; s: number; l: number }> = {
      idle:      { h: 245, s: 85, l: 48 },
      listening: { h: 228, s: 90, l: 45 },
      thinking:  { h: 275, s: 85, l: 45 },
      speaking:  { h: 228, s: 90, l: 45 },
    };

    function tick() {
      if (!ctx) return;
      const state = stateRef.current!;
      const al = audioLevelRef.current ?? 0;
      t.current++;
      const T = t.current;
      const col = palette[state];
      ctx.clearRect(0, 0, cs, cs);

      for (const p of particles.current) {
        const baseSpd = state === "speaking" ? 2.8 : state === "listening" ? 2 : state === "thinking" ? 0.5 : 1;
        const spd = baseSpd * (1 + al * 3);
        const orbitMul = state === "listening" ? 1.35 : state === "speaking" ? 1.2 + al * 0.3 : state === "thinking" ? 0.8 : 1;

        p.angle += p.speed * spd;
        const tx = cx + Math.cos(p.angle) * p.orbit * orbitMul;
        const ty = cy + Math.sin(p.angle) * p.orbit * orbitMul;
        p.vx += (tx - p.x) * 0.035; p.vy += (ty - p.y) * 0.035;
        p.vx *= 0.91; p.vy *= 0.91;

        if (state === "listening") {
          const scatter = 1.5 + al * 3;
          p.vx += (Math.random() - 0.5) * scatter;
          p.vy += (Math.random() - 0.5) * scatter;
        }
        if (state === "speaking") {
          const dx = p.x - cx, dy = p.y - cy;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const pulse = (Math.sin(T * 0.09 + p.angle * 2.5) * 0.5 + 0.5) * (1 + al * 2);
          p.vx += (dx / d) * pulse; p.vy += (dy / d) * pulse;
        }

        p.x += p.vx; p.y += p.vy;

        p.trail.push({ x: p.x, y: p.y });
        const trailLen = state === "speaking" ? 12 : state === "listening" ? 8 : 4;
        if (p.trail.length > trailLen) p.trail.shift();

        const sp = state === "speaking"
          ? 1 + Math.sin(T * 0.12 + p.angle * 3) * 0.5
          : state === "listening"
          ? 1 + Math.sin(T * 0.07 + p.angle) * 0.35
          : 1 + Math.sin(T * 0.025 + p.angle) * 0.12;
        p.r = p.baseR * sp;
        p.hue += (col.h + (p.angle * 8) % 30 - p.hue) * 0.025;

        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.r) || p.r <= 0) {
          const a = Math.random() * Math.PI * 2;
          p.x = cx + Math.cos(a) * orbR; p.y = cy + Math.sin(a) * orbR;
          p.vx = 0; p.vy = 0; p.trail = [];
          continue;
        }

        for (let j = 0; j < p.trail.length - 1; j++) {
          const pt = p.trail[j];
          if (!isFinite(pt.x) || !isFinite(pt.y)) continue;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},${col.s}%,${col.l}%,${(j / p.trail.length) * p.alpha * 0.2})`;
          ctx.fill();
        }

        const gr = p.r * 5;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
        g.addColorStop(0, `hsla(${p.hue},${col.s}%,${col.l + 12}%,${p.alpha * p.brightness * 0.3})`);
        g.addColorStop(1, `hsla(${p.hue},${col.s}%,${col.l}%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},${col.s - 5}%,${Math.min(col.l + 28, 97)}%,${p.alpha * p.brightness})`;
        ctx.fill();
      }
      raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [ref, size, stateRef, audioLevelRef]);
}

/* ════════════════════════════════════════════════════════════
   CSS BLOB RADII — GPU-accelerated border-radius keyframes
   replaces SVG path morphing (was blocking main thread)
   ════════════════════════════════════════════════════════════ */

const BLOB_KEYS: string[][] = [
  [
    '62% 38% 54% 46% / 44% 56% 44% 56%',
    '38% 62% 46% 54% / 56% 44% 56% 44%',
    '54% 46% 62% 38% / 50% 50% 38% 62%',
    '62% 38% 54% 46% / 44% 56% 44% 56%',
  ],
  [
    '46% 54% 44% 56% / 52% 48% 52% 48%',
    '58% 42% 52% 48% / 44% 56% 46% 54%',
    '42% 58% 56% 44% / 60% 40% 54% 46%',
    '46% 54% 44% 56% / 52% 48% 52% 48%',
  ],
  [
    '52% 48% 48% 52% / 48% 52% 46% 54%',
    '44% 56% 54% 46% / 56% 44% 52% 48%',
    '58% 42% 46% 54% / 44% 56% 58% 42%',
    '52% 48% 48% 52% / 48% 52% 46% 54%',
  ],
  [
    '55% 45% 50% 50% / 46% 54% 50% 50%',
    '45% 55% 52% 48% / 54% 46% 48% 52%',
    '50% 50% 44% 56% / 50% 50% 54% 46%',
    '55% 45% 50% 50% / 46% 54% 50% 50%',
  ],
];

/* ════════════════════════════════════════════════════════════
   FLOATING MINI-ORBS
   ════════════════════════════════════════════════════════════ */

interface MiniOrbPalette { c: string[]; ic: string[]; glow: string }

function MiniOrbs({ size, state, p }: { size: number; state: OrbState; p: MiniOrbPalette }) {
  const configs = [
    { ci: 2, gi: 1, sz: 6, orbit: size * 0.62, speed: 20, yDrift: 10, delay: 0 },
    { ci: 4, gi: 3, sz: 5, orbit: size * 0.72, speed: 28, yDrift: -8,  delay: 0.6 },
    { ci: 1, gi: 0, sz: 7, orbit: size * 0.55, speed: 22, yDrift: 7,   delay: 1.3 },
    { ci: 3, gi: 2, sz: 4, orbit: size * 0.78, speed: 32, yDrift: -12, delay: 0.9 },
    { ci: 0, gi: 1, sz: 5, orbit: size * 0.65, speed: 25, yDrift: 6,   delay: 1.8 },
  ];
  const active = state !== "idle";
  return (
    <>
      {configs.map((o, i) => {
        const color = p.ic[o.ci];
        const glow  = p.c[o.gi];
        return (
          <motion.div
            key={`mo-${i}`}
            className="absolute pointer-events-none"
            style={{ width: o.orbit * (active ? 0.7 : 1), height: o.orbit * (active ? 0.7 : 1) }}
            animate={{ rotate: 360 }}
            transition={{ rotate: { duration: o.speed, repeat: Infinity, ease: "linear" } }}
          >
            <motion.div
              className="absolute rounded-full"
              style={{
                width: o.sz, height: o.sz,
                top: -(o.sz / 2), left: `calc(50% - ${o.sz / 2}px)`,
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${color}, ${glow})`,
                boxShadow: `0 0 ${o.sz * 2}px ${glow}90, 0 0 ${o.sz * 4}px ${glow}40`,
              }}
              animate={{
                opacity: active ? [0.2, 0.4, 0.2] : [0.45, 0.85, 0.45],
                scale: [0.8, 1.2, 0.8],
                y: [0, o.yDrift, 0],
              }}
              transition={{
                opacity: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: o.delay },
                scale:   { duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: o.delay },
                y:       { duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: o.delay },
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN ORB COMPONENT
   ════════════════════════════════════════════════════════════ */

export function AIOrb({ state, size = 280, className, audioLevel = 0 }: AIOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<OrbState>(state);
  const audioLevelRef = useRef<number>(audioLevel);
  useLayoutEffect(() => { stateRef.current = state; }, [state]);
  useLayoutEffect(() => { audioLevelRef.current = audioLevel; }, [audioLevel]);
  useParticleCanvas(canvasRef, size, stateRef, audioLevelRef);

  // ── Audio motion values — instant response, no re-render ──
  const alMV = useMotionValue(0);
  useLayoutEffect(() => { alMV.set(audioLevel); }, [audioLevel, alMV]);
  const alSpring      = useSpring(alMV, { stiffness: 200, damping: 20, restDelta: 0.001 });
  const audioScale    = useTransform(alSpring, [0, 1], [1.0, 1.18]);
  const audioGlowScale = useTransform(alSpring, [0, 1], [1.0, 1.5]);

  const palettes = {
    idle: {
      c:  ["#3730a3", "#4338ca", "#4f46e5", "#6366f1", "#7c3aed"],
      ic: ["#a5b4fc", "#c4b5fd", "#818cf8", "#e0e7ff", "#ddd6fe"],
      glow: "#4f46e5",
    },
    listening: {
      c:  ["#1d4ed8", "#2563eb", "#3b82f6", "#4f46e5", "#1e40af"],
      ic: ["#93c5fd", "#bfdbfe", "#818cf8", "#dbeafe", "#a5b4fc"],
      glow: "#2563eb",
    },
    thinking: {
      c:  ["#6d28d9", "#7c3aed", "#9333ea", "#a855f7", "#5b21b6"],
      ic: ["#d8b4fe", "#f0abfc", "#c084fc", "#fae8ff", "#e9d5ff"],
      glow: "#7c3aed",
    },
    speaking: {
      c:  ["#1d4ed8", "#2563eb", "#3b82f6", "#4f46e5", "#1e40af"],
      ic: ["#93c5fd", "#bfdbfe", "#818cf8", "#dbeafe", "#a5b4fc"],
      glow: "#2563eb",
    },
  };
  const pal = palettes[state];
  const cSize = size * 2;

  const breathDur = state === "idle" ? 5.5 : state === "thinking" ? 2.8 : state === "listening" ? 2.0 : 1.6;
  const morphDur  = state === "speaking" ? 1.4 : state === "listening" ? 1.8 : state === "thinking" ? 2.5 : 5.5;

  const breathScale = state === "idle"      ? [1, 1.025, 1]
                    : state === "listening" ? [1, 1.045, 0.97, 1]
                    : state === "thinking"  ? [0.98, 1.02, 0.98]
                    : [1, 1.06, 0.955, 1];

  // 4 CSS blob layers: outer→inner, blurred→sharp, outer-palette→inner-palette
  const blobLayers = [
    { relSize: 0.92, blur: 14, useOuter: true,  opacity: 0.50, scaleBoost: audioGlowScale },
    { relSize: 0.80, blur: 5,  useOuter: true,  opacity: 0.68, scaleBoost: audioGlowScale },
    { relSize: 0.70, blur: 2,  useOuter: false, opacity: 0.82, scaleBoost: audioScale },
    { relSize: 0.60, blur: 0,  useOuter: false, opacity: 0.97, scaleBoost: audioScale },
  ] as const;

  return (
    <div
      className={`relative flex items-center justify-center${className ? ` ${className}` : ""}`}
      style={{ width: cSize, height: cSize }}
    >
      {/* ── Deep volumetric glow — audio-reactive scale ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.8, height: size * 1.8,
          background: `radial-gradient(circle, ${pal.glow}70 0%, ${pal.glow}35 40%, transparent 70%)`,
          filter: "blur(60px)",
          scale: audioGlowScale,
        }}
        animate={{ opacity: [0.6, 1.0, 0.6] }}
        transition={{ duration: breathDur * 1.3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Mid bloom ring ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.2, height: size * 1.2,
          background: `radial-gradient(circle, transparent 50%, ${pal.glow}45 68%, transparent 88%)`,
          filter: "blur(20px)",
          scale: audioGlowScale,
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: breathDur, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Listening: expanding ripple waves ── */}
      <AnimatePresence>
        {state === "listening" && [0, 1, 2].map(i => (
          <motion.div
            key={`rip-${i}`}
            className="absolute rounded-full"
            style={{ width: size * 0.85, height: size * 0.85, border: `1.5px solid ${pal.glow}` }}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: [0.9, 2.2], opacity: [0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.95, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* ── Speaking: frequency rings ── */}
      <AnimatePresence>
        {state === "speaking" && [0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={`fr-${i}`}
            className="absolute rounded-full"
            style={{
              width: size * (0.88 + i * 0.12),
              height: size * (0.88 + i * 0.12),
              border: `${1.5 - i * 0.2}px solid ${pal.glow}`,
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: [0.96, 1.1 + i * 0.04, 0.96], opacity: [0, 0.35 - i * 0.06, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
          />
        ))}
      </AnimatePresence>

      {/* ── Canvas particle layer ── */}
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* ── Orb body: static centering shell → breathing scale wrapper ── */}
      {/* Plain div holds the CSS translate so motion.div scale doesn't fight it */}
      <div
        className="absolute"
        style={{ width: size, height: size, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: breathScale }}
        transition={{ duration: breathDur, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* GPU-accelerated CSS blob layers (replaces SVG path morphing) */}
        {blobLayers.map((layer, li) => {
          const layerSize = size * layer.relSize;
          const offset = (size - layerSize) / 2;
          const colors = layer.useOuter ? pal.c : pal.ic;
          const bg = `radial-gradient(circle at ${36 + li * 6}% ${28 + li * 6}%, ${colors[0]} 0%, ${colors[1]} 35%, ${colors[2]} 65%, ${colors[3]} 100%)`;
          return (
            <motion.div
              key={`bl-${li}`}
              className="absolute"
              style={{
                width: layerSize, height: layerSize,
                top: offset, left: offset,
                background: bg,
                filter: layer.blur > 0 ? `blur(${layer.blur}px)` : undefined,
                opacity: layer.opacity,
                scale: layer.scaleBoost,
              }}
              animate={{ borderRadius: BLOB_KEYS[li] }}
              transition={{
                borderRadius: {
                  duration: morphDur * (1 + li * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.33, 0.67, 1],
                },
              }}
            />
          );
        })}

        {/* Glass highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.64, height: size * 0.64,
            top: (size - size * 0.64) / 2, left: (size - size * 0.64) / 2,
            background: "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 35%, transparent 62%)",
            filter: "blur(1px)",
          }}
        />

        {/* Glass sheen band */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: size * 0.17, height: size * 0.045,
            top: size * 0.28 - (size * 0.045) / 2,
            left: size * 0.4  - (size * 0.17)  / 2,
            background: "rgba(255,255,255,0.3)",
            borderRadius: "50%",
            transform: "rotate(-28deg)",
            filter: "blur(2px)",
          }}
        />

        {/* Rim glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.8, height: size * 0.8,
            top: (size - size * 0.8) / 2, left: (size - size * 0.8) / 2,
            background: `radial-gradient(circle, transparent 76%, ${pal.glow}22 88%, ${pal.glow}08 100%)`,
          }}
        />

        {/* Depth shadow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.75, height: size * 0.75,
            top: (size - size * 0.75) / 2, left: (size - size * 0.75) / 2,
            background: "radial-gradient(circle, transparent 0%, transparent 60%, rgba(10,10,26,0.18) 80%, rgba(10,10,26,0.32) 100%)",
          }}
        />

        {/* ── Thinking: rotating conic plasma ── */}
        <AnimatePresence>
          {state === "thinking" && (
            <motion.div
              className="absolute rounded-full overflow-hidden"
              style={{ top: size * 0.14, left: size * 0.14, width: size * 0.72, height: size * 0.72 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                opacity: { duration: 0.5 },
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0%, ${pal.glow}50 12%, transparent 28%, ${pal.c[2]}40 45%, transparent 60%, ${pal.glow}30 78%, transparent 100%)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>{/* end static centering shell */}

      {/* ── Thinking: orbiting accent dots ── */}
      <AnimatePresence>
        {state === "thinking" && (
          <>
            <motion.div
              className="absolute"
              style={{ width: size * 0.95, height: size * 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 2.8, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.4 } }}
            >
              <div className="absolute rounded-full" style={{
                width: 8, height: 8, background: pal.glow,
                top: -4, left: "50%", marginLeft: -4,
                boxShadow: `0 0 16px ${pal.glow}, 0 0 32px ${pal.glow}70`,
              }} />
            </motion.div>
            <motion.div
              className="absolute"
              style={{ width: size * 1.1, height: size * 1.1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7, rotate: -360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 4.5, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.5 } }}
            >
              <div className="absolute rounded-full" style={{
                width: 5, height: 5, background: pal.c[2],
                bottom: -2.5, left: "50%", marginLeft: -2.5,
                boxShadow: `0 0 12px ${pal.c[2]}`,
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mini orbs ── */}
      <MiniOrbs size={size} state={state} p={pal} />
    </div>
  );
}
