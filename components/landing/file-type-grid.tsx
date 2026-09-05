import { Braces, FileCode2, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const FILE_TYPES = [
  { label: "Text & code", icon: FileCode2 },
  { label: "JSON", icon: Braces },
  { label: "Spreadsheets", icon: FileSpreadsheet },
  { label: "Images", icon: ImageIcon },
  { label: "Documents", icon: FileText },
];

export function FileTypeGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">Five ways to compare.</h2>
        <p className="max-w-xl text-muted-foreground">Bring whatever you&apos;re working with.</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {FILE_TYPES.map((type) => (
          <div
            key={type.label}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-8 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl border border-border/60 text-primary">
              <type.icon className="size-5" />
            </span>
            <span className="text-sm font-medium">{type.label}</span>
          </div>
        ))}
      </Reveal>

      <p className="mt-6 text-sm text-muted-foreground">
        Text and code are ready today. JSON, spreadsheets, images, and documents are next.
      </p>
    </section>
  );
}
