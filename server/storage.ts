import { db } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import {
  users, provinces, colleges, packages, syllabus, mcqBank, pages, blogPosts, settings, assessmentQuestions,
  type InsertUser, type User, type Province, type InsertProvince,
  type College, type InsertCollege, type Package, type InsertPackage,
  type Syllabus, type InsertSyllabus, type McqQuestion, type InsertMcq,
  type Page, type InsertPage, type BlogPost, type InsertBlogPost, type Setting,
  type AssessmentQuestion, type InsertAssessmentQuestion
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByMobile(mobile: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  getProvinces(): Promise<Province[]>;
  createProvince(data: InsertProvince): Promise<Province>;
  updateProvince(id: number, data: Partial<InsertProvince>): Promise<Province | undefined>;
  deleteProvince(id: number): Promise<void>;

  getColleges(): Promise<College[]>;
  getCollegesByProvince(provinceId: number): Promise<College[]>;
  getCollege(id: number): Promise<College | undefined>;
  createCollege(data: InsertCollege): Promise<College>;
  updateCollege(id: number, data: Partial<InsertCollege>): Promise<College | undefined>;
  deleteCollege(id: number): Promise<void>;

  getPackages(): Promise<Package[]>;
  createPackage(data: InsertPackage): Promise<Package>;
  updatePackage(id: number, data: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: number): Promise<void>;

  getSyllabus(): Promise<Syllabus[]>;
  createSyllabus(data: InsertSyllabus): Promise<Syllabus>;

  getMcqs(level: string, subject?: string): Promise<McqQuestion[]>;
  createMcq(data: InsertMcq): Promise<McqQuestion>;

  getPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(data: InsertPage): Promise<Page>;
  updatePage(id: number, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<void>;

  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<void>;

  getAssessmentQuestions(type: string, subject?: string): Promise<AssessmentQuestion[]>;
  getAssessmentQuestionsBySubject(subject: string): Promise<AssessmentQuestion[]>;
  getAllAssessmentQuestions(): Promise<AssessmentQuestion[]>;
  createAssessmentQuestion(data: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  updateAssessmentQuestion(id: number, data: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion | undefined>;
  deleteAssessmentQuestion(id: number): Promise<void>;

  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: any): Promise<void>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByMobile(mobile: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mobile, mobile));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getProvinces(): Promise<Province[]> {
    return db.select().from(provinces).orderBy(asc(provinces.sortOrder));
  }

  async createProvince(data: InsertProvince): Promise<Province> {
    const [province] = await db.insert(provinces).values(data).returning();
    return province;
  }

  async updateProvince(id: number, data: Partial<InsertProvince>): Promise<Province | undefined> {
    const [province] = await db.update(provinces).set(data).where(eq(provinces.id, id)).returning();
    return province;
  }

  async deleteProvince(id: number): Promise<void> {
    await db.delete(provinces).where(eq(provinces.id, id));
  }

  async getColleges(): Promise<College[]> {
    return db.select().from(colleges);
  }

  async getCollegesByProvince(provinceId: number): Promise<College[]> {
    return db.select().from(colleges).where(eq(colleges.provinceId, provinceId));
  }

  async getCollege(id: number): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college;
  }

  async createCollege(data: InsertCollege): Promise<College> {
    const [college] = await db.insert(colleges).values(data).returning();
    return college;
  }

  async updateCollege(id: number, data: Partial<InsertCollege>): Promise<College | undefined> {
    const [college] = await db.update(colleges).set(data).where(eq(colleges.id, id)).returning();
    return college;
  }

  async deleteCollege(id: number): Promise<void> {
    await db.delete(colleges).where(eq(colleges.id, id));
  }

  async getPackages(): Promise<Package[]> {
    return db.select().from(packages);
  }

  async createPackage(data: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values(data).returning();
    return pkg;
  }

  async updatePackage(id: number, data: Partial<InsertPackage>): Promise<Package | undefined> {
    const [pkg] = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
    return pkg;
  }

  async deletePackage(id: number): Promise<void> {
    await db.delete(packages).where(eq(packages.id, id));
  }

  async getSyllabus(): Promise<Syllabus[]> {
    return db.select().from(syllabus).orderBy(asc(syllabus.sortOrder));
  }

  async createSyllabus(data: InsertSyllabus): Promise<Syllabus> {
    const [s] = await db.insert(syllabus).values(data).returning();
    return s;
  }

  async getMcqs(level: string, subject?: string): Promise<McqQuestion[]> {
    if (subject) {
      const results = await db.select().from(mcqBank)
        .where(eq(mcqBank.level, level));
      return results.filter(m => m.subject === subject);
    }
    return db.select().from(mcqBank).where(eq(mcqBank.level, level));
  }

  async createMcq(data: InsertMcq): Promise<McqQuestion> {
    const [mcq] = await db.insert(mcqBank).values(data).returning();
    return mcq;
  }

  async getPages(): Promise<Page[]> {
    return db.select().from(pages);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(data: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(data).returning();
    return page;
  }

  async updatePage(id: number, data: Partial<InsertPage>): Promise<Page | undefined> {
    const [page] = await db.update(pages).set(data).where(eq(pages.id, id)).returning();
    return page;
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(data).returning();
    return post;
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getAssessmentQuestions(type: string, subject?: string): Promise<AssessmentQuestion[]> {
    if (subject) {
      return db.select().from(assessmentQuestions).where(
        and(eq(assessmentQuestions.type, type), eq(assessmentQuestions.subject, subject))
      );
    }
    return db.select().from(assessmentQuestions).where(eq(assessmentQuestions.type, type));
  }

  async getAssessmentQuestionsBySubject(subject: string): Promise<AssessmentQuestion[]> {
    return db.select().from(assessmentQuestions).where(eq(assessmentQuestions.subject, subject));
  }

  async getAllAssessmentQuestions(): Promise<AssessmentQuestion[]> {
    return db.select().from(assessmentQuestions);
  }

  async createAssessmentQuestion(data: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const [q] = await db.insert(assessmentQuestions).values(data).returning();
    return q;
  }

  async updateAssessmentQuestion(id: number, data: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion | undefined> {
    const [q] = await db.update(assessmentQuestions).set(data).where(eq(assessmentQuestions.id, id)).returning();
    return q;
  }

  async deleteAssessmentQuestion(id: number): Promise<void> {
    await db.delete(assessmentQuestions).where(eq(assessmentQuestions.id, id));
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await db.insert(settings).values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();
