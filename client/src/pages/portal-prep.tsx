import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { apiRequest } from "@/lib/queryClient";
import { Send, Bot, User, Loader2, MessageCircle, Volume2, VolumeX, CheckCircle2, XCircle, BookOpen, RefreshCw, ArrowRight, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import type { McqQuestion } from "@shared/schema";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "mcq" | "subject-select" | "result" | "subject-switch";
  mcq?: McqQuestion;
  options?: Record<string, string>;
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SUBJECTS = ["Mathematics", "English", "General Science", "Urdu", "General Knowledge"];

export default function PortalPrep() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const utteranceIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [currentSubject, setCurrentSubject] = useState<string>("");
  const [mcqCount, setMcqCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<number>>(new Set());
  const [currentMcq, setCurrentMcq] = useState<McqQuestion | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [waitingForSubject, setWaitingForSubject] = useState(true);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [askingToSwitch, setAskingToSwitch] = useState(false);

  const level = user?.level || "middle";
  const { data: allMcqs } = useQuery<McqQuestion[]>({
    queryKey: ["/api/mcqs", level],
    enabled: !!user,
  });

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
        content: "Assalamo Alaikum! I am your online tutor. Which subject do you want to study first?",
        type: "subject-select"
      }]);
    }
  }, [user, isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, answered, showExplanation]);

  useEffect(() => {
    return () => { if (speechSupported) window.speechSynthesis.cancel(); };
  }, [speechSupported]);

  const speakText = useCallback((text: string) => {
    if (!speechSupported || !voiceEnabled) return;
    utteranceIdRef.current++;
    const currentId = utteranceIdRef.current;
    window.speechSynthesis.cancel();
    let cleaned = text.replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF\u2700-\u27BF\uFE00-\uFE0F\u200D\u20E3]/g, "");
    cleaned = cleaned.replace(/[*_~`#]/g, "").replace(/\n+/g, ". ").replace(/\.{2,}/g, ".").replace(/\s{2,}/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith("en-US"))
      || voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onstart = () => { if (utteranceIdRef.current === currentId) setSpeakingIndex(-1); };
    utterance.onend = () => { if (utteranceIdRef.current === currentId) setSpeakingIndex(null); };
    utterance.onerror = () => { if (utteranceIdRef.current === currentId) setSpeakingIndex(null); };
    window.speechSynthesis.speak(utterance);
  }, [speechSupported, voiceEnabled, voices]);

  const stopSpeaking = useCallback(() => {
    utteranceIdRef.current++;
    if (speechSupported) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  }, [speechSupported]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const getSubjectMcqs = (subject: string): McqQuestion[] => {
    if (!allMcqs) return [];
    const subjectLower = subject.toLowerCase();
    return allMcqs.filter(m => {
      const s = m.subject.toLowerCase();
      if (subjectLower.includes("math")) return s.includes("math");
      if (subjectLower.includes("english")) return s.includes("english");
      if (subjectLower.includes("science")) return s.includes("science");
      if (subjectLower.includes("urdu")) return s.includes("urdu");
      if (subjectLower.includes("knowledge") || subjectLower.includes("gk")) return s.includes("knowledge") || s.includes("intelligence");
      return s.includes(subjectLower);
    });
  };

  const getNextMcq = (subject: string): McqQuestion | null => {
    const pool = getSubjectMcqs(subject).filter(m => !usedQuestionIds.has(m.id));
    if (pool.length === 0) {
      setUsedQuestionIds(new Set());
      const fullPool = getSubjectMcqs(subject);
      if (fullPool.length === 0) return null;
      return fullPool[Math.floor(Math.random() * fullPool.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const sendNextMcq = (subject: string, count: number) => {
    const mcq = getNextMcq(subject);
    if (!mcq) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `No more questions available for ${subject} right now. Would you like to try another subject?`,
        type: "subject-select"
      }]);
      setWaitingForSubject(true);
      setWaitingForAnswer(false);
      return;
    }
    setUsedQuestionIds(prev => { const next = new Set(Array.from(prev)); next.add(mcq.id); return next; });
    setCurrentMcq(mcq);
    setAnswered(false);
    setSelectedOption(null);
    setShowExplanation(false);
    setWaitingForAnswer(true);
    const opts = mcq.optionsJson as Record<string, string>;
    let text = `Question ${count + 1}:\n${mcq.questionText}`;
    setMessages(prev => [...prev, {
      role: "assistant",
      content: text,
      type: "mcq",
      mcq,
      options: opts
    }]);
    if (voiceEnabled) {
      setTimeout(() => speakText(mcq.questionText), 300);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setCurrentSubject(subject);
    setMcqCount(0);
    setCorrectCount(0);
    setWaitingForSubject(false);
    setAskingToSwitch(false);
    setMessages(prev => [
      ...prev,
      { role: "user", content: subject },
      { role: "assistant", content: `Great choice! Let's start with ${subject}. Here's your first question:`, type: "text" }
    ]);
    setTimeout(() => sendNextMcq(subject, 0), 500);
  };

  const handleOptionSelect = (key: string) => {
    if (!currentMcq || answered) return;
    setAnswered(true);
    setSelectedOption(key);
    setWaitingForAnswer(false);
    setShowExplanation(false);
    const isCorrect = key.toLowerCase() === currentMcq.correctOption.toLowerCase();
    const newCount = mcqCount + 1;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setMcqCount(newCount);
    if (isCorrect) setCorrectCount(newCorrect);
  };

  const handleNextQuestion = () => {
    const newCount = mcqCount;
    if (newCount > 0 && newCount % 50 === 0) {
      setAskingToSwitch(true);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `You've completed ${newCount} questions in ${currentSubject}! Your score: ${correctCount}/${newCount} (${Math.round(correctCount / newCount * 100)}%).\n\nWould you like to continue with ${currentSubject} or switch to another subject?`,
        type: "subject-switch"
      }]);
    } else {
      sendNextMcq(currentSubject, newCount);
    }
  };

  const handleContinueSubject = () => {
    setAskingToSwitch(false);
    setMessages(prev => [...prev, {
      role: "user", content: `Continue with ${currentSubject}`
    }]);
    setTimeout(() => sendNextMcq(currentSubject, mcqCount), 500);
  };

  const handleSwitchSubject = () => {
    setAskingToSwitch(false);
    setWaitingForSubject(true);
    setWaitingForAnswer(false);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Which subject would you like to study next?",
      type: "subject-select"
    }]);
  };

  const handleTextMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim().toLowerCase();
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: input.trim() }]);

    if (askingToSwitch) {
      if (userMsg.includes("continue") || userMsg.includes("same") || userMsg.includes("yes") || userMsg.includes("jari")) {
        handleContinueSubject();
        return;
      } else if (userMsg.includes("switch") || userMsg.includes("change") || userMsg.includes("no") || userMsg.includes("nahi") || userMsg.includes("other")) {
        handleSwitchSubject();
        return;
      }
    }

    if (waitingForSubject) {
      const matched = SUBJECTS.find(s => userMsg.includes(s.toLowerCase()) ||
        (userMsg.includes("math") && s.includes("Math")) ||
        (userMsg.includes("gk") && s.includes("Knowledge")) ||
        (userMsg.includes("science") && s.includes("Science"))
      );
      if (matched) {
        handleSubjectSelect(matched);
        return;
      }
    }

    if (userMsg.includes("explain") || userMsg.includes("samjha") || userMsg.includes("why") || userMsg.includes("how")) {
      setLoading(true);
      try {
        const res = await apiRequest("POST", "/api/tutor/chat", {
          message: input.trim(),
          level: user.level,
          collegeId: user.selectedCollegeId,
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
        if (voiceEnabled) speakText(data.reply);
        if (currentSubject && !waitingForSubject) {
          setTimeout(() => sendNextMcq(currentSubject, mcqCount), 3000);
        }
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, couldn't process that. Let me continue with questions.", type: "text" }]);
        if (currentSubject) setTimeout(() => sendNextMcq(currentSubject, mcqCount), 1500);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentSubject.toLowerCase().includes("urdu") &&
      (userMsg.includes("essay") || userMsg.includes("application") || userMsg.includes("letter") || userMsg.includes("story") ||
        userMsg.includes("mazmoon") || userMsg.includes("kahani") || userMsg.includes("darkhast") || userMsg.includes("khat"))) {
      setLoading(true);
      try {
        const res = await apiRequest("POST", "/api/tutor/chat", {
          message: input.trim(),
          level: user.level,
          collegeId: user.selectedCollegeId,
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request.", type: "text" }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (waitingForAnswer && currentMcq) {
      const optKey = userMsg.trim().replace(/[).\s]/g, "");
      if (["a", "b", "c", "d"].includes(optKey)) {
        handleOptionSelect(optKey);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/tutor/chat", {
        message: input.trim(),
        level: user.level,
        collegeId: user.selectedCollegeId,
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
      if (voiceEnabled) speakText(data.reply);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that right now.", type: "text" }]);
    } finally {
      setLoading(false);
    }
  };

  const getOptionStyle = (key: string): string => {
    if (!answered || !currentMcq) return "border-border bg-card hover:bg-accent/50";
    const correctKey = currentMcq.correctOption.toLowerCase();
    const selectedKey = selectedOption?.toLowerCase();
    const k = key.toLowerCase();
    if (k === correctKey) return "border-green-500 bg-green-50 dark:bg-green-950/30";
    if (k === selectedKey && k !== correctKey) return "border-red-500 bg-red-50 dark:bg-red-950/30";
    return "border-border bg-card opacity-50";
  };

  const getOptionIcon = (key: string) => {
    if (!answered || !currentMcq) return null;
    const correctKey = currentMcq.correctOption.toLowerCase();
    const selectedKey = selectedOption?.toLowerCase();
    const k = key.toLowerCase();
    if (k === correctKey) return <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />;
    if (k === selectedKey && k !== correctKey) return <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
    return null;
  };

  const renderMcqOptions = (msg: ChatMessage, idx: number) => {
    if (msg.type !== "mcq" || !msg.mcq || !msg.options) return null;
    const isCurrentMcq = idx === messages.length - 1 || (answered && msg.mcq.id === currentMcq?.id);
    if (!isCurrentMcq) return null;

    const isAnswered = answered && msg.mcq.id === currentMcq?.id;
    const correctKey = msg.mcq.correctOption.toLowerCase();
    const isCorrect = selectedOption?.toLowerCase() === correctKey;

    return (
      <div className="w-full mt-2">
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(msg.options).map(([key, val]) => (
            <button
              key={key}
              className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left flex items-center gap-3 transition-all text-sm sm:text-base ${getOptionStyle(key)} ${!isAnswered ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}`}
              onClick={() => !isAnswered && handleOptionSelect(key)}
              disabled={isAnswered}
              data-testid={`button-option-${key}`}
            >
              <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
                isAnswered && key.toLowerCase() === correctKey
                  ? "bg-green-500 text-white"
                  : isAnswered && key.toLowerCase() === selectedOption?.toLowerCase() && key.toLowerCase() !== correctKey
                    ? "bg-red-500 text-white"
                    : "bg-muted text-foreground"
              }`}>
                {key.toUpperCase()}
              </span>
              <span className="flex-1 leading-snug">{val}</span>
              {getOptionIcon(key)}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="mt-3 space-y-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isCorrect ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"}`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isCorrect ? "Correct!" : `Incorrect! Answer: ${correctKey.toUpperCase()}) ${msg.options[msg.mcq.correctOption]}`}
              <span className="ml-auto text-xs opacity-70">{correctCount}/{mcqCount}</span>
            </div>

            {showExplanation && msg.mcq.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{msg.mcq.explanation}</p>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2">
              {msg.mcq.explanation && !showExplanation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExplanation(true)}
                  className="gap-1.5"
                  data-testid="button-explanation"
                >
                  <Lightbulb className="w-4 h-4" /> Explanation
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={handleNextQuestion}
                className="gap-1.5 ml-auto"
                data-testid="button-next-question"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMessage = (msg: ChatMessage, idx: number) => {
    if (msg.role === "user") {
      return (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 sm:gap-3 justify-end">
          <div className="max-w-[85%] sm:max-w-[80%] flex flex-col items-end">
            <div className="rounded-lg p-3 text-sm whitespace-pre-wrap bg-primary text-primary-foreground" data-testid={`text-message-${idx}`}>
              {msg.content}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
          {msg.type === "mcq" ? (
            <>
              <div className="w-full rounded-lg p-3 text-sm whitespace-pre-wrap bg-muted" data-testid={`text-message-${idx}`}>
                {msg.content}
              </div>
              {renderMcqOptions(msg, idx)}
            </>
          ) : (
            <div className="w-full rounded-lg p-3 text-sm whitespace-pre-wrap bg-muted" data-testid={`text-message-${idx}`}>
              {msg.content}
            </div>
          )}

          {msg.type === "subject-select" && (
            <div className="flex flex-wrap gap-2 mt-1">
              {SUBJECTS.map(s => (
                <Button key={s} size="sm" variant="outline" onClick={() => handleSubjectSelect(s)} className="text-xs sm:text-sm" data-testid={`button-subject-${s.toLowerCase().replace(/\s/g, '-')}`}>
                  <BookOpen className="w-3 h-3 mr-1" /> {s}
                </Button>
              ))}
            </div>
          )}

          {msg.type === "subject-switch" && (
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="default" onClick={handleContinueSubject} data-testid="button-continue">
                <RefreshCw className="w-3 h-3 mr-1" /> Continue {currentSubject}
              </Button>
              <Button size="sm" variant="outline" onClick={handleSwitchSubject} data-testid="button-switch">
                Switch Subject
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Live Chat - Online Tutor" description="Interactive MCQ tutoring with voice support for cadet college exam preparation." path="/portal/prep" />
      <PublicHeader />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate" data-testid="text-prep-title">Live Chat</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Interactive online tutor</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {currentSubject && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2" data-testid="badge-subject">
                {currentSubject} | {correctCount}/{mcqCount}
              </Badge>
            )}
            {speechSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) stopSpeaking(); }}
                className="gap-1 px-2"
                data-testid="button-voice-toggle"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-xs hidden sm:inline">{voiceEnabled ? "On" : "Off"}</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-[60vh] sm:min-h-[500px]">
          <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg, i) => renderMessage(msg, i))}
              {loading && (
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-3 sm:p-4">
            {speakingIndex !== null && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-primary/5 text-xs text-primary" aria-live="polite" role="status">
                <div className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "8px", animationDelay: "0ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "12px", animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "6px", animationDelay: "300ms" }} />
                  <span className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: "10px", animationDelay: "450ms" }} />
                </div>
                <span>Speaking...</span>
                <button onClick={stopSpeaking} className="ml-auto text-destructive hover:underline" data-testid="button-stop-speech">
                  Stop
                </button>
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleTextMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={waitingForAnswer ? "Tap an option above..." : waitingForSubject ? "Select a subject..." : "Type a message..."}
                disabled={loading}
                className="text-sm"
                data-testid="input-chat"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} data-testid="button-send" className="shrink-0">
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
