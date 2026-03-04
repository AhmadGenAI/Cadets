import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, Lock, Loader2 } from "lucide-react";
import type { z } from "zod";
import faviconImg from "@assets/pakmcqs-of-shaheen-forces-academy_1772625743394.webp";

export default function AdminLogin() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    try {
      await login(values.mobile, values.password);
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const me = await res.json();
      if (me.role !== "admin") {
        toast({ title: "Access Denied", description: "This login is for administrators only.", variant: "destructive" });
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        return;
      }
      toast({ title: "Welcome, Admin!", description: "You are now logged in to the admin panel." });
      setLocation("/admin");
    } catch (e: any) {
      toast({ title: "Login Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/20">
            <img src={faviconImg} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold" data-testid="text-admin-login-title">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorized access only</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Mobile</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input {...field} placeholder="03001234567" className="pl-10" data-testid="input-admin-mobile" />
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
                      <Input {...field} type="password" placeholder="Enter admin password" className="pl-10" data-testid="input-admin-password" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit-admin-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Admin Login
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This portal is restricted to authorized administrators.
        </p>
      </Card>
    </div>
  );
}
