import { TerminalInput } from "@/components/TerminalInput";
import { motion } from "framer-motion";

export default function TerminalPage() {
  return (
    <div className="p-4 h-full flex flex-col">
      <motion.div className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <TerminalInput />
      </motion.div>
    </div>
  );
}
