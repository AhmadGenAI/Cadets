import { useQuery } from "@tanstack/react-query";

export function useSiteSettings() {
  const { data } = useQuery<{ siteName: string }>({
    queryKey: ["/api/settings/site"],
    staleTime: 5 * 60 * 1000,
  });

  return {
    siteName: data?.siteName ?? "Cadet Colleges Test Preparation Portal",
  };
}
