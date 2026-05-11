import { useCallback, useEffect, useState } from "react";
import { TopNavbar } from "./TopNavbar";
import { Sidebar, type FileNode } from "./Sidebar";
import { EditorPane, type OpenFile } from "./EditorPane";
import { Terminal, type LogLine } from "./Terminal";
import { RightPanel } from "./RightPanel";

const DEFAULT_CODE = `fun main() {
    print "Hello Tamizhi";
}
`;

const initialTree: FileNode[] = [
  {
    id: "root",
    name: "tamizhi-project",
    type: "folder",
    children: [
      {
        id: "src",
        name: "src",
        type: "folder",
        children: [
          { id: "main", name: "main.tz", type: "file" },
          { id: "utils", name: "utils.tz", type: "file" },
        ],
      },
      {
        id: "tests",
        name: "tests",
        type: "folder",
        children: [{ id: "test1", name: "main_test.tz", type: "file" }],
      },
      { id: "readme", name: "README.md", type: "file" },
      { id: "config", name: "tamizhi.toml", type: "file" },
    ],
  },
];

const fileContents: Record<string, string> = {
  main: DEFAULT_CODE,
  utils: `fun greet(name) {\n    print "Vanakkam, " + name;\n}\n`,
  test1: `fun test_main() {\n    assert main() == 0;\n}\n`,
  readme: `# Tamizhi Project\n\nLinux Native Programming Language.\n`,
  config: `[package]\nname = "tamizhi-project"\nversion = "0.1.0"\n`,
};

const SAMPLE_AST = `Program
└── FunctionDecl "main"
    ├── Params: []
    ├── ReturnType: void
    └── Body
        └── PrintStmt
            └── StringLiteral "Hello Tamizhi"`;

const SAMPLE_IR = `; ModuleID = 'tamizhi'
target triple = "x86_64-unknown-linux-gnu"

@.str = private constant [15 x i8] c"Hello Tamizhi\\00"

declare i32 @puts(i8*)

define i32 @main() {
entry:
  %0 = call i32 @puts(i8* getelementptr ([15 x i8], [15 x i8]* @.str, i32 0, i32 0))
  ret i32 0
}`;

const STORAGE_KEY = "tamizhi-ide-state-v1";

type Persisted = {
  fileContents: Record<string, string>;
  openFiles: OpenFile[];
  activeId: string;
};

function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();
if (persisted?.fileContents) {
  Object.assign(fileContents, persisted.fileContents);
}

export function IDE() {
  const [tree] = useState<FileNode[]>(initialTree);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>(
    persisted?.openFiles ?? [{ id: "main", name: "main.tz", content: DEFAULT_CODE }],
  );
  const [activeId, setActiveId] = useState(persisted?.activeId ?? "main");
  const [logs, setLogs] = useState<LogLine[]>([
    { type: "success", text: "✓ Tamizhi compiler initialized" },
    { type: "info", text: "  LLVM 17.0.6 backend loaded" },
    { type: "info", text: "  Target: x86_64-unknown-linux-gnu" },
    { type: "cmd", text: "tamizhi --version" },
    { type: "info", text: "tamizhi 0.1.0 (linux-native)" },
    ...(persisted
      ? [{ type: "info" as const, text: "→ Restored project from local storage" }]
      : []),
  ]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">("ok");
  const [memory, setMemory] = useState(2048);
  const [execTime, setExecTime] = useState(0.42);

  const openFile = useCallback((id: string) => {
    setActiveId(id);
    setOpenFiles((prev) => {
      if (prev.find((f) => f.id === id)) return prev;
      const node = findNode(initialTree, id);
      if (!node || node.type !== "file") return prev;
      return [...prev, { id, name: node.name, content: fileContents[id] ?? "" }];
    });
  }, []);

  const closeFile = (id: string) => {
    setOpenFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeId === id && next.length) setActiveId(next[0].id);
      return next;
    });
  };

  const updateContent = (id: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f)),
    );
    fileContents[id] = content;
  };

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    setStatus("running");
    setLogs((l) => [
      ...l,
      { type: "cmd", text: `tamizhi run ${openFiles.find((f) => f.id === activeId)?.name ?? ""}` },
      { type: "info", text: "→ Lexing..." },
      { type: "info", text: "→ Parsing AST..." },
      { type: "info", text: "→ Generating LLVM IR..." },
      { type: "info", text: "→ JIT compiling..." },
    ]);
    const start = performance.now();
    setTimeout(() => {
      const t = performance.now() - start;
      setLogs((l) => [
        ...l,
        { type: "success", text: "✓ Compilation successful" },
        { type: "info", text: "Hello Tamizhi" },
        { type: "success", text: `✓ Process exited (0) in ${t.toFixed(2)}ms` },
      ]);
      setExecTime(t);
      setMemory(1800 + Math.random() * 800);
      setStatus("ok");
      setRunning(false);
    }, 900);
  };

  const handleSave = () => {
    setLogs((l) => [
      ...l,
      { type: "cmd", text: `save ${openFiles.find((f) => f.id === activeId)?.name}` },
      { type: "success", text: "✓ File saved" },
    ]);
  };

  const handleCreate = () => {
    const id = `new-${Date.now()}`;
    const name = `untitled-${openFiles.length + 1}.tz`;
    fileContents[id] = "";
    setOpenFiles((p) => [...p, { id, name, content: "" }]);
    setActiveId(id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-foreground">
      <TopNavbar onRun={handleRun} onSave={handleSave} running={running} />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          tree={tree}
          activeId={activeId}
          onSelect={openFile}
          onCreate={handleCreate}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <EditorPane
            files={openFiles}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeFile}
            onChange={updateContent}
          />
          <Terminal lines={logs} onClear={() => setLogs([])} />
        </div>
        <RightPanel
          ast={SAMPLE_AST}
          ir={SAMPLE_IR}
          status={status}
          memory={memory}
          execTime={execTime}
        />
      </div>
    </div>
  );
}

function findNode(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNode(n.children, id);
      if (f) return f;
    }
  }
  return null;
}
