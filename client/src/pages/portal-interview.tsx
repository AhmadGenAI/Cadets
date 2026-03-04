import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { MessageSquare, Star, AlertCircle, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const tips = [
  { title: "Introduce Yourself", content: "Practice a clear, confident 2-minute self-introduction. Include your name, school, hobbies, and why you want to join a cadet college.", icon: MessageSquare },
  { title: "General Knowledge", content: "Stay updated with current affairs, Pakistan's geography, history, and important dates. Read newspapers daily.", icon: Star },
  { title: "Confidence & Body Language", content: "Maintain eye contact, sit straight, speak clearly. Don't rush your answers. It's okay to say 'I don't know' politely.", icon: ThumbsUp },
  { title: "Common Questions", content: "Why do you want to join? What are your hobbies? Who is your role model? Tell about your family. What is discipline?", icon: AlertCircle },
];

const sampleQuestions = [
  "Tell us about yourself and your family.",
  "Why do you want to join this cadet college?",
  "What is the capital of Pakistan? Name all provinces.",
  "Who is the current Prime Minister / Army Chief?",
  "What is discipline and why is it important?",
  "What are your hobbies and interests?",
  "What is your favorite subject and why?",
  "If selected, what will you miss most from home?",
  "Name 5 important rivers/mountains of Pakistan.",
  "What do you want to become when you grow up?",
];

export default function PortalInterview() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) { setLocation("/login"); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeUp} className="text-2xl font-bold mb-2" data-testid="text-interview-title">
              Interview Preparation
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-8">
              Tips and practice questions to ace your cadet college interview.
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {tips.map(tip => (
                <motion.div key={tip.title} variants={fadeUp}>
                  <Card className="p-5 h-full" data-testid={`card-tip-${tip.title.replace(/\s/g, '-').toLowerCase()}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <tip.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.content}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-xl font-bold mb-4">Sample Interview Questions</motion.h2>
            <motion.div variants={stagger} className="space-y-3">
              {sampleQuestions.map((q, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="p-4 flex items-start gap-3" data-testid={`card-question-${i}`}>
                    <Badge variant="secondary" className="shrink-0 mt-0.5">{i + 1}</Badge>
                    <p className="text-sm">{q}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
