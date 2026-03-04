import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/schema";
import { SeoHead } from "@/components/seo-head";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, Lock, User, Mail, Loader2, MapPin, GraduationCap, Users, Globe } from "lucide-react";
import type { College, Province } from "@shared/schema";
import type { z } from "zod";

const countryCodes: Record<string, { code: string; flag: string; sample: string }> = {
  "Pakistan": { code: "+92", flag: "🇵🇰", sample: "3001234567" },
  "India": { code: "+91", flag: "🇮🇳", sample: "9812345678" },
  "Bangladesh": { code: "+880", flag: "🇧🇩", sample: "1712345678" },
  "Turkey": { code: "+90", flag: "🇹🇷", sample: "5321234567" },
  "United Kingdom": { code: "+44", flag: "🇬🇧", sample: "7911234567" },
  "United States": { code: "+1", flag: "🇺🇸", sample: "2025551234" },
  "United Arab Emirates": { code: "+971", flag: "🇦🇪", sample: "501234567" },
  "Saudi Arabia": { code: "+966", flag: "🇸🇦", sample: "512345678" },
  "Canada": { code: "+1", flag: "🇨🇦", sample: "6135551234" },
  "Australia": { code: "+61", flag: "🇦🇺", sample: "412345678" },
  "Qatar": { code: "+974", flag: "🇶🇦", sample: "55123456" },
  "Malaysia": { code: "+60", flag: "🇲🇾", sample: "121234567" },
  "Bahrain": { code: "+973", flag: "🇧🇭", sample: "36001234" },
  "Kuwait": { code: "+965", flag: "🇰🇼", sample: "51234567" },
  "Oman": { code: "+968", flag: "🇴🇲", sample: "92123456" },
  "Germany": { code: "+49", flag: "🇩🇪", sample: "15112345678" },
  "Other": { code: "+", flag: "🌍", sample: "1234567890" },
};

const countryOrder = [
  "Pakistan", "India", "Bangladesh", "Turkey",
  "United Kingdom", "United States", "United Arab Emirates", "Saudi Arabia",
  "Canada", "Australia", "Qatar", "Malaysia",
  "Bahrain", "Kuwait", "Oman", "Germany", "Other"
];

export default function Register() {
  const { register: doRegister } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: provinces } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });
  const { data: colleges } = useQuery<College[]>({ queryKey: ["/api/colleges"] });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", fatherName: "", email: "", country: "Pakistan", selectedProvinceId: undefined, selectedCollegeId: undefined, mobile: "", password: "" },
  });

  const selectedCountry = form.watch("country");
  const selectedProvinceId = form.watch("selectedProvinceId");

  const availableCountries = useMemo(() => {
    const dbCountries = new Set(provinces?.map(p => p.country) ?? []);
    const ordered = countryOrder.filter(c => c === "Other" || dbCountries.has(c));
    dbCountries.forEach(c => { if (!ordered.includes(c)) ordered.splice(ordered.length - 1, 0, c); });
    if (!ordered.includes("Other")) ordered.push("Other");
    return ordered;
  }, [provinces]);

  const filteredProvinces = useMemo(() => {
    return provinces?.filter(p => p.country === selectedCountry) ?? [];
  }, [provinces, selectedCountry]);

  const filteredColleges = useMemo(() => {
    return colleges?.filter(c => !selectedProvinceId || c.provinceId === selectedProvinceId) ?? [];
  }, [colleges, selectedProvinceId]);

  const hasProvinces = filteredProvinces.length > 0;
  const hasColleges = filteredColleges.length > 0;

  const dialInfo = countryCodes[selectedCountry] || countryCodes["Other"];

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    try {
      const dial = countryCodes[values.country]?.code || "+";
      let cleanNum = values.mobile.replace(/[\s\-()]/g, "");
      if (!cleanNum.startsWith("+") && cleanNum.startsWith("0")) {
        cleanNum = cleanNum.substring(1);
      }
      const fullMobile = cleanNum.startsWith("+") ? cleanNum : dial + cleanNum;
      const result = await doRegister({ ...values, mobile: fullMobile });
      toast({
        title: "Registration completed successfully",
        description: `Free trial: ${result.trialDays} days. Duration extend karne ke liye WhatsApp +923348480890`,
      });
      setLocation("/portal");
    } catch (e: any) {
      toast({ title: "Registration Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Register" description="Create your cadet college test preparation account. Start your free trial today." path="/register" />
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start your cadet college preparation</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} placeholder="Student's first name" className="pl-10" data-testid="input-name" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} placeholder="Father's name" className="pl-10" data-testid="input-father-name" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" data-testid="input-email" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("selectedProvinceId", undefined);
                        form.setValue("selectedCollegeId", undefined);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-country">
                          <Globe className="w-4 h-4 mr-1 text-muted-foreground" />
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCountries.map(c => (
                          <SelectItem key={c} value={c}>
                            {countryCodes[c]?.flag || "🌍"} {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {hasProvinces && (
                <FormField
                  control={form.control}
                  name="selectedProvinceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedCountry === "Pakistan" ? "Province / Region" :
                         selectedCountry === "United States" || selectedCountry === "Australia" ? "State" :
                         selectedCountry === "Canada" ? "Province" :
                         selectedCountry === "India" ? "State" :
                         selectedCountry === "Bangladesh" ? "Division" :
                         selectedCountry === "United Kingdom" ? "Region" :
                         selectedCountry === "Malaysia" ? "State" :
                         "Province / State"}
                      </FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(parseInt(v));
                          form.setValue("selectedCollegeId", undefined);
                        }}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-province">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            <SelectValue placeholder="Choose province / state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredProvinces.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {hasColleges && selectedProvinceId && (
                <FormField
                  control={form.control}
                  name="selectedCollegeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Cadet College / Military School</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-college">
                            <GraduationCap className="w-4 h-4 mr-1 text-muted-foreground" />
                            <SelectValue placeholder="Choose an institution" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredColleges.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-3 rounded-md border bg-muted text-sm shrink-0 min-w-[90px]">
                          <span>{dialInfo.flag}</span>
                          <span className="text-muted-foreground">{dialInfo.code}</span>
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} placeholder={`e.g. ${dialInfo.sample}`} className="pl-10" data-testid="input-mobile" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="password" placeholder="Min. 6 characters" className="pl-10" data-testid="input-password" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit-register">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium" data-testid="link-login">
              Login here
            </Link>
          </p>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
