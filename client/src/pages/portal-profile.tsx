import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { User, Phone, Mail, GraduationCap, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PortalProfile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) { setLocation("/login"); return null; }

  const getStatus = () => {
    const endDate = user.packageExpiryDate || user.trialEndDate;
    if (!endDate) return { label: "Trial", variant: "secondary" as const };
    if (new Date(endDate) >= new Date()) return { label: "Active", variant: "default" as const };
    return { label: "Expired", variant: "destructive" as const };
  };

  const status = getStatus();

  const fields = [
    { icon: User, label: "Name", value: user.name || "Not set" },
    { icon: Phone, label: "Mobile", value: user.mobile },
    { icon: Mail, label: "Email", value: user.email || "Not set" },
    { icon: GraduationCap, label: "Level", value: user.level ? user.level.charAt(0).toUpperCase() + user.level.slice(1) : "Not set" },
    { icon: Calendar, label: "Package Type", value: user.packageType || "Trial" },
    { icon: Calendar, label: "Expiry Date", value: user.packageExpiryDate ? new Date(user.packageExpiryDate).toLocaleDateString("en-PK") : user.trialEndDate ? new Date(user.trialEndDate).toLocaleDateString("en-PK") : "N/A" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="My Profile" path="/portal/profile" />
      <PublicHeader />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-2xl font-bold mb-6" data-testid="text-profile-title">My Profile</h1>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" data-testid="text-profile-name">{user.name || user.mobile}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <field.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      <p className="text-sm font-medium" data-testid={`text-${field.label.toLowerCase().replace(/\s/g, '-')}`}>{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 mt-4">
              <p className="text-sm text-muted-foreground">
                To extend your subscription or change your package, please contact us on WhatsApp:{" "}
                <a href="https://wa.me/923348480890" className="text-primary font-medium" data-testid="link-whatsapp-profile">
                  +923348480890
                </a>
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
