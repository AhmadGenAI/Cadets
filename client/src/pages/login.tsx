import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { SeoHead } from "@/components/seo-head";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, Lock, Loader2 } from "lucide-react";
import type { z } from "zod";

const countryCodes = [
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
];

const welcomeMessages = [
  "Welcome back, future cadet!",
  "Great to see you again!",
  "Ready for today's preparation?",
  "Your journey continues today!",
  "Welcome aboard, warrior!",
  "Time to sharpen your skills!",
  "The future belongs to you!",
  "Let's achieve greatness today!",
];

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCodeKey, setSelectedCodeKey] = useState("+92__Pakistan");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    try {
      const dialCode = selectedCodeKey.split("__")[0];
      let cleanNum = values.mobile.replace(/[\s\-()]/g, "");
      if (!cleanNum.startsWith("+") && cleanNum.startsWith("0")) {
        cleanNum = cleanNum.substring(1);
      }
      const fullMobile = cleanNum.startsWith("+") ? cleanNum : dialCode + cleanNum;
      await login(fullMobile, values.password);
      const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      toast({ title: msg, description: "Let's start your preparation!" });
      setLocation("/portal");
    } catch (e: any) {
      toast({ title: "Login Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Login" description="Login to your cadet college test preparation account." path="/login" />
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-md bg-primary flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Login to continue your preparation</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Select value={selectedCodeKey} onValueChange={setSelectedCodeKey}>
                          <SelectTrigger className="w-[130px] shrink-0" data-testid="select-country-code">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((c, i) => (
                              <SelectItem key={`${c.code}-${c.country}-${i}`} value={`${c.code}__${c.country}`}>
                                {c.flag} {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} placeholder="3001234567" className="pl-10" data-testid="input-mobile" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="password" placeholder="Enter password" className="pl-10" data-testid="input-password" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit-login">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Login
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium" data-testid="link-register">
              Register here
            </Link>
          </p>
        </Card>
      </div>
      <PublicFooter />
    </div>
  );
}
