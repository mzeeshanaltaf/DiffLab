import type { Metadata } from "next";
import { getSavedDiff } from "@/lib/share/persist";
import { ToolShell, type ToolMode } from "@/components/tool-shell";

export const metadata: Metadata = {
  title: "Shared diff",
  robots: { index: false, follow: false },
};

export default async function SavedDiffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getSavedDiff(id);

  if (!row) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-2 px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Diff not found</h1>
        <p className="text-sm text-muted-foreground">
          This link has expired or never existed. Saved diffs can be set to expire after 1, 7, or 30 days, or kept
          forever.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-4 sm:px-6">
      <ToolShell mode={row.mode as ToolMode} initial={row.payload} />
    </div>
  );
}
