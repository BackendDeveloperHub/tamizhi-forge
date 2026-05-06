import { motion } from "framer-motion";
import { Activity, Binary, Cpu, GitBranch, Timer, MemoryStick } from "lucide-react";
import { useState } from "react";

interface Props {
  ast: string;
  ir: string;
  status: "idle" | "running" | "ok" | "error";
  memory: number;
  execTime: number;
}

const tabs = [
  { id: "ast", label: "AST", icon: GitBranch },
  { id: "ir", label: "LLVM IR", icon: Binary },
  { id: "stats", label: "Stats", icon: Activity },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statusColor = {
  idle: "text-muted-foreground",
  running: "neon-text",
  ok: "neon-text-green",
  error: "text-[oklch(0.7_0.25_25)]",
};

export function RightPanel({ ast, ir, status, memory, execTime }: Props) {
  const [tab, setTab] = useState<TabId>("ast");

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass border-l border-border/60 w-80 flex flex-col"
    >
      <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Compiler
        </span>
        <div className="flex items-center gap-1.5">
          <Cpu className={`w-3 h-3 ${statusColor[status]}`} />
          <span className={`text-[10px] uppercase tracking-wider ${statusColor[status]}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="flex border-b border-border/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] uppercase tracking-wider transition-colors ${
              tab === t.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3 text-xs font-mono">
        {tab === "ast" && (
          <pre className="text-foreground/80 whitespace-pre-wrap">{ast}</pre>
        )}
        {tab === "ir" && (
          <pre className="neon-text whitespace-pre-wrap">{ir}</pre>
        )}
        {tab === "stats" && (
          <div className="space-y-3">
            <StatCard
              icon={Timer}
              label="Execution Time"
              value={`${execTime.toFixed(2)} ms`}
            />
            <StatCard
              icon={MemoryStick}
              label="Memory Usage"
              value={`${memory.toFixed(1)} KB`}
            />
            <StatCard icon={Cpu} label="LLVM Backend" value="Connected" ok />
            <StatCard icon={Activity} label="Optimizer" value="O2" ok />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="glass rounded-md p-3 flex items-center justify-between border border-border/50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground text-[11px] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className={ok ? "neon-text-green" : "neon-text"}>{value}</span>
    </div>
  );
}
