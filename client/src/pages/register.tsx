import { useState } from "react";
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

export default function Register() {
  const { register: doRegister } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: provinces } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });
  const { data: colleges } = useQuery<College[]>({ queryKey: ["/api/colleges"] });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", fatherName: "", email: "", country: "Pakistan", selectedProvinceId: undefined, selectedCollegeId: undefined, mobile: "+92", password: "" },
  });

  const selectedProvinceId = form.watch("selectedProvinceId");
  const filteredColleges = colleges?.filter(c => !selectedProvinceId || c.provinceId === selectedProvinceId) ?? [];

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    try {
      const result = await doRegister(values);
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-country">
                          <Globe className="w-4 h-4 mr-1 text-muted-foreground" />
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pakistan">Pakistan</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Qatar">Qatar</SelectItem>
                        <SelectItem value="Bahrain">Bahrain</SelectItem>
                        <SelectItem value="Kuwait">Kuwait</SelectItem>
                        <SelectItem value="Oman">Oman</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selectedProvinceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Province</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(parseInt(v)); form.setValue("selectedCollegeId", undefined); }} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-province">
                          <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                          <SelectValue placeholder="Choose your province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces?.map(p => (
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
              <FormField
                control={form.control}
                name="selectedCollegeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Cadet College</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-college">
                          <GraduationCap className="w-4 h-4 mr-1 text-muted-foreground" />
                          <SelectValue placeholder={selectedProvinceId ? "Choose a cadet college" : "Select province first"} />
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
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} placeholder="+923001234567" className="pl-10" data-testid="input-mobile" />
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
