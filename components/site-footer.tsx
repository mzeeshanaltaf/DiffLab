import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        <nav className="flex items-center gap-4">
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <p>
          Developed with 💖 by{" "}
          <a
            href="https://zeeshanai.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Zeeshan Altaf
          </a>
        </p>
      </div>
    </footer>
  );
}
