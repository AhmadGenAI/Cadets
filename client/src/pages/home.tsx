import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertBar } from "@/components/alert-bar";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { SeoHead } from "@/components/seo-head";
import { GraduationCap, MapPin, Calendar, ChevronRight, Anchor, Plane, Swords, BookOpen, Users, Award, Brain, ClipboardCheck } from "lucide-react";
import type { Province, College } from "@shared/schema";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const forceBoxes = [
  { title: "Pakistan Army", icon: Swords, image: "/images/army-box.png", color: "from-green-900/90 to-green-700/90" },
  { title: "Pakistan Navy", icon: Anchor, image: "/images/navy-box.png", color: "from-blue-900/90 to-blue-700/90" },
  { title: "Pakistan Air Force", icon: Plane, image: "/images/paf-box.png", color: "from-sky-900/90 to-sky-700/90" },
];

const stats = [
  { label: "Cadet Colleges", value: "30+", icon: GraduationCap },
  { label: "Students Prepared", value: "5,000+", icon: Users },
  { label: "Success Rate", value: "85%", icon: Award },
];

export default function Home() {
  const { data: provinces, isLoading: provincesLoading } = useQuery<Province[]>({
    queryKey: ["/api/provinces"],
  });

  const { data: colleges, isLoading: collegesLoading } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead
        title="Home"
        description="Pakistan's premier cadet college entrance exam preparation platform. AI tutoring, MCQ practice, interview and medical prep for all cadet colleges."
        path="/"
      />
      <PublicHeader />
      <AlertBar />

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-bg.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="secondary" className="mb-2 text-sm px-4 py-1">
                Pakistan's #1 Cadet College Prep Platform
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight"
            >
              Your Journey to a{" "}
              <span className="text-primary">Cadet College</span>{" "}
              Starts Here
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-white/80 max-w-2xl"
            >
              Smart AI tutoring, mock tests, interview preparation, and complete syllabus coverage for all cadet colleges across Pakistan.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mt-2">
              <Link href="/register">
                <Button size="lg" className="text-base px-8" data-testid="button-hero-register">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-base px-8 bg-white/10 backdrop-blur-sm text-white border-white/20" data-testid="button-hero-pricing">
                  View Pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="flex items-center gap-4 justify-center">
                <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold" data-testid={`text-stat-${stat.label.replace(/\s/g, '-').toLowerCase()}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Free Assessment</Badge>
          <h2 className="text-3xl font-bold mb-3">Check Your Preparation Level</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Take our free assessments to evaluate your personality traits and academic readiness for cadet college entrance exams.</p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <Card className="p-6 h-full flex flex-col" data-testid="card-personality-assessment">
              <div className="w-12 h-12 rounded-md bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Personality Assessment</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                Evaluate your personality across 14 key traits including self confidence, courage, integrity, determination, and leadership qualities that cadet colleges look for.
              </p>
              <Link href="/assessment/personality">
                <Button className="w-full" data-testid="button-personality-assessment">
                  <Brain className="w-4 h-4 mr-2" /> Start Personality Test
                </Button>
              </Link>
            </Card>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Card className="p-6 h-full flex flex-col" data-testid="card-academic-assessment">
              <div className="w-12 h-12 rounded-md bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Academic Assessment</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                Test your knowledge across Intelligence, English, General Science, Mathematics, and Urdu. Pass each subject to move forward and get personalized study recommendations.
              </p>
              <Link href="/assessment/academic">
                <Button variant="outline" className="w-full" data-testid="button-academic-assessment">
                  <ClipboardCheck className="w-4 h-4 mr-2" /> Start Academic Test
                </Button>
              </Link>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Explore by Province</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Select your province to find cadet colleges near you and start your preparation journey.</p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-4"
        >
          {provincesLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.7rem)] h-48 rounded-md" />
              ))
            : provinces?.filter(p => p.isVisible && p.country === "Pakistan")?.map((province) => (
                <motion.div key={province.id} variants={fadeUp} className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.7rem)]">
                  <Link href={`/provinces/${province.id}`}>
                    <Card
                      className="group relative overflow-hidden cursor-pointer h-48"
                      data-testid={`card-province-${province.id}`}
                    >
                      {province.imageUrl && (
                        <img
                          src={province.imageUrl}
                          alt={province.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="relative z-10 h-full flex flex-col justify-end p-4">
                        <h3 className="text-lg font-bold text-white">{province.name}</h3>
                        <p className="text-xs text-white/70">
                          {colleges?.filter(c => c.provinceId === province.id).length ?? 0} colleges
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </motion.div>
      </section>

      <section className="py-20 bg-card border-y">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Featured Cadet Colleges</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Top cadet colleges currently accepting applications.</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {collegesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-md" />
                ))
              : colleges?.filter(c => c.isFeatured).slice(0, 6).map((college) => (
                  <motion.div key={college.id} variants={fadeUp}>
                    <Card className="p-5 flex flex-col gap-3 h-full" data-testid={`card-college-${college.id}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base leading-snug">{college.name}</h3>
                          {college.city && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {college.city}
                            </p>
                          )}
                        </div>
                        {college.isFeatured && <Badge variant="default" className="shrink-0">Featured</Badge>}
                      </div>
                      {college.lastApplyDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Last date:{" "}
                            {new Date(college.lastApplyDate).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      <div className="mt-auto pt-2">
                        <Link href="/register">
                          <Button size="sm" className="w-full" data-testid={`button-enroll-${college.id}`}>
                            <GraduationCap className="w-4 h-4 mr-1" /> Enroll Now
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Armed Forces Preparation</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Prepare for Pakistan's elite military institutions.</p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {forceBoxes.map((box) => (
            <motion.div key={box.title} variants={fadeUp}>
              <Card
                className="relative overflow-hidden h-56 cursor-pointer group"
                data-testid={`card-force-${box.title.replace(/\s/g, '-').toLowerCase()}`}
              >
                <img
                  src={box.image}
                  alt={box.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${box.color}`} />
                <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
                  <box.icon className="w-10 h-10 text-white" />
                  <h3 className="text-xl font-bold text-white">{box.title}</h3>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-4">
              Ready to Start Your Preparation?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg opacity-90 mb-8">
              Join thousands of students already preparing for their cadet college entrance exams.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-base px-10" data-testid="button-cta-register">
                  <BookOpen className="w-5 h-5 mr-2" /> Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
      <ChatbotWidget />
    </div>
  );
}
