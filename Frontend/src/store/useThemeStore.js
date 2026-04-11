import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("guff-theme") || "dark",

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("guff-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      return { theme: newTheme };
    });
  },

  initTheme: () => {
    const theme = localStorage.getItem("guff-theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  },
}));