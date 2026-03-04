import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { SeoHead } from "@/components/seo-head";
import { Calendar, ArrowRight } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });

  const published = posts?.filter(p => p.isPublished) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeoHead title="Blog" description="Latest articles and tips for cadet college entrance exam preparation in Pakistan." path="/blog" />
      <PublicHeader />
      <div className="flex-1 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Blog</Badge>
            <h1 className="text-4xl font-bold mb-3">Latest Articles</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Tips, guides, and news for cadet college preparation.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-md" />)}
            </div>
          ) : published.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
            </Card>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {published.map(post => (
                <motion.div key={post.id} variants={fadeUp}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden cursor-pointer group h-full flex flex-col" data-testid={`card-blog-${post.id}`}>
                      {post.thumbnailUrl && (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-base mb-2 line-clamp-2">{post.title}</h3>
                        {post.content && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between">
                          {post.publishedAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.publishedAt).toLocaleDateString("en-PK")}
                            </span>
                          )}
                          <span className="text-xs text-primary font-medium flex items-center gap-1">
                            Read more <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
