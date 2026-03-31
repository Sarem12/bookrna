"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "dark" | "light";

type ThemeToggleProps = {
  variant?: "icon" | "menu";
  className?: string;
};

const STORAGE_KEY = "bekam-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

function getCurrentTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextTheme = getCurrentTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return variant === "menu" ? (
      <button
        type="button"
        disabled
        className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm opacity-70 ${className}`}
      >
        <Sun className="h-4 w-4" />
        Theme
      </button>
    ) : (
      <button
        type="button"
        disabled
        aria-label="Toggle theme"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full opacity-70 ${className}`}
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const nextLabel = theme === "dark" ? "Light mode" : "Dark mode";
  const Icon = theme === "dark" ? Sun : Moon;

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-[var(--surface-elevated)] ${className}`}
      >
        <Icon className="h-4 w-4" />
        {nextLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)] ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
