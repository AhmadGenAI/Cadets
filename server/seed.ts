import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users, provinces, colleges, packages, pages, blogPosts, mcqBank, settings } from "@shared/schema";

export async function seedDatabase() {
  const existingProvinces = await storage.getProvinces();
  if (existingProvinces.length > 0) return;

  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");
  await db.insert(users).values({
    mobile: "03000000000",
    passwordHash: adminPassword,
    name: "Admin",
    role: "admin",
    isActive: true,
  });

  const punjab = await storage.createProvince({ name: "Punjab", imageUrl: "/images/province-punjab.png", sortOrder: 1 });
  const sindh = await storage.createProvince({ name: "Sindh", imageUrl: "/images/province-sindh.png", sortOrder: 2 });
  const kpk = await storage.createProvince({ name: "Khyber Pakhtunkhwa", imageUrl: "/images/province-kpk.png", sortOrder: 3 });
  const balochistan = await storage.createProvince({ name: "Balochistan", imageUrl: "/images/province-balochistan.png", sortOrder: 4 });

  await storage.createCollege({ name: "Cadet College Hasan Abdal", provinceId: punjab.id, city: "Hasan Abdal", lastApplyDate: "2026-06-15", isFeatured: true });
  await storage.createCollege({ name: "Lawrence College Ghora Gali", provinceId: punjab.id, city: "Murree", lastApplyDate: "2026-05-30", isFeatured: true });
  await storage.createCollege({ name: "Military College Jhelum", provinceId: punjab.id, city: "Jhelum", lastApplyDate: "2026-06-01", isFeatured: false });
  await storage.createCollege({ name: "Cadet College Petaro", provinceId: sindh.id, city: "Petaro", lastApplyDate: "2026-07-15", isFeatured: true });
  await storage.createCollege({ name: "Cadet College Larkana", provinceId: sindh.id, city: "Larkana", lastApplyDate: "2026-07-01", isFeatured: false });
  await storage.createCollege({ name: "Cadet College Razmak", provinceId: kpk.id, city: "Razmak", lastApplyDate: "2026-06-20", isFeatured: true });
  await storage.createCollege({ name: "Cadet College Kohat", provinceId: kpk.id, city: "Kohat", lastApplyDate: "2026-06-10", isFeatured: false });
  await storage.createCollege({ name: "Cadet College Mastung", provinceId: balochistan.id, city: "Mastung", isFeatured: false });

  await storage.createPackage({
    name: "Free Trial",
    price: 0,
    durationDays: 3,
    featuresJson: ["Access to AI Tutor", "5 MCQs per day", "Interview tips", "Medical guide"],
    isActive: true,
  });
  await storage.createPackage({
    name: "Standard",
    price: 500,
    durationDays: 30,
    featuresJson: ["Unlimited AI Tutor access", "Unlimited MCQs & quizzes", "Mock tests", "Interview preparation", "Medical tips", "PDF generation", "Email reminders"],
    isActive: true,
  });
  await storage.createPackage({
    name: "6 Months Premium",
    price: 2000,
    durationDays: 180,
    featuresJson: ["Everything in Standard", "Priority support", "College-specific prep", "Advanced mock tests", "Progress tracking", "Syllabus coverage reports", "WhatsApp support"],
    isActive: true,
  });

  await storage.createPage({
    title: "About Us",
    slug: "about",
    content: "<h2>About Cadet Colleges Test Preparation Portal</h2><p>Cadet Colleges Test Preparation Portal is Pakistan's premier online preparation platform for cadet college entrance exams. We provide comprehensive preparation tools including AI-powered tutoring, practice tests, interview preparation, and medical exam guidance.</p><p>Our mission is to make quality cadet college preparation accessible to every student across Pakistan, regardless of their location or background.</p><h3>Our Vision</h3><p>To be the leading educational technology platform empowering the next generation of Pakistan's military leaders.</p>",
    isPublished: true,
  });
  await storage.createPage({
    title: "Terms of Service",
    slug: "terms",
    content: "<h2>Terms of Service</h2><p>By using Cadet Colleges Test Preparation Portal, you agree to the following terms and conditions.</p><h3>Account Registration</h3><p>You must provide a valid mobile number to register. Each mobile number can only be used for one account.</p><h3>Free Trial</h3><p>New users receive a free trial period. After the trial expires, a paid subscription is required to continue using premium features.</p><h3>Refund Policy</h3><p>Contact our WhatsApp support for any refund requests within 7 days of purchase.</p>",
    isPublished: true,
  });
  await storage.createPage({
    title: "Privacy Policy",
    slug: "privacy",
    content: "<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p><h3>Information We Collect</h3><p>We collect your mobile number, name, email (optional), and study preferences to provide personalized preparation.</p><h3>Data Security</h3><p>All passwords are encrypted and stored securely. We never share your personal information with third parties.</p>",
    isPublished: true,
  });

  await storage.createBlogPost({
    title: "How to Prepare for Cadet College Entry Test 2026",
    slug: "how-to-prepare-cadet-college-2026",
    content: "<p>Preparing for cadet college entry tests requires a structured approach. Here are our top tips:</p><h3>1. Start Early</h3><p>Begin your preparation at least 3-6 months before the exam date. This gives you enough time to cover all subjects thoroughly.</p><h3>2. Focus on Core Subjects</h3><p>Mathematics, English, Urdu, and General Knowledge are the four pillars of the entry test. Allocate time to each subject daily.</p><h3>3. Practice MCQs Daily</h3><p>Solve at least 25 MCQs every day. This builds your speed and accuracy for the actual exam.</p><h3>4. Join Online Preparation</h3><p>Use platforms like Cadet Colleges Test Preparation Portal that provide AI-tutoring and topic-wise preparation.</p>",
    isPublished: true,
    publishedAt: new Date(),
  });
  await storage.createBlogPost({
    title: "Top 10 Cadet Colleges in Pakistan - Complete Guide",
    slug: "top-10-cadet-colleges-pakistan",
    content: "<p>Pakistan has some of the finest cadet colleges in the world. Here is our guide to the top institutions:</p><h3>1. Cadet College Hasan Abdal</h3><p>Located in Punjab, it is one of the oldest and most prestigious cadet colleges in Pakistan.</p><h3>2. Lawrence College Ghora Gali</h3><p>Set in the scenic hills of Murree, Lawrence College has a rich history dating back to 1860.</p><h3>3. Cadet College Petaro</h3><p>A premier institution in Sindh known for its excellent academic record.</p><p>Each college has its own unique culture, facilities, and entry requirements. Research thoroughly before applying.</p>",
    isPublished: true,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  const mcqs = [
    { level: "middle", subject: "Mathematics", questionText: "What is 25% of 200?", optionsJson: { a: "25", b: "50", c: "75", d: "100" }, correctOption: "b", explanation: "25% of 200 = (25/100) x 200 = 50" },
    { level: "middle", subject: "Mathematics", questionText: "If x + 5 = 12, what is x?", optionsJson: { a: "5", b: "6", c: "7", d: "8" }, correctOption: "c", explanation: "x = 12 - 5 = 7" },
    { level: "middle", subject: "Mathematics", questionText: "What is the area of a rectangle with length 8 and width 5?", optionsJson: { a: "13", b: "26", c: "40", d: "45" }, correctOption: "c", explanation: "Area = length x width = 8 x 5 = 40" },
    { level: "middle", subject: "English", questionText: "Choose the correct spelling:", optionsJson: { a: "Recieve", b: "Receive", c: "Receve", d: "Recieve" }, correctOption: "b", explanation: "The correct spelling follows the 'i before e except after c' rule." },
    { level: "middle", subject: "English", questionText: "What is the past tense of 'go'?", optionsJson: { a: "Goed", b: "Gone", c: "Went", d: "Going" }, correctOption: "c", explanation: "'Went' is the simple past tense of 'go'." },
    { level: "middle", subject: "English", questionText: "Select the correct sentence:", optionsJson: { a: "He don't know", b: "He doesn't know", c: "He doesn't knows", d: "He not know" }, correctOption: "b", explanation: "With third person singular (he/she/it), we use 'doesn't' + base verb." },
    { level: "middle", subject: "General Knowledge", questionText: "What is the capital of Pakistan?", optionsJson: { a: "Lahore", b: "Karachi", c: "Islamabad", d: "Peshawar" }, correctOption: "c", explanation: "Islamabad is the capital of Pakistan since 1967." },
    { level: "middle", subject: "General Knowledge", questionText: "How many provinces does Pakistan have?", optionsJson: { a: "3", b: "4", c: "5", d: "6" }, correctOption: "b", explanation: "Pakistan has 4 provinces: Punjab, Sindh, KPK, and Balochistan." },
    { level: "middle", subject: "General Knowledge", questionText: "Which is the longest river of Pakistan?", optionsJson: { a: "Ravi", b: "Chenab", c: "Indus", d: "Jhelum" }, correctOption: "c", explanation: "The Indus River (Darya-e-Sindh) is the longest river in Pakistan." },
    { level: "middle", subject: "General Knowledge", questionText: "Pakistan became independent on:", optionsJson: { a: "14 August 1947", b: "23 March 1940", c: "15 August 1947", d: "26 January 1950" }, correctOption: "a", explanation: "Pakistan gained independence on 14 August 1947." },
    { level: "middle", subject: "Science", questionText: "What is the chemical formula for water?", optionsJson: { a: "CO2", b: "H2O", c: "O2", d: "NaCl" }, correctOption: "b", explanation: "Water is composed of 2 hydrogen atoms and 1 oxygen atom: H2O." },
    { level: "middle", subject: "Science", questionText: "Which planet is closest to the Sun?", optionsJson: { a: "Venus", b: "Earth", c: "Mercury", d: "Mars" }, correctOption: "c", explanation: "Mercury is the closest planet to the Sun in our solar system." },
  ];

  for (const mcq of mcqs) {
    await storage.createMcq(mcq);
  }

  await storage.setSetting("trial_days", 3);
  await storage.setSetting("site_name", "Cadet Colleges Test Preparation Portal");

  console.log("Seed data inserted successfully.");
}
