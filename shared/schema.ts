import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, date, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  selectedCollegeId: integer("selected_college_id"),
  level: varchar("level", { length: 30 }),
  preferredLanguage: varchar("preferred_language", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  trialStartDate: date("trial_start_date"),
  trialEndDate: date("trial_end_date"),
  packageType: varchar("package_type", { length: 30 }).default("trial"),
  packageExpiryDate: date("package_expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  provinceId: integer("province_id").notNull(),
  city: varchar("city", { length: 100 }),
  applyLink: text("apply_link"),
  lastApplyDate: date("last_apply_date"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull().default(0),
  durationDays: integer("duration_days").notNull(),
  featuresJson: jsonb("features_json"),
  isActive: boolean("is_active").notNull().default(true),
});

export const syllabus = pgTable("syllabus", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 30 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  chapter: varchar("chapter", { length: 200 }),
  topic: varchar("topic", { length: 200 }),
  difficulty: varchar("difficulty", { length: 20 }),
  collegeId: integer("college_id"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const mcqBank = pgTable("mcq_bank", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id"),
  level: varchar("level", { length: 30 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 200 }),
  questionText: text("question_text").notNull(),
  optionsJson: jsonb("options_json").notNull(),
  correctOption: varchar("correct_option", { length: 10 }).notNull(),
  explanation: text("explanation"),
  language: varchar("language", { length: 20 }).default("english"),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content"),
  isPublished: boolean("is_published").notNull().default(true),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content"),
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: timestamp("published_at"),
  isPublished: boolean("is_published").notNull().default(false),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProvinceSchema = createInsertSchema(provinces).omit({ id: true });
export const insertCollegeSchema = createInsertSchema(colleges).omit({ id: true });
export const insertPackageSchema = createInsertSchema(packages).omit({ id: true });
export const insertSyllabusSchema = createInsertSchema(syllabus).omit({ id: true });
export const insertMcqSchema = createInsertSchema(mcqBank).omit({ id: true });
export const insertPageSchema = createInsertSchema(pages).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });

export const registerSchema = z.object({
  mobile: z.string().min(10, "Mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  selectedCollegeId: z.number().optional(),
  level: z.enum(["primary", "middle", "matric", "intermediate"]).optional(),
});

export const loginSchema = z.object({
  mobile: z.string().min(10, "Mobile number is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type InsertProvince = z.infer<typeof insertProvinceSchema>;
export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Syllabus = typeof syllabus.$inferSelect;
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type McqQuestion = typeof mcqBank.$inferSelect;
export type InsertMcq = z.infer<typeof insertMcqSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Setting = typeof settings.$inferSelect;
