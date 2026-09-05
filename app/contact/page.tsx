import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact & Feedback",
  description: "Share feedback, report a bug, or suggest a feature.",
};

// Short error codes set by the API route's redirect (?error=...) mapped to
// human-readable copy. Keep keys in sync with the route handler's fail() calls.
const ERROR_MESSAGES: Record<string, string> = {
  fields: "Please fill in all fields.",
  email: "Please enter a valid email address.",
  length: "Message must be 5000 characters or fewer.",
  rate: "Too many submissions. Please try again later.",
  server: "Service is temporarily unavailable. Please try again later.",
  parse: "Invalid submission. Please try again.",
};

type Props = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const { sent, error } = await searchParams;
  const initialError = error
    ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.")
    : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquareText className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contact &amp; feedback
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Found a bug, have an idea, or just want to say hi? Send us a message — we read
            everything.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <ContactForm initialSuccess={!!sent} initialError={initialError} />
      </div>
    </div>
  );
}
