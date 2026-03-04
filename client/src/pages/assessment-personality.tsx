import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { SeoHead } from "@/components/seo-head";
import { Brain, ChevronRight, ChevronLeft, ArrowLeft, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { AssessmentQuestion } from "@shared/schema";

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Disagree", color: "bg-red-500" },
  { value: 2, label: "Disagree", color: "bg-orange-400" },
  { value: 3, label: "Neutral", color: "bg-yellow-400" },
  { value: 4, label: "Agree", color: "bg-lime-400" },
  { value: 5, label: "Strongly Agree", color: "bg-green-500" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AssessmentPersonality() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const { data: questions, isLoading } = useQuery<AssessmentQuestion[]>({
    queryKey: ["/api/assessment/personality"],
    enabled: started,
  });

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleFinish = () => {
    setFinished(true);
  };

  const getTraitScores = () => {
    if (!questions) return {};
    const traitMap: Record<string, { total: number; count: number }> = {};
    questions.forEach(q => {
      const trait = q.trait || "Unknown";
      if (!traitMap[trait]) traitMap[trait] = { total: 0, count: 0 };
      traitMap[trait].count++;
      traitMap[trait].total += answers[q.id] || 3;
    });
    const scores: Record<string, number> = {};
    for (const [trait, { total, count }] of Object.entries(traitMap)) {
      scores[trait] = Math.round((total / (count * 5)) * 100);
    }
    return scores;
  };

  const allAnswered = questions ? questions.every(q => answers[q.id] !== undefined) : false;
  const currentQuestion = questions?.[currentIndex];
  const progress = questions ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (finished) {
    const scores = getTraitScores();
    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    const weakAreas = sorted.filter(([, score]) => score < 60);
    const strongAreas = sorted.filter(([, score]) => score >= 75);
    const averageAreas = sorted.filter(([, score]) => score >= 60 && score < 75);

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SeoHead title="Personality Assessment Results" path="/assessment/personality" />
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
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" data-testid="text-result-title">Your Personality Assessment</h1>
                    <p className="text-sm text-muted-foreground">Based on your responses</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sorted.map(([trait, score]) => (
                    <div key={trait} data-testid={`trait-score-${trait.replace(/\s/g, '-').toLowerCase()}`}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{trait}</span>
                        <span className={`font-bold ${score >= 75 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{score}%</span>
                      </div>
                      <Progress value={score} className="h-2.5" />
                    </div>
                  ))}
                </div>
              </Card>

              {weakAreas.length > 0 && (
                <Card className="p-5 mb-4 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-700 dark:text-red-400">Areas Needing Improvement</h3>
                  </div>
                  <ul className="space-y-2">
                    {weakAreas.map(([trait, score]) => (
                      <li key={trait} className="text-sm">
                        <span className="font-medium">{trait}</span> ({score}%) — You should actively work on developing this quality. Practice exercises and real-life situations can help strengthen this trait.
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {averageAreas.length > 0 && (
                <Card className="p-5 mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-yellow-700 dark:text-yellow-400">Average — Room for Growth</h3>
                  </div>
                  <ul className="space-y-1">
                    {averageAreas.map(([trait, score]) => (
                      <li key={trait} className="text-sm">
                        <span className="font-medium">{trait}</span> ({score}%) — Good foundation, but keep working to strengthen this trait.
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {strongAreas.length > 0 && (
                <Card className="p-5 mb-4 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-700 dark:text-green-400">Strong Areas</h3>
                  </div>
                  <ul className="space-y-1">
                    {strongAreas.map(([trait, score]) => (
                      <li key={trait} className="text-sm">
                        <span className="font-medium">{trait}</span> ({score}%) — Excellent! You show strong qualities in this area.
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="p-5 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-2">What's Next?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Now that you know your personality strengths and areas for improvement, take the Academic Assessment to check your subject knowledge and overall preparation level.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/assessment/academic">
                    <Button data-testid="button-academic-assessment">Take Academic Assessment <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" data-testid="button-register-now">Enroll for Full Preparation</Button>
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Personality Assessment" description="Free personality assessment for cadet college aspirants. Evaluate your strengths across 14 key personality traits." path="/assessment/personality" />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {!started ? (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2" data-testid="text-personality-title">Personality Assessment</h1>
                <p className="text-muted-foreground mb-4">
                  This free assessment evaluates your personality across 14 key traits that cadet colleges look for in candidates. You'll rate statements on a 5-point scale from "Strongly Disagree" to "Strongly Agree."
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {["Self Confidence", "Courage", "Integrity", "Leadership", "Discipline"].map(t => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                  <Badge variant="outline">+9 more traits</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  There are approximately 56 questions. Answer honestly for the most accurate results.
                </p>
                <Button size="lg" onClick={() => setStarted(true)} data-testid="button-start-personality">
                  Start Assessment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </motion.div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : currentQuestion ? (
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" data-testid="badge-progress">
                  Question {currentIndex + 1} of {questions?.length}
                </Badge>
                <Badge variant="secondary">{currentQuestion.trait}</Badge>
              </div>
              <Progress value={progress} className="mb-6 h-2" />

              <Card className="p-6">
                <p className="text-lg font-medium mb-6" data-testid="text-current-question">{currentQuestion.questionText}</p>
                <div className="space-y-3">
                  {LIKERT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        answers[currentQuestion.id] === opt.value
                          ? "border-primary bg-primary/10 font-medium"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`likert-${opt.value}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${opt.color} flex items-center justify-center text-white text-sm font-bold`}>
                          {opt.value}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} data-testid="button-prev">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                {currentIndex === (questions?.length || 0) - 1 ? (
                  <Button onClick={handleFinish} disabled={!allAnswered} data-testid="button-finish">
                    View Results <CheckCircle className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!answers[currentQuestion.id]} data-testid="button-next">
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
