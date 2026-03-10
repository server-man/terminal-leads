import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Zap, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PinVerification() {
  const { user, setPinVerified, signOut } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    if (user) checkPin();
  }, [user]);

  async function checkPin() {
    const { data } = await supabase
      .from("user_pins")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();
    const exists = !!data;
    setHasPin(exists);
    if (!exists) setIsSettingUp(true);
  }

  async function handleSetupPin() {
    if (pin.length !== 4) return;
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setLoading(true);
    // Simple hash - in production use bcrypt via edge function
    const pinHash = btoa(pin + user!.id);
    const { error } = await supabase.from("user_pins").insert({
      user_id: user!.id,
      pin_hash: pinHash,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("PIN set successfully");
      setPinVerified(true);
    }
    setLoading(false);
  }

  async function handleVerifyPin() {
    if (pin.length !== 4) return;
    setLoading(true);
    const pinHash = btoa(pin + user!.id);
    const { data } = await supabase
      .from("user_pins")
      .select("pin_hash")
      .eq("user_id", user!.id)
      .single();

    if (data && data.pin_hash === pinHash) {
      setPinVerified(true);
      toast.success("Access granted");
    } else {
      toast.error("Invalid PIN");
      setPin("");
    }
    setLoading(false);
  }

  if (hasPin === null) {
    return (
      <div className="min-h-screen bg-background scanline flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scanline flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-sm p-8 space-y-6"
      >
        <div className="flex items-center justify-center gap-3">
          <Zap className="h-5 w-5 text-primary neon-glow" />
          <h1 className="font-display text-lg font-bold text-foreground neon-glow">LEADGEN_OS</h1>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">
            {isSettingUp ? "Set Up Security PIN" : "Enter Security PIN"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              {isSettingUp ? "Create a 4-digit PIN" : "Enter your 4-digit PIN"}
            </p>
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {isSettingUp && (
            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">Confirm PIN</p>
              <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}

          <Button
            onClick={isSettingUp ? handleSetupPin : handleVerifyPin}
            className="w-full"
            disabled={loading || pin.length !== 4 || (isSettingUp && confirmPin.length !== 4)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSettingUp ? "Set PIN" : "Verify"}
          </Button>

          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-primary">
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
