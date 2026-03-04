import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Heart, Eye, Ruler, Activity, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const categories = [
  {
    title: "Physical Fitness",
    icon: Activity,
    items: [
      "Start daily jogging (at least 1-2 km) 3 months before the test",
      "Practice push-ups, sit-ups, and squats regularly",
      "Maintain good posture - stand and sit straight",
      "Get 7-8 hours of sleep every night",
    ]
  },
  {
    title: "Eye Care",
    icon: Eye,
    items: [
      "Get your eyesight checked well before the medical exam",
      "Reduce screen time - take breaks every 30 minutes",
      "Eat foods rich in Vitamin A (carrots, eggs, green vegetables)",
      "If you wear glasses, inform during registration",
    ]
  },
  {
    title: "Height & Weight",
    icon: Ruler,
    items: [
      "Minimum height requirements vary by age group",
      "Maintain healthy weight - neither too thin nor overweight",
      "Drink plenty of milk and eat protein-rich food",
      "Practice hanging exercises to improve posture",
    ]
  },
  {
    title: "General Health",
    icon: Heart,
    items: [
      "Get a complete dental checkup - fix any cavities",
      "Check for flat feet - practice arch exercises",
      "No chronic skin conditions should be present",
      "Ensure all vaccinations are up to date",
      "Keep ears clean - no infections or hearing issues",
    ]
  },
];

export default function PortalMedical() {
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
            <motion.h1 variants={fadeUp} className="text-2xl font-bold mb-2" data-testid="text-medical-title">
              Medical Exam Tips
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-8">
              Prepare for the physical and medical examination with these guidelines.
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {categories.map(cat => (
                <motion.div key={cat.title} variants={fadeUp}>
                  <Card className="p-5 h-full" data-testid={`card-medical-${cat.title.replace(/\s/g, '-').toLowerCase()}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <cat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{cat.title}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
