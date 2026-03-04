import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import {
  BookOpen, Brain, ClipboardList, Stethoscope, UserCircle,
  GraduationCap, Calendar, LogOut, Shield
} from "lucide-react";
import type { College } from "@shared/schema";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const welcomeMessages = [
  "Ready to conquer today's lessons?",
  "Your preparation continues!",
  "Let's make today count!",
  "One step closer to your dream!",
  "Focus, determination, success!",
  "Great things await you today!",
  "Every question brings you closer!",
  "Champions prepare daily!",
];

const dashboardItems = [
  { title: "Start Preparation", desc: "AI-powered smart tutoring session", icon: Brain, href: "/portal/prep", color: "text-primary" },
  { title: "MCQs & Quizzes", desc: "Practice questions by topic", icon: ClipboardList, href: "/portal/quizzes", color: "text-blue-500 dark:text-blue-400" },
  { title: "Interview Prep", desc: "Tips and mock questions", icon: BookOpen, href: "/portal/interview", color: "text-orange-500 dark:text-orange-400" },
  { title: "Medical Tips", desc: "Physical & medical exam guide", icon: Stethoscope, href: "/portal/medical", color: "text-red-500 dark:text-red-400" },
  { title: "My Profile", desc: "Manage your account", icon: UserCircle, href: "/portal/profile", color: "text-purple-500 dark:text-purple-400" },
];

export default function Portal() {
  const { user, logout, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: colleges } = useQuery<College[]>({ queryKey: ["/api/colleges"] });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const selectedCollege = colleges?.find(c => c.id === user.selectedCollegeId);
  const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  const getStatusBadge = () => {
    if (!user.packageExpiryDate && !user.trialEndDate) {
      return <Badge variant="secondary">Trial</Badge>;
    }
    const endDate = user.packageExpiryDate || user.trialEndDate;
    if (endDate && new Date(endDate) >= new Date()) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="destructive">Expired</Badge>;
  };

  const daysLeft = () => {
    const endDate = user.packageExpiryDate || user.trialEndDate;
    if (!endDate) return 0;
    const diff = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-welcome">
                  {user.name ? `Assalam-o-Alaikum, ${user.name}!` : "Assalam-o-Alaikum!"}
                </h1>
                <p className="text-muted-foreground mt-1">{welcomeMsg}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-5 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold" data-testid="text-college">
                        {selectedCollege?.name ?? "No college selected"}
                      </p>
                      {selectedCollege?.lastApplyDate && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last date: {new Date(selectedCollege.lastApplyDate).toLocaleDateString("en-PK")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-muted-foreground" data-testid="text-days-left">{daysLeft()} days remaining</p>
                    <Progress value={Math.min(100, (daysLeft() / 30) * 100)} className="w-32 h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {dashboardItems.map((item) => (
                <motion.div key={item.title} variants={fadeUp}>
                  <Link href={item.href}>
                    <Card
                      className="p-5 cursor-pointer hover-elevate transition-all h-full"
                      data-testid={`card-${item.title.replace(/\s/g, '-').toLowerCase()}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-md bg-card flex items-center justify-center border shrink-0">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
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
