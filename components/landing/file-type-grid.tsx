import Link from "next/link";
import { Braces, FileCode2, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const FILE_TYPES = [
  { label: "Text & code", icon: FileCode2, href: "/compare/text" },
  { label: "JSON", icon: Braces, href: "/compare/json" },
  { label: "Spreadsheets", icon: FileSpreadsheet, href: "/compare/excel" },
  { label: "Images", icon: ImageIcon, href: "/compare/image" },
  { label: "Documents", icon: FileText, href: "/compare/document" },
];

export function FileTypeGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">Five ways to compare.</h2>
        <p className="max-w-xl text-muted-foreground">Bring whatever you&apos;re working with.</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {FILE_TYPES.map((type) => {
          const content = (
            <>
              <span className="flex size-12 items-center justify-center rounded-2xl border border-border/60 text-primary">
                <type.icon className="size-5" />
              </span>
              <span className="text-sm font-medium">{type.label}</span>
            </>
          );
          const className = cn(
            "flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-8 text-center",
            type.href && "transition-colors hover:border-primary/60 hover:bg-accent"
          );
          return type.href ? (
            <Link key={type.label} href={type.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={type.label} className={className}>
              {content}
            </div>
          );
        })}
      </Reveal>

      <p className="mt-6 text-sm text-muted-foreground">
        Text, code, JSON, spreadsheets, images, and documents are ready today.
      </p>
    </section>
  );
}
