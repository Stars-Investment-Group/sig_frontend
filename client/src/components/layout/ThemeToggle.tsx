import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Bascule clair / sombre (un clic pour alterner).
 * Une Tooltip simple fournit le label et le raccourci.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
