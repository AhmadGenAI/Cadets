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
  Plus, Pencil, Trash2, LogOut, LayoutDashboard, Download, Smartphone
} from "lucide-react";
import type { User, Province, College, Package as PkgType, Page as PageType, BlogPost } from "@shared/schema";

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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
  });

  const exportUsers = async () => {
    window.open("/api/admin/users/export", "_blank");
  };

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
              <TableHead>Status</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Active</TableHead>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {provinces?.map(p => (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-2" data-testid={`card-admin-province-${p.id}`}>
            <div className="flex items-center gap-3">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover" />}
              <span className="font-medium">{p.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-province-${p.id}`}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
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
  const [form, setForm] = useState({ name: "", provinceId: "", city: "", lastApplyDate: "", isFeatured: false });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/colleges", {
        name: form.name,
        provinceId: parseInt(form.provinceId),
        city: form.city || null,
        lastApplyDate: form.lastApplyDate || null,
        isFeatured: form.isFeatured,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colleges"] });
      toast({ title: "College created" });
      setOpen(false);
      setForm({ name: "", provinceId: "", city: "", lastApplyDate: "", isFeatured: false });
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

function SettingsTab() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<{ site_name: string; trial_days: number }>({
    queryKey: ["/api/admin/settings"],
  });

  const [siteName, setSiteName] = useState("");
  const [trialDays, setTrialDays] = useState("");

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name);
      setTrialDays(String(settings.trial_days));
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (data: { site_name?: string; trial_days?: number }) => {
      await apiRequest("PATCH", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/site"] });
      toast({ title: "Settings saved" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Site Settings</h2>

      <Card className="p-6 max-w-lg space-y-5">
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
          <p className="text-xs text-muted-foreground">Number of free trial days for new registrations.</p>
        </div>

        <Button
          onClick={() => mutation.mutate({ site_name: siteName, trial_days: parseInt(trialDays) })}
          disabled={mutation.isPending}
          data-testid="button-save-settings"
        >
          {mutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </Card>
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
