import { useQuery } from "@tanstack/react-query";
import type { College } from "@shared/schema";
import { AlertTriangle } from "lucide-react";

export function AlertBar() {
  const { data: colleges } = useQuery<College[]>({
    queryKey: ["/api/colleges"],
  });

  const featured = colleges?.filter(c => c.isFeatured && c.lastApplyDate) ?? [];

  if (featured.length === 0) return null;

  const alertText = featured
    .map(c => `${c.name} - Last date: ${new Date(c.lastApplyDate!).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}`)
    .join("   |   ");

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="flex items-center gap-3 animate-marquee whitespace-nowrap">
        <AlertTriangle className="w-4 h-4 shrink-0 ml-4" />
        <span className="text-sm font-medium">{alertText}</span>
        <span className="text-sm font-medium ml-12">{alertText}</span>
      </div>
    </div>
  );
}
