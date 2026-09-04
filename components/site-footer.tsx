export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
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
