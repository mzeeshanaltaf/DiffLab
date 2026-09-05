"use client";

import { useRef, useState } from "react";
import { Clipboard, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InputPaneHeaderProps {
  label: string;
  filename: string | null;
  accentClassName: string;
  className?: string;
  onFile: (file: File) => void;
  onPasteText: (text: string) => void;
  onClear: () => void;
}

export function InputPaneHeader({
  label,
  filename,
  accentClassName,
  className,
  onFile,
  onPasteText,
  onClear,
}: InputPaneHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteError, setPasteError] = useState(false);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onPasteText(text);
      setPasteError(false);
    } catch {
      setPasteError(true);
      window.setTimeout(() => setPasteError(false), 2500);
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        "flex min-w-0 items-center gap-2 px-3 py-1.5 transition-colors",
        isDragOver && "bg-accent/60",
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", accentClassName)} />
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      {filename ? (
        <Badge variant="secondary" className="min-w-0 truncate font-normal">
          <span className="truncate">{filename}</span>
        </Badge>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Paste into ${label}`}
                onClick={handlePaste}
              >
                <Clipboard className={cn(pasteError && "text-destructive")} />
              </Button>
            }
          />
          <TooltipContent>{pasteError ? "Clipboard permission denied" : "Paste from clipboard"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Upload file for ${label}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp />
              </Button>
            }
          />
          <TooltipContent>Upload a file</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label={`Clear ${label}`} onClick={onClear}>
                <X />
              </Button>
            }
          />
          <TooltipContent>Clear</TooltipContent>
        </Tooltip>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
