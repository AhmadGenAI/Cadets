import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface SeoHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

export function SeoHead({ title, description, path }: SeoHeadProps) {
  const { siteName } = useSiteSettings();

  useEffect(() => {
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = pageTitle;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const desc = description || "Pakistan's premier cadet college entrance exam preparation platform with AI tutoring, MCQ practice, interview and medical preparation.";
    setMeta("description", desc);
    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", siteName, "property");
    if (path) {
      setMeta("og:url", `${window.location.origin}${path}`, "property");
    }
    setMeta("twitter:card", "summary", "name");
    setMeta("twitter:title", pageTitle, "name");
    setMeta("twitter:description", desc, "name");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${path || window.location.pathname}`;
  }, [title, description, path, siteName]);

  return null;
}
