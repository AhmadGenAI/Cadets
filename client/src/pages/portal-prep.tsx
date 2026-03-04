import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bot, User, Loader2, Brain, Volume2, Square } from "lucide-react";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function stripEmojis(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "");
}

function cleanTextForSpeech(text: string): string {
  let cleaned = stripEmojis(text);
  cleaned = cleaned.replace(/[*_~`#]/g, "");
  cleaned = cleaned.replace(/^-\s/gm, "");
  cleaned = cleaned.replace(/\n{2,}/g, ". ");
  cleaned = cleaned.replace(/\n/g, ". ");
  cleaned = cleaned.replace(/\.{2,}/g, ".");
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  return cleaned.trim();
}

export default function PortalPrep() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utteranceIdRef = useRef(0);

  useEffect(() => {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    setSpeechSupported(supported);
    if (supported) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) { setLocation("/login"); return; }
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Assalam-o-Alaikum! I'm your AI tutor at Cadet Colleges Test Preparation Portal. I'm here to help you prepare for your cadet college entrance exam.\n\nI can help you with:\n- Subject-wise lessons and explanations\n- Practice MCQs and quizzes\n- Study tips and strategies\n- General knowledge preparation\n\nWhat would you like to study today? You can ask me about any subject like Math, English, Science, Urdu, or General Knowledge.`
      }]);
    }
  }, [user, isLoading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  const stopSpeaking = useCallback(() => {
    utteranceIdRef.current++;
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
  }, [speechSupported]);

  const speakMessage = useCallback((text: string, index: number) => {
    if (!speechSupported) return;

    if (speakingIndex === index) {
      stopSpeaking();
      return;
    }

    utteranceIdRef.current++;
    const currentId = utteranceIdRef.current;
    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith("en-US"))
      || voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      if (utteranceIdRef.current === currentId) setSpeakingIndex(index);
    };
    utterance.onend = () => {
      if (utteranceIdRef.current === currentId) setSpeakingIndex(null);
    };
    utterance.onerror = () => {
      if (utteranceIdRef.current === currentId) setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [speechSupported, speakingIndex, stopSpeaking, voices]);

  if (!user) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/tutor/chat", {
        message: userMsg,
        level: user.level,
        collegeId: user.selectedCollegeId,
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="AI Tutor" description="Chat with your AI tutor for personalized cadet college exam preparation." path="/portal/prep" />
      <PublicHeader />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-prep-title">Smart Tutor</h1>
            <p className="text-xs text-muted-foreground">AI-powered preparation assistant</p>
          </div>
          {speechSupported && (
            <Badge variant="outline" className="ml-auto text-xs gap-1">
              <Volume2 className="w-3 h-3" />
              Voice enabled
            </Badge>
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-[500px]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`w-full rounded-md p-3 text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                      data-testid={`text-message-${i}`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && speechSupported && (
                      <button
                        onClick={() => speakMessage(msg.content, i)}
                        className={`mt-1.5 flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
                          speakingIndex === i
                            ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                        data-testid={`button-speak-${i}`}
                        aria-label={speakingIndex === i ? "Stop listening" : "Listen to this explanation"}
                        aria-pressed={speakingIndex === i}
                      >
                        {speakingIndex === i ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            {speakingIndex !== null && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-md bg-primary/5 text-xs text-primary" aria-live="polite" role="status">
                <div className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "8px", animationDelay: "0ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "12px", animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "6px", animationDelay: "300ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "10px", animationDelay: "450ms" }} />
                </div>
                <span>Speaking explanation...</span>
                <button
                  onClick={stopSpeaking}
                  className="ml-auto text-destructive hover:underline"
                  data-testid="button-stop-speech"
                >
                  Stop
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about your preparation..."
                disabled={loading}
                data-testid="input-chat"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} data-testid="button-send">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
