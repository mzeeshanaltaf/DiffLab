import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSavedDiff } from "@/lib/share/persist";
import { isExpiryOption, type ShareMode } from "@/lib/share/url";

const VALID_MODES: ShareMode[] = ["text", "json", "excel"];

// Generous but bounded -- this lands in a Json column on a shared Postgres
// instance, so an unbounded payload is a denial-of-service vector against
// every other app on that box.
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export async function POST(req: NextRequest) {
  const { success: underLimit } = await checkRateLimit(clientIp(req), "diffs");
  if (!underLimit) {
    return NextResponse.json({ error: "Too many saved diffs. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { mode, data, expiry } = body as Record<string, unknown>;

  if (typeof mode !== "string" || !VALID_MODES.includes(mode as ShareMode)) {
    return NextResponse.json({ error: "Invalid or missing mode." }, { status: 400 });
  }
  if (!isExpiryOption(expiry)) {
    return NextResponse.json({ error: "Invalid or missing expiry." }, { status: 400 });
  }
  if (data === undefined) {
    return NextResponse.json({ error: "Missing data." }, { status: 400 });
  }

  const size = Buffer.byteLength(JSON.stringify(data), "utf8");
  if (size > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Diff is too large to save." }, { status: 413 });
  }

  try {
    const id = await createSavedDiff(mode as ShareMode, data, expiry);
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[api/diffs] Failed to save diff:", err);
    return NextResponse.json({ error: "Could not save this diff. Please try again later." }, { status: 500 });
  }
}
