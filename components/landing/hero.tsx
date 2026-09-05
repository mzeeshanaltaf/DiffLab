import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LiveDiffDemo } from "@/components/landing/live-diff-demo";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-2 md:items-center md:gap-16 md:pt-20">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Compare anything. Miss nothing.
        </h1>
        <p className="max-w-md text-lg text-muted-foreground text-balance">
          Diff text, code, JSON, spreadsheets, images, and documents side by side, in your
          browser. Nothing uploads unless you share it.
        </p>
        <div>
          <Button render={<Link href="/compare/text" />} nativeButton={false} size="lg">
            Start comparing
          </Button>
        </div>
      </div>

      <LiveDiffDemo />
    </section>
  );
}
