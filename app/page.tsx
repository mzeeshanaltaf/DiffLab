import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-32 text-center sm:px-6">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <GitCompareArrows className="size-6" />
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Compare anything, instantly.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Text, code, JSON, spreadsheets, images, and documents — diffed side by
        side, right in your browser. Nothing is uploaded unless you choose to
        share it.
      </p>
      <Button
        render={<Link href="/compare/text" />}
        nativeButton={false}
        size="lg"
        className="mt-2"
      >
        Start comparing
      </Button>
    </div>
  );
}
