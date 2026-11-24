import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';

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
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const selectTheme = (nextTheme: ThemeMode) => {
    if (nextTheme === theme) return;

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (typeof doc.startViewTransition === 'function' && !prefersReducedMotion) {
      doc.startViewTransition(() => {
        flushSync(() => {
          applyThemeToDom(nextTheme);
          onThemeChange(nextTheme);
        });
      });
    } else {
      applyThemeToDom(nextTheme);
      onThemeChange(nextTheme);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      role="group"
      aria-label="Pilih tema tampilan"
      className="inline-flex h-8 items-center rounded-lg border border-zinc-200/90 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <button
        type="button"
        onClick={() => selectTheme('light')}
        aria-pressed={!isDark}
        aria-label="Mode Terang"
        title="Mode Terang"
        className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100 ${
          !isDark
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
        }`}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => selectTheme('dark')}
        aria-pressed={isDark}
        aria-label="Mode Gelap"
        title="Mode Gelap"
        className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100 ${
          isDark
            ? 'bg-zinc-800 text-zinc-100 shadow-2xs'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
        }`}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
