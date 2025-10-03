import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const baseClasses =
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/75 text-slate-700 shadow-md backdrop-blur transition-all duration-300 hover:scale-105 hover:border-white/60 hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-amber-200 dark:hover:border-amber-200/60 dark:hover:bg-slate-900';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`${baseClasses} ${className}`.trim()}
    >
      {isDark ? (
        <svg
          className="h-6 w-6 drop-shadow text-amber-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      ) : (
        <svg
          className="h-6 w-6 drop-shadow text-amber-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.021 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
