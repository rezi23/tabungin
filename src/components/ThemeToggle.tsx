import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MatrixTransitionOverlay } from './MatrixTransitionOverlay';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'tabungin_theme_v1';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

function applyThemeToDom(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage access errors
  }
}

interface ThemeToggleProps {
  theme: ThemeMode;
  onThemeChange: (nextTheme: ThemeMode) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const [transitionState, setTransitionState] = useState<{
    active: boolean;
    targetTheme: ThemeMode;
  }>({
    active: false,
    targetTheme: theme,
  });

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const handleToggle = () => {
    if (transitionState.active) return;

    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';

    setTransitionState({
      active: true,
      targetTheme: nextTheme,
    });
  };

  const handleSwitchTheme = useCallback(() => {
    applyThemeToDom(transitionState.targetTheme);
    onThemeChange(transitionState.targetTheme);
  }, [onThemeChange, transitionState.targetTheme]);

  const handleComplete = useCallback(() => {
    setTransitionState((prev) => ({ ...prev, active: false }));
  }, []);

  const isDark = theme === 'dark';

  return (
    <>
      <motion.button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
        title={isDark ? 'Ubah ke Mode Terang (Matrix)' : 'Ubah ke Mode Gelap (Matrix)'}
        onClick={handleToggle}
        disabled={transitionState.active}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={`relative inline-flex h-[38px] w-[72px] shrink-0 cursor-pointer items-center overflow-hidden rounded-full border p-1 shadow-inner transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-wait ${
          isDark
            ? 'border-emerald-500/50 bg-gradient-to-r from-slate-950 via-emerald-950/90 to-slate-900 shadow-emerald-950/80'
            : 'border-sky-300/80 bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-200 shadow-sky-500/30'
        }`}
      >
        {/* Night Sky Stars */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            y: isDark ? 0 : -10,
            scale: isDark ? 1 : 0.6,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0"
        >
          <span className="animate-twinkle absolute top-2 left-3 h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_6px_#34d399]" />
          <span className="animate-twinkle-delayed absolute top-5 left-5 h-0.5 w-0.5 rounded-full bg-teal-200" />
          <span className="animate-twinkle absolute top-2.5 left-8 h-1.5 w-1.5 text-emerald-300">
            <svg viewBox="0 0 12 12" fill="currentColor" className="h-full w-full">
              <path d="M6 0L7.4 4.6L12 6L7.4 7.4L6 12L4.6 7.4L0 6L4.6 4.6L6 0Z" />
            </svg>
          </span>
          <span className="animate-twinkle-delayed absolute bottom-2 left-2.5 h-1 w-1 rounded-full bg-emerald-400/90" />
        </motion.div>

        {/* Day Sky Fluffy Clouds */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            x: isDark ? 14 : 0,
            scale: isDark ? 0.7 : 1,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute right-2 bottom-1.5 h-2.5 w-6 rounded-full bg-white/85 blur-[0.3px]" />
          <span className="absolute right-3.5 bottom-2.5 h-2.5 w-3.5 rounded-full bg-white/90" />
          <span className="absolute top-1.5 right-4 h-1.5 w-4 rounded-full bg-white/60" />
        </motion.div>

        {/* Sliding Celestial Orb (Sun <-> Moon) */}
        <motion.span
          aria-hidden="true"
          layout
          initial={false}
          animate={{
            x: isDark ? 34 : 0,
            rotate: isDark ? 360 : 0,
          }}
          transition={{
            x: { type: 'spring', stiffness: 360, damping: 24, mass: 0.85 },
            rotate: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-colors duration-500 ${
            isDark
              ? 'bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.85)]'
              : 'bg-gradient-to-br from-amber-200 via-amber-400 to-orange-400 shadow-[0_0_14px_rgba(251,191,36,0.95)]'
          }`}
        >
          {/* Sun Rays (visible in Light Mode) */}
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.4 : 1,
              rotate: isDark ? -90 : 0,
            }}
            transition={{ duration: 0.4 }}
            className="absolute h-4 w-4 text-amber-800/80"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" className="text-amber-500/40" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </motion.svg>

          {/* Crescent Moon (visible in Dark Mode) */}
          <motion.svg
            viewBox="0 0 24 24"
            fill="currentColor"
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0,
              scale: isDark ? 1 : 0.4,
              rotate: isDark ? 0 : 90,
            }}
            transition={{ duration: 0.4 }}
            className="absolute h-4 w-4 text-emerald-950"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        </motion.span>
      </motion.button>

      {/* Full-Screen Matrix Digital Rain Transition */}
      <MatrixTransitionOverlay
        active={transitionState.active}
        targetTheme={transitionState.targetTheme}
        onSwitchTheme={handleSwitchTheme}
        onComplete={handleComplete}
      />
    </>
  );
}
