import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type { ThemeMode } from './ThemeToggle';

interface MatrixTransitionOverlayProps {
  active: boolean;
  targetTheme: ThemeMode;
  onSwitchTheme: () => void;
  onComplete: () => void;
}

const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

const TOTAL_DURATION = 1950; // ms - sleek, decisive luxury pacing
const SWITCH_TIME = 980; // ms - exact peak where underlying theme swaps
const EXIT_START = 1380; // ms - graceful rain & veil dissolve

interface RainColumn {
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  trailLength: number;
  layer: 0 | 1 | 2;
  chars: string[];
  tick: number;
}

function randomChar(): string {
  return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
}

function decodeText(target: string, progress: number): string {
  const lockedCount = Math.floor(progress * target.length);
  return target
    .split('')
    .map((ch, idx) => {
      if (ch === ' ') return ' ';
      if (idx < lockedCount) return ch;
      return randomChar();
    })
    .join('');
}

export function MatrixTransitionOverlay({
  active,
  targetTheme,
  onSwitchTheme,
  onComplete,
}: MatrixTransitionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onSwitchRef = useRef(onSwitchTheme);
  const onCompleteRef = useRef(onComplete);

  onSwitchRef.current = onSwitchTheme;
  onCompleteRef.current = onComplete;

  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'peak' | 'exit'>('enter');
  const [decodedTitle, setDecodedTitle] = useState('');
  const [hexCode, setHexCode] = useState('0x4A9F2E');

  const goingDark = targetTheme === 'dark';
  const finalTitle = goingDark ? 'NIGHT MODE' : 'LIGHT MODE';

  useEffect(() => {
    if (!active) return;

    setPercent(0);
    setPhase('enter');
    setDecodedTitle(decodeText(finalTitle, 0));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 3 refined parallax depth layers of Matrix digital rain
    const columns: RainColumn[] = [];
    const layerConfigs: Array<{
      layer: 0 | 1 | 2;
      fontSize: number;
      step: number;
      speedMin: number;
      speedMax: number;
    }> = [
      { layer: 0, fontSize: 11, step: 20, speedMin: 0.45, speedMax: 0.85 },
      { layer: 1, fontSize: 15, step: 24, speedMin: 0.9, speedMax: 1.55 },
      { layer: 2, fontSize: 21, step: 64, speedMin: 1.5, speedMax: 2.3 },
    ];

    for (const cfg of layerConfigs) {
      const count = Math.ceil(width / cfg.step);
      const maxRows = Math.ceil(height / cfg.fontSize);
      for (let i = 0; i < count; i++) {
        const trailLength = 12 + Math.floor(Math.random() * 16);
        columns.push({
          x: i * cfg.step + (Math.random() * 6 - 3),
          y: -Math.random() * (maxRows * 0.75),
          speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
          fontSize: cfg.fontSize,
          trailLength,
          layer: cfg.layer,
          chars: Array.from({ length: trailLength }, randomChar),
          tick: 0,
        });
      }
    }

    let rafId = 0;
    let switched = false;
    let lastHudUpdate = 0;
    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / TOTAL_DURATION);

      if (!switched && elapsed >= SWITCH_TIME) {
        switched = true;
        setPhase('peak');
        onSwitchRef.current();
      }

      if (elapsed >= EXIT_START) {
        setPhase('exit');
      }

      if (now - lastHudUpdate > 30) {
        lastHudUpdate = now;
        const loadPct = Math.min(100, Math.round((elapsed / (SWITCH_TIME + 80)) * 100));
        setPercent(loadPct);
        const titleReveal = Math.min(1, Math.max(0, (elapsed - 140) / 680));
        setDecodedTitle(decodeText(finalTitle, titleReveal));
        setHexCode(
          `0x${Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .toUpperCase()
            .padStart(6, '0')}`
        );
      }

      // Smooth luxury opacity envelope
      let bgAlpha = 0.94;
      let rainAlpha = 1;
      if (elapsed < 220) {
        const t = elapsed / 220;
        const ease = 1 - Math.pow(1 - t, 3);
        bgAlpha = ease * 0.94;
        rainAlpha = Math.min(1, t * 1.5);
      } else if (elapsed > EXIT_START) {
        const t = (elapsed - EXIT_START) / (TOTAL_DURATION - EXIT_START);
        const ease = 1 - Math.pow(1 - t, 2.6);
        bgAlpha = 0.94 * (1 - ease);
        rainAlpha = Math.max(0, 1 - Math.pow(t, 1.7));
      }

      ctx.clearRect(0, 0, width, height);

      // Deep luxury obsidian or luminous alabaster backdrop
      if (bgAlpha > 0.005) {
        ctx.fillStyle = goingDark
          ? `rgba(3, 7, 18, ${bgAlpha.toFixed(3)})`
          : `rgba(248, 250, 252, ${bgAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);

        // Subtle radial ambient vignette for cinematic depth
        const radial = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.08,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.72
        );
        if (goingDark) {
          radial.addColorStop(0, `rgba(16, 185, 129, ${(bgAlpha * 0.09).toFixed(3)})`);
          radial.addColorStop(1, `rgba(2, 6, 23, ${(bgAlpha * 0.5).toFixed(3)})`);
        } else {
          radial.addColorStop(0, `rgba(20, 184, 166, ${(bgAlpha * 0.08).toFixed(3)})`);
          radial.addColorStop(1, `rgba(226, 232, 240, ${(bgAlpha * 0.45).toFixed(3)})`);
        }
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      }

      // Ultra-fine architectural grid
      if (bgAlpha > 0.15) {
        ctx.save();
        ctx.strokeStyle = goingDark
          ? `rgba(52, 211, 153, ${(bgAlpha * 0.055).toFixed(3)})`
          : `rgba(15, 118, 110, ${(bgAlpha * 0.055).toFixed(3)})`;
        ctx.lineWidth = 1;
        const gridGap = 64;
        const offsetY = (elapsed * 0.04) % gridGap;
        ctx.beginPath();
        for (let gx = 0; gx < width; gx += gridGap) {
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
        }
        for (let gy = offsetY; gy < height; gy += gridGap) {
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Render 3-layer refined Matrix digital rain
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed * (elapsed > SWITCH_TIME ? 1.25 : 1);
        col.tick++;

        if (col.tick % 3 === 0) {
          col.chars[Math.floor(Math.random() * col.trailLength)] = randomChar();
        }

        if ((col.y - col.trailLength) * col.fontSize > height && elapsed < EXIT_START) {
          col.y = -Math.random() * 8;
        }

        ctx.font = `500 ${col.fontSize}px "JetBrains Mono", ui-monospace, monospace`;
        const headRow = Math.floor(col.y);
        const layerOpacity = col.layer === 0 ? 0.3 : col.layer === 1 ? 0.72 : 0.92;

        for (let t = 0; t < col.trailLength; t++) {
          const py = (headRow - t) * col.fontSize;
          if (py < -col.fontSize || py > height + col.fontSize) continue;

          const fade = (1 - t / col.trailLength) * rainAlpha * layerOpacity;
          if (fade <= 0.025) continue;

          const ch = col.chars[t % col.trailLength];

          if (t === 0) {
            ctx.save();
            ctx.shadowBlur = col.layer === 2 ? 14 : 8;
            ctx.shadowColor = goingDark ? '#10B981' : '#0D9488';
            ctx.fillStyle = goingDark
              ? `rgba(236, 253, 245, ${Math.min(1, fade * 1.15).toFixed(3)})`
              : `rgba(15, 23, 42, ${Math.min(1, fade * 1.05).toFixed(3)})`;
            ctx.fillText(ch, col.x, py);
            ctx.restore();
          } else if (t <= 2) {
            ctx.fillStyle = goingDark
              ? `rgba(52, 211, 153, ${(fade * 0.92).toFixed(3)})`
              : `rgba(13, 148, 136, ${(fade * 0.85).toFixed(3)})`;
            ctx.fillText(ch, col.x, py);
          } else {
            ctx.fillStyle = goingDark
              ? `rgba(16, 185, 129, ${(fade * 0.62).toFixed(3)})`
              : `rgba(20, 184, 166, ${(fade * 0.55).toFixed(3)})`;
            ctx.fillText(ch, col.x, py);
          }
        }
      }

      // Single razor-sharp luminous laser sweep around peak switch
      if (elapsed >= 480 && elapsed <= EXIT_START + 220) {
        const scanT = (elapsed - 480) / (EXIT_START + 220 - 480);
        const scanY = scanT * height;
        const scanAlpha = Math.sin(scanT * Math.PI);

        const grad = ctx.createLinearGradient(0, scanY - 48, 0, scanY + 48);
        if (goingDark) {
          grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
          grad.addColorStop(0.5, `rgba(52, 211, 153, ${(scanAlpha * 0.28).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else {
          grad.addColorStop(0, 'rgba(13, 148, 136, 0)');
          grad.addColorStop(0.5, `rgba(13, 148, 136, ${(scanAlpha * 0.22).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(13, 148, 136, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 48, width, 96);

        ctx.fillStyle = goingDark
          ? `rgba(167, 243, 208, ${(scanAlpha * 0.75).toFixed(3)})`
          : `rgba(15, 118, 110, ${(scanAlpha * 0.65).toFixed(3)})`;
        ctx.fillRect(0, scanY - 0.5, width, 1);
      }

      if (progress < 1) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        if (!switched) {
          switched = true;
          onSwitchRef.current();
        }
        onCompleteRef.current();
      }
    };

    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [active, finalTitle, goingDark]);

  if (!active || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <MotionConfig reducedMotion="never">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden select-none"
      >
        {/* 1. 3-Layer Luxury Matrix Digital Rain Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

        {/* 2. Subtle Architectural Top & Bottom Telemetry Bars */}
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: phase === 'exit' ? '-100%' : '0%', opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute top-0 right-0 left-0 h-12 border-b backdrop-blur-md ${
            goingDark
              ? 'border-emerald-500/20 bg-slate-950/60'
              : 'border-slate-900/10 bg-white/60'
          }`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 font-mono text-[10px] font-medium tracking-[0.28em] uppercase">
            <span className={goingDark ? 'text-emerald-400/90' : 'text-teal-800'}>
              TABUNGIN · INTERFACE ENGINE
            </span>
            <span className={goingDark ? 'text-slate-400' : 'text-slate-500'}>
              MEM {hexCode}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: phase === 'exit' ? '100%' : '0%', opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute right-0 bottom-0 left-0 h-12 border-t backdrop-blur-md ${
            goingDark
              ? 'border-emerald-500/20 bg-slate-950/60'
              : 'border-slate-900/10 bg-white/60'
          }`}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 font-mono text-[10px] font-medium tracking-[0.28em] uppercase">
            <span className={goingDark ? 'text-slate-400' : 'text-slate-500'}>
              {goingDark ? 'PROFILE // STEALTH DARK' : 'PROFILE // SOLAR LIGHT'}
            </span>
            <span className={goingDark ? 'text-emerald-400/90' : 'text-teal-800'}>
              SYNC {String(percent).padStart(3, '0')}%
            </span>
          </div>
        </motion.div>

        {/* 3. Refined Editorial Centerpiece (No Logo, Pure Luxury Typography) */}
        <AnimatePresence>
          {phase !== 'exit' && (
            <motion.div
              key="luxury-stage"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center px-6"
            >
              <div
                className={`relative flex w-full max-w-xl flex-col items-center rounded-3xl border px-8 py-10 text-center backdrop-blur-xl sm:px-12 sm:py-12 ${
                  goingDark
                    ? 'border-emerald-500/20 bg-slate-950/55 shadow-[0_24px_80px_rgba(0,0,0,0.65)]'
                    : 'border-slate-900/10 bg-white/65 shadow-[0_24px_80px_rgba(15,23,42,0.12)]'
                }`}
              >
                {/* Minimalist Corner Hairline Accents */}
                <span
                  className={`absolute top-4 left-4 h-3 w-3 border-t border-l ${
                    goingDark ? 'border-emerald-400/60' : 'border-teal-600/60'
                  }`}
                />
                <span
                  className={`absolute top-4 right-4 h-3 w-3 border-t border-r ${
                    goingDark ? 'border-emerald-400/60' : 'border-teal-600/60'
                  }`}
                />
                <span
                  className={`absolute bottom-4 left-4 h-3 w-3 border-b border-l ${
                    goingDark ? 'border-emerald-400/60' : 'border-teal-600/60'
                  }`}
                />
                <span
                  className={`absolute right-4 bottom-4 h-3 w-3 border-r border-b ${
                    goingDark ? 'border-emerald-400/60' : 'border-teal-600/60'
                  }`}
                />

                {/* Eyebrow */}
                <p
                  className={`font-mono text-[11px] font-semibold tracking-[0.35em] uppercase ${
                    goingDark ? 'text-emerald-400' : 'text-teal-700'
                  }`}
                >
                  {goingDark ? 'INITIALIZING ENVIRONMENT' : 'RESTORING CLARITY'}
                </p>

                {/* Crisp Decoding Luxury Headline */}
                <motion.h2
                  initial={{ letterSpacing: '0.32em' }}
                  animate={{ letterSpacing: '0.16em' }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className={`mt-4 font-mono text-3xl font-bold uppercase sm:text-5xl ${
                    goingDark
                      ? 'text-white drop-shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                      : 'text-slate-900 drop-shadow-[0_0_20px_rgba(13,148,136,0.2)]'
                  }`}
                >
                  {decodedTitle || finalTitle}
                </motion.h2>

                {/* Symmetrical Expanding Hairline Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className={`mt-5 h-px w-full max-w-xs origin-center ${
                    goingDark
                      ? 'bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-teal-600/60 to-transparent'
                  }`}
                />

                {/* Refined Subtitle */}
                <p
                  className={`mt-4 text-xs font-medium tracking-[0.22em] uppercase sm:text-[13px] ${
                    goingDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {goingDark
                    ? 'Stealth Dark Financial Workspace'
                    : 'Daylight Precision Financial Workspace'}
                </p>

                {/* Ultra-Sleek 2px Precision Progress Bar */}
                <div className="mt-7 w-full max-w-xs">
                  <div
                    className={`h-[3px] w-full overflow-hidden rounded-full ${
                      goingDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-75 ${
                        goingDark
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-200 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                          : 'bg-gradient-to-r from-teal-700 via-teal-500 to-sky-400 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Soft Refined Aura Bloom on Peak Switch */}
        <AnimatePresence>
          {phase === 'peak' && (
            <motion.div
              key="luxury-bloom"
              initial={{ opacity: 0.55, scale: 0.4 }}
              animate={{ opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-none absolute inset-0 m-auto h-[55vmax] w-[55vmax] rounded-full blur-3xl ${
                goingDark ? 'bg-emerald-500/45' : 'bg-teal-400/35'
              }`}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>,
    document.body
  );
}
