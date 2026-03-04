import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const SUBJECTS = ["Mathematics", "English", "General Science", "General Knowledge", "Urdu"];

export default function PortalPdf() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [subject, setSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [pdfCount, setPdfCount] = useState(0);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) { setLocation("/login"); return null; }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: subject || undefined,
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
      a.download = `mcq-paper-${subject || "mixed"}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenerated(true);
      setPdfCount(c => c + 1);
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
              Generate MCQ practice papers for your preparation.
            </p>

            <Card className="p-6">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileDown className="w-8 h-8 text-primary" />
                </div>

                {!generated ? (
                  <>
                    <div className="w-full max-w-sm space-y-4">
                      <div>
                        <Label className="mb-2 block">Select Subject</Label>
                        <Select onValueChange={setSubject} value={subject}>
                          <SelectTrigger data-testid="select-pdf-subject">
                            <SelectValue placeholder="All subjects (mixed)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects (Mixed)</SelectItem>
                            {SUBJECTS.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                        <p>We can generate a PDF practice paper for you here. Each paper contains 5 unique MCQs with answer key.</p>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleGenerate}
                        disabled={loading}
                        data-testid="button-generate-pdf"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <FileDown className="w-4 h-4 mr-2" />
                        )}
                        {loading ? "Generating PDF..." : "Generate & Download PDF"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-lg font-semibold mb-1" data-testid="text-pdf-success">PDF Downloaded!</h2>
                      <p className="text-sm text-muted-foreground">
                        {pdfCount > 1
                          ? `You have generated ${pdfCount} papers so far.`
                          : "Your practice paper has been downloaded."}
                      </p>
                    </div>

                    <div className="w-full max-w-sm space-y-3">
                      <p className="text-center text-sm font-medium" data-testid="text-want-more">
                        Do you want another PDF?
                      </p>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={handleGenerate}
                          disabled={loading}
                          data-testid="button-yes-more"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          {loading ? "Generating..." : "Yes, Generate More"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => { setGenerated(false); setSubject(""); }}
                          disabled={loading}
                          data-testid="button-no-done"
                        >
                          No, I'm Done
                        </Button>
                      </div>

                      <div className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => { setGenerated(false); }}
                          className="text-xs"
                          data-testid="button-change-subject"
                        >
                          Change Subject
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
