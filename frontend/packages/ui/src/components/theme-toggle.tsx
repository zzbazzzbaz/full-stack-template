import { Moon, Sun } from "lucide-react";
import { Button } from "#components/button";
import { useTheme } from "#hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="切换主题">
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
