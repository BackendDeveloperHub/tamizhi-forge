import { motion } from "framer-motion";
import { Terminal as TermIcon, Trash2, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export interface LogLine {
  type: "info" | "error" | "success" | "cmd";
  text: string;
}

interface Props {
  lines: LogLine[];
  onClear: () => void;
}

const colorMap: Record<LogLine["type"], string> = {
  info: "text-foreground/80",
  error: "text-[oklch(0.7_0.25_25)]",
  success: "neon-text-green",
  cmd: "neon-text",
};

export function Terminal({ lines, onClear }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [lines]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass border-t border-border/60 flex flex-col"
      style={{ height: 200 }}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Terminal
          </span>
          <span className="pulse-dot ml-2" />
        </div>
        <div className="flex gap-1">
          <button
            onClick={onClear}
            className="p-1 hover:bg-muted/50 rounded text-muted-foreground hover:text-primary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-muted/50 rounded text-muted-foreground">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex-1 overflow-auto px-3 py-2 text-xs font-mono leading-relaxed scan-line relative"
      >
        {lines.map((l, i) => (
          <div key={i} className={`${colorMap[l.type]} whitespace-pre-wrap`}>
            {l.type === "cmd" && <span className="neon-text">➜ </span>}
            {l.text}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="neon-text-green">tamizhi@linux</span>
          <span className="text-muted-foreground">:</span>
          <span className="neon-text">~/project</span>
          <span className="text-muted-foreground">$</span>
          <span className="w-2 h-4 bg-primary animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
