import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  FolderPlus,
  Folder,
  FolderOpen,
  FileCode2,
  Search,
} from "lucide-react";
import { useState } from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface Props {
  tree: FileNode[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

function Node({
  node,
  depth,
  activeId,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted/40 rounded text-foreground/80"
          style={{ paddingLeft: depth * 12 + 8 }}
        >
          {open ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {open ? (
            <FolderOpen className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-primary" />
          )}
          <span>{node.name}</span>
        </button>
        {open &&
          node.children?.map((c) => (
            <Node
              key={c.id}
              node={c}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
      </div>
    );
  }
  const active = node.id === activeId;
  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
        active
          ? "bg-primary/15 text-primary border-l-2 border-primary"
          : "hover:bg-muted/40 text-foreground/70"
      }`}
      style={{ paddingLeft: depth * 12 + 20 }}
    >
      <FileCode2 className="w-3.5 h-3.5" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function Sidebar({ tree, activeId, onSelect, onCreate }: Props) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass border-r border-border/60 w-60 flex flex-col"
    >
      <div className="px-3 py-2 flex items-center justify-between border-b border-border/40">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            onClick={onCreate}
            className="p-1 hover:bg-muted/50 rounded text-muted-foreground hover:text-primary"
            title="New file"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-muted/50 rounded text-muted-foreground hover:text-primary">
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-muted/50 rounded text-muted-foreground hover:text-primary">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {tree.map((n) => (
          <Node key={n.id} node={n} depth={0} activeId={activeId} onSelect={onSelect} />
        ))}
      </div>
      <div className="divider-glow" />
      <div className="p-3 text-[10px] text-muted-foreground">
        <div className="flex justify-between">
          <span>Branch</span>
          <span className="neon-text">main</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Tamizhi</span>
          <span className="neon-text-green">v0.1.0</span>
        </div>
      </div>
    </motion.aside>
  );
}
