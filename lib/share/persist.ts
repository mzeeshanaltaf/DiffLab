import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { ExpiryOption, ShareMode } from "@/lib/share/url";

export type { ExpiryOption };
export { isExpiryOption } from "@/lib/share/url";

const EXPIRY_MS: Record<Exclude<ExpiryOption, "never">, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function expiryToDate(expiry: ExpiryOption): Date | null {
  return expiry === "never" ? null : new Date(Date.now() + EXPIRY_MS[expiry]);
}

export async function createSavedDiff(mode: ShareMode, data: unknown, expiry: ExpiryOption) {
  const id = nanoid(10);
  await prisma.diff.create({
    data: {
      id,
      mode,
      payload: data as Prisma.InputJsonValue,
      expiresAt: expiryToDate(expiry),
    },
  });
  return id;
}

export async function getSavedDiff(id: string) {
  const row = await prisma.diff.findUnique({ where: { id } });
  if (!row) return null;

  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    await prisma.diff.delete({ where: { id } }).catch(() => {});
    return null;
  }

  await prisma.diff.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
  return row;
}
