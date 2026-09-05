"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Reveal } from "@/components/landing/reveal";

interface UseCase {
  id: string;
  label: string;
  headline: string;
  body: string;
  capabilities: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: "developers",
    label: "Developers",
    headline: "Review code without leaving the browser.",
    body: "Paste two versions of a file, or drop them in, and get syntax-highlighted, per-chunk diffs with word-level precision.",
    capabilities: [
      "40+ languages recognized automatically",
      "Unified patch export for git apply",
      "Ignore regex-matched noise like timestamps and UUIDs",
    ],
  },
  {
    id: "writers",
    label: "Writers",
    headline: "Track every edit to a draft.",
    body: "Compare two drafts of an article, contract, or email and see exactly which sentences moved, changed, or disappeared.",
    capabilities: [
      "Word-level highlighting for prose",
      "Ignore whitespace from copy-paste reformatting",
      "Print or save the comparison as a PDF",
    ],
  },
  {
    id: "ops",
    label: "Ops",
    headline: "Catch config drift before it ships.",
    body: "Diff two versions of a config file, deploy script, or environment file to confirm only the intended lines changed.",
    capabilities: [
      "Regex presets for timestamps and UUIDs",
      "Collapse unchanged lines to focus on what moved",
      "Syntax highlighting for YAML, TOML, JSON, and shell",
    ],
  },
];

export function UseCaseTabs() {
  const [activeId, setActiveId] = useState(USE_CASES[0].id);
  const active = USE_CASES.find((useCase) => useCase.id === activeId) ?? USE_CASES[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-col gap-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          Built around how you actually work.
        </h2>

        <ToggleGroup
          value={[activeId]}
          onValueChange={(value) => value[0] && setActiveId(value[0])}
          variant="outline"
          className="w-fit"
        >
          {USE_CASES.map((useCase) => (
            <ToggleGroupItem key={useCase.id} value={useCase.id}>
              {useCase.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Reveal>

      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-col gap-6 rounded-2xl border border-border/60 bg-card p-8 md:flex-row md:items-start md:justify-between md:gap-12"
      >
        <div className="flex max-w-md flex-col gap-3">
          <h3 className="text-xl font-medium">{active.headline}</h3>
          <p className="text-muted-foreground">{active.body}</p>
        </div>

        <ul className="flex flex-col gap-3 md:w-72 md:shrink-0">
          {active.capabilities.map((capability) => (
            <li key={capability} className="flex gap-2.5 text-sm text-muted-foreground">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
              {capability}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
