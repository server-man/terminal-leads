import { Activity, Bot, Link2 } from "lucide-react";
import { motion } from "framer-motion";

interface StatusItem {
  label: string;
  status: "online" | "offline";
  icon: React.ReactNode;
}

const statuses: StatusItem[] = [
  { label: "Bot Online", status: "online", icon: <Bot className="h-4 w-4" /> },
  { label: "Apify Connected", status: "online", icon: <Link2 className="h-4 w-4" /> },
];

export function SystemStatus() {
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
        <Activity className="h-3.5 w-3.5" />
        <span>System Status</span>
      </div>
      <div className="space-y-2">
        {statuses.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-card-foreground">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div
                className={`h-2 w-2 rounded-full ${
                  item.status === "online" ? "bg-primary" : "bg-destructive"
                }`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={`text-xs font-medium ${
                item.status === "online" ? "text-primary" : "text-destructive"
              }`}>
                {item.status === "online" ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
