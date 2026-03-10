import { SystemStatus } from "@/components/SystemStatus";
import { LeadsTable } from "@/components/LeadsTable";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="p-4 space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SystemStatus />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <LeadsTable />
      </motion.div>
    </div>
  );
}
