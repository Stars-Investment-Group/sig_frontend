import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Flag } from "@/components/Flag";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de langue / internationalisation.
 * - Affiche le drapeau SVG du pays représentant la langue active
 * - Change réellement la langue via le contexte i18n (persisté en localStorage)
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code.toLowerCase() === language)!;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
          aria-label="Changer de langue"
        >
          <Flag code={current.flagCode} size={18} />
          <span className="hidden text-xs font-medium md:inline">
            {current.code}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-52 p-1" sideOffset={10}>
        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Language
        </div>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code.toLowerCase() as typeof language);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent",
              lang.dir === "rtl" && "flex-row-reverse justify-end"
            )}
          >
            <Flag code={lang.flagCode} size={18} />
            <span className="flex-1 text-left">{lang.label}</span>
            {language === lang.code.toLowerCase() && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

