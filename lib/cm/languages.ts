import type { Extension } from "@codemirror/state";

export interface LanguageDef {
  id: string;
  label: string;
  extensions: string[];
  filenames?: string[];
  load: () => Promise<Extension>;
}

async function streamLang<T>(modPromise: Promise<T>, pick: (mod: T) => Parameters<
  typeof import("@codemirror/language")["StreamLanguage"]["define"]
>[0]): Promise<Extension> {
  const [{ StreamLanguage }, mod] = await Promise.all([import("@codemirror/language"), modPromise]);
  return StreamLanguage.define(pick(mod));
}

export const LANGUAGES: LanguageDef[] = [
  { id: "plaintext", label: "Plain text", extensions: [".txt"], load: async () => [] },

  // Official @codemirror/lang-* packages - full LanguageSupport (highlighting + indentation).
  {
    id: "javascript",
    label: "JavaScript",
    extensions: [".js", ".mjs", ".cjs"],
    load: async () => (await import("@codemirror/lang-javascript")).javascript(),
  },
  {
    id: "jsx",
    label: "JSX",
    extensions: [".jsx"],
    load: async () => (await import("@codemirror/lang-javascript")).javascript({ jsx: true }),
  },
  {
    id: "typescript",
    label: "TypeScript",
    extensions: [".ts", ".mts", ".cts"],
    load: async () => (await import("@codemirror/lang-javascript")).javascript({ typescript: true }),
  },
  {
    id: "tsx",
    label: "TSX",
    extensions: [".tsx"],
    load: async () => (await import("@codemirror/lang-javascript")).javascript({ jsx: true, typescript: true }),
  },
  {
    id: "python",
    label: "Python",
    extensions: [".py", ".pyw"],
    load: async () => (await import("@codemirror/lang-python")).python(),
  },
  {
    id: "html",
    label: "HTML",
    extensions: [".html", ".htm"],
    load: async () => (await import("@codemirror/lang-html")).html(),
  },
  {
    id: "css",
    label: "CSS",
    extensions: [".css"],
    load: async () => (await import("@codemirror/lang-css")).css(),
  },
  {
    id: "json",
    label: "JSON",
    extensions: [".json", ".jsonc", ".map"],
    load: async () => (await import("@codemirror/lang-json")).json(),
  },
  {
    id: "markdown",
    label: "Markdown",
    extensions: [".md", ".markdown"],
    load: async () => (await import("@codemirror/lang-markdown")).markdown(),
  },
  {
    id: "xml",
    label: "XML",
    extensions: [".xml", ".svg", ".xsl", ".xsd"],
    load: async () => (await import("@codemirror/lang-xml")).xml(),
  },
  {
    id: "sql",
    label: "SQL",
    extensions: [".sql"],
    load: async () => (await import("@codemirror/lang-sql")).sql(),
  },
  {
    id: "rust",
    label: "Rust",
    extensions: [".rs"],
    load: async () => (await import("@codemirror/lang-rust")).rust(),
  },
  {
    id: "java",
    label: "Java",
    extensions: [".java"],
    load: async () => (await import("@codemirror/lang-java")).java(),
  },
  {
    id: "cpp",
    label: "C / C++",
    extensions: [".c", ".h", ".cpp", ".cc", ".cxx", ".hpp", ".hh"],
    load: async () => (await import("@codemirror/lang-cpp")).cpp(),
  },
  {
    id: "php",
    label: "PHP",
    extensions: [".php"],
    load: async () => (await import("@codemirror/lang-php")).php(),
  },
  {
    id: "yaml",
    label: "YAML",
    extensions: [".yaml", ".yml"],
    load: async () => (await import("@codemirror/lang-yaml")).yaml(),
  },

  // @codemirror/legacy-modes - lighter StreamLanguage parsers, still get highlighting + auto-detect.
  { id: "go", label: "Go", extensions: [".go"], load: () => streamLang(import("@codemirror/legacy-modes/mode/go"), (m) => m.go) },
  { id: "ruby", label: "Ruby", extensions: [".rb"], load: () => streamLang(import("@codemirror/legacy-modes/mode/ruby"), (m) => m.ruby) },
  {
    id: "shell",
    label: "Shell",
    extensions: [".sh", ".bash", ".zsh"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/shell"), (m) => m.shell),
  },
  { id: "lua", label: "Lua", extensions: [".lua"], load: () => streamLang(import("@codemirror/legacy-modes/mode/lua"), (m) => m.lua) },
  {
    id: "swift",
    label: "Swift",
    extensions: [".swift"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/swift"), (m) => m.swift),
  },
  {
    id: "csharp",
    label: "C#",
    extensions: [".cs"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clike"), (m) => m.csharp),
  },
  {
    id: "kotlin",
    label: "Kotlin",
    extensions: [".kt", ".kts"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clike"), (m) => m.kotlin),
  },
  {
    id: "scala",
    label: "Scala",
    extensions: [".scala"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clike"), (m) => m.scala),
  },
  {
    id: "objectivec",
    label: "Objective-C",
    extensions: [".m", ".mm"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clike"), (m) => m.objectiveC),
  },
  {
    id: "dart",
    label: "Dart",
    extensions: [".dart"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clike"), (m) => m.dart),
  },
  { id: "perl", label: "Perl", extensions: [".pl", ".pm"], load: () => streamLang(import("@codemirror/legacy-modes/mode/perl"), (m) => m.perl) },
  { id: "r", label: "R", extensions: [".r"], load: () => streamLang(import("@codemirror/legacy-modes/mode/r"), (m) => m.r) },
  {
    id: "groovy",
    label: "Groovy",
    extensions: [".groovy", ".gradle"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/groovy"), (m) => m.groovy),
  },
  {
    id: "haskell",
    label: "Haskell",
    extensions: [".hs"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/haskell"), (m) => m.haskell),
  },
  {
    id: "clojure",
    label: "Clojure",
    extensions: [".clj", ".cljs", ".cljc"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/clojure"), (m) => m.clojure),
  },
  { id: "toml", label: "TOML", extensions: [".toml"], load: () => streamLang(import("@codemirror/legacy-modes/mode/toml"), (m) => m.toml) },
  {
    id: "dockerfile",
    label: "Dockerfile",
    extensions: [],
    filenames: ["dockerfile"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/dockerfile"), (m) => m.dockerFile),
  },
  {
    id: "powershell",
    label: "PowerShell",
    extensions: [".ps1", ".psm1"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/powershell"), (m) => m.powerShell),
  },
  {
    id: "ini",
    label: "INI / Properties",
    extensions: [".ini", ".cfg", ".properties"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/properties"), (m) => m.properties),
  },
  {
    id: "pascal",
    label: "Pascal",
    extensions: [".pas"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/pascal"), (m) => m.pascal),
  },
  {
    id: "cmake",
    label: "CMake",
    extensions: [".cmake"],
    filenames: ["cmakelists.txt"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/cmake"), (m) => m.cmake),
  },
  {
    id: "protobuf",
    label: "Protocol Buffers",
    extensions: [".proto"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/protobuf"), (m) => m.protobuf),
  },
  { id: "vb", label: "Visual Basic", extensions: [".vb"], load: () => streamLang(import("@codemirror/legacy-modes/mode/vb"), (m) => m.vb) },
  {
    id: "diff",
    label: "Diff / Patch",
    extensions: [".diff", ".patch"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/diff"), (m) => m.diff),
  },
  { id: "julia", label: "Julia", extensions: [".jl"], load: () => streamLang(import("@codemirror/legacy-modes/mode/julia"), (m) => m.julia) },
  {
    id: "fortran",
    label: "Fortran",
    extensions: [".f", ".f90", ".f95"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/fortran"), (m) => m.fortran),
  },
  {
    id: "verilog",
    label: "Verilog",
    extensions: [".v", ".sv"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/verilog"), (m) => m.verilog),
  },
  {
    id: "nginx",
    label: "Nginx",
    extensions: [".conf"],
    filenames: ["nginx.conf"],
    load: () => streamLang(import("@codemirror/legacy-modes/mode/nginx"), (m) => m.nginx),
  },
];

const EXTENSION_INDEX = new Map<string, string>();
const FILENAME_INDEX = new Map<string, string>();
for (const lang of LANGUAGES) {
  for (const ext of lang.extensions) EXTENSION_INDEX.set(ext, lang.id);
  for (const name of lang.filenames ?? []) FILENAME_INDEX.set(name, lang.id);
}

export function detectLanguageFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase();
  const base = lower.split("/").pop() ?? lower;
  if (FILENAME_INDEX.has(base)) return FILENAME_INDEX.get(base) ?? null;
  const dot = base.lastIndexOf(".");
  if (dot === -1) return null;
  const ext = base.slice(dot);
  return EXTENSION_INDEX.get(ext) ?? null;
}

export function getLanguageDef(id: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.id === id);
}
