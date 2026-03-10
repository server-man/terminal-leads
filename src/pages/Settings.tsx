import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { User, Shield, Sliders, BookOpen, Loader2, Save } from "lucide-react";
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
    // Verify current PIN
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
    <motion.div className="p-4 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="font-display text-xl font-bold text-foreground mb-4 neon-glow">Settings</h2>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:text-primary text-xs gap-1">
            <User className="h-3 w-3" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:text-primary text-xs gap-1">
            <Shield className="h-3 w-3" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:text-primary text-xs gap-1">
            <Sliders className="h-3 w-3" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:text-primary text-xs gap-1">
            <BookOpen className="h-3 w-3" /> Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="glass-panel p-6 space-y-4">
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
            <Button onClick={saveProfile} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="glass-panel p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Change PIN</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Current PIN</label>
              <InputOTP maxLength={4} value={currentPin} onChange={setCurrentPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">New PIN</label>
              <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Confirm New PIN</label>
              <InputOTP maxLength={4} value={confirmNewPin} onChange={setConfirmNewPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={changePin} disabled={loading || currentPin.length !== 4 || newPin.length !== 4} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              Update PIN
            </Button>
          </div>

          <div className="border-t border-border pt-4 mt-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Password</h3>
            <p className="text-xs text-muted-foreground">Use the forgot password flow to reset your password.</p>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="glass-panel p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Enable system notifications</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-foreground">Sound Effects</p>
                <p className="text-xs text-muted-foreground">Enable terminal sound effects</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <Button onClick={savePreferences} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="glass-panel p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Documentation</h3>
          <div className="space-y-4 text-sm text-card-foreground">
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Terminal Commands</h4>
              <p className="text-xs text-muted-foreground font-mono">/scrape [keyword] — Scrape leads by niche keyword</p>
              <p className="text-xs text-muted-foreground font-mono">/help — Show available commands</p>
              <p className="text-xs text-muted-foreground font-mono">/clear — Clear terminal history</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">AI Agent</h4>
              <p className="text-xs text-muted-foreground">Chat with the AI to get help with lead generation cycles, email templates, and scraping status.</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Lead Statuses</h4>
              <p className="text-xs text-muted-foreground">new → contacted → replied → converted</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-primary font-semibold">Security</h4>
              <p className="text-xs text-muted-foreground">A 4-digit PIN is required on every login for additional security. Change it in the Security tab.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
