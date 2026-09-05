import { Columns2, Download, EyeOff, GitMerge, Type, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

const STAT_BARS: { type: "add" | "remove" | "context"; width: number }[] = [
  { type: "context", width: 78 },
  { type: "remove", width: 46 },
  { type: "add", width: 62 },
  { type: "add", width: 34 },
  { type: "context", width: 85 },
  { type: "remove", width: 28 },
];

function DiffStatPreview() {
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {STAT_BARS.map((bar, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 rounded-full",
              bar.type === "add" && "bg-primary/70",
              bar.type === "remove" && "bg-destructive/60",
              bar.type === "context" && "bg-muted-foreground/25"
            )}
            style={{ width: `${bar.width}%` }}
          />
        </div>
      ))}
    </div>
  );
}

const TILES = [
  {
    title: "Split & unified views",
    body: "Compare side by side or in a single unified stream, and switch anytime.",
    icon: Columns2,
    span: "md:col-span-2",
    tint: false,
    visual: true,
  },
  {
    title: "Live as you type",
    body: "Every keystroke re-runs the diff instantly. No button to press.",
    icon: Zap,
    span: "md:col-span-2",
    tint: true,
    visual: false,
  },
  {
    title: "Word, line, or character precision",
    body: "Zoom into exactly the level of change that matters.",
    icon: Type,
    span: "md:col-span-1",
    tint: false,
    visual: false,
  },
  {
    title: "Ignore whitespace, case, or regex",
    body: "Filter out the noise before you filter out the signal.",
    icon: EyeOff,
    span: "md:col-span-1",
    tint: false,
    visual: false,
  },
  {
    title: "Per-chunk merge & revert",
    body: "Pull a change from either side without leaving the editor.",
    icon: GitMerge,
    span: "md:col-span-2",
    tint: true,
    visual: false,
  },
  {
    title: "Export a unified patch",
    body: "Copy or download a .patch file ready for git apply.",
    icon: Download,
    span: "md:col-span-4",
    tint: false,
    visual: false,
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">Diffing, done properly.</h2>
        <p className="max-w-xl text-muted-foreground">
          Split and unified views, precision control, syntax highlighting, and per-chunk merging,
          live as you type.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
        {TILES.map((tile, i) => (
          <Reveal key={tile.title} delay={i * 0.06} className={tile.span}>
            <div
              className={cn(
                "flex h-full flex-col gap-4 rounded-2xl border border-border/60 p-6",
                tile.tint ? "bg-linear-to-br from-primary/10 to-transparent" : "bg-card"
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <tile.icon className="size-4" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-medium">{tile.title}</h3>
                <p className="text-sm text-muted-foreground">{tile.body}</p>
              </div>
              {tile.visual ? (
                <div className="mt-auto pt-2">
                  <DiffStatPreview />
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
