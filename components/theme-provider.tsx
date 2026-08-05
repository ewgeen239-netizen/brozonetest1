"use client";

import * as React from "react";

type Theme = "dark" | "light";

const ThemeContext = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('brozone-theme')||'dark';document.documentElement.classList.toggle('dark',t!=='light');document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const stored = (localStorage.getItem("brozone-theme") as Theme) || "dark";
    setTheme(stored);
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("brozone-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => React.useContext(ThemeContext);
