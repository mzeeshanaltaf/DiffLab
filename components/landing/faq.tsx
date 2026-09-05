import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const FAQS = [
  {
    question: "Does anything get uploaded?",
    answer:
      "No. Every diff runs in your browser using JavaScript. Nothing is sent anywhere unless you explicitly choose to share a link.",
  },
  {
    question: "What's the difference between word, line, and character precision?",
    answer:
      "Line precision highlights whole changed lines, word precision highlights individual words, and character precision zooms in to the exact letters that changed.",
  },
  {
    question: "Can I ignore things like timestamps or whitespace?",
    answer:
      "Yes. Turn on ignore whitespace or ignore case, or supply a regular expression, and matching text is excluded from the comparison entirely.",
  },
  {
    question: "Which languages get syntax highlighting?",
    answer:
      "Over 40, including JavaScript, TypeScript, Python, Go, Rust, Java, SQL, and YAML, detected automatically from the file name.",
  },
  {
    question: "Is DiffLab free?",
    answer: "Yes. There's no account, no paywall, and no limit on how many diffs you run.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">Common questions.</h2>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 divide-y divide-border/60 border-t border-border/60">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
