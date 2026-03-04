import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import type { Page } from "@shared/schema";

export default function StaticPage() {
  const [, params] = useRoute("/page/:slug");
  const slug = params?.slug;

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ["/api/pages", slug],
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : page ? (
            <>
              <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">{page.title}</h1>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content || "" }}
                data-testid="text-page-content"
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Page not found.</p>
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
