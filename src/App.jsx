/*
 * Kanban Board
 * Developed by Huncho.dev
 * All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Board from './components/Board';
import useBoardStore from './store/useBoardStore';
import logoSrc from './assets/logo.png';

const DARK_MODE_KEY = 'huncho-kanban-theme';

export default function App() {
  const searchQuery = useBoardStore((s) => s.searchQuery);
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery);
  const columns = useBoardStore((s) => s.columns);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    } catch {
      /* storage blocked */
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] text-txt transition-colors duration-300">

      {/* ── Header ─────────────────────────────────── */}
      <header className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-surface-header backdrop-blur-md border-b border-edge transition-colors duration-300">
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Logo + Branding */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 6, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shrink-0"
              style={{ boxShadow: '0 4px 14px var(--shadow-color)' }}
            >
              <img
                src={logoSrc}
                alt="Kanban Board — Huncho.dev"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-txt tracking-tight leading-tight">
                Kanban Board
              </h1>
              <p className="text-[11px] text-txt-secondary leading-tight">
                {columns.length} column{columns.length !== 1 ? 's' : ''} · {totalCards} card{totalCards !== 1 ? 's' : ''}{' '}
                <span className="hidden sm:inline">
                  · crafted by{' '}
                  <a
                    href="https://huncho.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:text-brand-secondary font-medium transition-colors"
                  >
                    Huncho.dev
                  </a>
                </span>
              </p>
            </div>
          </div>

          {/* Search + Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-40 sm:w-64 pl-9 pr-8 py-2 text-sm bg-surface-input border border-edge rounded-xl text-txt placeholder-txt-secondary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-txt-secondary hover:text-txt cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* ── Day / Night Toggle ────────────────── */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to day mode' : 'Switch to night mode'}
              className="relative w-[56px] h-[30px] rounded-full border border-edge transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              style={{ backgroundColor: darkMode ? 'var(--hover-state)' : 'var(--badge-bg)' }}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-[24px] h-[24px] rounded-full shadow-md flex items-center justify-center"
                style={{
                  left: darkMode ? 'calc(100% - 27px)' : '3px',
                  backgroundColor: darkMode ? 'var(--card-surface)' : 'var(--card-surface)',
                  boxShadow: '0 1px 4px var(--shadow-color)',
                }}
              >
                {darkMode ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--warning)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--warning)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Board ──────────────────────────────────── */}
      <Board />

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="shrink-0 px-6 py-2 border-t border-edge bg-surface-footer backdrop-blur-sm transition-colors duration-300">
        <p className="text-center text-[11px] text-txt-secondary">
          Designed &amp; developed by{' '}
          <a
            href="https://huncho.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-txt-secondary hover:text-brand transition-colors"
          >
            Huncho.dev
          </a>
          {' '}· {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
