import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { SeoHead } from "@/components/seo-head";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, Clock, ChevronRight, CheckCircle, XCircle, ArrowLeft, RotateCcw, GraduationCap, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { AssessmentQuestion } from "@shared/schema";

const SUBJECTS = [
  { key: "intelligence", label: "Intelligence Test", desc: "Verbal & non-verbal reasoning", icon: "🧠", time: 600, count: 25 },
  { key: "english", label: "English", desc: "Grammar, vocabulary, comprehension", icon: "📝", time: 600, count: 25 },
  { key: "science", label: "General Science", desc: "Physics, chemistry, biology basics", icon: "🔬", time: 600, count: 25 },
  { key: "math", label: "Mathematics", desc: "Arithmetic, algebra, geometry", icon: "📐", time: 600, count: 25 },
  { key: "urdu", label: "Urdu", desc: "اردو گرامر، محاورے، مترادفات", icon: "📖", time: 600, count: 25 },
];

const PASS_PERCENT = 50;
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AssessmentAcademic() {
  const [started, setStarted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [stageResult, setStageResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const [allResults, setAllResults] = useState<{ subject: string; score: number; total: number; passed: boolean }[]>([]);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);

  const subject = SUBJECTS[currentStage];

  const loadQuestions = useCallback(async (subjectKey: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessment/academic/${subjectKey}`, { credentials: "include" });
      const data = await res.json();
      setQuestions(data);
      setCurrentQ(0);
      setAnswers({});
      setTimeLeft(SUBJECTS.find(s => s.key === subjectKey)?.time || 600);
      setStageResult(null);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (started && !stageResult && !completed && !failed && !loading && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitStage();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, stageResult, completed, failed, loading, questions.length]);

  const handleStart = async () => {
    setStarted(true);
    setCurrentStage(0);
    setAllResults([]);
    setFailed(false);
    setCompleted(false);
    await loadQuestions(SUBJECTS[0].key);
  };

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitStage = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const passed = (correct / questions.length) * 100 >= PASS_PERCENT;
    const result = { subject: subject.key, score: correct, total: questions.length, passed };
    setStageResult({ passed, score: correct, total: questions.length });
    setAllResults(prev => [...prev, result]);
    if (!passed) setFailed(true);
    if (passed && currentStage === SUBJECTS.length - 1) setCompleted(true);
  };

  const handleNextStage = async () => {
    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);
    await loadQuestions(SUBJECTS[nextStage].key);
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentStage(0);
    setQuestions([]);
    setCurrentQ(0);
    setAnswers({});
    setTimeLeft(600);
    setStageResult(null);
    setAllResults([]);
    setFailed(false);
    setCompleted(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentQ];

  if (completed) {
    const totalScore = allResults.reduce((s, r) => s + r.score, 0);
    const totalQuestions = allResults.reduce((s, r) => s + r.total, 0);
    const overallPercent = Math.round((totalScore / totalQuestions) * 100);

    const getStudyRecommendation = (score: number, total: number) => {
      const pct = (score / total) * 100;
      if (pct >= 80) return "30 minutes daily";
      if (pct >= 60) return "1 hour daily";
      return "2 hours daily";
    };

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SeoHead title="Academic Assessment Results" path="/assessment/academic" />
        <PublicHeader />
        <div className="flex-1 py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </Button>
              </Link>

              <Card className="p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" data-testid="text-congratulations">Congratulations! 🎉</h1>
                    <p className="text-sm text-muted-foreground">You passed all 5 stages of the assessment</p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-primary">{overallPercent}%</p>
                  <p className="text-muted-foreground">Overall Score ({totalScore}/{totalQuestions})</p>
                </div>
              </Card>

              <Card className="p-5 mb-4">
                <h3 className="font-bold mb-3">Subject-wise Performance</h3>
                <div className="space-y-3">
                  {allResults.map(r => {
                    const sub = SUBJECTS.find(s => s.key === r.subject);
                    const pct = Math.round((r.score / r.total) * 100);
                    return (
                      <div key={r.subject} data-testid={`result-${r.subject}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{sub?.icon} {sub?.label}</span>
                          <span className={`font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>{r.score}/{r.total} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5 mb-4">
                <h3 className="font-bold mb-3">📋 Recommended Daily Study Plan</h3>
                <div className="space-y-2">
                  {allResults.map(r => {
                    const sub = SUBJECTS.find(s => s.key === r.subject);
                    const recommendation = getStudyRecommendation(r.score, r.total);
                    return (
                      <div key={r.subject} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm font-medium">{sub?.icon} {sub?.label}</span>
                        <Badge variant="secondary">{recommendation}</Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Follow this schedule consistently for at least 3-6 months before your exam for best results. Focus more on weaker subjects while maintaining practice in stronger ones.
                </p>
              </Card>

              <Card className="p-5 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-2">Ready for Full Preparation?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enroll in our comprehensive test preparation program with AI tutoring, unlimited MCQ practice, mock tests, and personalized study schedules.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/register">
                    <Button data-testid="button-enroll">
                      <GraduationCap className="w-4 h-4 mr-1" /> Enroll Now
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" data-testid="button-view-plans">View Plans</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (failed) {
    const lastResult = allResults[allResults.length - 1];
    const failedSubject = SUBJECTS.find(s => s.key === lastResult?.subject);
    const pct = lastResult ? Math.round((lastResult.score / lastResult.total) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SeoHead title="Assessment - Try Again" path="/assessment/academic" />
        <PublicHeader />
        <div className="flex-1 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-failed">You did not pass</h2>
                <p className="text-muted-foreground mb-4">
                  You scored {lastResult?.score}/{lastResult?.total} ({pct}%) in <strong>{failedSubject?.label}</strong>. You need at least 50% to proceed.
                </p>
                {allResults.length > 1 && (
                  <div className="text-left mb-6">
                    <h4 className="font-semibold mb-2">Your progress so far:</h4>
                    {allResults.map(r => {
                      const sub = SUBJECTS.find(s => s.key === r.subject);
                      return (
                        <div key={r.subject} className="flex items-center gap-2 text-sm py-1">
                          {r.passed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                          <span>{sub?.label}: {r.score}/{r.total}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm">Please restart the test and try again</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You must pass each subject with at least 50% marks before moving to the next one. Review your {failedSubject?.label} and attempt the test again.
                  </p>
                </div>
                <Button size="lg" onClick={handleRestart} data-testid="button-restart">
                  <RotateCcw className="w-4 h-4 mr-1" /> Restart Assessment
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Academic Assessment" description="Free academic assessment to check your cadet college preparation level. Test intelligence, English, Science, Math and Urdu." path="/assessment/academic" />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {!started ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2" data-testid="text-academic-title">Academic Assessment</h1>
                <p className="text-muted-foreground mb-6">
                  This free test evaluates your preparation level across 5 subjects. You must pass each subject (50% marks) before moving to the next one.
                </p>
                <div className="text-left space-y-3 mb-6">
                  {SUBJECTS.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="text-2xl">{s.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Stage {i + 1}: {s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc} • {s.count} MCQs • {s.time / 60} minutes</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Each test has a timer. If time runs out, your answers are automatically submitted. Questions change each time you take the test.
                </p>
                <Button size="lg" onClick={handleStart} data-testid="button-start-academic">
                  Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </motion.div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : stageResult ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-stage-passed">Congratulations!</h2>
                <p className="text-muted-foreground mb-2">
                  You passed <strong>{subject.label}</strong> with {stageResult.score}/{stageResult.total} ({Math.round((stageResult.score / stageResult.total) * 100)}%)
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {currentStage < SUBJECTS.length - 1 ? `Next: ${SUBJECTS[currentStage + 1].label}` : "All tests completed!"}
                </p>
                <Button size="lg" onClick={handleNextStage} data-testid="button-next-stage">
                  Continue to {SUBJECTS[currentStage + 1]?.label || "Results"} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </motion.div>
          ) : currentQuestion ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{subject.icon} {subject.label}</Badge>
                  <Badge variant="secondary">Stage {currentStage + 1}/5</Badge>
                </div>
                <Badge variant={timeLeft < 60 ? "destructive" : "outline"} className="font-mono" data-testid="badge-timer">
                  <Clock className="w-3 h-3 mr-1" /> {formatTime(timeLeft)}
                </Badge>
              </div>
              <Progress value={((currentQ + 1) / questions.length) * 100} className="mb-4 h-2" />

              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                <Card className="p-6 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</p>
                  <p className="text-lg font-medium mb-5" data-testid="text-question">{currentQuestion.questionText}</p>
                  <div className="space-y-2">
                    {currentQuestion.optionsJson && Object.entries(currentQuestion.optionsJson as Record<string, string>).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleAnswer(currentQuestion.id, key)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          answers[currentQuestion.id] === key
                            ? "border-primary bg-primary/10 font-medium"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`option-${key}`}
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-bold mr-3">{key}</span>
                        {value}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} data-testid="button-prev-q">
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQ < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQ(currentQ + 1)} disabled={!answers[currentQuestion.id]} data-testid="button-next-q">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmitStage} data-testid="button-submit-stage">
                      Submit <CheckCircle className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                      i === currentQ
                        ? "bg-primary text-primary-foreground"
                        : answers[q.id]
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`q-nav-${i}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
