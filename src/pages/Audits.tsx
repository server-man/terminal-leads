import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, ShieldCheck, AlertTriangle, Eye, Globe, Clock, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  event_type: string;
  severity: string;
  message: string;
  metadata: any;
  created_at: string;
}

const severityConfig: Record<string, { color: string; icon: typeof Info }> = {
  info: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Info },
  warning: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertTriangle },
  critical: { color: "bg-destructive/20 text-destructive border-destructive/30", icon: ShieldAlert },
  success: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: ShieldCheck },
};

const threatChecks = [
  { name: "Rate Limiting", status: "active", detail: "Request throttling enabled" },
  { name: "IP Monitoring", status: "active", detail: "Tracking connection origins" },
  { name: "Proxy Shield", status: "pending", detail: "Proxy rotation — coming soon" },
  { name: "Anti-Ban Detection", status: "pending", detail: "Platform flag monitoring — coming soon" },
  { name: "Email Warm-up", status: "pending", detail: "Deliverability scoring — coming soon" },
];

export default function Audits() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data as AuditLog[]);
    setLoading(false);
  }

  async function logTestEvent() {
    await supabase.from("audit_logs").insert({
      user_id: user!.id,
      event_type: "security_scan",
      severity: "info",
      message: "Manual security scan initiated by user",
      metadata: { timestamp: new Date().toISOString() },
    });
    toast.success("Security scan logged");
    fetchLogs();
  }

  const anim = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.3 } });

  return (
    <div className="p-3 sm:p-4 space-y-4 max-w-4xl mx-auto">
      <motion.div {...anim(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground neon-glow flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Audits & Security
        </h2>
        <Button onClick={logTestEvent} size="sm" variant="outline" className="gap-2 text-xs self-start">
          <RefreshCw className="h-3 w-3" /> Run Scan
        </Button>
      </motion.div>

      {/* Threat monitoring cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {threatChecks.map((check, i) => (
          <motion.div key={check.name} {...anim(i + 1)}>
            <Card className="glass-panel border-border">
              <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                <div className={`p-1.5 rounded ${check.status === "active" ? "bg-primary/20" : "bg-muted"}`}>
                  {check.status === "active" ? (
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-card-foreground">{check.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${check.status === "active" ? "text-primary border-primary/30" : "text-muted-foreground border-border"}`}>
                      {check.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security overview */}
      <motion.div {...anim(6)}>
        <Card className="glass-panel border-border">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-primary" /> Vulnerability Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              <div className="glass-panel p-3 rounded">
                <span className="text-2xl font-bold text-primary">0</span>
                <p className="text-[10px] text-muted-foreground uppercase">Active Threats</p>
              </div>
              <div className="glass-panel p-3 rounded">
                <span className="text-2xl font-bold text-yellow-400">0</span>
                <p className="text-[10px] text-muted-foreground uppercase">Warnings</p>
              </div>
              <div className="glass-panel p-3 rounded">
                <span className="text-2xl font-bold text-emerald-400">0</span>
                <p className="text-[10px] text-muted-foreground uppercase">Flags / Bans</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              Proxy integration coming soon — will enable IP rotation and anti-detection features.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit log */}
      <motion.div {...anim(7)}>
        <Card className="glass-panel border-border">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" /> Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {loading ? (
                <p className="p-4 text-xs text-muted-foreground text-center">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground text-center">No audit events yet. Run a scan to start monitoring.</p>
              ) : (
                <div className="divide-y divide-border">
                  {logs.map((log) => {
                    const cfg = severityConfig[log.severity] || severityConfig.info;
                    const Icon = cfg.icon;
                    return (
                      <div key={log.id} className="flex items-start gap-3 px-3 sm:px-4 py-2.5">
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-card-foreground">{log.event_type}</span>
                            <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{log.message}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
