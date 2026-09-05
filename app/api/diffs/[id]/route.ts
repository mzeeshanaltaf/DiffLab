import { NextRequest, NextResponse } from "next/server";
import { getSavedDiff } from "@/lib/share/persist";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const row = await getSavedDiff(id);
  if (!row) {
    return NextResponse.json({ error: "Not found or expired." }, { status: 404 });
  }

  return NextResponse.json({
    mode: row.mode,
    data: row.payload,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    views: row.views,
  });
}
