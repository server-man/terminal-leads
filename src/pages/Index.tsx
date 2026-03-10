import { Zap, Shield } from "lucide-react";
import { SystemStatus } from "@/components/SystemStatus";
import { LeadsTable } from "@/components/LeadsTable";
import { TerminalInput } from "@/components/TerminalInput";
import { AIChatPanel } from "@/components/AIChatPanel";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background scanline">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary neon-glow" />
          <h1 className="font-display text-lg font-bold text-foreground neon-glow tracking-tight">
            LEADGEN_OS
          </h1>
          <span className="text-xs text-muted-foreground">v2.1.0</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>SECURE SESSION</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-49px)]">
        {/* Left: Main content */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-w-0">
          {/* Top row: Status */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SystemStatus />
          </motion.div>

          {/* Leads Table */}
          <motion.div
            className="flex-1 min-h-0 overflow-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <LeadsTable />
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <TerminalInput />
          </motion.div>
        </div>

        {/* Right: AI Chat */}
        <motion.div
          className="w-96 border-l border-border"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <AIChatPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
