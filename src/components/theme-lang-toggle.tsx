import { Check, ChevronDown, Languages, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACCENT_PALETTE, ACCENT_IDS } from "@/lib/accent-palette";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ToggleSize = "sm" | "md";

const sizeStyles = {
  sm: {
    btn: "h-8",
    lang: "gap-1.5 px-2.5 text-xs",
    icon: "h-3.5 w-3.5",
    dot: "h-4 w-4",
    theme: "h-8 w-8",
    themeIcon: "h-4 w-4",
  },
  md: {
    btn: "h-10",
    lang: "gap-2 px-3 text-sm",
    icon: "h-4 w-4",
    dot: "h-5 w-5",
    theme: "h-10 w-10",
    themeIcon: "h-5 w-5",
  },
} as const;

export function ThemeLangToggle({ size = "sm", className }: { size?: ToggleSize; className?: string }) {
  const { theme, toggle: toggleTheme, accent, setAccent } = useTheme();
  const { lang, toggle: toggleLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const swatch = ACCENT_PALETTE[accent][theme].swatch;
  const s = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleLang}
        aria-label={t("a11y.langToggle")}
        title={t("a11y.langToggle")}
        className={cn("glass-control rounded-full font-semibold uppercase tracking-wider", s.btn, s.lang)}
      >
        <Languages className={s.icon} aria-hidden="true" />
        {lang.toUpperCase()}
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t("a11y.accentPicker")}
            title={t("a11y.accentPicker")}
            className={cn("glass-control gap-1.5 rounded-full px-2.5 pr-3", s.btn)}
          >
            <span
              className={cn(
                "accent-swatch-dot rounded-full border border-white/25 shadow-[0_0_16px_var(--accent-glow)]",
                s.dot,
              )}
              style={{ background: swatch }}
              aria-hidden="true"
            />
            <ChevronDown
              className={cn(s.icon, "text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={10}
          className="w-52 rounded-2xl border border-white/20 bg-background/10 p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("theme.accentColor")}
          </p>
          <ul className="mt-2 space-y-1">
            {ACCENT_IDS.map((id) => {
              const selected = accent === id;
              const color = ACCENT_PALETTE[id][theme].swatch;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      setAccent(id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors",
                      selected
                        ? "glass-accent-active text-foreground"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20",
                        selected && "shadow-[0_0_18px_var(--accent-glow)]",
                      )}
                      style={{ background: color }}
                      aria-hidden="true"
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                    </span>
                    <span className="flex-1 font-medium">{t(`accent.${id}`)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={t("a11y.themeToggle")}
        title={t("a11y.themeToggle")}
        className={cn("glass-control rounded-full", s.theme)}
      >
        {theme === "dark" ? (
          <Sun className={s.themeIcon} aria-hidden="true" />
        ) : (
          <Moon className={s.themeIcon} aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
