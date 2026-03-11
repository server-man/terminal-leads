import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Mail, TrendingUp, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  replied: number;
  converted: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LeadStats>({ total: 0, new: 0, contacted: 0, replied: 0, converted: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (leads) {
      setStats({
        total: leads.length,
        new: leads.filter((l) => l.status === "new").length,
        contacted: leads.filter((l) => l.status === "contacted").length,
        replied: leads.filter((l) => l.status === "replied").length,
        converted: leads.filter((l) => l.status === "converted").length,
      });
      setRecentLeads(leads.slice(0, 5));
    }
    setLoading(false);
  }

  const conversionRate = stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : "0.0";

  const statCards = [
    { label: "Total Leads", value: stats.total, icon: Users, color: "text-primary" },
    { label: "New", value: stats.new, icon: Mail, color: "text-blue-400" },
    { label: "Contacted", value: stats.contacted, icon: Activity, color: "text-yellow-400" },
    { label: "Replied", value: stats.replied, icon: TrendingUp, color: "text-orange-400" },
    { label: "Converted", value: stats.converted, icon: BarChart3, color: "text-emerald-400" },
  ];

  const anim = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.3 } });

  return (
    <div className="p-3 sm:p-4 space-y-4 max-w-5xl mx-auto">
      <motion.h2 {...anim(0)} className="font-display text-lg sm:text-xl font-bold text-foreground neon-glow">
        Analytics
      </motion.h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} {...anim(i + 1)}>
            <Card className="glass-panel border-border">
              <CardContent className="p-3 sm:p-4 flex flex-col items-center gap-1">
                <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                <span className="text-lg sm:text-2xl font-bold text-foreground">{loading ? "–" : s.value}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider text-center">{s.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conversion + Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div {...anim(6)}>
          <Card className="glass-panel border-border">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <span className="text-3xl sm:text-4xl font-bold text-primary neon-glow">{conversionRate}%</span>
              <p className="text-xs text-muted-foreground mt-1">{stats.converted} of {stats.total} leads converted</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...anim(7)}>
          <Card className="glass-panel border-border">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" /> Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
              {["new", "contacted", "replied", "converted"].map((status) => {
                const count = stats[status as keyof LeadStats] as number;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-card-foreground capitalize">{status}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent leads */}
      <motion.div {...anim(8)}>
        <Card className="glass-panel border-border">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary" /> Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentLeads.length === 0 && !loading ? (
                <p className="p-4 text-xs text-muted-foreground text-center">No leads yet</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between px-3 sm:px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-card-foreground truncate">{lead.email}</p>
                      <p className="text-[10px] text-muted-foreground">{lead.niche || "—"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2 capitalize">
                      {lead.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
