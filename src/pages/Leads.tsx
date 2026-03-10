import { LeadsTable } from "@/components/LeadsTable";
import { TerminalInput } from "@/components/TerminalInput";
import { motion } from "framer-motion";

export default function Leads() {
  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <motion.div className="flex-1 min-h-0 overflow-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <LeadsTable />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TerminalInput />
      </motion.div>
    </div>
  );
}
