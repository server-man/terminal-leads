import { AIChatPanel } from "@/components/AIChatPanel";
import { motion } from "framer-motion";

export default function Agent() {
  return (
    <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AIChatPanel />
    </motion.div>
  );
}
