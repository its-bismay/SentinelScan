import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'forest';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'forest')}
      className={`btn btn-sm btn-circle border transition-all duration-200 ${
        isDark
          ? 'bg-base-200 border-base-content/10 text-warning hover:bg-base-300'
          : 'bg-base-200 border-base-content/20 text-slate-700 hover:bg-base-300'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
