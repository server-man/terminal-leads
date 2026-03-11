import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Power, Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function DeadSwitch() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchState();
  }, [user]);

  async function fetchState() {
    const { data } = await supabase
      .from("dead_switch")
      .select("is_active")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) setIsActive(data.is_active);
    setLoading(false);
  }

  async function toggle() {
    setLoading(true);
    const newState = !isActive;
    const { error } = await supabase
      .from("dead_switch")
      .update({
        is_active: newState,
        activated_at: newState ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user!.id);

    if (error) {
      // If no row exists yet, insert one
      if (error.code === "PGRST116") {
        await supabase.from("dead_switch").insert({
          user_id: user!.id,
          is_active: newState,
          activated_at: newState ? new Date().toISOString() : null,
        });
      } else {
        toast.error(error.message);
        setLoading(false);
        return;
      }
    }

    // Log to audit
    await supabase.from("audit_logs").insert({
      user_id: user!.id,
      event_type: "dead_switch",
      severity: newState ? "critical" : "success",
      message: newState ? "Dead Switch ACTIVATED — all features disabled" : "Dead Switch DEACTIVATED — features re-enabled",
    });

    setIsActive(newState);
    toast[newState ? "warning" : "success"](
      newState ? "Dead Switch activated — all features disabled" : "Dead Switch deactivated — features re-enabled"
    );
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <motion.div
          className={`p-2 rounded-full ${isActive ? "bg-destructive/20" : "bg-primary/20"}`}
          animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          {isActive ? (
            <ShieldOff className="h-5 w-5 text-destructive" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-primary" />
          )}
        </motion.div>
        <div>
          <p className="text-sm font-medium text-card-foreground">
            Dead Switch — {isActive ? "ACTIVE" : "STANDBY"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isActive
              ? "All features are currently disabled. Deactivate to resume."
              : "Activate to immediately disable all running features."}
          </p>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={isActive ? "default" : "destructive"}
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Power className="h-4 w-4" />
            {isActive ? "Deactivate Dead Switch" : "Activate Dead Switch"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="glass-panel border-border max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {isActive ? "Deactivate Dead Switch?" : "Activate Dead Switch?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              {isActive
                ? "This will re-enable all features and resume normal operation."
                : "This will immediately disable all running features including scraping, AI agent, and lead processing. Use this if you detect suspicious activity."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggle} className={`text-xs ${!isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
