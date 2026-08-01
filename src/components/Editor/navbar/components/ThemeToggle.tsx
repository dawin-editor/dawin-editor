import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const labels: Record<string, string> = {
  light: "وضع نهاري",
  dark: "وضع ليلي",
  system: "تلقائي",
};

const icons: Record<string, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = ["system", "light", "dark"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const Icon = icons[theme];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="size-8 bg-icons-bg hover:bg-icons-color-hover rounded-0.5"
          onClick={cycleTheme}
        >
          <Icon className="size-5.5 text-icons-color" strokeWidth={2} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-dubai-regular text-sm">
        {labels[theme]}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
