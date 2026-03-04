import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowLeft, Calendar } from "lucide-react";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Blog
            </Button>
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : post ? (
            <article>
              <h1 className="text-3xl font-bold mb-3" data-testid="text-blog-title">{post.title}</h1>
              {post.publishedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
              {post.thumbnailUrl && (
                <img src={post.thumbnailUrl} alt={post.title} className="w-full rounded-md mb-8 max-h-96 object-cover" />
              )}
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
                data-testid="text-blog-content"
              />
            </article>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Blog post not found.</p>
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
