import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, MapPin, GraduationCap, Package, FileText, Settings,
  Plus, Pencil, Trash2, LogOut, LayoutDashboard, Download, Smartphone, ClipboardList, Upload, CalendarDays
} from "lucide-react";
import type { User, Province, College, Package as PkgType, Page as PageType, BlogPost, AssessmentQuestion } from "@shared/schema";

export default function Admin() {
  const { user, logout, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }
  if (!user || user.role !== "admin") {
    setLocation("/admin-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <AdminInstallButton />
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-view-site">View Site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="dashboard" data-testid="tab-dashboard"><LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
              <TabsTrigger value="provinces" data-testid="tab-provinces"><MapPin className="w-4 h-4 mr-1" /> Provinces</TabsTrigger>
              <TabsTrigger value="colleges" data-testid="tab-colleges"><GraduationCap className="w-4 h-4 mr-1" /> Colleges</TabsTrigger>
              <TabsTrigger value="packages" data-testid="tab-packages"><Package className="w-4 h-4 mr-1" /> Packages</TabsTrigger>
              <TabsTrigger value="pages" data-testid="tab-pages"><FileText className="w-4 h-4 mr-1" /> Pages</TabsTrigger>
              <TabsTrigger value="blog" data-testid="tab-blog"><FileText className="w-4 h-4 mr-1" /> Blog</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment"><ClipboardList className="w-4 h-4 mr-1" /> Assessment</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings"><Settings className="w-4 h-4 mr-1" /> Settings</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="provinces"><ProvincesTab /></TabsContent>
          <TabsContent value="colleges"><CollegesTab /></TabsContent>
          <TabsContent value="packages"><PackagesTab /></TabsContent>
          <TabsContent value="pages"><PagesTab /></TabsContent>
          <TabsContent value="blog"><BlogTab /></TabsContent>
          <TabsContent value="assessment"><AssessmentTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: colleges } = useQuery<College[]>({ queryKey: ["/api/colleges"] });
  const { data: provinces } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });

  const stats = [
    { label: "Total Users", value: users?.length ?? 0, icon: Users },
    { label: "Active Users", value: users?.filter(u => u.isActive).length ?? 0, icon: Users },
    { label: "Colleges", value: colleges?.length ?? 0, icon: GraduationCap },
    { label: "Provinces", value: provinces?.length ?? 0, icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" data-testid="text-admin-dashboard">Admin Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4" data-testid={`card-stat-${s.label.replace(/\s/g, '-').toLowerCase()}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { toast } = useToast();
  const [renewUserId, setRenewUserId] = useState<number | null>(null);
  const [renewDate, setRenewDate] = useState("");

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
  });

  const renewMutation = useMutation({
    mutationFn: async ({ id, date }: { id: number; date: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { packageExpiryDate: date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User renewed", description: `Active until ${renewDate}` });
      setRenewUserId(null);
      setRenewDate("");
    },
  });

  const exportUsers = async () => {
    window.open("/api/admin/users/export", "_blank");
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  };

  const renewUser = users?.find(u => u.id === renewUserId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Users Management</h2>
        <Button variant="secondary" size="sm" onClick={exportUsers} data-testid="button-export-users">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mobile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Expiring</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Renew</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.filter(u => u.role === "student").map(u => {
              const endDate = u.packageExpiryDate || u.trialEndDate;
              const isExpired = endDate ? new Date(endDate) < new Date() : false;
              return (
                <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                  <TableCell className="font-mono text-sm">{u.mobile}</TableCell>
                  <TableCell>{u.name || "-"}</TableCell>
                  <TableCell className="capitalize">{u.level || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground" data-testid={`text-registered-${u.id}`}>
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm" data-testid={`text-expiry-${u.id}`}>
                    {endDate ? (
                      <span className={isExpired ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {formatDate(endDate)}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isExpired ? "destructive" : "default"}>
                      {isExpired ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{u.packageType || "trial"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={u.isActive}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: u.id, isActive: checked })}
                      data-testid={`switch-active-${u.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRenewUserId(u.id);
                        const existing = u.packageExpiryDate || u.trialEndDate;
                        if (existing) {
                          const d = new Date(existing);
                          if (d < new Date()) {
                            const future = new Date();
                            future.setDate(future.getDate() + 30);
                            setRenewDate(future.toISOString().split("T")[0]);
                          } else {
                            setRenewDate(d.toISOString().split("T")[0]);
                          }
                        } else {
                          const future = new Date();
                          future.setDate(future.getDate() + 30);
                          setRenewDate(future.toISOString().split("T")[0]);
                        }
                      }}
                      data-testid={`button-renew-${u.id}`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 mr-1" /> Renew
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={renewUserId !== null} onOpenChange={(open) => { if (!open) setRenewUserId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew User Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {renewUser && (
              <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">User:</span> {renewUser.name || renewUser.mobile}</p>
                <p><span className="text-muted-foreground">Mobile:</span> {renewUser.mobile}</p>
                <p><span className="text-muted-foreground">Current Expiry:</span> {formatDate(renewUser.packageExpiryDate || renewUser.trialEndDate)}</p>
              </div>
            )}
            <div>
              <Label className="mb-2 block">Active Until (Expiry Date)</Label>
              <Input
                type="date"
                value={renewDate}
                onChange={e => setRenewDate(e.target.value)}
                data-testid="input-renew-date"
              />
            </div>
            <Button
              className="w-full"
              disabled={!renewDate || renewMutation.isPending}
              onClick={() => {
                if (renewUserId && renewDate) {
                  renewMutation.mutate({ id: renewUserId, date: renewDate });
                }
              }}
              data-testid="button-confirm-renew"
            >
              {renewMutation.isPending ? "Saving..." : "Save & Renew"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProvincesTab() {
  const { data: provinces, isLoading } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/provinces", { name, imageUrl: imageUrl || null, sortOrder: (provinces?.length ?? 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provinces"] });
      toast({ title: "Province created" });
      setOpen(false);
      setName("");
      setImageUrl("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/provinces/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provinces"] });
      toast({ title: "Province deleted" });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      await apiRequest("PATCH", `/api/admin/provinces/${id}`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provinces"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Provinces</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-province"><Plus className="w-4 h-4 mr-1" /> Add Province</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Province</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} data-testid="input-province-name" /></div>
              <div><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="/images/province.png" data-testid="input-province-image" /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending} data-testid="button-save-province">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">Toggle visibility to show or hide provinces on the landing page.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {provinces?.map(p => (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-2" data-testid={`card-admin-province-${p.id}`}>
            <div className="flex items-center gap-3">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover" />}
              <div>
                <span className="font-medium">{p.name}</span>
                <span className={`block text-xs ${p.isVisible ? "text-green-600" : "text-muted-foreground"}`}>
                  {p.isVisible ? "Visible on landing" : "Hidden"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={p.isVisible}
                onCheckedChange={(checked) => toggleVisibility.mutate({ id: p.id, isVisible: checked })}
                data-testid={`switch-visibility-province-${p.id}`}
              />
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-province-${p.id}`}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CollegesTab() {
  const { data: colleges } = useQuery<College[]>({ queryKey: ["/api/colleges"] });
  const { data: provinces } = useQuery<Province[]>({ queryKey: ["/api/provinces"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", provinceId: "", city: "", lastApplyDate: "", isFeatured: false, applyLink: "", feeStructure: "", contactNumber: "", admissionClasses: "" });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/colleges", {
        name: form.name,
        provinceId: parseInt(form.provinceId),
        city: form.city || null,
        lastApplyDate: form.lastApplyDate || null,
        isFeatured: form.isFeatured,
        applyLink: form.applyLink || null,
        feeStructure: form.feeStructure || null,
        contactNumber: form.contactNumber || null,
        admissionClasses: form.admissionClasses || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colleges"] });
      toast({ title: "College created" });
      setOpen(false);
      setForm({ name: "", provinceId: "", city: "", lastApplyDate: "", isFeatured: false, applyLink: "", feeStructure: "", contactNumber: "", admissionClasses: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/colleges/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colleges"] });
      toast({ title: "College deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Colleges</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-college"><Plus className="w-4 h-4 mr-1" /> Add College</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add College</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="input-college-name" /></div>
              <div>
                <Label>Province</Label>
                <Select value={form.provinceId} onValueChange={v => setForm(f => ({...f, provinceId: v}))}>
                  <SelectTrigger data-testid="select-college-province"><SelectValue placeholder="Select province" /></SelectTrigger>
                  <SelectContent>
                    {provinces?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} data-testid="input-college-city" /></div>
              <div><Label>Last Apply Date</Label><Input type="date" value={form.lastApplyDate} onChange={e => setForm(f => ({...f, lastApplyDate: e.target.value}))} data-testid="input-college-date" /></div>
              <div><Label>Website URL</Label><Input value={form.applyLink} onChange={e => setForm(f => ({...f, applyLink: e.target.value}))} placeholder="https://..." data-testid="input-college-link" /></div>
              <div><Label>Fee Structure</Label><Textarea value={form.feeStructure} onChange={e => setForm(f => ({...f, feeStructure: e.target.value}))} placeholder="Fee details (shown in chatbot responses)" rows={3} data-testid="input-college-fee" /></div>
              <div><Label>Contact Number</Label><Input value={form.contactNumber} onChange={e => setForm(f => ({...f, contactNumber: e.target.value}))} placeholder="e.g. 0572-520244" data-testid="input-college-contact" /></div>
              <div><Label>Admission Classes</Label><Input value={form.admissionClasses} onChange={e => setForm(f => ({...f, admissionClasses: e.target.value}))} placeholder="e.g. 8 or 6, 7, 8, 9, 11" data-testid="input-college-classes" /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={c => setForm(f => ({...f, isFeatured: c}))} data-testid="switch-featured" />
                <Label>Featured</Label>
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.provinceId || createMutation.isPending} data-testid="button-save-college">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Last Date</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges?.map(c => (
              <TableRow key={c.id} data-testid={`row-college-${c.id}`}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.city || "-"}</TableCell>
                <TableCell>{c.lastApplyDate ? new Date(c.lastApplyDate).toLocaleDateString("en-PK") : "-"}</TableCell>
                <TableCell>{c.isFeatured ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-college-${c.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function PackagesTab() {
  const { data: packages } = useQuery<PkgType[]>({ queryKey: ["/api/packages"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "0", durationDays: "3", features: "" });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/packages", {
        name: form.name,
        price: parseInt(form.price),
        durationDays: parseInt(form.durationDays),
        featuresJson: form.features.split("\n").filter(f => f.trim()),
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Package created" });
      setOpen(false);
      setForm({ name: "", price: "0", durationDays: "3", features: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/packages/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Package deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Packages</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-package"><Plus className="w-4 h-4 mr-1" /> Add Package</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Package</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="input-package-name" /></div>
              <div><Label>Price (Rs)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} data-testid="input-package-price" /></div>
              <div><Label>Duration (days)</Label><Input type="number" value={form.durationDays} onChange={e => setForm(f => ({...f, durationDays: e.target.value}))} data-testid="input-package-duration" /></div>
              <div><Label>Features (one per line)</Label><Textarea value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} placeholder="Feature 1\nFeature 2" data-testid="input-package-features" /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending} data-testid="button-save-package">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {packages?.map(p => (
          <Card key={p.id} className="p-4" data-testid={`card-admin-package-${p.id}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-1">{p.price === 0 ? "Free" : `Rs ${p.price}`}</p>
                <p className="text-sm text-muted-foreground">{p.durationDays} days</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-package-${p.id}`}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PagesTab() {
  const { data: pages } = useQuery<PageType[]>({ queryKey: ["/api/admin/pages"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "" });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/pages", { ...form, isPublished: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page created" });
      setOpen(false);
      setForm({ title: "", slug: "", content: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/pages/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Pages</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-page"><Plus className="w-4 h-4 mr-1" /> Add Page</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Page</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} data-testid="input-page-title" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} placeholder="about-us" data-testid="input-page-slug" /></div>
              <div><Label>Content (HTML)</Label><Textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="min-h-[200px]" data-testid="input-page-content" /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.slug || createMutation.isPending} data-testid="button-save-page">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages?.map(p => (
              <TableRow key={p.id} data-testid={`row-page-${p.id}`}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">/page/{p.slug}</TableCell>
                <TableCell>{p.isPublished ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-page-${p.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function BlogTab() {
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/admin/blog"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", thumbnailUrl: "" });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/blog", {
        ...form,
        thumbnailUrl: form.thumbnailUrl || null,
        isPublished: true,
        publishedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post created" });
      setOpen(false);
      setForm({ title: "", slug: "", content: "", thumbnailUrl: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/blog/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post deleted" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Blog Posts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-blog"><Plus className="w-4 h-4 mr-1" /> Add Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} data-testid="input-blog-title" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} placeholder="my-first-post" data-testid="input-blog-slug" /></div>
              <div><Label>Thumbnail URL</Label><Input value={form.thumbnailUrl} onChange={e => setForm(f => ({...f, thumbnailUrl: e.target.value}))} data-testid="input-blog-thumbnail" /></div>
              <div><Label>Content (HTML)</Label><Textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="min-h-[200px]" data-testid="input-blog-content" /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.slug || createMutation.isPending} data-testid="button-save-blog">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Published</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map(p => (
              <TableRow key={p.id} data-testid={`row-blog-${p.id}`}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">/blog/{p.slug}</TableCell>
                <TableCell>{p.isPublished ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-blog-${p.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

type ForceBox = { title: string; image: string; url: string };
type SettingsData = {
  site_name: string;
  trial_days: number;
  hero_media: string;
  hero_media_type: string;
  bg_audio: string;
  force_boxes: ForceBox[] | null;
  cta_bg_image: string;
};

function SettingsTab() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/admin/settings"],
  });

  const [siteName, setSiteName] = useState("");
  const [trialDays, setTrialDays] = useState("");
  const [heroMedia, setHeroMedia] = useState("");
  const [heroMediaType, setHeroMediaType] = useState("image");
  const [bgAudio, setBgAudio] = useState("");
  const [ctaBgImage, setCtaBgImage] = useState("");
  const [forceBoxesList, setForceBoxesList] = useState<ForceBox[]>([]);
  const [newBox, setNewBox] = useState<ForceBox>({ title: "", image: "", url: "" });
  const [editBoxIdx, setEditBoxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name);
      setTrialDays(String(settings.trial_days));
      setHeroMedia(settings.hero_media || "");
      setHeroMediaType(settings.hero_media_type || "image");
      setBgAudio(settings.bg_audio || "");
      setCtaBgImage(settings.cta_bg_image || "");
      if (settings.force_boxes && Array.isArray(settings.force_boxes)) {
        setForceBoxesList(settings.force_boxes);
      }
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<SettingsData>) => {
      await apiRequest("PATCH", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/site"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/homepage"] });
      toast({ title: "Settings saved" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const saveAll = () => {
    mutation.mutate({
      site_name: siteName,
      trial_days: parseInt(trialDays) as any,
      hero_media: heroMedia,
      hero_media_type: heroMediaType,
      bg_audio: bgAudio,
      cta_bg_image: ctaBgImage,
      force_boxes: forceBoxesList as any,
    });
  };

  const addOrUpdateBox = () => {
    if (!newBox.title.trim()) return;
    if (editBoxIdx !== null) {
      const updated = [...forceBoxesList];
      updated[editBoxIdx] = { ...newBox };
      setForceBoxesList(updated);
      setEditBoxIdx(null);
    } else {
      setForceBoxesList([...forceBoxesList, { ...newBox }]);
    }
    setNewBox({ title: "", image: "", url: "" });
  };

  const removeBox = (idx: number) => {
    setForceBoxesList(forceBoxesList.filter((_, i) => i !== idx));
  };

  const editBox = (idx: number) => {
    setNewBox({ ...forceBoxesList[idx] });
    setEditBoxIdx(idx);
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Site Settings</h2>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="Enter site name"
                data-testid="input-site-name"
              />
              <p className="text-xs text-muted-foreground">Displayed in the header, footer, and landing page.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial-days">Free Trial Days</Label>
              <Input
                id="trial-days"
                type="number"
                min="0"
                value={trialDays}
                onChange={e => setTrialDays(e.target.value)}
                placeholder="3"
                data-testid="input-trial-days"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Hero Section Media Type</Label>
              <Select value={heroMediaType} onValueChange={setHeroMediaType}>
                <SelectTrigger data-testid="select-hero-media-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-media">Hero {heroMediaType === "video" ? "Video" : "Image"} URL</Label>
              <Input
                id="hero-media"
                value={heroMedia}
                onChange={e => setHeroMedia(e.target.value)}
                placeholder={heroMediaType === "video" ? "https://example.com/hero-video.mp4" : "https://example.com/hero-image.jpg"}
                data-testid="input-hero-media"
              />
              <p className="text-xs text-muted-foreground">
                {heroMediaType === "video"
                  ? "Direct video file URL (.mp4). Plays automatically in hero section."
                  : "Image URL for the hero background. Leave empty for default."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bg-audio">Background Audio URL</Label>
            <Input
              id="bg-audio"
              value={bgAudio}
              onChange={e => setBgAudio(e.target.value)}
              placeholder="https://example.com/background-music.mp3"
              data-testid="input-bg-audio"
            />
            <p className="text-xs text-muted-foreground">Audio file URL (.mp3) that plays when the website opens. Leave empty to disable.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-bg-image">CTA Section Background Image</Label>
            <Input
              id="cta-bg-image"
              value={ctaBgImage}
              onChange={e => setCtaBgImage(e.target.value)}
              placeholder="https://example.com/cta-background.jpg"
              data-testid="input-cta-bg-image"
            />
            <p className="text-xs text-muted-foreground">Background image for "Ready to Start Your Preparation" section. Leave empty for default color.</p>
          </div>
        </div>

        <div className="border-t pt-5">
          <Label className="text-base font-semibold mb-3 block">Armed Forces Preparation Boxes</Label>
          <p className="text-xs text-muted-foreground mb-4">Add boxes with title, image URL, and optional link. These appear in the "Armed Forces Preparation" section.</p>

          {forceBoxesList.length > 0 && (
            <div className="space-y-2 mb-4">
              {forceBoxesList.map((box, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-md" data-testid={`row-force-box-${idx}`}>
                  {box.image && (
                    <img src={box.image} alt={box.title} className="w-12 h-12 object-cover rounded-md shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{box.title}</p>
                    {box.url && <p className="text-xs text-muted-foreground truncate">{box.url}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => editBox(idx)} data-testid={`button-edit-box-${idx}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeBox(idx)} data-testid={`button-remove-box-${idx}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={newBox.title}
                onChange={e => setNewBox({ ...newBox, title: e.target.value })}
                placeholder="Pakistan Army"
                data-testid="input-box-title"
              />
            </div>
            <div>
              <Label className="text-xs">Image URL</Label>
              <Input
                value={newBox.image}
                onChange={e => setNewBox({ ...newBox, image: e.target.value })}
                placeholder="https://..."
                data-testid="input-box-image"
              />
            </div>
            <div>
              <Label className="text-xs">Link URL (optional)</Label>
              <Input
                value={newBox.url}
                onChange={e => setNewBox({ ...newBox, url: e.target.value })}
                placeholder="https://..."
                data-testid="input-box-url"
              />
            </div>
            <Button onClick={addOrUpdateBox} disabled={!newBox.title.trim()} data-testid="button-add-box">
              {editBoxIdx !== null ? "Update" : <><Plus className="w-4 h-4 mr-1" /> Add</>}
            </Button>
          </div>
        </div>

        <div className="border-t pt-5">
          <Button
            onClick={saveAll}
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
            data-testid="button-save-settings"
          >
            {mutation.isPending ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AssessmentTab() {
  const { data: questions, isLoading } = useQuery<AssessmentQuestion[]>({ queryKey: ["/api/admin/assessment"] });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ type: "academic", subject: "english", trait: "", questionText: "", optionsJson: { A: "", B: "", C: "", D: "" }, correctAnswer: "A" });
  const [editId, setEditId] = useState<number | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const data: any = {
        type: form.type,
        questionText: form.questionText,
        subject: form.type === "academic" ? form.subject : null,
        trait: form.type === "personality" ? form.trait : null,
        optionsJson: form.type === "academic" ? form.optionsJson : null,
        correctAnswer: form.type === "academic" ? form.correctAnswer : null,
      };
      if (editId) {
        await apiRequest("PATCH", `/api/admin/assessment/${editId}`, data);
      } else {
        await apiRequest("POST", "/api/admin/assessment", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment"] });
      toast({ title: editId ? "Question updated" : "Question added" });
      setOpen(false);
      setEditId(null);
      setForm({ type: "academic", subject: "english", trait: "", questionText: "", optionsJson: { A: "", B: "", C: "", D: "" }, correctAnswer: "A" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/assessment/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment"] });
      toast({ title: "Question deleted" });
    },
  });

  const handleEdit = (q: AssessmentQuestion) => {
    setEditId(q.id);
    setForm({
      type: q.type,
      subject: q.subject || "english",
      trait: q.trait || "",
      questionText: q.questionText,
      optionsJson: (q.optionsJson as any) || { A: "", B: "", C: "", D: "" },
      correctAnswer: q.correctAnswer || "A",
    });
    setOpen(true);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("question") || header.includes("subject");
      const dataLines = hasHeader ? lines.slice(1) : lines;
      const questions: any[] = [];
      for (const line of dataLines) {
        const parts = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
        if (parts.length >= 7) {
          questions.push({
            type: "academic",
            subject: parts[0].toLowerCase(),
            questionText: parts[1],
            optionsJson: { A: parts[2], B: parts[3], C: parts[4], D: parts[5] },
            correctAnswer: parts[6].toUpperCase(),
            trait: null,
          });
        }
      }
      if (questions.length === 0) {
        toast({ title: "No valid questions found", description: "CSV format: subject,question,optionA,optionB,optionC,optionD,correctAnswer", variant: "destructive" });
        setCsvUploading(false);
        return;
      }
      await apiRequest("POST", "/api/admin/assessment/bulk", { questions });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment"] });
      toast({ title: `Imported ${questions.length} questions` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }
    setCsvUploading(false);
    e.target.value = "";
  };

  const filtered = questions?.filter(q => {
    if (filter === "all") return true;
    if (filter === "personality") return q.type === "personality";
    return q.type === "academic" && q.subject === filter;
  }) ?? [];

  const counts: Record<string, number> = {};
  questions?.forEach(q => {
    const key = q.type === "personality" ? "personality" : q.subject || "other";
    counts[key] = (counts[key] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Assessment Question Bank</h2>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" data-testid="input-csv-upload" />
            <Button variant="outline" size="sm" asChild disabled={csvUploading}>
              <span><Upload className="w-4 h-4 mr-1" /> {csvUploading ? "Importing..." : "Import CSV"}</span>
            </Button>
          </label>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditId(null); setForm({ type: "academic", subject: "english", trait: "", questionText: "", optionsJson: { A: "", B: "", C: "", D: "" }, correctAnswer: "A" }); } }}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-question"><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editId ? "Edit Question" : "Add Question"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger data-testid="select-q-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic (MCQ)</SelectItem>
                      <SelectItem value="personality">Personality (Likert)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type === "academic" && (
                  <div>
                    <Label>Subject</Label>
                    <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                      <SelectTrigger data-testid="select-q-subject"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intelligence">Intelligence</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">General Science</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="urdu">Urdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.type === "personality" && (
                  <div>
                    <Label>Personality Trait</Label>
                    <Select value={form.trait} onValueChange={v => setForm(f => ({ ...f, trait: v }))}>
                      <SelectTrigger data-testid="select-q-trait"><SelectValue placeholder="Select trait" /></SelectTrigger>
                      <SelectContent>
                        {["SELF CONFIDENCE","PLANNING ABILITY","COURAGE","EMOTIONAL STABILITY","RESPONSIBILITY","INTEGRITY","DETERMINATION","INITIATIVE","INFLUENCING ABILITY","SOCIAL RELATIONS","GENERAL AWARENESS","PRACTICAL ABILITY","PHYSICAL ENDURANCE","EXPRESSION"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Question Text</Label>
                  <Textarea value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))} rows={3} data-testid="input-q-text" />
                </div>
                {form.type === "academic" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {(["A","B","C","D"] as const).map(k => (
                        <div key={k}>
                          <Label>Option {k}</Label>
                          <Input value={(form.optionsJson as any)[k] || ""} onChange={e => setForm(f => ({ ...f, optionsJson: { ...f.optionsJson, [k]: e.target.value } }))} data-testid={`input-option-${k}`} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Correct Answer</Label>
                      <Select value={form.correctAnswer} onValueChange={v => setForm(f => ({ ...f, correctAnswer: v }))}>
                        <SelectTrigger data-testid="select-correct"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <Button onClick={() => {
                  if (form.type === "personality" && !form.trait) {
                    toast({ title: "Please select a personality trait", variant: "destructive" });
                    return;
                  }
                  if (form.type === "academic" && (!form.optionsJson.A || !form.optionsJson.B || !form.optionsJson.C || !form.optionsJson.D)) {
                    toast({ title: "Please fill all four options", variant: "destructive" });
                    return;
                  }
                  createMutation.mutate();
                }} disabled={!form.questionText || createMutation.isPending} data-testid="button-save-question">
                  {editId ? "Update" : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: `All (${questions?.length || 0})` },
          { key: "personality", label: `Personality (${counts.personality || 0})` },
          { key: "intelligence", label: `Intelligence (${counts.intelligence || 0})` },
          { key: "english", label: `English (${counts.english || 0})` },
          { key: "science", label: `Science (${counts.science || 0})` },
          { key: "math", label: `Math (${counts.math || 0})` },
          { key: "urdu", label: `Urdu (${counts.urdu || 0})` },
        ].map(f => (
          <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm" onClick={() => setFilter(f.key)} data-testid={`filter-${f.key}`}>
            {f.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        CSV format: <code>subject,question,optionA,optionB,optionC,optionD,correctAnswer</code>
      </p>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-28">Subject/Trait</TableHead>
                <TableHead className="w-20">Answer</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map((q, i) => (
                <TableRow key={q.id} data-testid={`row-question-${q.id}`}>
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{q.questionText}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{q.type === "personality" ? q.trait : q.subject}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{q.correctAnswer || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(q)} data-testid={`button-edit-q-${q.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(q.id)} data-testid={`button-delete-q-${q.id}`}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > 50 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t">
              Showing first 50 of {filtered.length} questions. Use filters to narrow down.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function AdminInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (iosDevice && !standalone) setIsIos(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
  if (isStandalone) return null;

  const handleClick = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        toast({ title: "App Installed", description: "You can now open the admin panel from your home screen." });
      }
    } else if (isIos) {
      setShowTip(true);
      toast({
        title: "Install on iPhone/iPad",
        description: "Tap the Share button (square with arrow) at the bottom of Safari, then tap 'Add to Home Screen'.",
      });
    } else {
      toast({
        title: "Install App",
        description: "Open this page in Chrome or Edge on your mobile to install.",
      });
    }
  }, [deferredPrompt, isIos, toast]);

  return (
    <Button variant="outline" size="sm" onClick={handleClick} data-testid="button-admin-install">
      <Smartphone className="w-4 h-4 mr-1" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
