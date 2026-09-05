import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-card to-card px-6 py-16 text-center">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Paste two things. See what changed.
        </h2>
        <p className="text-muted-foreground">No signup. No upload. Just paste and compare.</p>
        <Button render={<Link href="/compare/text" />} nativeButton={false} size="lg">
          Start comparing
        </Button>
      </Reveal>
    </section>
  );
}
