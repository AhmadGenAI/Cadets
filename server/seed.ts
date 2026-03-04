import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users, provinces, colleges, packages, pages, blogPosts, mcqBank, settings } from "@shared/schema";

export async function seedDatabase() {
  const { seedAssessmentQuestions } = await import("./assessment-seed");
  await seedAssessmentQuestions();

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
  const ajk = await storage.createProvince({ name: "Azad Jammu & Kashmir", imageUrl: "/images/province-ajk.png", sortOrder: 5 });
  await storage.createProvince({ name: "Gilgit-Baltistan", imageUrl: "/images/province-gb.png", sortOrder: 6 });
  await storage.createProvince({ name: "Islamabad Capital Territory", imageUrl: "/images/province-ict.png", sortOrder: 7 });

  await storage.createCollege({ name: "Cadet College Hasan Abdal", provinceId: punjab.id, city: "Hasan Abdal", applyLink: "https://cch.edu.pk", isFeatured: true, feeStructure: "One-Time: Registration Rs. 7,000. Admission Fee Rs. 2,000. Fee collected quarterly in advance. Late fee Rs. 200/day. Historical annual fee ~Rs. 150,000-175,000 (varies by class). Contact: admission@cch.edu.pk, 0343-1-224-224. Website: cch.edu.pk/fee-structure" });
  await storage.createCollege({ name: "Lawrence College Ghora Gali", provinceId: punjab.id, city: "Murree", isFeatured: true, feeStructure: "Admission form (in person): Rs. 1,000. By post: Rs. 1,500. Test fee: Rs. 5,000 (non-refundable). Estimated annual fee Rs. 300,000-500,000 (boarding included). Contact college for exact current fee." });
  await storage.createCollege({ name: "Military College Jhelum", provinceId: punjab.id, city: "Jhelum", applyLink: "https://ccj.edu.pk", isFeatured: false, feeStructure: "Monthly Fee: Civilians ~Rs. 33,000. Army Officers (Serving/Retired) ~Rs. 23,000. JCOs & Soldiers ~Rs. 18,000. Other Defence (PAF/PN/MES) treated as Civilians. Includes tuition, messing, hostel." });
  await storage.createCollege({ name: "PAF College Sargodha", provinceId: punjab.id, city: "Sargodha", isFeatured: true, feeStructure: "PAF-run institution. Estimated monthly fee Rs. 20,000-30,000. Special fee concessions for PAF personnel children. Includes tuition, hostel, messing." });
  await storage.createCollege({ name: "PAF Cadet College Murree Lower Topa", provinceId: punjab.id, city: "Murree", isFeatured: true, feeStructure: "PAF-run institution in Murree. Estimated monthly fee Rs. 20,000-30,000. Special concessions for PAF/Armed Forces children." });
  await storage.createCollege({ name: "Cadet College Lahore", provinceId: punjab.id, city: "Lahore", applyLink: "https://www.cadetcollegelahore.com", isFeatured: false, feeStructure: "Registration: Rs. 5,000. Admission: Rs. 5,000. Entrance test: Rs. 5,000 (bank draft). Monthly fee Rs. 25,000-35,000 (varies by grade). Includes tuition, boarding, meals." });
  await storage.createCollege({ name: "Cadet College Jhang", provinceId: punjab.id, city: "Jhang", applyLink: "https://cadetcollegejhang.com", isFeatured: false, feeStructure: "Fee details on website: cadetcollegejhang.com/fee-scholarships. Scholarships available for deserving students." });
  await storage.createCollege({ name: "Cadet College Fateh Jang", provinceId: punjab.id, city: "Fateh Jang", applyLink: "https://ccf.edu.pk", isFeatured: false, feeStructure: "One-Time Admission Charges: Rs. 110,000 (Admission Fee Rs. 50,000 + Development Fund Rs. 30,000 + Annual Charges Rs. 30,000). Monthly Fee: Rs. 41,500-42,500 per month (includes tuition Rs. 4,000/month, hostel, messing, laundry). Fee paid in 2-month terms. Classes 6th, 7th, 8th, 9th & 11th." });
  await storage.createCollege({ name: "Military College Murree", provinceId: punjab.id, city: "Murree", isFeatured: false, feeStructure: "Military-run institution. Estimated monthly fee Rs. 25,000-40,000. Special concessions for military personnel children." });
  await storage.createCollege({ name: "Pakistan Cadet School & College Murree", provinceId: punjab.id, city: "Murree", applyLink: "https://pakistancadetcollege.com", isFeatured: false, feeStructure: "Prospectus: Rs. 1,500 (cash or bank draft). Special fee concession and quota for kids of Army/Martyrs and FATA region." });
  await storage.createCollege({ name: "Cadet College Chakwal", provinceId: punjab.id, city: "Chakwal", isFeatured: false, feeStructure: "Estimated monthly fee Rs. 20,000-30,000 including tuition, boarding, messing." });
  await storage.createCollege({ name: "Cadet College Sargodha", provinceId: punjab.id, city: "Sargodha", isFeatured: false, feeStructure: "Estimated monthly fee Rs. 20,000-30,000 including tuition, boarding, messing." });

  await storage.createCollege({ name: "Cadet College Petaro", provinceId: sindh.id, city: "Petaro", isFeatured: true, feeStructure: "Entry test fee: Rs. 4,000 (non-refundable). Both Matriculation and Cambridge systems available. Estimated annual fee Rs. 200,000-350,000." });
  await storage.createCollege({ name: "Cadet College Larkana", provinceId: sindh.id, city: "Larkana", isFeatured: false, feeStructure: "Estimated annual fee Rs. 150,000-250,000 including boarding and messing." });
  await storage.createCollege({ name: "Cadet College Ghotki", provinceId: sindh.id, city: "Ghotki", isFeatured: false, feeStructure: "Sindh government-subsidized. Estimated annual fee Rs. 120,000-200,000." });
  await storage.createCollege({ name: "PAF College Karachi", provinceId: sindh.id, city: "Karachi", isFeatured: false, feeStructure: "PAF-run institution in Karachi. Estimated monthly fee Rs. 20,000-30,000. Special concessions for PAF personnel children." });
  await storage.createCollege({ name: "PN Cadet College Karachi", provinceId: sindh.id, city: "Karachi", isFeatured: false, feeStructure: "Pakistan Navy-run institution. Estimated monthly fee Rs. 20,000-30,000. Special concessions for Navy personnel children." });

  await storage.createCollege({ name: "Cadet College Razmak", provinceId: kpk.id, city: "Razmak", isFeatured: true, feeStructure: "Government-subsidized college. Estimated annual fee Rs. 100,000-200,000. Special concessions for FATA/tribal area students." });
  await storage.createCollege({ name: "Cadet College Kohat", provinceId: kpk.id, city: "Kohat", applyLink: "https://www.cck.edu.pk", isFeatured: false, feeStructure: "Registration: Rs. 3,000 (8th Class), Rs. 4,000 late. 11th Class: Rs. 4,000 application fee (non-refundable). Estimated monthly fee Rs. 25,000-35,000 including tuition, boarding, messing." });
  await storage.createCollege({ name: "Cadet College Warsak", provinceId: kpk.id, city: "Peshawar", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000. Special concessions for KPK domicile holders." });
  await storage.createCollege({ name: "Cadet College Swat", provinceId: kpk.id, city: "Swat", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000." });
  await storage.createCollege({ name: "Cadet College Kanju Swabi", provinceId: kpk.id, city: "Swabi", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000." });
  await storage.createCollege({ name: "Cadet College Mastuj Chitral", provinceId: kpk.id, city: "Chitral", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 100,000-180,000." });
  await storage.createCollege({ name: "Cadet College Spinkai", provinceId: kpk.id, city: "South Waziristan", isFeatured: false, feeStructure: "Government-subsidized. Special concessions for tribal area students. Estimated annual fee Rs. 80,000-150,000." });

  await storage.createCollege({ name: "Cadet College Mastung", provinceId: balochistan.id, city: "Mastung", isFeatured: false, feeStructure: "Government-subsidized college in Balochistan. Estimated annual fee Rs. 100,000-180,000. Special concessions available for Balochistan students." });
  await storage.createCollege({ name: "Military College Sui", provinceId: balochistan.id, city: "Sui", isFeatured: false, feeStructure: "Army-run institution in Balochistan. Heavily subsidized. Estimated monthly fee Rs. 15,000-25,000. Special concessions for Balochistan domicile." });
  await storage.createCollege({ name: "Cadet College Turbat", provinceId: balochistan.id, city: "Turbat", isFeatured: false, feeStructure: "Balochistan government-subsidized. Estimated annual fee Rs. 80,000-150,000. Special concessions for Balochistan students." });

  await storage.createCollege({ name: "Cadet College Muzaffarabad", provinceId: ajk.id, city: "Muzaffarabad", isFeatured: false, feeStructure: "AJK government-subsidized. Estimated annual fee Rs. 120,000-200,000." });
  await storage.createCollege({ name: "Cadet College Palandri", provinceId: ajk.id, city: "Palandri", isFeatured: false, feeStructure: "AJK government-subsidized. Estimated annual fee Rs. 100,000-180,000." });

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
