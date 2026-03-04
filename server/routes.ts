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
        country: data.country || null,
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
      reply = "Wa-Alaikum-Assalam! 😊 Welcome beta, it's great to have you here at **Cadet Colleges Test Preparation Portal**!\n\nI'm your friendly guide and I'm here to help you with everything about cadet colleges. Think of me as your older brother who's been through this journey!\n\nI can help you with:\n- **Admissions** — requirements, dates, how to apply\n- **Entry Test** — syllabus, preparation tips\n- **College Info** — all 29 cadet colleges across Pakistan\n- **Fee Structure** — college-wise fees and scholarships\n- **Interview & Medical** — what to expect and how to prepare\n- **Online Preparation** — daily tests, quizzes & AI tutoring\n\nBus pooch lo beta, kya jaanna hai? 😊";
    } else if (lowerMsg.includes("admission") || lowerMsg.includes("apply") || lowerMsg.includes("application") || lowerMsg.includes("last date") || lowerMsg.includes("daakhla") || lowerMsg.includes("dakhla")) {
      const colleges = await storage.getColleges();
      const withDates = colleges.filter(c => c.lastApplyDate);
      let dateInfo = "";
      if (withDates.length > 0) {
        dateInfo = "\n\n**Upcoming Deadlines:**\n" + withDates.map(c => `- ${c.name}: ${new Date(c.lastApplyDate!).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}`).join("\n");
      }
      reply = `Bohat acha sawal hai beta! 😊 Let me tell you everything about **Cadet College Admissions**:\n\n**When do admissions open?**\nMost cadet colleges announce admissions between **January to March** every year. Some colleges like Cadet College Fateh Jang also take admissions mid-year.\n\n**Which classes can apply?**\n- **Class 8** — This is the most common entry point (almost all colleges)\n- **Class 11** — Some colleges like Kohat, Jhelum, Lawrence College\n- **Class 6 & 7** — Limited colleges like Fateh Jang\n\n**General Requirements:**\n- Age: **12-15 years** (varies by college and class)\n- Must have passed the previous class with good grades\n- Pakistani nationality or valid domicile\n- Physically and medically fit\n- Good moral character certificate from school\n\n**Admission Process:**\n1. Fill the application form (online or paper)\n2. Pay the application fee (Rs. 1,000 - 5,000)\n3. Appear in the **Written Entry Test** (MCQs + Subjective)\n4. Shortlisted candidates called for **Interview**\n5. Pass the **Medical/Physical Test**\n6. Final merit list announced${dateInfo}\n\nBeta, agar aap test ki tayyari karna chahte ho toh humare portal par **register** karo! Hum daily tests, quizzes, aur AI Tutor dete hain jo bilkul live teacher ki tarah guide karta hai. 💪\n\n[Register here](/register) — **3-day free trial** to get started!`;
    } else if (lowerMsg.includes("fee") || lowerMsg.includes("cost") || lowerMsg.includes("charges") || lowerMsg.includes("price") || lowerMsg.includes("kitni") || lowerMsg.includes("kharcha")) {
      const allColleges = await storage.getColleges();
      const matchedCollege = allColleges.find(c => {
        const cName = c.name.toLowerCase();
        const cCity = (c.city || "").toLowerCase();
        const nameWords = cName.replace(/cadet|college|military|school|pakistan|paf|pn/g, "").trim().split(/\s+/).filter(w => w.length > 2);
        const nameMatch = nameWords.length > 0 && nameWords.some(w => lowerMsg.includes(w));
        const cityMatch = cCity.length > 3 && lowerMsg.includes(cCity);
        return nameMatch || cityMatch;
      });

      if (matchedCollege && matchedCollege.feeStructure) {
        reply = `**${matchedCollege.name} — Fee Structure**\n\n${matchedCollege.feeStructure}`;
        if (matchedCollege.applyLink) {
          reply += `\n\n**Official Website:** [${matchedCollege.applyLink}](${matchedCollege.applyLink})`;
        }
        reply += "\n\n*Note: Fees may change. Always confirm from the official college website or contact the college directly.*";
      } else {
        const feeColleges = allColleges.filter(c => c.feeStructure);
        const summaryLines = feeColleges.slice(0, 8).map(c => {
          const short = c.feeStructure!.split(".").slice(0, 2).join(".") + ".";
          return `- **${c.name}**: ${short}`;
        });
        reply = `**Cadet College Fee Structures**\n\nHere's a summary of fees for some colleges:\n\n${summaryLines.join("\n")}\n\n**Tips:**\n- Armed forces children usually get fee concessions\n- Some colleges offer merit-based scholarships\n- Government-subsidized colleges have lower fees\n\nAsk me about a specific college's fee — e.g. "fee of Cadet College Fateh Jang" — for detailed information!`;
      }
    } else if (lowerMsg.includes("eligibility") || lowerMsg.includes("age") || lowerMsg.includes("requirement") || lowerMsg.includes("who can apply") || lowerMsg.includes("kon apply") || lowerMsg.includes("kaun apply")) {
      reply = "Beta, yeh bohat important question hai! 😊 Let me explain the **Eligibility Criteria**:\n\n**Age Limits:**\n- Class 6 entry: **10-12 years**\n- Class 7 entry: **11-13 years**\n- Class 8 entry: **12-14 years**\n- Class 11 entry: **15-17 years** (after Matric)\n- _(Age limits may vary slightly by college — always check their website)_\n\n**Academic Requirements:**\n- Must have passed the previous class\n- Good grades especially in **Mathematics, English, and Science**\n- Some colleges require minimum 60-70% marks\n\n**Other Requirements:**\n- Pakistani nationality or valid domicile holder\n- Physically and medically fit\n- No serious medical conditions (eyesight, hearing, etc.)\n- Good moral character certificate from school\n- Some colleges accept overseas Pakistanis too!\n\n**Documents Needed:**\n- Birth certificate / B-Form\n- School leaving certificate\n- Previous class result card\n- Passport-size photographs\n- Domicile certificate\n- Father's CNIC copy\n\nAgar aap eligible ho toh foran preparation shuru karo! 💪 Humare portal par register karo aur **free trial** mein daily MCQs aur AI Tutor access karo.\n\nKoi aur sawal ho toh zaroor poochna! 😊";
    } else if (lowerMsg.includes("syllabus") || lowerMsg.includes("test pattern") || lowerMsg.includes("what to study") || lowerMsg.includes("paper pattern") || lowerMsg.includes("nisab") || lowerMsg.includes("course outline")) {
      const classMatch = lowerMsg.match(/(?:class|grade)\s*(\d+)|(\d+)(?:th|st|nd|rd)\s*(?:class|grade)?|^(\d+)$/);
      const classNum = classMatch ? parseInt(classMatch[1] || classMatch[2] || classMatch[3]) : null;

      const allColleges = await storage.getColleges();
      const matchedCollege = allColleges.find(c => {
        const cName = c.name.toLowerCase();
        const cCity = (c.city || "").toLowerCase();
        const nameWords = cName.replace(/cadet|college|military|school|pakistan|paf|pn/g, "").trim().split(/\s+/).filter(w => w.length > 2);
        const nameMatch = nameWords.length > 0 && nameWords.some(w => lowerMsg.includes(w));
        const cityMatch = cCity.length > 3 && lowerMsg.includes(cCity);
        return nameMatch || cityMatch;
      });

      if (!classNum) {
        reply = "**Entry Test Syllabus**\n\nAdmissions in cadet colleges are mostly held for:\n- **Class 8** (most common — after 7th grade)\n- **Class 11** (FSc/ICS level — after Matric)\n- Some colleges also offer entry in **Class 6, 7, and 9**\n\nPlease tell me which class syllabus you need? For example:\n- _\"Syllabus for class 8\"_\n- _\"8th class syllabus for Hasan Abdal\"_\n- _\"11th class test pattern\"_";
      } else if (classNum === 6 || classNum === 7) {
        reply = `**Entry Test Syllabus — Class ${classNum}**\n\n**Note:** Only a few colleges offer admission in Class ${classNum} (e.g., Cadet College Fateh Jang offers Class 6 & 7).\n\n**Subjects & Topics:**\n\n📘 **Mathematics (30-35%)**\n- Whole numbers, Fractions, Decimals\n- Basic Geometry (shapes, angles, perimeter, area)\n- Ratio and Proportion\n- Unitary Method\n- LCM & HCF\n\n📗 **English (25-30%)**\n- Basic Grammar (tenses, parts of speech)\n- Sentence correction\n- Vocabulary & Synonyms/Antonyms\n- Short reading comprehension\n- Fill in the blanks\n\n📕 **Urdu (15%)**\n- Urdu grammar basics (اسم، فعل، حرف)\n- محاورے اور ضرب الامثال\n- Short paragraph writing\n\n📙 **General Knowledge & Islamiat (15-20%)**\n- Islamic basics (نماز، روزے کی تعداد، کلمے)\n- Pakistan — capital, provinces, national symbols\n- Famous personalities\n- Basic Science facts\n\n📒 **Intelligence Test (10%)**\n- Pattern recognition\n- Number series\n- Odd one out\n\n**Format:** MCQs + short answer questions | **Duration:** 1.5 - 2 hours`;
        const collegesWithClass = allColleges.filter(c => {
          if (!c.admissionClasses) return false;
          const classes = c.admissionClasses.split(",").map(s => s.trim());
          return classes.includes(`${classNum}`);
        });
        if (collegesWithClass.length > 0) {
          reply += `\n\n**Colleges offering Class ${classNum} admission:**\n` + collegesWithClass.map(c => `- ${c.name}${c.contactNumber ? ` (📞 ${c.contactNumber})` : ""}${c.applyLink ? ` — [Website](${c.applyLink})` : ""}`).join("\n");
        }
      } else if (classNum === 8) {
        reply = `**Entry Test Syllabus — Class 8 (Most Common)**\n\nClass 8 entry is offered by almost all cadet colleges. The test is based on **Class 7 curriculum**.\n\n**Subjects & Topics:**\n\n📘 **Mathematics (30-40%)**\n- Integers, Fractions, Decimals, Percentages\n- Ratio, Proportion & Unitary Method\n- Algebra — basic expressions, linear equations\n- Geometry — lines, angles, triangles, circles\n- Mensuration — area, perimeter, volume\n- Data Handling — bar graphs, pie charts\n- Profit/Loss, Simple Interest\n\n📗 **English (20-30%)**\n- Parts of speech, Tenses (present, past, future)\n- Active/Passive voice, Direct/Indirect speech\n- Vocabulary — synonyms, antonyms, meanings\n- Comprehension passage\n- Sentence correction & transformation\n- Essay/Paragraph (some colleges)\n\n📕 **Urdu (10-15%)**\n- اردو گرامر (اسم، فعل، حروف، صفت)\n- محاورے، ضرب الامثال\n- خلاصہ نویسی / مضمون نویسی\n- نظم کی تشریح\n- خط نویسی\n\n📙 **General Knowledge / Islamiat (15-20%)**\n- Pakistan Studies — history, geography, constitution\n- Current Affairs — PM, President, COAS, important events\n- Islamic Studies — ارکان اسلام، نماز، قرآن مجید\n- Famous scientists, inventors, capitals\n- Basic everyday Science\n\n📒 **Intelligence / IQ Test (10-15%)**\n- Number series & patterns\n- Analogies (word & figure)\n- Odd one out\n- Coding-Decoding\n- Mirror images\n\n**Format:** Mostly MCQs (80-100 questions) + some subjective\n**Duration:** 2 - 3 hours\n**Passing marks:** Typically 50-60% (varies by college)`;
        if (matchedCollege) {
          reply += `\n\n**${matchedCollege.name}:**`;
          if (matchedCollege.contactNumber) reply += `\n📞 Contact: ${matchedCollege.contactNumber}`;
          if (matchedCollege.applyLink) reply += `\n🌐 Website: [${matchedCollege.applyLink}](${matchedCollege.applyLink})`;
        }
      } else if (classNum === 9) {
        reply = `**Entry Test Syllabus — Class 9**\n\n**Note:** Only a few colleges offer admission in Class 9. The test is based on **Class 8 curriculum**.\n\n**Subjects & Topics:**\n\n📘 **Mathematics (30-35%)**\n- Algebraic expressions & factorization\n- Linear equations & inequalities\n- Geometry — congruence, similarity, Pythagoras theorem\n- Mensuration — surface area, volume\n- Statistics & Probability basics\n- Sets & Functions\n\n📗 **English (25-30%)**\n- Grammar — all tenses, conditionals, modals\n- Active/Passive, Direct/Indirect speech\n- Comprehension & summary writing\n- Essay, letter, application writing\n- Vocabulary & idioms\n\n📕 **Urdu (15%)**\n- Advanced Urdu grammar\n- نثر و نظم کی تشریح\n- خلاصہ نویسی\n- درخواست نویسی\n\n📙 **Science (15-20%)**\n- Physics — motion, force, energy\n- Chemistry — atoms, elements, compounds\n- Biology — cell structure, human body systems\n\n📒 **General Knowledge & Islamiat (10%)**\n- Pakistan & Islamic studies\n- Current affairs\n\n**Format:** MCQs + subjective | **Duration:** 2.5 - 3 hours`;
        if (matchedCollege) {
          reply += `\n\n**${matchedCollege.name}:**`;
          if (matchedCollege.contactNumber) reply += `\n📞 Contact: ${matchedCollege.contactNumber}`;
          if (matchedCollege.applyLink) reply += `\n🌐 Website: [${matchedCollege.applyLink}](${matchedCollege.applyLink})`;
        }
      } else if (classNum === 11 || classNum === 10) {
        reply = `**Entry Test Syllabus — Class 11 (FSc/ICS Level)**\n\nSome cadet colleges offer admission in 1st Year (Class 11) after Matric. The test is based on **Matric (9th & 10th) curriculum**.\n\n**Subjects & Topics:**\n\n📘 **Mathematics (30-35%)**\n- Quadratic equations, Logarithms\n- Matrices, Determinants\n- Trigonometry — ratios, identities\n- Coordinate Geometry\n- Arithmetic & Geometric progressions\n- Sets, Functions, Variation\n\n📗 **English (20-25%)**\n- Advanced grammar — all tenses, clauses\n- Comprehension & precis writing\n- Essay, letter, story writing\n- Vocabulary, idioms, phrasal verbs\n- Translation (Urdu to English)\n\n📕 **Physics (15-20%)**\n- Kinematics, Dynamics, Work/Energy\n- Heat, Light, Sound\n- Electricity, Magnetism\n- Atomic Physics basics\n\n📗 **Chemistry (10-15%)**\n- Periodic table, Chemical bonding\n- Acids, Bases, Salts\n- Organic Chemistry basics\n- Chemical reactions & equations\n\n📙 **Biology (for Pre-Medical)**\n- Cell biology, Genetics basics\n- Human body systems\n- Plant biology\n- Ecology\n\n📒 **General Knowledge, Islamiat & Pak Studies (10%)**\n- Pakistan history & constitution\n- Islamic teachings\n- Current affairs\n\n**Format:** MCQs (100-150 questions) + subjective\n**Duration:** 3 hours\n\n**Colleges offering 11th Class entry:**`;
        const collegesWithFsc = allColleges.filter(c => {
          if (!c.admissionClasses) return false;
          const classes = c.admissionClasses.split(",").map(s => s.trim());
          return classes.includes("11");
        });
        if (collegesWithFsc.length > 0) {
          reply += "\n" + collegesWithFsc.map(c => `- ${c.name}${c.contactNumber ? ` (📞 ${c.contactNumber})` : ""}${c.applyLink ? ` — [Website](${c.applyLink})` : ""}`).join("\n");
        } else {
          reply += "\n- Cadet College Kohat, Cadet College Hasan Abdal, Military College Jhelum, and several others";
        }
        if (matchedCollege) {
          reply += `\n\n**${matchedCollege.name}:**`;
          if (matchedCollege.contactNumber) reply += `\n📞 Contact: ${matchedCollege.contactNumber}`;
          if (matchedCollege.applyLink) reply += `\n🌐 Website: [${matchedCollege.applyLink}](${matchedCollege.applyLink})`;
        }
      } else {
        reply = `I don't have specific syllabus information for Class ${classNum}.\n\nCadet college admissions are typically held for:\n- **Class 6** (limited colleges like Fateh Jang)\n- **Class 7** (some colleges)\n- **Class 8** (most common — majority of colleges)\n- **Class 9** (few colleges)\n- **Class 11** (FSc/ICS level)\n\nPlease ask about one of these classes, e.g. _\"syllabus for class 8\"_`;
      }

      if (classNum && !matchedCollege) {
        reply += "\n\n💡 **Tip:** Ask about a specific college's syllabus — e.g. _\"class 8 syllabus for Hasan Abdal\"_ — for college-specific details and contact info.";
      }

      reply += "\n\nRegister on our portal to practice subject-wise MCQs and take mock tests!";
    } else if (lowerMsg.includes("interview") || lowerMsg.includes("viva")) {
      reply = "Beta, interview ki tayyari bohat zaroori hai! 😊 Written test pass karne ke baad yeh next step hai.\n\n**Interview Preparation**\n\n**Common Questions jo zaroor poochhe jaate hain:**\n- Apna taaruf bataiye (Tell me about yourself)\n- Cadet college kyun join karna chahte ho?\n- Pakistan ke provinces aur un ke capitals?\n- Current Prime Minister / President / COAS?\n- Apka favourite subject aur kyun?\n- Apke father kya karte hain?\n- Apne school mein koi achievement?\n- Islam ke 5 arkaan bataiye\n\n**Tips jo follow karo:**\n- Saaf suthre formal kapre pehno 👔\n- Eye contact maintain karo\n- Aahistagi se aur confidence se bolo\n- Pakistan ke baare mein basic facts yaad karo\n- Sachchi baat bolo — panel ko pata chal jaata hai!\n- Hands mat hilao, seedha khare ho kar baat karo\n\nHumare portal par **Interview Prep section** hai jismein **50+ practice questions** hain with model answers! 💪\n\n[Register karo](/register) aur interview ki complete tayyari karo!";
    } else if (lowerMsg.includes("medical") || lowerMsg.includes("physical") || lowerMsg.includes("health")) {
      reply = "Beta, medical test bhi bohat important hai! 😊 Interview ke baad yeh hota hai.\n\n**Medical & Physical Test**\n\n**Medical Tests:**\n- Vision test (6/6 eyesight preferred — chashmay walon ke liye mushkil ho sakta hai)\n- Hearing test\n- Blood tests (CBC, blood group)\n- Chest X-ray\n- General physical examination\n- Dental check-up\n\n**Physical Standards:**\n- Height and weight apni age ke mutabiq honi chahiye\n- Flat feet ya knock knees nahi honi chahiyen\n- Color blindness nahi honi chahiye\n- Teeth saaf aur healthy\n\n**Tips jo abhi se follow karo:**\n- Roz exercise karo — at least 30 minutes running/sports 🏃\n- Balanced diet khao — doodh, fruits, sabziyaan\n- Test se pehle achi neend lo\n- Purane medical records saath le kar jao\n- Agar chashmay hain toh doctor se mil lo\n\nHumare portal par **Medical Prep section** hai jismein detailed guidance hai! Portal par register karo aur sab kuch access karo. 💪";
    } else if (lowerMsg.includes("hasan abdal") || lowerMsg.includes("hasanabdal")) {
      const college = (await storage.getColleges()).find(c => c.name.toLowerCase().includes("hasan abdal"));
      reply = "**Cadet College Hasan Abdal**\n\n- **Location:** Hasan Abdal, Punjab\n- **Established:** 1954\n- One of the **oldest and most prestigious** cadet colleges\n- Entry at **Class 8** level\n- Produces many top military officers\n- Beautiful campus near Taxila\n\nIt is considered the 'Eton of Pakistan' for its academic excellence and discipline.";
      if (college?.feeStructure) reply += `\n\n**Fee Structure:** ${college.feeStructure}`;
      if (college?.applyLink) reply += `\n\n**Website:** [${college.applyLink}](${college.applyLink})`;
    } else if (lowerMsg.includes("petaro")) {
      const college = (await storage.getColleges()).find(c => c.name.toLowerCase().includes("petaro"));
      reply = "**Cadet College Petaro**\n\n- **Location:** Petaro, Sindh\n- **Established:** 1957\n- Premier institution in **Sindh**\n- Known for excellent **academic record**\n- Beautiful campus with modern facilities\n- Produces many distinguished alumni";
      if (college?.feeStructure) reply += `\n\n**Fee Structure:** ${college.feeStructure}`;
    } else if (lowerMsg.includes("kohat")) {
      const college = (await storage.getColleges()).find(c => c.name.toLowerCase().includes("kohat"));
      reply = "**Cadet College Kohat**\n\n- **Location:** Kohat, KPK\n- Leading cadet college in **Khyber Pakhtunkhwa**\n- Known for strong discipline and academics\n- Modern facilities and experienced faculty\n- Entry available at Class 7 and 8 levels";
      if (college?.feeStructure) reply += `\n\n**Fee Structure:** ${college.feeStructure}`;
      if (college?.applyLink) reply += `\n\n**Website:** [${college.applyLink}](${college.applyLink})`;
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
    } else if (lowerMsg.includes("preparation") || lowerMsg.includes("prepare") || lowerMsg.includes("tips") || lowerMsg.includes("how to") || lowerMsg.includes("tayyari") || lowerMsg.includes("tayari") || lowerMsg.includes("ready") || lowerMsg.includes("start") || lowerMsg.includes("shuru") || lowerMsg.includes("guide") || lowerMsg.includes("help me") || lowerMsg.includes("madad")) {
      reply = `Beta, bohat achi baat hai ke tum tayyari karna chahte ho! 💪 Yeh decision tumhari zindagi badal sakta hai!\n\n**Preparation Tips:**\n\n1. 📅 **Start 3-6 months before** the exam — jaldi shuru karo, late mat karo!\n2. 📚 **Daily 2-3 hours** padho — consistency is key\n3. 🔢 **Math par sabse zyada focus** karo — yeh 30-40% weightage hai\n4. ✍️ **Daily MCQs** practice karo — at least 25-30 questions\n5. 📰 **Newspaper** padho for current affairs & GK\n6. 🏃 **Exercise daily** — physical fitness bhi zaroori hai\n7. 📝 **Weekly mock tests** do — real exam jaisa practice\n8. 👥 **Group study** bhi helpful hai\n\n---\n\n**Humare Portal ki Khas Baat:** 🌟\n\nHum tumhare liye **complete online preparation system** banaya hai:\n\n✅ **AI Smart Tutor** — bilkul live teacher ki tarah guide karta hai, tumse baat karta hai!\n✅ **Daily MCQ Tests** — subject-wise practice (Math, English, Urdu, GK, Science)\n✅ **Quizzes & Mock Tests** — real exam pattern ke mutabiq\n✅ **Interview Preparation** — 50+ practice questions with model answers\n✅ **Medical Guide** — kya expect karna hai\n✅ **PDF Papers** — download karo aur offline practice karo\n\n**Our Packages:**\n- 🆓 **Free Trial (3 days)** — Register karo aur try karo, bilkul free!\n- 💰 **Standard (Rs. 500/month)** — Unlimited access to everything\n- 👑 **Premium (Rs. 2,000/6 months)** — Best value + WhatsApp support + progress tracking\n\nBeta, **abhi [register karo](/register)** aur apni tayyari shuru karo! Pehle 3 din bilkul **FREE** hain! 😊\n\nHum tumhare saath hain is journey mein. InshAllah kamyabi milegi! 🤲`;
    } else if (/^(class\s*)?\d+(th|st|nd|rd)?(\s*class)?$/i.test(lowerMsg)) {
      const numMatch = lowerMsg.match(/(\d+)/);
      const num = numMatch ? parseInt(numMatch[1]) : 0;
      if ([6, 7, 8, 9, 10, 11].includes(num)) {
        reply = `You mentioned **Class ${num}**. What would you like to know?\n\n- _\"Syllabus for class ${num}\"_ — entry test subjects & topics\n- _\"Fee of class ${num}\"_ — fee information\n- _\"Admission class ${num}\"_ — admission process\n\nOr ask about a specific college: _\"class ${num} syllabus for Hasan Abdal\"_`;
      } else {
        reply = `Cadet college admissions are typically for **Class 6, 7, 8, 9, or 11**. Class ${num} is not a standard entry point.\n\nPlease ask about one of the available classes, e.g. _\"syllabus for class 8\"_`;
      }
    } else if (lowerMsg.includes("thank") || lowerMsg.includes("shukriya") || lowerMsg.includes("jazak") || lowerMsg.includes("thanks")) {
      reply = "Alhamdulillah! 😊 Bohat khushi hui beta ke main tumhari madad kar saka. Yaad rakhna, mehnat ka phal zaroor milta hai!\n\nAgar aur koi sawal ho toh kabhi bhi pooch lena. Main hamesha yahan hoon tumhare liye! 💪\n\nInshAllah tum zaroor kamyab hoge! 🤲\n\n**WhatsApp:** +923348480890\n**Website:** [www.pakshaheens.com](https://www.pakshaheens.com)";
    } else if (lowerMsg.includes("who are you") || lowerMsg.includes("tum kaun") || lowerMsg.includes("kon ho") || lowerMsg.includes("your name") || lowerMsg.includes("naam")) {
      reply = "Main hoon tumhara **Shaheen Bot** 😊 — Cadet Colleges Test Preparation Portal ka AI assistant!\n\nMera kaam hai tumhari madad karna cadet college ke entry test ki tayyari mein. Main bilkul ek teacher ki tarah tumse baat karta hoon aur tumhare sawalat ka jawab deta hoon.\n\nMujh se pooch sakte ho:\n- Admission process aur requirements\n- Syllabus aur test pattern\n- College ki information\n- Fee structure\n- Interview aur medical ki tayyari\n- Preparation tips aur resources\n\nBolo beta, kya jaanna hai? 😊";
    } else if (isCadetRelated) {
      reply = `Bohat acha sawal hai beta! 😊\n\nMain tumhe in topics mein madad kar sakta hoon:\n- **Admissions** — dates, requirements, process\n- **Entry Test** — syllabus, pattern, tips\n- **Colleges** — list, details, locations\n- **Fees** — college-wise fee structure\n- **Interview** — common questions, preparation\n- **Medical** — physical standards, tests\n- **Preparation** — online daily tests, quizzes, AI tutoring\n\nKisi bhi topic ke baare mein pooch lo, main detail mein bataonga! 😊\n\nAur agar test ki tayyari karni hai toh [register karo](/register) — pehle **3 din FREE trial** hai! 💪`;
    } else {
      reply = `Beta, main specifically **cadet college** se related sawalat mein madad karta hoon 😊\n\nMain help kar sakta hoon:\n- Admissions aur eligibility\n- Entry test ki tayyari\n- College information (29 colleges across Pakistan)\n- Fee structures aur scholarships\n- Interview aur medical ki tayyari\n- Online preparation — daily tests, quizzes, AI tutor\n\nAgar koi aur madad chahiye toh humse contact karo:\n**WhatsApp:** [+923348480890](https://wa.me/923348480890)\n**Website:** [www.pakshaheens.com](https://www.pakshaheens.com)\n\nBolo, cadet college ke baare mein kya jaanna hai? 😊`;
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

    const user = await storage.getUser(req.session.userId!);
    const studentName = user?.name ? user.name.split(" ")[0] : "beta";
    const syllabusData = await storage.getSyllabus();
    const subjects = [...new Set(syllabusData.filter(s => !level || s.level === level).map(s => s.subject))];

    let reply = "";
    const lowerMsg = message.toLowerCase();

    const greetings = ["hi", "hello", "assalam", "salam", "aoa", "hey", "good morning", "good evening"];
    const isGreeting = greetings.some(g => lowerMsg.startsWith(g) || lowerMsg === g);

    if (isGreeting) {
      reply = `Wa-Alaikum-Assalam ${studentName}! 😊 Bohat khushi hui tumse mil ke!\n\nMain tumhara **personal tutor** hoon. Main yahan hoon tumhare saath har qadam par — bilkul ek teacher ki tarah!\n\nAaj kya padhna hai? Bolo:\n- 📘 **Math** — numbers, algebra, geometry\n- 📗 **English** — grammar, vocabulary, comprehension\n- 📕 **Urdu** — grammar, essay, poetry\n- 📙 **GK/Science** — Pakistan studies, current affairs, science\n- 📝 **Quick Quiz** — test your knowledge!\n\nYa phir koi topic bolo, main explain kar deta hoon! 😊`;
    } else if (lowerMsg.includes("math") || lowerMsg.includes("mathematics") || lowerMsg.includes("hisab")) {
      reply = `Shabash ${studentName}! 💪 Math padhna bohat zaroori hai — entry test mein **30-40% questions** math se aate hain!\n\nChalo shuru karte hain. Yeh key topics hain:\n\n📘 **Number System**\n- Whole numbers, Fractions, Decimals\n- LCM & HCF\n- Percentage, Ratio, Proportion\n\n📐 **Geometry**\n- Lines, Angles, Triangles\n- Area, Perimeter, Volume\n- Circle properties\n\n🔢 **Algebra**\n- Basic equations\n- Simplification\n- Word problems\n\n📊 **Arithmetic**\n- Profit/Loss\n- Simple Interest\n- Average, Speed, Time, Distance\n\nKis topic se shuru karein? Bolo toh main usko detail mein samjhata hoon! Ya bolo **"quiz"** toh main MCQs deta hoon practice ke liye! 😊`;
    } else if (lowerMsg.includes("english") || lowerMsg.includes("angrezi")) {
      reply = `Great choice ${studentName}! 😊 English mein ache marks laana bohat zaroori hai.\n\nLet's focus on key areas:\n\n📗 **Grammar (Most Important!)**\n- Tenses — Present, Past, Future (Simple, Continuous, Perfect)\n- Parts of Speech — Noun, Verb, Adjective, Adverb\n- Active/Passive Voice\n- Direct/Indirect Speech\n- Articles (a, an, the)\n- Prepositions\n\n📖 **Vocabulary**\n- Synonyms & Antonyms\n- One-word substitutions\n- Idioms & Phrases\n- Fill in the blanks\n\n📄 **Comprehension**\n- Reading passages\n- Answering questions from the passage\n- Summary writing\n\nKis cheez se shuru karein ${studentName}? Grammar se ya vocabulary se? Ya bolo **"quiz"** toh main MCQs deta hoon! 😊\n\n💡 **Tip:** Roz 10 new English words yaad karo with meanings!`;
    } else if (lowerMsg.includes("science") || lowerMsg.includes("general knowledge") || lowerMsg.includes("gk") || lowerMsg.includes("pakistan") || lowerMsg.includes("islamiat") || lowerMsg.includes("islamic")) {
      reply = `Bohat acha ${studentName}! 😊 GK aur Science mein strong hona bohat zaroori hai.\n\n📙 **Pakistan Studies**\n- Pakistan ka geography — provinces, capitals, rivers, mountains\n- Important dates — 14 August 1947, 23 March 1940, etc.\n- Leaders — Quaid-e-Azam, Allama Iqbal\n- Current PM, President, COAS, Chief Justice\n\n🌍 **Current Affairs**\n- Recent important events\n- Pakistan ke neighbours\n- International organizations (UN, OIC, SAARC)\n\n🔬 **Basic Science**\n- Solar System — planets, sun, moon\n- Human Body — organs, senses\n- Plants — photosynthesis, parts of plant\n- Animals — classification\n- Simple machines, magnets\n\n☪️ **Islamiat**\n- Arkaan-e-Islam (5 pillars)\n- Kalimay\n- Prophets' names\n- Basic Quran knowledge\n- Namaz ki rakaat\n\nKis topic se shuru karein? Main samjhata hoon! 😊`;
    } else if (lowerMsg.includes("urdu")) {
      reply = `Shabash ${studentName}! 😊 Urdu bhi important subject hai.\n\n📕 **Urdu Grammar**\n- **اسم** (Noun) — اسم معرفہ، اسم نکرہ\n- **فعل** (Verb) — ماضی، حال، مستقبل\n- **حرف** (Preposition) — حرف جار، حرف عطف\n- **صفت** (Adjective)\n- **ضمیر** (Pronoun)\n\n✍️ **Writing Skills**\n- خط نویسی (Letter writing)\n- مضمون نویسی (Essay writing)\n- درخواست نویسی (Application writing)\n- خلاصہ نویسی (Summary writing)\n\n📚 **Literature**\n- محاورے اور ضرب الامثال\n- نظم کی تشریح\n- نثر کی تشریح\n\n📝 **Practice**\n- اردو ترجمہ (Translation)\n- خالی جگہ پر کریں\n- درست جواب کا انتخاب\n\nKis topic se shuru karein ${studentName}? Ya bolo **"quiz"** toh Urdu MCQs deta hoon! 😊`;
    } else if (lowerMsg.includes("quiz") || lowerMsg.includes("mcq") || lowerMsg.includes("test") || lowerMsg.includes("sawal") || lowerMsg.includes("question")) {
      reply = `Chalo ${studentName}, quiz time! 💪 Dekho kitne sahi karte ho:\n\n**Q1:** Pakistan ka sabse lamba darya kaunsa hai?\nA) Ravi  B) Chenab  C) **Indus (Sindh)**  D) Jhelum\n\n**Q2:** 3/4 ko percentage mein likho?\nA) 60%  B) **75%**  C) 80%  D) 70%\n\n**Q3:** "He ___ to school every day." (Choose correct option)\nA) go  B) going  C) **goes**  D) gone\n\n**Q4:** Pakistan mein kitne provinces hain?\nA) 3  B) **4**  C) 5  D) 6\n\n**Q5:** اسلام کے ارکان کتنے ہیں؟\nA) 3  B) 4  C) **5**  D) 6\n\nAnswers: Q1-C, Q2-B, Q3-C, Q4-B, Q5-C\n\nKitne sahi kiye ${studentName}? 😊 Agar 4/5 ya zyada aaye toh **Mashallah!** 🌟\nAgar kum aaye toh fikar mat karo, practice se sab theek ho jayega! 💪\n\nAur quiz chahiye? Bolo subject ka naam aur main deta hoon! Ya MCQ section mein jao full practice ke liye!`;
    } else if (lowerMsg.includes("thank") || lowerMsg.includes("shukriya") || lowerMsg.includes("jazak")) {
      reply = `Alhamdulillah ${studentName}! 😊 Mujhe bohat khushi hai ke main tumhari madad kar saka.\n\nYaad rakhna: **Mehnat ka phal zaroor milta hai!** Roz thodi thodi practice karo aur InshAllah tum zaroor select ho jaoge! 🤲\n\nJab bhi mann kare padhne ka, yahan aa jao — main hamesha tumhare liye available hoon! 💪\n\nKeep going, ${studentName}! Tum bohat ache kar rahe ho! 🌟`;
    } else if (lowerMsg.includes("bore") || lowerMsg.includes("tired") || lowerMsg.includes("mushkil") || lowerMsg.includes("difficult") || lowerMsg.includes("hard") || lowerMsg.includes("nahi samajh") || lowerMsg.includes("confused")) {
      reply = `${studentName}, fikar mat karo! 😊 Har cheez pehle mushkil lagti hai, phir asan ho jaati hai.\n\nJab mujhe boring lagta hai ya mushkil lagti hai, toh main yeh karta hoon:\n\n1. 🧘 **5 minute break** lo — pani piyo, walk karo\n2. 🎯 **Chhota goal** set karo — sirf 5 MCQs solve karo\n3. 🔄 **Subject change** karo — agar Math mushkil lag raha hai toh GK padho\n4. 📝 **Quiz mode** try karo — game ki tarah padho!\n5. 💪 **Yaad karo** — cadet college mein jaana hai!\n\nChalo, kuch aur try karte hain. Bolo kaunsa subject padhein? Ya main tumhe ek easy quiz doon? 😊\n\nTum bohat ache ho ${studentName}, bus thodi aur mehnat! InshAllah ho jayega! 🤲`;
    } else if (lowerMsg.includes("score") || lowerMsg.includes("marks") || lowerMsg.includes("kitne") || lowerMsg.includes("result") || lowerMsg.includes("progress")) {
      reply = `${studentName}, bohat acha hai ke tum apni progress check kar rahe ho! 😊\n\nRegular practice karte raho aur apni performance improve karo. Entry test mein typically:\n\n- **50-60%** marks chahiye pass hone ke liye\n- **70%+** marks se acha chance hai selection ka\n- **80%+** marks se bohat strong position!\n\n**Tips for better marks:**\n1. Roz kam se kam **25-30 MCQs** practice karo\n2. Weak subjects par extra time do\n3. MCQ section mein jao aur practice karo 📝\n4. PDF papers download karo aur solve karo\n\nMehnat karte raho ${studentName}! Tum zaroor kamyab hoge InshAllah! 💪🌟`;
    } else {
      reply = `${studentName}, main tumhara **personal tutor** hoon aur hamesha tumhare saath hoon! 😊\n\nMain in subjects mein tumhari madad kar sakta hoon:\n\n${subjects.length > 0 ? subjects.map((s, i) => `${i + 1}. 📚 **${s}**`).join("\n") : "1. 📘 **Mathematics**\n2. 📗 **English**\n3. 📕 **Urdu**\n4. 📙 **General Knowledge**\n5. 🔬 **Science**"}\n\nBus subject ka naam bolo aur main tumhe:\n- 📖 Topic explain karunga\n- 📝 Practice MCQs dunga\n- 🧠 Quick quiz dunga\n- 💡 Tips aur tricks bataunga\n\nKya padhna hai aaj ${studentName}? Chalo shuru karte hain! 💪\n\n_Remember: Every expert was once a beginner!_ 🌟`;
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
