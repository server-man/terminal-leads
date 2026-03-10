import { useState, useRef, useEffect } from "react";
import { Terminal, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TerminalInputProps {
  onCommand?: (command: string, args: string) => void;
}

export function TerminalInput({ onCommand }: TerminalInputProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory((h) => [...h.slice(-4), `> ${trimmed}`]);
    setInput("");

    if (trimmed.startsWith("/scrape ")) {
      const keyword = trimmed.slice(8).trim();
      if (!keyword) {
        setHistory((h) => [...h, "[ERR] Usage: /scrape [keyword]"]);
        return;
      }
      setHistory((h) => [...h, `[SYS] Scraping leads for "${keyword}"...`]);
      // Demo: insert a sample lead
      const { error } = await supabase.from("leads").insert({
        email: `lead-${Date.now()}@${keyword.replace(/\s/g, "")}.com`,
        name: `${keyword} Lead`,
        status: "new",
        niche: keyword,
      });
      if (error) {
        setHistory((h) => [...h, `[ERR] ${error.message}`]);
      } else {
        setHistory((h) => [...h, `[OK] Lead scraped for "${keyword}"`]);
        toast.success(`Lead added for "${keyword}"`);
      }
    } else if (trimmed === "/help") {
      setHistory((h) => [...h, "[SYS] Commands: /scrape [keyword], /help, /clear"]);
    } else if (trimmed === "/clear") {
      setHistory([]);
    } else {
      onCommand?.("chat", trimmed);
    }
  }

  return (
    <div className="glass-panel">
      {history.length > 0 && (
        <div className="p-3 border-b border-border max-h-32 overflow-y-auto space-y-0.5">
          {history.map((line, i) => (
            <div key={i} className={`text-xs font-mono ${
              line.startsWith("[ERR]") ? "text-destructive" :
              line.startsWith("[OK]") ? "text-primary" :
              line.startsWith("[SYS]") ? "text-muted-foreground" :
              "text-card-foreground"
            }`}>
              {line}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
        <Terminal className="h-4 w-4 text-primary shrink-0" />
        <ChevronRight className="h-3 w-3 text-primary shrink-0" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command or message... (/help for commands)"
          className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground font-mono"
        />
        <span className="h-4 w-0.5 bg-primary animate-blink" />
      </form>
    </div>
  );
}
