import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const modes = [
  { href: "/compare/text", label: "Text" },
  { href: "/compare/json", label: "JSON" },
  { href: "/compare/excel", label: "Excel" },
  { href: "/compare/image", label: "Image" },
  { href: "/compare/document", label: "Document" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GitCompareArrows className="size-4" />
          </span>
          DiffLab
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {modes.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {mode.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
