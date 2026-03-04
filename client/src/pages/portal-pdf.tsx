import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2, CheckCircle } from "lucide-react";
import type { McqQuestion } from "@shared/schema";
import { motion } from "framer-motion";
import watermarkImg from "@assets/Shaheen_Forces_Academy_1772625469029.jpg";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PortalPdf() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [subject, setSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const level = user?.level || "middle";
  const { data: mcqs } = useQuery<McqQuestion[]>({
    queryKey: [`/api/mcqs/${level}`],
    enabled: !!user,
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) { setLocation("/login"); return null; }

  const subjects = [...new Set(mcqs?.map(m => m.subject) ?? [])];
  const availableCount = subject && subject !== "all"
    ? mcqs?.filter(m => m.subject === subject).length ?? 0
    : mcqs?.length ?? 0;

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: subject || undefined,
          level: user.level,
          count: 25,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shaheen-mcqs-${subject || "all"}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenerated(true);
      toast({ title: "PDF Generated", description: "Your MCQ paper has been downloaded." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="PDF Paper Generator" description="Generate practice test papers in PDF format for cadet college preparation." path="/portal/pdf" />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-pdf-title">PDF Generator</h1>
            <p className="text-muted-foreground mb-8">
              Generate a practice paper with 25 MCQs, complete with watermark and answer key.
            </p>

            <Card className="p-6">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                  <img
                    src={watermarkImg}
                    alt="Cadet Colleges Test Preparation Portal"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center">
                  <h2 className="text-lg font-semibold">MCQ Practice Paper</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a subject to generate a PDF with questions, options, and answer key.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                  <div>
                    <Label className="mb-2 block">Subject</Label>
                    <Select onValueChange={setSubject} value={subject}>
                      <SelectTrigger data-testid="select-pdf-subject">
                        <SelectValue placeholder="All subjects (mixed)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects (Mixed)</SelectItem>
                        {subjects.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted rounded-md p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Available questions:</span>
                      <span className="font-medium" data-testid="text-available-count">{availableCount}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted-foreground">Questions in PDF:</span>
                      <span className="font-medium">Up to 25</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium capitalize">{level}</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      PDF includes Shaheen Forces Academy watermark
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      Answer key included at the end
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      Footer: www.pakshaheens.com + WhatsApp contact
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={loading || availableCount === 0}
                    data-testid="button-generate-pdf"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : generated ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <FileDown className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Generating..." : generated ? "Download Again" : "Generate & Download PDF"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
