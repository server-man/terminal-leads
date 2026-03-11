import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Mail, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  status: string;
  niche: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-primary/20 text-primary border-primary/30",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  replied: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  converted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchLeads())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
    setLoading(false);
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border flex items-center gap-2">
        <Database className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Leads Database</span>
        <span className="ml-auto text-xs text-muted-foreground">{leads.length} records</span>
      </div>

      {/* Mobile card view */}
      <div className="block sm:hidden divide-y divide-border">
        {loading ? (
          <p className="p-4 text-center text-muted-foreground text-xs">Loading...</p>
        ) : leads.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground text-xs">No leads yet. Use /scrape [keyword] to start.</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-card-foreground truncate flex-1">{lead.email}</span>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[lead.status] || statusColors.new}`}>
                  {lead.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{lead.name || "—"}</span>
                <span>•</span>
                <span>{lead.niche || "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-3"><div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />Email</div></th>
              <th className="text-left p-3"><div className="flex items-center gap-1.5"><User className="h-3 w-3" />Name</div></th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3"><div className="flex items-center gap-1.5"><Tag className="h-3 w-3" />Niche</div></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No leads yet. Use /scrape [keyword] to start.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-card-foreground">{lead.email}</td>
                  <td className="p-3 text-card-foreground">{lead.name || "—"}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={statusColors[lead.status] || statusColors.new}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{lead.niche || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
