"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone || iosStandalone);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) return null;

  async function installApp() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setPromptEvent(null);
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }

    setShowIOSHelp(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#064E3B] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#075E46]"
      >
        <Download className="size-4" />
        Install App
      </button>

      {showIOSHelp ? (
        <div className="fixed inset-0 z-[100] grid place-items-end bg-black/35 p-3 backdrop-blur-sm sm:place-items-center">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/madrasah-hub-logo.svg" alt="Madrasah Hub" className="size-14 rounded-2xl" />
                <div>
                  <p className="text-lg font-extrabold text-[#064E3B]">Pasang Madrasah Hub</p>
                  <p className="text-sm text-slate-500">Akses pantas dari skrin utama</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowIOSHelp(false)} className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-[#F4F7F2] p-4 text-sm text-slate-700">
              <p className="font-bold text-[#064E3B]">iPhone / iPad</p>
              <p className="flex items-center gap-2"><Share2 className="size-4 text-[#0B7A53]" /> Tekan butang Share dalam Safari.</p>
              <p>2. Pilih <strong>Add to Home Screen</strong>.</p>
              <p>3. Tekan <strong>Add</strong>.</p>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Android Chrome akan memaparkan pemasangan terus apabila aplikasi memenuhi syarat peranti.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
