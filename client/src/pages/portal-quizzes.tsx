import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen, Loader2 } from "lucide-react";
import type { McqQuestion } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PortalQuizzes() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) { setLocation("/login"); return null; }

  const { data: mcqs, isLoading } = useQuery<McqQuestion[]>({
    queryKey: ["/api/mcqs", user.level || "middle"],
    enabled: !!user.level,
  });

  const subjects = [...new Set(mcqs?.map(m => m.subject) ?? [])];
  const filteredMcqs = selectedSubject ? mcqs?.filter(m => m.subject === selectedSubject) : mcqs;
  const currentQ = filteredMcqs?.[currentIdx];
  const options = currentQ?.optionsJson as Record<string, string> | undefined;
  const isFinished = currentIdx >= (filteredMcqs?.length ?? 0);

  const handleAnswer = (key: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(key);
    if (key === currentQ?.correctOption) setScore(s => s + 1);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentIdx(i => i + 1);
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizStarted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="MCQ Practice" description="Practice multiple choice questions for cadet college entrance exams." path="/portal/quizzes" />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-2xl font-bold mb-6" data-testid="text-quiz-title">MCQs & Quizzes</h1>

            {!quizStarted ? (
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Start a Quiz</h2>
                  <p className="text-muted-foreground mt-1">Select a subject and test your knowledge</p>
                </div>
                <div className="max-w-xs mx-auto space-y-4">
                  <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    disabled={!selectedSubject || isLoading}
                    onClick={() => setQuizStarted(true)}
                    data-testid="button-start-quiz"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Start Quiz
                  </Button>
                </div>
              </Card>
            ) : isFinished ? (
              <Card className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-4xl font-bold text-primary mb-2" data-testid="text-score">
                  {score} / {filteredMcqs?.length ?? 0}
                </p>
                <p className="text-muted-foreground mb-6">
                  {score / (filteredMcqs?.length ?? 1) >= 0.7 ? "Great job! Keep it up!" : "Keep practicing, you'll improve!"}
                </p>
                <Button onClick={resetQuiz} data-testid="button-retry">
                  <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              </Card>
            ) : currentQ ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="secondary">
                    Question {currentIdx + 1} of {filteredMcqs?.length}
                  </Badge>
                  <Badge variant="default">Score: {score}</Badge>
                </div>
                <h2 className="text-lg font-semibold mb-6" data-testid="text-question">{currentQ.questionText}</h2>
                <div className="space-y-3">
                  {options && Object.entries(options).map(([key, val]) => {
                    let cls = "p-4 border rounded-md cursor-pointer transition-colors text-left w-full flex items-center gap-3";
                    if (showResult) {
                      if (key === currentQ.correctOption) cls += " border-primary bg-primary/10";
                      else if (key === selectedAnswer) cls += " border-destructive bg-destructive/10";
                      else cls += " opacity-50";
                    } else {
                      cls += " hover-elevate";
                    }
                    return (
                      <button
                        key={key}
                        className={cls}
                        onClick={() => handleAnswer(key)}
                        disabled={!!selectedAnswer}
                        data-testid={`button-option-${key}`}
                      >
                        <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                          {key.toUpperCase()}
                        </span>
                        <span className="flex-1">{val}</span>
                        {showResult && key === currentQ.correctOption && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                        {showResult && key === selectedAnswer && key !== currentQ.correctOption && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {showResult && currentQ.explanation && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <p className="text-sm"><strong>Explanation:</strong> {currentQ.explanation}</p>
                  </div>
                )}
                {showResult && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={nextQuestion} data-testid="button-next">
                      Next <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>
            ) : null}
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
