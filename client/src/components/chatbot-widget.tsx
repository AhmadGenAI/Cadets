import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import faviconImg from "@assets/pakmcqs-of-shaheen-forces-academy_1772625743394.webp";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    .replace(/\n/g, '<br/>');
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Assalam-o-Alaikum! I'm here to help you with cadet college queries.\n\nAsk me about:\n- **Admissions** & eligibility\n- **Entry test** syllabus\n- **College** information\n- **Fee** structures\n- **Interview** & Medical prep\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", content: data.reply || data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, something went wrong. Please try again or visit **[www.pakshaheens.com](https://www.pakshaheens.com)** for help." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          data-testid="button-open-chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col" style={{ height: "min(500px, calc(100vh - 6rem))" }}>
          <Card className="flex flex-col h-full shadow-2xl border overflow-hidden">
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary-foreground/20">
                  <img src={faviconImg} alt="Bot" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Cadet College Assistant</p>
                  <p className="text-xs opacity-80">Ask anything about cadet colleges</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                onClick={() => setOpen(false)}
                data-testid="button-close-chatbot"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                    data-testid={`chat-message-${msg.role}-${i}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-background border rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-background shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about cadet colleges..."
                  className="flex-1 text-sm"
                  disabled={loading}
                  data-testid="input-chatbot-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  data-testid="button-send-chatbot"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
