import { motion } from "framer-motion";
import { Play, Save, Settings, Moon, Terminal as TermIcon, Cpu } from "lucide-react";

interface Props {
  onRun: () => void;
  onSave: () => void;
  running: boolean;
}

export function TopNavbar({ onRun, onSave, running }: Props) {
  return (
    <header className="glass scan-line relative flex items-center justify-between px-4 h-14 border-b border-border/60 z-20">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-md flex items-center justify-center border border-primary/40 bg-primary/10 shadow-[0_0_18px_oklch(0.78_0.18_165/0.4)]">
            <TermIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-wider logo-grad">TAMIZHI</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
              Linux Native Programming Language
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md glass">
        <Cpu className="w-3.5 h-3.5 text-primary" />
        <span className="pulse-dot" />
        <span className="text-xs neon-text-green tracking-wide">LLVM Backend Connected</span>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRun}
          className="neon-btn flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Play className="w-3.5 h-3.5" />
          {running ? "Running..." : "Run"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="neon-btn neon-btn-pink flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </motion.button>
        <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors">
          <Moon className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
