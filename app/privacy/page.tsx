import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What DiffLab stores, what it doesn't, and what the contact form sends.",
};

const SECTIONS = [
  {
    title: "Client-side by default",
    body: "Every diff — text, JSON, Excel, image, or document — is parsed, compared, and rendered entirely in your browser. Nothing you paste or upload is sent to a server unless you explicitly click \"Save & share.\" Closing the tab leaves no trace on our end.",
  },
  {
    title: "What \"Save & share\" stores",
    body: "When you choose to share a diff, either the comparison is encoded directly into the URL (for small diffs, so nothing touches our database at all), or — for larger diffs — both sides of the content plus your diff settings are stored in our database and served back only to whoever holds the resulting link. We don't scan, read, or use that content for anything other than serving it back to you.",
  },
  {
    title: "Retention & expiry",
    body: "Saved links carry an expiry you choose at share time: 1 day, 7 days, 30 days, or never. Expired links and their stored content are deleted and become permanently inaccessible once the expiry passes.",
  },
  {
    title: "What the contact form sends",
    body: "Submitting the contact form sends your name, email address, and message to our automation backend (n8n) over an authenticated HTTPS request, used solely to read and respond to your message. Submissions are rate-limited per IP address to prevent abuse; that IP is used only for the rate-limit check and is not stored alongside your message.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Fast and free without asking you to trust us with your data by default.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8"
          >
            <h2 className="font-medium">{section.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
