"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { encodeShareHash, buildHashUrl, HASH_BUDGET, EXPIRY_OPTIONS, type ExpiryOption, type ShareMode } from "@/lib/share/url";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Could not copy link");
  }
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <Input readOnly value={value} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
      <Button
        variant="secondary"
        onClick={async () => {
          await copyToClipboard(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        Copy
      </Button>
    </div>
  );
}

export interface ShareDialogProps {
  mode: ShareMode;
  getShareData: () => unknown;
}

export function ShareDialog({ mode, getShareData }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [hashLink, setHashLink] = useState<string | null>(null);
  const [oversized, setOversized] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryOption>("7d");
  const [savedLink, setSavedLink] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;

    setSavedLink(null);
    const data = getShareData();
    const encoded = encodeShareHash({ mode, data });
    if (encoded.length <= HASH_BUDGET) {
      setOversized(false);
      setHashLink(buildHashUrl({ mode, data }));
    } else {
      setOversized(true);
      setHashLink(null);
    }
  }

  async function handleCreateLink() {
    setSaving(true);
    try {
      const res = await fetch("/api/diffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, data: getShareData(), expiry }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save this diff.");
      setSavedLink(`${window.location.origin}/d/${json.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this diff.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm">
            <Share2 data-icon="inline-start" />
            Share
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this diff</DialogTitle>
          <DialogDescription>
            {oversized
              ? "This diff is too large to fit in a URL. Save it to get a short link instead."
              : "This link encodes both sides directly in the URL — nothing is uploaded to a server."}
          </DialogDescription>
        </DialogHeader>

        {!oversized && hashLink ? <CopyField value={hashLink} /> : null}

        {oversized ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="share-expiry" className="font-normal">
                Link expires
              </Label>
              <Select value={expiry} onValueChange={(value) => value && setExpiry(value as ExpiryOption)}>
                <SelectTrigger id="share-expiry" size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {savedLink ? (
              <CopyField value={savedLink} />
            ) : (
              <Button onClick={handleCreateLink} disabled={saving}>
                {saving ? "Creating link…" : "Create link"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Saved diffs are stored on our server so anyone with the link can view them until they expire.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
