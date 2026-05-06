import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, SplitSquareHorizontal } from "lucide-react";

export interface OpenFile {
  id: string;
  name: string;
  content: string;
}

interface Props {
  files: OpenFile[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onChange: (id: string, value: string) => void;
}

function defineTamizhi(monaco: Monaco) {
  monaco.languages.register({ id: "tamizhi" });
  monaco.languages.setMonarchTokensProvider("tamizhi", {
    keywords: [
      "fun", "let", "const", "if", "else", "while", "for", "return",
      "print", "true", "false", "null", "import", "export", "struct",
      "enum", "match", "in", "as", "use", "pub", "mut",
    ],
    typeKeywords: ["int", "float", "string", "bool", "void", "char"],
    operators: ["=", ">", "<", "!", "==", "!=", "+", "-", "*", "/", "%", "&&", "||"],
    tokenizer: {
      root: [
        [/\/\/.*/, "comment"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
        [/\b\d+(\.\d+)?\b/, "number"],
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "type",
              "@default": "identifier",
            },
          },
        ],
        [/[{}()[\]]/, "@brackets"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
    },
  });

  monaco.editor.defineTheme("tamizhi-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "8be9fd", fontStyle: "bold" },
      { token: "type", foreground: "ff79c6" },
      { token: "string", foreground: "50fa7b" },
      { token: "number", foreground: "bd93f9" },
      { token: "comment", foreground: "6272a4", fontStyle: "italic" },
      { token: "identifier", foreground: "f8f8f2" },
    ],
    colors: {
      "editor.background": "#0e1320",
      "editor.foreground": "#e6f1ff",
      "editorLineNumber.foreground": "#3a4a6a",
      "editorLineNumber.activeForeground": "#8be9fd",
      "editor.selectionBackground": "#264f78",
      "editorCursor.foreground": "#50fa7b",
      "editor.lineHighlightBackground": "#161d2e",
      "editorGutter.background": "#0e1320",
    },
  });

  monaco.languages.registerCompletionItemProvider("tamizhi", {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const suggestions = [
        "fun", "let", "const", "if", "else", "while", "return", "print",
        "struct", "enum", "match", "import",
      ].map((k) => ({
        label: k,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: k,
        range,
      }));
      suggestions.push({
        label: "main",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "fun main() {\n\t$0\n}",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      } as never);
      return { suggestions };
    },
  });
}

export function EditorPane({
  files,
  activeId,
  onSelect,
  onClose,
  onChange,
}: Props) {
  const active = files.find((f) => f.id === activeId);

  const handleMount: OnMount = (_editor, monaco) => {
    defineTamizhi(monaco);
    monaco.editor.setTheme("tamizhi-dark");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0e1320]">
      <div className="flex items-center bg-card/40 border-b border-border/60 h-9 overflow-x-auto">
        <AnimatePresence>
          {files.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelect(f.id)}
              className={`group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-r border-border/60 ${
                f.id === activeId
                  ? "bg-[#0e1320] text-primary border-t-2 border-t-primary"
                  : "text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <span>{f.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(f.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button className="p-1 text-muted-foreground hover:text-primary">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-primary">
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {active ? (
          <Editor
            height="100%"
            language="tamizhi"
            theme="tamizhi-dark"
            value={active.content}
            onMount={handleMount}
            onChange={(v) => onChange(active.id, v ?? "")}
            options={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 14,
              minimap: { enabled: true, scale: 0.5 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              lineNumbers: "on",
              renderLineHighlight: "all",
              scrollBeyondLastLine: false,
              padding: { top: 12 },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No file open
          </div>
        )}
      </div>
    </div>
  );
}
