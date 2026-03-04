import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { hashPassword, comparePassword } from "./auth";
import { generateMcqPdf } from "./pdf";
import { registerSchema, loginSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "shaheen-forces-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  function requireAuth(req: Request, res: Response, next: Function) {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  }

  async function requireAdmin(req: Request, res: Response, next: Function) {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    next();
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await storage.getUserByMobile(data.mobile);
      if (existing) return res.status(400).json({ message: "Mobile number already registered" });

      const trialDaysSetting = await storage.getSetting("trial_days");
      const trialDays = (trialDaysSetting?.value as number) || 3;

      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + trialDays);

      const user = await storage.createUser({
        mobile: data.mobile,
        passwordHash: await hashPassword(data.password),
        name: data.name || null,
        email: data.email || null,
        role: "student",
        selectedCollegeId: data.selectedCollegeId || null,
        level: data.level || null,
        isActive: true,
        trialStartDate: now.toISOString().split("T")[0],
        trialEndDate: trialEnd.toISOString().split("T")[0],
        packageType: "trial",
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, passwordHash: undefined }, trialDays });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByMobile(data.mobile);
      if (!user) return res.status(401).json({ message: "Invalid mobile or password" });

      const valid = await comparePassword(data.password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Invalid mobile or password" });

      if (!user.isActive) return res.status(403).json({ message: "Account is deactivated. Contact admin." });

      req.session.userId = user.id;
      res.json({ user: { ...user, passwordHash: undefined } });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ ...user, passwordHash: undefined });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ ok: true });
  });

  // Public routes
  app.get("/api/provinces", async (_req, res) => {
    const data = await storage.getProvinces();
    res.json(data);
  });

  app.get("/api/colleges", async (_req, res) => {
    const data = await storage.getColleges();
    res.json(data);
  });

  app.get("/api/packages", async (_req, res) => {
    const data = await storage.getPackages();
    res.json(data.filter(p => p.isActive));
  });

  app.get("/api/blog", async (_req, res) => {
    const data = await storage.getBlogPosts();
    res.json(data.filter(p => p.isPublished));
  });

  app.get("/api/blog/:slug", async (req, res) => {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || !post.isPublished) return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  app.get("/api/pages/:slug", async (req, res) => {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page || !page.isPublished) return res.status(404).json({ message: "Not found" });
    res.json(page);
  });

  // Student routes
  app.get("/api/mcqs/:level", requireAuth, async (req, res) => {
    const data = await storage.getMcqs(req.params.level);
    res.json(data);
  });

  app.post("/api/tutor/chat", requireAuth, async (req, res) => {
    const { message, level, collegeId } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    const syllabusData = await storage.getSyllabus();
    const subjects = [...new Set(syllabusData.filter(s => !level || s.level === level).map(s => s.subject))];

    let reply = "";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("math") || lowerMsg.includes("mathematics")) {
      reply = `Great choice! Let's work on Mathematics.\n\nHere are some key topics for your level:\n\n1. **Number System** - Understanding whole numbers, fractions, and decimals\n2. **Algebra** - Basic equations and expressions\n3. **Geometry** - Shapes, angles, and measurements\n4. **Arithmetic** - Addition, subtraction, multiplication, division\n\nWould you like me to explain any specific topic or give you some practice MCQs?`;
    } else if (lowerMsg.includes("english")) {
      reply = `Let's focus on English!\n\nKey areas for preparation:\n\n1. **Grammar** - Tenses, articles, prepositions\n2. **Vocabulary** - Synonyms, antonyms, word meanings\n3. **Comprehension** - Reading and understanding passages\n4. **Sentence Correction** - Finding and fixing errors\n\nShall I start with grammar basics or give you some vocabulary exercises?`;
    } else if (lowerMsg.includes("science") || lowerMsg.includes("general knowledge") || lowerMsg.includes("gk")) {
      reply = `Let's prepare General Knowledge & Science!\n\nImportant topics:\n\n1. **Pakistan Studies** - Geography, history, important dates\n2. **Current Affairs** - Recent events, leaders, achievements\n3. **Basic Science** - Plants, animals, human body, solar system\n4. **Islamic Studies** - Basic pillars, important events\n\nWhat would you like to start with?`;
    } else if (lowerMsg.includes("urdu")) {
      reply = `Urdu ki tayyari karein!\n\nAhem topics:\n\n1. **Grammar** - Isim, Fe'l, Hurf\n2. **Mazameen** - Essay writing\n3. **Comprehension** - Passage reading\n4. **Poetry** - Famous poets and their work\n\nKis topic se shuru karein?`;
    } else if (lowerMsg.includes("quiz") || lowerMsg.includes("mcq") || lowerMsg.includes("test")) {
      reply = `Here are some quick MCQs:\n\n**Q1:** What is the capital of Pakistan?\nA) Lahore  B) Islamabad  C) Karachi  D) Peshawar\n\n**Q2:** How many provinces does Pakistan have?\nA) 3  B) 4  C) 5  D) 6\n\n**Q3:** Which is the longest river of Pakistan?\nA) Ravi  B) Chenab  C) Indus  D) Jhelum\n\nTry answering these! I'll tell you the correct answers.`;
    } else {
      reply = `I can help you prepare for your cadet college entrance exam! Here are the subjects I can cover:\n\n${subjects.length > 0 ? subjects.map((s, i) => `${i + 1}. **${s}**`).join("\n") : "- Mathematics\n- English\n- Urdu\n- General Knowledge\n- Science"}\n\nJust type the subject name and I'll create a study plan for you. You can also ask for:\n- Practice MCQs\n- Topic explanations\n- Quick quizzes\n\nWhat would you like to study?`;
    }

    res.json({ reply });
  });

  // PDF generation
  app.post("/api/pdf/generate", requireAuth, async (req, res) => {
    try {
      const { subject } = req.body;
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ message: "User not found" });

      if (subject && typeof subject !== "string") {
        return res.status(400).json({ message: "Invalid subject" });
      }

      const mcqLevel = user.level || "middle";
      const subjectFilter = subject && subject !== "all" ? subject : undefined;
      const allMcqs = await storage.getMcqs(mcqLevel, subjectFilter);

      if (allMcqs.length === 0) {
        return res.status(404).json({ message: "No MCQs found for the selected criteria" });
      }

      const MAX_QUESTIONS = 25;
      const numQuestions = Math.min(MAX_QUESTIONS, allMcqs.length);
      const shuffled = [...allMcqs].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numQuestions);

      const title = subject
        ? `${subject} - MCQ Practice (${mcqLevel.charAt(0).toUpperCase() + mcqLevel.slice(1)} Level)`
        : `MCQ Practice Paper (${mcqLevel.charAt(0).toUpperCase() + mcqLevel.slice(1)} Level)`;

      const pdfBuffer = await generateMcqPdf(selected, title, user.name || undefined);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=shaheen-mcqs-${Date.now()}.pdf`);
      res.send(pdfBuffer);
    } catch (e: any) {
      console.error("PDF generation error:", e);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const data = await storage.getAllUsers();
    res.json(data.map(u => ({ ...u, passwordHash: undefined })));
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.updateUser(id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user, passwordHash: undefined });
  });

  app.get("/api/admin/users/export", requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    const csv = [
      "ID,Mobile,Name,Email,Level,Package,Status,Created",
      ...users.filter(u => u.role === "student").map(u => {
        const endDate = u.packageExpiryDate || u.trialEndDate;
        const status = endDate && new Date(endDate) >= new Date() ? "Active" : "Expired";
        return `${u.id},${u.mobile},${u.name || ""},${u.email || ""},${u.level || ""},${u.packageType || "trial"},${status},${u.createdAt?.toISOString() || ""}`;
      })
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
  });

  app.post("/api/admin/provinces", requireAdmin, async (req, res) => {
    const province = await storage.createProvince(req.body);
    res.json(province);
  });

  app.patch("/api/admin/provinces/:id", requireAdmin, async (req, res) => {
    const province = await storage.updateProvince(parseInt(req.params.id), req.body);
    if (!province) return res.status(404).json({ message: "Not found" });
    res.json(province);
  });

  app.delete("/api/admin/provinces/:id", requireAdmin, async (req, res) => {
    await storage.deleteProvince(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/admin/colleges", requireAdmin, async (req, res) => {
    const college = await storage.createCollege(req.body);
    res.json(college);
  });

  app.patch("/api/admin/colleges/:id", requireAdmin, async (req, res) => {
    const college = await storage.updateCollege(parseInt(req.params.id), req.body);
    if (!college) return res.status(404).json({ message: "Not found" });
    res.json(college);
  });

  app.delete("/api/admin/colleges/:id", requireAdmin, async (req, res) => {
    await storage.deleteCollege(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/admin/packages", requireAdmin, async (req, res) => {
    const pkg = await storage.createPackage(req.body);
    res.json(pkg);
  });

  app.patch("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    const pkg = await storage.updatePackage(parseInt(req.params.id), req.body);
    if (!pkg) return res.status(404).json({ message: "Not found" });
    res.json(pkg);
  });

  app.delete("/api/admin/packages/:id", requireAdmin, async (req, res) => {
    await storage.deletePackage(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/admin/pages", requireAdmin, async (_req, res) => {
    const data = await storage.getPages();
    res.json(data);
  });

  app.post("/api/admin/pages", requireAdmin, async (req, res) => {
    const page = await storage.createPage(req.body);
    res.json(page);
  });

  app.patch("/api/admin/pages/:id", requireAdmin, async (req, res) => {
    const page = await storage.updatePage(parseInt(req.params.id), req.body);
    if (!page) return res.status(404).json({ message: "Not found" });
    res.json(page);
  });

  app.delete("/api/admin/pages/:id", requireAdmin, async (req, res) => {
    await storage.deletePage(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/admin/blog", requireAdmin, async (_req, res) => {
    const data = await storage.getBlogPosts();
    res.json(data);
  });

  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    const post = await storage.createBlogPost(req.body);
    res.json(post);
  });

  app.patch("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    const post = await storage.updateBlogPost(parseInt(req.params.id), req.body);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    await storage.deleteBlogPost(parseInt(req.params.id));
    res.json({ ok: true });
  });

  return httpServer;
}
