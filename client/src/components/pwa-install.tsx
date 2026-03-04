import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    setIsIos(isIosDevice && !isInStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  if (dismissed) return null;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
  if (isStandalone) return null;

  if (!deferredPrompt && !isIos) return null;

  if (isIos && !showIosGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="p-4 shadow-lg border-primary/20 bg-background">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Install App</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to your home screen for quick access
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" onClick={() => setShowIosGuide(true)} data-testid="button-install-app">
                  Show Me How
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} data-testid="button-dismiss-install">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isIos && showIosGuide) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="p-4 shadow-lg border-primary/20 bg-background">
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-sm">Install on iPhone/iPad</p>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top right corner</li>
          </ol>
          <Button size="sm" variant="outline" className="w-full mt-3" onClick={handleDismiss}>
            Got it
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="p-4 shadow-lg border-primary/20 bg-background">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install App</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Install for quick access from your home screen
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="default" onClick={handleInstall} data-testid="button-install-app">
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} data-testid="button-dismiss-install">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
