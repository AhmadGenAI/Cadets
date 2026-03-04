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
      let existing = await storage.getUserByMobile(data.mobile);
      if (!existing && data.mobile.startsWith("+92")) {
        existing = await storage.getUserByMobile("0" + data.mobile.slice(3));
      }
      if (!existing && data.mobile.startsWith("0")) {
        existing = await storage.getUserByMobile("+92" + data.mobile.slice(1));
      }
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
        fatherName: data.fatherName || null,
        email: data.email || null,
        role: "student",
        selectedCollegeId: data.selectedCollegeId || null,
        selectedProvinceId: data.selectedProvinceId || null,
        level: null,
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
      let user = await storage.getUserByMobile(data.mobile);
      if (!user && data.mobile.startsWith("+92")) {
        user = await storage.getUserByMobile("0" + data.mobile.slice(3));
      }
      if (!user && data.mobile.startsWith("0")) {
        user = await storage.getUserByMobile("+92" + data.mobile.slice(1));
      }
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

  // Public settings
  app.get("/api/settings/site", async (_req, res) => {
    const siteName = await storage.getSetting("site_name");
    res.json({ siteName: siteName?.value ?? "Cadet Colleges Test Preparation Portal" });
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

  // Public chatbot
  app.post("/api/chatbot", async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (message.length > 500) {
      return res.status(400).json({ message: "Message too long" });
    }

    const lowerMsg = message.toLowerCase().trim();
    let reply = "";

    const cadetKeywords = ["cadet", "college", "admission", "entry test", "preparation", "exam", "syllabus", "fee", "hostel", "uniform", "medical", "interview", "age", "eligibility", "merit", "apply", "application", "last date", "hasan abdal", "petaro", "kohat", "rawalakot", "sui", "larkana", "murree", "lawrence", "pano aqil", "pakistan", "army", "navy", "air force", "paf", "military", "test date", "result", "mcq", "english", "math", "urdu", "islamiat", "science", "gk", "general knowledge", "quiz", "practice", "preparation", "province", "punjab", "sindh", "kpk", "balochistan", "class 7", "class 8", "middle", "matric", "8th", "7th", "6th"];

    const isCadetRelated = cadetKeywords.some(kw => lowerMsg.includes(kw));

    const greetings = ["hi", "hello", "assalam", "salam", "aoa", "hey", "good morning", "good evening"];
    const isGreeting = greetings.some(g => lowerMsg.startsWith(g) || lowerMsg === g);

    if (isGreeting) {
      reply = "Assalam-o-Alaikum! Welcome to Cadet Colleges Test Preparation Portal.\n\nI can help you with:\n- **Admission** requirements and dates\n- **Entry test** syllabus and tips\n- **College information** across Pakistan\n- **Fee structure** and eligibility\n- **Interview & Medical** preparation\n\nWhat would you like to know about cadet colleges?";
    } else if (lowerMsg.includes("admission") || lowerMsg.includes("apply") || lowerMsg.includes("application") || lowerMsg.includes("last date")) {
      const colleges = await storage.getColleges();
      const withDates = colleges.filter(c => c.lastApplyDate);
      let dateInfo = "";
      if (withDates.length > 0) {
        dateInfo = "\n\n**Upcoming Deadlines:**\n" + withDates.map(c => `- ${c.name}: ${new Date(c.lastApplyDate!).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}`).join("\n");
      }
      reply = `**Cadet College Admissions**\n\nAdmissions typically open in January-March for most cadet colleges. Students in Class 7 and Class 8 can apply.\n\n**General Requirements:**\n- Age between 12-15 years (varies by college)\n- Good academic record\n- Pakistani nationality\n- Physically and medically fit${dateInfo}\n\nRegister on our portal to start your preparation today!`;
    } else if (lowerMsg.includes("fee") || lowerMsg.includes("cost") || lowerMsg.includes("charges") || lowerMsg.includes("price")) {
      reply = "**Fee Structure**\n\nCadet college fees vary by institution:\n\n- **Monthly fees** typically range from Rs. 15,000 to Rs. 50,000\n- **Admission fee** is usually one-time\n- **Security deposit** is refundable\n- Some colleges offer **scholarships** for merit students\n- **Armed forces children** may get fee concessions\n\nFor specific college fee details, visit our portal or contact the respective college directly.\n\nFor preparation packages, check our [Pricing](/pricing) page!";
    } else if (lowerMsg.includes("eligibility") || lowerMsg.includes("age") || lowerMsg.includes("requirement") || lowerMsg.includes("who can apply")) {
      reply = "**Eligibility Criteria**\n\n**Age:**\n- Class 7 entry: 11-13 years\n- Class 8 entry: 12-14 years\n- (Age limits may vary slightly by college)\n\n**Academic:**\n- Must have passed the previous class\n- Good grades in Mathematics, English, and Science\n\n**Other Requirements:**\n- Pakistani national or domicile holder\n- Physically fit (medical test required)\n- No serious medical conditions\n- Good moral character\n\nWould you like to know about a specific college?";
    } else if (lowerMsg.includes("syllabus") || lowerMsg.includes("test pattern") || lowerMsg.includes("what to study") || lowerMsg.includes("paper pattern")) {
      reply = "**Entry Test Syllabus**\n\nThe written test typically covers:\n\n1. **Mathematics** (30-40%)\n   - Arithmetic, Algebra, Geometry\n2. **English** (20-30%)\n   - Grammar, Vocabulary, Comprehension\n3. **Urdu** (10-15%)\n   - Grammar, Essay, Comprehension\n4. **General Knowledge / Islamiat** (15-20%)\n   - Pakistan Studies, Current Affairs, Islamic basics\n5. **Intelligence Test** (10-15%)\n   - Patterns, analogies, reasoning\n\n**Test Format:** Mostly MCQs with some subjective questions\n**Duration:** 2-3 hours\n\nRegister on our portal to practice subject-wise MCQs!";
    } else if (lowerMsg.includes("interview") || lowerMsg.includes("viva")) {
      reply = "**Interview Preparation**\n\nAfter passing the written test, selected candidates face an interview:\n\n**Common Questions:**\n- Tell me about yourself\n- Why do you want to join a cadet college?\n- Name the capitals of provinces\n- Current Prime Minister / President\n- Your favorite subject and why\n\n**Tips:**\n- Dress neatly in formal clothes\n- Maintain eye contact\n- Speak clearly and confidently\n- Know basic facts about Pakistan\n- Be honest in your answers\n\nOur portal has a dedicated Interview Prep section with 50+ practice questions!";
    } else if (lowerMsg.includes("medical") || lowerMsg.includes("physical") || lowerMsg.includes("health")) {
      reply = "**Medical & Physical Test**\n\nAfter the interview, candidates undergo a medical examination:\n\n**Medical Tests:**\n- Vision test (6/6 eyesight preferred)\n- Hearing test\n- Blood tests\n- Chest X-ray\n- General physical examination\n\n**Physical Standards:**\n- Height and weight appropriate for age\n- No flat feet or knock knees\n- No color blindness\n- Good dental health\n\n**Tips:**\n- Maintain regular exercise\n- Eat a balanced diet\n- Get enough sleep before the test\n- Carry all previous medical records\n\nCheck our Medical Prep section on the portal for detailed guidance!";
    } else if (lowerMsg.includes("hasan abdal") || lowerMsg.includes("hasanabdal")) {
      reply = "**Cadet College Hasan Abdal**\n\n- **Location:** Hasan Abdal, Punjab\n- **Established:** 1954\n- One of the **oldest and most prestigious** cadet colleges\n- Entry at **Class 8** level\n- Produces many top military officers\n- Beautiful campus near Taxila\n\nIt is considered the 'Eton of Pakistan' for its academic excellence and discipline.";
    } else if (lowerMsg.includes("petaro")) {
      reply = "**Cadet College Petaro**\n\n- **Location:** Petaro, Sindh\n- **Established:** 1957\n- Premier institution in **Sindh**\n- Known for excellent **academic record**\n- Beautiful campus with modern facilities\n- Produces many distinguished alumni";
    } else if (lowerMsg.includes("kohat")) {
      reply = "**Cadet College Kohat**\n\n- **Location:** Kohat, KPK\n- Leading cadet college in **Khyber Pakhtunkhwa**\n- Known for strong discipline and academics\n- Modern facilities and experienced faculty\n- Entry available at Class 7 and 8 levels";
    } else if (lowerMsg.includes("college") || lowerMsg.includes("list") || lowerMsg.includes("how many")) {
      const colleges = await storage.getColleges();
      const provinces = await storage.getProvinces();
      const provinceMap = new Map(provinces.map(p => [p.id, p.name]));
      const grouped: Record<string, string[]> = {};
      colleges.forEach(c => {
        const pName = provinceMap.get(c.provinceId) || "Other";
        if (!grouped[pName]) grouped[pName] = [];
        grouped[pName].push(c.name);
      });
      const listing = Object.entries(grouped).map(([prov, cols]) => `**${prov}:**\n${cols.map(c => `  - ${c}`).join("\n")}`).join("\n\n");
      reply = `**Cadet Colleges in Pakistan**\n\n${listing}\n\nVisit our homepage to explore colleges by province!`;
    } else if (lowerMsg.includes("preparation") || lowerMsg.includes("prepare") || lowerMsg.includes("tips") || lowerMsg.includes("how to")) {
      reply = "**Preparation Tips**\n\n1. **Start 3-6 months** before the exam\n2. **Daily routine:** Study at least 2-3 hours\n3. **Focus areas:** Math (most important), English, GK\n4. **Practice MCQs** daily — aim for 25+ questions\n5. **Read newspapers** for current affairs\n6. **Physical fitness** — exercise regularly\n7. **Mock tests** — take weekly practice tests\n8. **Group study** can be helpful\n\nOur portal offers:\n- AI Smart Tutor for personalized help\n- Subject-wise MCQ practice\n- Interview & Medical prep guides\n- Downloadable PDF practice papers\n\n[Register now](/register) to start your free trial!";
    } else if (isCadetRelated) {
      reply = `That's a great question about cadet colleges!\n\nI can help you with specific topics:\n- **Admissions** — dates, requirements, process\n- **Entry Test** — syllabus, pattern, tips\n- **Colleges** — list, details, locations\n- **Fees** — structure and scholarships\n- **Interview** — common questions, preparation\n- **Medical** — physical standards, tests\n\nPlease ask about any of these topics and I'll provide detailed information!`;
    } else {
      reply = `I appreciate your question, but I'm specifically designed to help with **cadet college** related queries only.\n\nI can assist with:\n- Admissions & eligibility\n- Entry test preparation\n- College information\n- Fee structures\n- Interview & medical preparation\n\nFor other information, please visit **[www.pakshaheens.com](https://www.pakshaheens.com)** or contact us on WhatsApp: **+923348480890**.\n\nIs there anything about cadet colleges I can help you with?`;
    }

    res.json({ reply });
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
      "ID,Mobile,Name,Father Name,Email,Package,Status,Created",
      ...users.filter(u => u.role === "student").map(u => {
        const endDate = u.packageExpiryDate || u.trialEndDate;
        const status = endDate && new Date(endDate) >= new Date() ? "Active" : "Expired";
        return `${u.id},${u.mobile},${u.name || ""},${u.fatherName || ""},${u.email || ""},${u.packageType || "trial"},${status},${u.createdAt?.toISOString() || ""}`;
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

  app.get("/api/assessment/personality", async (_req, res) => {
    const questions = await storage.getAssessmentQuestions("personality");
    const shuffled = questions.sort(() => Math.random() - 0.5);
    res.json(shuffled);
  });

  app.get("/api/assessment/academic/:subject", async (req, res) => {
    const { subject } = req.params;
    const valid = ["intelligence", "english", "science", "math", "urdu"];
    if (!valid.includes(subject)) return res.status(400).json({ message: "Invalid subject" });
    const questions = await storage.getAssessmentQuestions("academic", subject);
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 25);
    res.json(shuffled);
  });

  app.get("/api/admin/assessment", requireAdmin, async (_req, res) => {
    const questions = await storage.getAllAssessmentQuestions();
    res.json(questions);
  });

  app.post("/api/admin/assessment", requireAdmin, async (req, res) => {
    const { type, questionText, subject, trait, optionsJson, correctAnswer } = req.body;
    if (!type || !questionText) return res.status(400).json({ message: "type and questionText are required" });
    if (type === "personality" && !trait) return res.status(400).json({ message: "trait is required for personality questions" });
    if (type === "academic") {
      if (!subject) return res.status(400).json({ message: "subject is required for academic questions" });
      if (!optionsJson || !optionsJson.A || !optionsJson.B || !optionsJson.C || !optionsJson.D) return res.status(400).json({ message: "All four options (A,B,C,D) are required" });
      if (!["A","B","C","D"].includes(correctAnswer)) return res.status(400).json({ message: "correctAnswer must be A, B, C, or D" });
    }
    const question = await storage.createAssessmentQuestion(req.body);
    res.json(question);
  });

  app.patch("/api/admin/assessment/:id", requireAdmin, async (req, res) => {
    const { type, questionText } = req.body;
    if (type && !questionText && !req.body.questionText) return res.status(400).json({ message: "questionText is required" });
    const question = await storage.updateAssessmentQuestion(parseInt(req.params.id), req.body);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json(question);
  });

  app.delete("/api/admin/assessment/:id", requireAdmin, async (req, res) => {
    await storage.deleteAssessmentQuestion(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/admin/assessment/bulk", requireAdmin, async (req, res) => {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ message: "Expected array of questions" });
    let count = 0;
    for (const q of questions) {
      await storage.createAssessmentQuestion(q);
      count++;
    }
    res.json({ ok: true, imported: count });
  });

  // Admin settings
  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    const siteName = await storage.getSetting("site_name");
    const trialDays = await storage.getSetting("trial_days");
    res.json({
      site_name: siteName?.value ?? "Cadet Colleges Test Preparation Portal",
      trial_days: trialDays?.value ?? 3,
    });
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    const { site_name, trial_days } = req.body;
    if (site_name !== undefined) {
      if (typeof site_name !== "string" || site_name.trim().length === 0) {
        return res.status(400).json({ message: "Site name is required" });
      }
      await storage.setSetting("site_name", site_name.trim());
    }
    if (trial_days !== undefined) {
      const days = parseInt(trial_days);
      if (isNaN(days) || days < 0) {
        return res.status(400).json({ message: "Invalid trial days" });
      }
      await storage.setSetting("trial_days", days);
    }
    res.json({ ok: true });
  });

  return httpServer;
}
