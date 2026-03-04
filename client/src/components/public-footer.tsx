import { Link } from "wouter";
import { Shield } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function PublicFooter() {
  const { siteName } = useSiteSettings();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">{siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pakistan's leading cadet college preparation portal. Prepare for your future with smart learning tools.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/page/about" className="text-sm text-muted-foreground transition-colors" data-testid="link-about">About Us</Link>
              <Link href="/page/terms" className="text-sm text-muted-foreground transition-colors" data-testid="link-terms">Terms of Service</Link>
              <Link href="/page/privacy" className="text-sm text-muted-foreground transition-colors" data-testid="link-privacy">Privacy Policy</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground transition-colors" data-testid="link-pricing-footer">Pricing</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.pakshaheens.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground"
                data-testid="link-website"
              >
                www.pakshaheens.com
              </a>
              <a
                href="https://wa.me/923348480890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4 text-green-500" />
                +923348480890
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
