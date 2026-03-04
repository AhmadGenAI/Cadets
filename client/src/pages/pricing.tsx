import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Check, Star } from "lucide-react";
import type { Package } from "@shared/schema";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

export default function Pricing() {
  const { data: packages, isLoading } = useQuery<Package[]>({ queryKey: ["/api/packages"] });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing Plans</Badge>
            <h1 className="text-4xl font-bold mb-4">Choose Your Preparation Plan</h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Start with a free trial. Upgrade when you're ready to unlock full access.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-md" />)
              : packages?.map((pkg, idx) => {
                  const features: string[] = Array.isArray(pkg.featuresJson) ? pkg.featuresJson as string[] : [];
                  const isPopular = idx === 1;
                  return (
                    <motion.div key={pkg.id} variants={fadeUp}>
                      <Card
                        className={`p-6 flex flex-col h-full relative ${isPopular ? "border-primary border-2" : ""}`}
                        data-testid={`card-package-${pkg.id}`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="flex items-center gap-1"><Star className="w-3 h-3" /> Most Popular</Badge>
                          </div>
                        )}
                        <div className="mb-6">
                          <h3 className="text-xl font-bold">{pkg.name}</h3>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                              {pkg.price === 0 ? "Free" : `Rs ${pkg.price.toLocaleString()}`}
                            </span>
                            {pkg.price > 0 && (
                              <span className="text-muted-foreground text-sm">
                                / {pkg.durationDays} days
                              </span>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-3 flex-1">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href="/register" className="mt-6">
                          <Button
                            className="w-full"
                            variant={isPopular ? "default" : "secondary"}
                            data-testid={`button-select-${pkg.id}`}
                          >
                            {pkg.price === 0 ? "Start Free Trial" : "Get Started"}
                          </Button>
                        </Link>
                      </Card>
                    </motion.div>
                  );
                })}
          </motion.div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              Payment via JazzCash / EasyPaisa coming soon. Contact WhatsApp{" "}
              <a href="https://wa.me/923348480890" className="text-primary font-medium" data-testid="link-whatsapp-pricing">
                +923348480890
              </a>{" "}
              to activate your account.
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
