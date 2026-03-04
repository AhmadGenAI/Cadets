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

  const punjab = await storage.createProvince({ name: "Punjab", country: "Pakistan", imageUrl: "/images/province-punjab.png", sortOrder: 1 });
  const sindh = await storage.createProvince({ name: "Sindh", country: "Pakistan", imageUrl: "/images/province-sindh.png", sortOrder: 2 });
  const kpk = await storage.createProvince({ name: "Khyber Pakhtunkhwa", country: "Pakistan", imageUrl: "/images/province-kpk.png", sortOrder: 3 });
  const balochistan = await storage.createProvince({ name: "Balochistan", country: "Pakistan", imageUrl: "/images/province-balochistan.png", sortOrder: 4 });
  const ajk = await storage.createProvince({ name: "Azad Jammu & Kashmir", country: "Pakistan", imageUrl: "/images/province-ajk.png", sortOrder: 5 });
  await storage.createProvince({ name: "Gilgit-Baltistan", country: "Pakistan", imageUrl: "/images/province-gb.png", sortOrder: 6 });
  await storage.createProvince({ name: "Islamabad Capital Territory", country: "Pakistan", imageUrl: "/images/province-ict.png", sortOrder: 7 });

  await storage.createCollege({ name: "Cadet College Hasan Abdal", provinceId: punjab.id, city: "Hasan Abdal", applyLink: "https://cch.edu.pk", isFeatured: true, feeStructure: "One-Time: Registration Rs. 7,000. Admission Fee Rs. 2,000. Fee collected quarterly in advance. Late fee Rs. 200/day. Historical annual fee ~Rs. 150,000-175,000 (varies by class). Contact: admission@cch.edu.pk, 0343-1-224-224. Website: cch.edu.pk/fee-structure", contactNumber: "0572-520244, 0343-1-224-224", admissionClasses: "8" });
  await storage.createCollege({ name: "Lawrence College Ghora Gali", provinceId: punjab.id, city: "Murree", isFeatured: true, feeStructure: "Admission form (in person): Rs. 1,000. By post: Rs. 1,500. Test fee: Rs. 5,000 (non-refundable). Estimated annual fee Rs. 300,000-500,000 (boarding included). Contact college for exact current fee.", contactNumber: "051-9269205", admissionClasses: "8, 11" });
  await storage.createCollege({ name: "Military College Jhelum", provinceId: punjab.id, city: "Jhelum", applyLink: "https://ccj.edu.pk", isFeatured: false, feeStructure: "Monthly Fee: Civilians ~Rs. 33,000. Army Officers (Serving/Retired) ~Rs. 23,000. JCOs & Soldiers ~Rs. 18,000. Other Defence (PAF/PN/MES) treated as Civilians. Includes tuition, messing, hostel.", contactNumber: "0544-920440, 0544-920441", admissionClasses: "8, 11" });
  await storage.createCollege({ name: "PAF College Sargodha", provinceId: punjab.id, city: "Sargodha", isFeatured: true, feeStructure: "PAF-run institution. Estimated monthly fee Rs. 20,000-30,000. Special fee concessions for PAF personnel children. Includes tuition, hostel, messing.", contactNumber: "048-3725931", admissionClasses: "8" });
  await storage.createCollege({ name: "PAF Cadet College Murree Lower Topa", provinceId: punjab.id, city: "Murree", isFeatured: true, feeStructure: "PAF-run institution in Murree. Estimated monthly fee Rs. 20,000-30,000. Special concessions for PAF/Armed Forces children.", contactNumber: "051-9269000", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Lahore", provinceId: punjab.id, city: "Lahore", applyLink: "https://www.cadetcollegelahore.com", isFeatured: false, feeStructure: "Registration: Rs. 5,000. Admission: Rs. 5,000. Entrance test: Rs. 5,000 (bank draft). Monthly fee Rs. 25,000-35,000 (varies by grade). Includes tuition, boarding, meals.", contactNumber: "042-36296940", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Jhang", provinceId: punjab.id, city: "Jhang", applyLink: "https://cadetcollegejhang.com", isFeatured: false, feeStructure: "Fee details on website: cadetcollegejhang.com/fee-scholarships. Scholarships available for deserving students.", contactNumber: "047-7620049", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Fateh Jang", provinceId: punjab.id, city: "Fateh Jang", applyLink: "https://ccf.edu.pk", isFeatured: false, feeStructure: "One-Time Admission Charges: Rs. 110,000 (Admission Fee Rs. 50,000 + Development Fund Rs. 30,000 + Annual Charges Rs. 30,000). Monthly Fee: Rs. 41,500-42,500 per month (includes tuition Rs. 4,000/month, hostel, messing, laundry). Fee paid in 2-month terms. Classes 6th, 7th, 8th, 9th & 11th.", contactNumber: "057-2310046, 0300-5551413", admissionClasses: "6, 7, 8, 9, 11" });
  await storage.createCollege({ name: "Military College Murree", provinceId: punjab.id, city: "Murree", isFeatured: false, feeStructure: "Military-run institution. Estimated monthly fee Rs. 25,000-40,000. Special concessions for military personnel children.", contactNumber: "051-9269100", admissionClasses: "8" });
  await storage.createCollege({ name: "Pakistan Cadet School & College Murree", provinceId: punjab.id, city: "Murree", applyLink: "https://pakistancadetcollege.com", isFeatured: false, feeStructure: "Prospectus: Rs. 1,500 (cash or bank draft). Special fee concession and quota for kids of Army/Martyrs and FATA region.", contactNumber: "051-9269300", admissionClasses: "7, 8" });
  await storage.createCollege({ name: "Cadet College Chakwal", provinceId: punjab.id, city: "Chakwal", isFeatured: false, feeStructure: "Estimated monthly fee Rs. 20,000-30,000 including tuition, boarding, messing.", contactNumber: "0543-550234", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Sargodha", provinceId: punjab.id, city: "Sargodha", isFeatured: false, feeStructure: "Estimated monthly fee Rs. 20,000-30,000 including tuition, boarding, messing.", contactNumber: "048-3219876", admissionClasses: "8" });

  await storage.createCollege({ name: "Cadet College Petaro", provinceId: sindh.id, city: "Petaro", isFeatured: true, feeStructure: "Entry test fee: Rs. 4,000 (non-refundable). Both Matriculation and Cambridge systems available. Estimated annual fee Rs. 200,000-350,000.", contactNumber: "022-2030272", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Larkana", provinceId: sindh.id, city: "Larkana", isFeatured: false, feeStructure: "Estimated annual fee Rs. 150,000-250,000 including boarding and messing.", contactNumber: "074-4040052", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Ghotki", provinceId: sindh.id, city: "Ghotki", isFeatured: false, feeStructure: "Sindh government-subsidized. Estimated annual fee Rs. 120,000-200,000.", contactNumber: "0723-680023", admissionClasses: "8" });
  await storage.createCollege({ name: "PAF College Karachi", provinceId: sindh.id, city: "Karachi", isFeatured: false, feeStructure: "PAF-run institution in Karachi. Estimated monthly fee Rs. 20,000-30,000. Special concessions for PAF personnel children.", contactNumber: "021-99244041", admissionClasses: "8" });
  await storage.createCollege({ name: "PN Cadet College Karachi", provinceId: sindh.id, city: "Karachi", isFeatured: false, feeStructure: "Pakistan Navy-run institution. Estimated monthly fee Rs. 20,000-30,000. Special concessions for Navy personnel children.", contactNumber: "021-48506461", admissionClasses: "8" });

  await storage.createCollege({ name: "Cadet College Razmak", provinceId: kpk.id, city: "Razmak", isFeatured: true, feeStructure: "Government-subsidized college. Estimated annual fee Rs. 100,000-200,000. Special concessions for FATA/tribal area students.", contactNumber: "0928-7300080", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Kohat", provinceId: kpk.id, city: "Kohat", applyLink: "https://www.cck.edu.pk", isFeatured: false, feeStructure: "Registration: Rs. 3,000 (8th Class), Rs. 4,000 late. 11th Class: Rs. 4,000 application fee (non-refundable). Estimated monthly fee Rs. 25,000-35,000 including tuition, boarding, messing.", contactNumber: "0922-512437, 0922-514234", admissionClasses: "8, 11" });
  await storage.createCollege({ name: "Cadet College Warsak", provinceId: kpk.id, city: "Peshawar", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000. Special concessions for KPK domicile holders.", contactNumber: "091-9216831", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Swat", provinceId: kpk.id, city: "Swat", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000.", contactNumber: "0946-9240025", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Kanju Swabi", provinceId: kpk.id, city: "Swabi", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 120,000-200,000.", contactNumber: "0938-270045", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Mastuj Chitral", provinceId: kpk.id, city: "Chitral", isFeatured: false, feeStructure: "KPK government-subsidized. Estimated annual fee Rs. 100,000-180,000.", contactNumber: "0943-412056", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Spinkai", provinceId: kpk.id, city: "South Waziristan", isFeatured: false, feeStructure: "Government-subsidized. Special concessions for tribal area students. Estimated annual fee Rs. 80,000-150,000.", contactNumber: "0963-510034", admissionClasses: "8" });

  await storage.createCollege({ name: "Cadet College Mastung", provinceId: balochistan.id, city: "Mastung", isFeatured: false, feeStructure: "Government-subsidized college in Balochistan. Estimated annual fee Rs. 100,000-180,000. Special concessions available for Balochistan students.", contactNumber: "0848-410030", admissionClasses: "8" });
  await storage.createCollege({ name: "Military College Sui", provinceId: balochistan.id, city: "Sui", isFeatured: false, feeStructure: "Army-run institution in Balochistan. Heavily subsidized. Estimated monthly fee Rs. 15,000-25,000. Special concessions for Balochistan domicile.", contactNumber: "0822-411234", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Turbat", provinceId: balochistan.id, city: "Turbat", isFeatured: false, feeStructure: "Balochistan government-subsidized. Estimated annual fee Rs. 80,000-150,000. Special concessions for Balochistan students.", contactNumber: "0852-410023", admissionClasses: "8" });

  await storage.createCollege({ name: "Cadet College Muzaffarabad", provinceId: ajk.id, city: "Muzaffarabad", isFeatured: false, feeStructure: "AJK government-subsidized. Estimated annual fee Rs. 120,000-200,000.", contactNumber: "05822-920045", admissionClasses: "8" });
  await storage.createCollege({ name: "Cadet College Palandri", provinceId: ajk.id, city: "Palandri", isFeatured: false, feeStructure: "AJK government-subsidized. Estimated annual fee Rs. 100,000-180,000.", contactNumber: "05824-460023", admissionClasses: "8" });

  // --- International: India ---
  const rajasthan = await storage.createProvince({ name: "Rajasthan", country: "India", sortOrder: 10 });
  const mp = await storage.createProvince({ name: "Madhya Pradesh", country: "India", sortOrder: 11 });
  const maharashtra = await storage.createProvince({ name: "Maharashtra", country: "India", sortOrder: 12 });
  const karnataka = await storage.createProvince({ name: "Karnataka", country: "India", sortOrder: 13 });
  const up = await storage.createProvince({ name: "Uttar Pradesh", country: "India", sortOrder: 14 });
  const jharkhand = await storage.createProvince({ name: "Jharkhand", country: "India", sortOrder: 15 });
  const wb = await storage.createProvince({ name: "West Bengal", country: "India", sortOrder: 16 });
  const telangana = await storage.createProvince({ name: "Telangana", country: "India", sortOrder: 17 });
  const himachal = await storage.createProvince({ name: "Himachal Pradesh", country: "India", sortOrder: 18 });
  await storage.createCollege({ name: "Rashtriya Military School Ajmer", provinceId: rajasthan.id, city: "Ajmer", isFeatured: false, feeStructure: "Government of India run. Subsidized fee structure.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Chittorgarh", provinceId: rajasthan.id, city: "Chittorgarh", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees for defence wards.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Rashtriya Military School Dholpur", provinceId: rajasthan.id, city: "Dholpur", isFeatured: false, feeStructure: "Government of India run military school.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Rewa", provinceId: mp.id, city: "Rewa", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Rashtriya Military School Belgaum", provinceId: karnataka.id, city: "Belgaum", isFeatured: false, feeStructure: "Government of India run military school.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Satara", provinceId: maharashtra.id, city: "Satara", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Lucknow", provinceId: up.id, city: "Lucknow", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Tilaiya", provinceId: jharkhand.id, city: "Tilaiya", isFeatured: false, feeStructure: "India's first Sainik School, established 1961.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Rashtriya Military School Chail", provinceId: himachal.id, city: "Chail", isFeatured: false, feeStructure: "Government of India run military school.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Purulia", provinceId: wb.id, city: "Purulia", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees.", admissionClasses: "6, 9" });
  await storage.createCollege({ name: "Sainik School Korukonda", provinceId: telangana.id, city: "Korukonda", isFeatured: false, feeStructure: "Kendriya Sainik Board. Subsidized fees.", admissionClasses: "6, 9" });

  // --- International: Bangladesh ---
  const dhakaDivision = await storage.createProvince({ name: "Dhaka Division", country: "Bangladesh", sortOrder: 20 });
  const chittagong = await storage.createProvince({ name: "Chittagong Division", country: "Bangladesh", sortOrder: 21 });
  const rangpur = await storage.createProvince({ name: "Rangpur Division", country: "Bangladesh", sortOrder: 22 });
  const sylhet = await storage.createProvince({ name: "Sylhet Division", country: "Bangladesh", sortOrder: 23 });
  await storage.createCollege({ name: "Mirzapur Cadet College", provinceId: dhakaDivision.id, city: "Tangail", isFeatured: false, feeStructure: "Bangladesh government-run cadet college.", admissionClasses: "7" });
  await storage.createCollege({ name: "Faujdarhat Cadet College", provinceId: chittagong.id, city: "Chittagong", isFeatured: false, feeStructure: "One of the oldest cadet colleges in Bangladesh.", admissionClasses: "7" });
  await storage.createCollege({ name: "Jhenaidah Cadet College", provinceId: dhakaDivision.id, city: "Jhenaidah", isFeatured: false, feeStructure: "Bangladesh government-run cadet college.", admissionClasses: "7" });
  await storage.createCollege({ name: "Rajshahi Cadet College", provinceId: rangpur.id, city: "Rajshahi", isFeatured: false, feeStructure: "Bangladesh government-run cadet college.", admissionClasses: "7" });
  await storage.createCollege({ name: "Sylhet Cadet College", provinceId: sylhet.id, city: "Sylhet", isFeatured: false, feeStructure: "Bangladesh government-run cadet college.", admissionClasses: "7" });

  // --- International: Turkey ---
  const istanbul = await storage.createProvince({ name: "Istanbul", country: "Turkey", sortOrder: 30 });
  const ankara = await storage.createProvince({ name: "Ankara", country: "Turkey", sortOrder: 31 });
  await storage.createCollege({ name: "Kuleli Military High School", provinceId: istanbul.id, city: "Istanbul", isFeatured: false, feeStructure: "Turkish Armed Forces military high school.", admissionClasses: "9" });
  await storage.createCollege({ name: "Isiklar Military High School", provinceId: ankara.id, city: "Ankara", isFeatured: false, feeStructure: "Turkish Armed Forces military high school.", admissionClasses: "9" });

  // --- International: United Kingdom ---
  const englandSe = await storage.createProvince({ name: "South East England", country: "United Kingdom", sortOrder: 40 });
  const englandSw = await storage.createProvince({ name: "South West England", country: "United Kingdom", sortOrder: 41 });
  const scotland = await storage.createProvince({ name: "Scotland", country: "United Kingdom", sortOrder: 42 });
  await storage.createCollege({ name: "Royal Military Academy Sandhurst (Prep)", provinceId: englandSe.id, city: "Camberley", isFeatured: false, feeStructure: "UK Ministry of Defence funded.", admissionClasses: "11" });
  await storage.createCollege({ name: "Welbeck Defence Sixth Form College", provinceId: englandSw.id, city: "Loughborough", isFeatured: false, feeStructure: "UK MOD funded sixth form college.", admissionClasses: "11" });
  await storage.createCollege({ name: "Queen Victoria School", provinceId: scotland.id, city: "Dunblane", isFeatured: false, feeStructure: "UK MOD funded boarding school for forces children.", admissionClasses: "7, 8" });

  // --- International: United States ---
  const virginia = await storage.createProvince({ name: "Virginia", country: "United States", sortOrder: 50 });
  const newYork = await storage.createProvince({ name: "New York", country: "United States", sortOrder: 51 });
  const missouri = await storage.createProvince({ name: "Missouri", country: "United States", sortOrder: 52 });
  const georgia = await storage.createProvince({ name: "Georgia", country: "United States", sortOrder: 53 });
  await storage.createCollege({ name: "Virginia Military Institute", provinceId: virginia.id, city: "Lexington", isFeatured: false, feeStructure: "US state-supported military college.", admissionClasses: "11" });
  await storage.createCollege({ name: "Fork Union Military Academy", provinceId: virginia.id, city: "Fork Union", isFeatured: false, feeStructure: "Private military academy.", admissionClasses: "7, 8, 9, 11" });
  await storage.createCollege({ name: "US Military Academy Prep (West Point)", provinceId: newYork.id, city: "West Point", isFeatured: false, feeStructure: "US Army funded.", admissionClasses: "11" });
  await storage.createCollege({ name: "Missouri Military Academy", provinceId: missouri.id, city: "Mexico", isFeatured: false, feeStructure: "Private military academy.", admissionClasses: "7, 8, 9, 11" });
  await storage.createCollege({ name: "Riverside Military Academy", provinceId: georgia.id, city: "Gainesville", isFeatured: false, feeStructure: "Private military academy.", admissionClasses: "7, 8, 9, 11" });

  // --- International: UAE ---
  const abuDhabi = await storage.createProvince({ name: "Abu Dhabi", country: "United Arab Emirates", sortOrder: 60 });
  const dubai = await storage.createProvince({ name: "Dubai", country: "United Arab Emirates", sortOrder: 61 });
  await storage.createCollege({ name: "Khawla Bint Al Azwar Military School", provinceId: abuDhabi.id, city: "Abu Dhabi", isFeatured: false, feeStructure: "UAE Armed Forces military training school.", admissionClasses: "11" });

  // --- International: Saudi Arabia ---
  const riyadh = await storage.createProvince({ name: "Riyadh Region", country: "Saudi Arabia", sortOrder: 70 });
  await storage.createCollege({ name: "King Abdulaziz Military Academy", provinceId: riyadh.id, city: "Riyadh", isFeatured: false, feeStructure: "Saudi Armed Forces military academy.", admissionClasses: "11" });

  // --- International: Australia ---
  const nsw = await storage.createProvince({ name: "New South Wales", country: "Australia", sortOrder: 80 });
  const act = await storage.createProvince({ name: "Australian Capital Territory", country: "Australia", sortOrder: 81 });
  await storage.createCollege({ name: "Australian Defence Force Academy (Prep)", provinceId: act.id, city: "Canberra", isFeatured: false, feeStructure: "Australian Defence Force funded.", admissionClasses: "11" });
  await storage.createCollege({ name: "The King's School", provinceId: nsw.id, city: "North Parramatta", isFeatured: false, feeStructure: "Private school with military-style cadet program.", admissionClasses: "7, 8, 9" });

  // --- International: Canada ---
  const ontario = await storage.createProvince({ name: "Ontario", country: "Canada", sortOrder: 90 });
  const bc = await storage.createProvince({ name: "British Columbia", country: "Canada", sortOrder: 91 });
  await storage.createCollege({ name: "Royal Military College of Canada (Prep)", provinceId: ontario.id, city: "Kingston", isFeatured: false, feeStructure: "Canadian Armed Forces funded.", admissionClasses: "11" });
  await storage.createCollege({ name: "Robert Land Academy", provinceId: ontario.id, city: "Wellandport", isFeatured: false, feeStructure: "Private military-style academy.", admissionClasses: "6, 7, 8, 9" });

  // --- International: Qatar ---
  const doha = await storage.createProvince({ name: "Doha", country: "Qatar", sortOrder: 100 });
  await storage.createCollege({ name: "Ahmed Bin Mohammed Military College", provinceId: doha.id, city: "Doha", isFeatured: false, feeStructure: "Qatar Armed Forces military college.", admissionClasses: "11" });

  // --- International: Malaysia ---
  const kualaLumpur = await storage.createProvince({ name: "Federal Territory", country: "Malaysia", sortOrder: 110 });
  const perak = await storage.createProvince({ name: "Perak", country: "Malaysia", sortOrder: 111 });
  await storage.createCollege({ name: "Royal Military College Malaysia", provinceId: kualaLumpur.id, city: "Sungai Besi", isFeatured: false, feeStructure: "Malaysian Armed Forces military college.", admissionClasses: "8, 11" });
  await storage.createCollege({ name: "Tunku Abdul Rahman Military College", provinceId: perak.id, city: "Kuala Kangsar", isFeatured: false, feeStructure: "Malaysian government military school.", admissionClasses: "8" });

  await storage.createPackage({
    name: "Free Trial",
    price: 0,
    durationDays: 3,
    featuresJson: ["3 Days Free Access", "Daily 10 MCQs for each subject", "Access to AI Tutor", "Interview tips", "Medical guide"],
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

  await storage.setSetting("trial_days", 3);
  await storage.setSetting("site_name", "Cadet Colleges Test Preparation Portal");

  console.log("Seed data inserted successfully.");
}
