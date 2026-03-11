import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { DeadSwitch } from "@/components/DeadSwitch";
import { User, Shield, Sliders, BookOpen, Loader2, Save, Power } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Settings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  async function loadProfile() {
    const [profileRes, prefsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase.from("user_preferences").select("*").eq("user_id", user!.id).single(),
    ]);
    if (profileRes.data) {
      setDisplayName(profileRes.data.display_name || "");
      setAvatarUrl(profileRes.data.avatar_url || "");
    }
    if (prefsRes.data) {
      setNotificationsEnabled(prefsRes.data.notifications_enabled);
      setSoundEnabled(prefsRes.data.sound_enabled);
    }
    setProfileLoading(false);
  }

  async function saveProfile() {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), avatar_url: avatarUrl.trim(), updated_at: new Date().toISOString() })
      .eq("id", user!.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setLoading(false);
  }

  async function savePreferences() {
    setLoading(true);
    const { error } = await supabase
      .from("user_preferences")
      .update({ notifications_enabled: notificationsEnabled, sound_enabled: soundEnabled, updated_at: new Date().toISOString() })
      .eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else toast.success("Preferences saved");
    setLoading(false);
  }

  async function changePin() {
    if (newPin.length !== 4 || newPin !== confirmNewPin) {
      toast.error("PINs must be 4 digits and match");
      return;
    }
    setLoading(true);
    const currentHash = btoa(currentPin + user!.id);
    const { data } = await supabase.from("user_pins").select("pin_hash").eq("user_id", user!.id).single();
    if (!data || data.pin_hash !== currentHash) {
      toast.error("Current PIN is incorrect");
      setLoading(false);
      return;
    }
    const newHash = btoa(newPin + user!.id);
    const { error } = await supabase
      .from("user_pins")
      .update({ pin_hash: newHash, updated_at: new Date().toISOString() })
      .eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else {
      toast.success("PIN updated");
      setCurrentPin("");
      setNewPin("");
      setConfirmNewPin("");
    }
    setLoading(false);
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div className="p-3 sm:p-4 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 neon-glow">Settings</h2>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border w-full flex overflow-x-auto">
          <TabsTrigger value="profile" className="data-[state=active]:text-primary text-[10px] sm:text-xs gap-1 flex-1 min-w-0">
            <User className="h-3 w-3 shrink-0" /> <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:text-primary text-[10px] sm:text-xs gap-1 flex-1 min-w-0">
            <Shield className="h-3 w-3 shrink-0" /> <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:text-primary text-[10px] sm:text-xs gap-1 flex-1 min-w-0">
            <Sliders className="h-3 w-3 shrink-0" /> <span className="hidden sm:inline">Prefs</span>
          </TabsTrigger>
          <TabsTrigger value="killswitch" className="data-[state=active]:text-destructive text-[10px] sm:text-xs gap-1 flex-1 min-w-0">
            <Power className="h-3 w-3 shrink-0" /> <span className="hidden sm:inline">Dead Switch</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:text-primary text-[10px] sm:text-xs gap-1 flex-1 min-w-0">
            <BookOpen className="h-3 w-3 shrink-0" /> <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass-panel p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Profile Info</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input value={user?.email || ""} disabled className="terminal-input opacity-60" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="terminal-input" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Avatar URL</label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="terminal-input" />
            </div>
            <Button onClick={saveProfile} disabled={loading} className="gap-2 w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="glass-panel p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Change PIN</h3>
          <div className="space-y-4">
            {[
              { label: "Current PIN", value: currentPin, onChange: setCurrentPin },
              { label: "New PIN", value: newPin, onChange: setNewPin },
              { label: "Confirm New PIN", value: confirmNewPin, onChange: setConfirmNewPin },
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="text-xs text-muted-foreground">{field.label}</label>
                <InputOTP maxLength={4} value={field.value} onChange={field.onChange}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            ))}
            <Button onClick={changePin} disabled={loading || currentPin.length !== 4 || newPin.length !== 4} className="gap-2 w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Update PIN
            </Button>
          </div>
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Password</h3>
            <p className="text-xs text-muted-foreground">Use the forgot password flow to reset your password.</p>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="glass-panel p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-card-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Enable system notifications</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-card-foreground">Sound Effects</p>
                <p className="text-xs text-muted-foreground">Enable terminal sound effects</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <Button onClick={savePreferences} disabled={loading} className="gap-2 w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="killswitch" className="glass-panel p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-2">
            <Power className="h-4 w-4" /> Dead Switch
          </h3>
          <p className="text-xs text-muted-foreground">
            Emergency kill switch to immediately disable all running features — scraping, AI agent, and lead processing.
            Use this if you detect suspicious activity, potential bans, or need to go dark immediately.
          </p>
          <DeadSwitch />
        </TabsContent>

        <TabsContent value="docs" className="glass-panel p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Documentation</h3>
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Terminal Commands</h4>
              <p className="text-xs text-muted-foreground font-mono break-all">/scrape [keyword] — Scrape leads by niche</p>
              <p className="text-xs text-muted-foreground font-mono">/help — Show commands</p>
              <p className="text-xs text-muted-foreground font-mono">/clear — Clear terminal</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">AI Agent</h4>
              <p className="text-xs text-muted-foreground">Chat with the AI for lead generation, email templates, and scraping status.</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Lead Statuses</h4>
              <p className="text-xs text-muted-foreground">new → contacted → replied → converted</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Security</h4>
              <p className="text-xs text-muted-foreground">4-digit PIN required every login. Dead Switch for emergency shutdown.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
