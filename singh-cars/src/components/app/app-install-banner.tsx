"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, PlusSquare, Share2, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "scb-install-banner-dismissed";

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function detectIosSafari() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);

  return isIos && isSafari;
}

export function AppInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");
  const isIosSafari = useMemo(() => detectIosSafari(), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    setIsStandalone(isStandaloneDisplay());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      window.localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!isAdminRoute || dismissed || isStandalone) {
    return null;
  }

  const showAndroidPrompt = Boolean(deferredPrompt);
  const showIosPrompt = isIosSafari && !showAndroidPrompt;

  if (!showAndroidPrompt && !showIosPrompt) {
    return null;
  }

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        window.localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="sticky top-0 z-[70] border-b border-gray-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="mx-auto flex max-w-[1680px] items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-black">
          {showAndroidPrompt ? <Download className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-black">
            {showAndroidPrompt ? "Install app" : "Add this app to Home Screen"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {showAndroidPrompt
              ? "Install Singh Car Bazar Files for faster opening and a cleaner full-screen dealer workflow."
              : "In Safari, tap Share, then Add to Home Screen to use this like an app on iPhone."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {showAndroidPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="admin-btn admin-btn-sm min-h-11 px-4"
              >
                <Download className="h-4 w-4" />
                {isInstalling ? "Installing..." : "Install App"}
              </button>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black">
                <Share2 className="h-4 w-4" />
                Share
                <PlusSquare className="h-4 w-4" />
                Add to Home Screen
              </span>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="admin-btn admin-btn-sm min-h-11 px-4 text-gray-700"
            >
              <X className="h-4 w-4" />
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
