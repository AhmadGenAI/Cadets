import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowLeft, MapPin, Calendar, GraduationCap } from "lucide-react";
import type { Province, College } from "@shared/schema";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function ProvincesDetail() {
  const [, params] = useRoute("/provinces/:id");
  const id = params?.id ? parseInt(params.id) : null;

  const { data: provinces } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });
  const { data: colleges, isLoading } = useQuery<College[]>({ queryKey: ["/api/colleges"] });

  const province = provinces?.find(p => p.id === id);
  const provinceColleges = colleges?.filter(c => c.provinceId === id) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>

          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-province-title">
              {province?.name ?? "Province"} - Cadet Colleges
            </h1>
            <p className="text-muted-foreground mb-8">
              {provinceColleges.length} cadet college{provinceColleges.length !== 1 ? "s" : ""} found
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-md" />)}
            </div>
          ) : provinceColleges.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No colleges found in this province yet.</p>
            </Card>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {provinceColleges.map(college => (
                <motion.div key={college.id} variants={fadeUp}>
                  <Card className="p-5 flex flex-col gap-3 h-full" data-testid={`card-college-${college.id}`}>
                    <h3 className="font-semibold">{college.name}</h3>
                    {college.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {college.city}
                      </p>
                    )}
                    {college.lastApplyDate && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Last date: {new Date(college.lastApplyDate).toLocaleDateString("en-PK")}
                      </p>
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
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
