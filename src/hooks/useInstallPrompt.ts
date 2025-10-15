import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface InstallPromptChoice {
  outcome: "accepted" | "dismissed";
  platform: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
}

const INSTALL_HINT_STORAGE_KEY = "moltiplica-install-hint";

type UseInstallPromptReturn = {
  canInstall: boolean;
  promptInstall: () => Promise<InstallPromptChoice | null>;
  isPrompting: boolean;
  userChoice: InstallPromptChoice | null;
  shouldShowHint: boolean;
  dismissHint: () => void;
  isInstallButtonDisabled: boolean;
};

export function useInstallPrompt(): UseInstallPromptReturn {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [userChoice, setUserChoice] = useState<InstallPromptChoice | null>(null);
  const [shouldShowHint, setShouldShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      deferredPromptRef.current = promptEvent;
      setCanInstall(true);
      setUserChoice(null);
      setIsPrompting(false);

      try {
        const hasSeenHint = window.localStorage.getItem(INSTALL_HINT_STORAGE_KEY);
        if (!hasSeenHint) {
          setShouldShowHint(true);
          window.localStorage.setItem(INSTALL_HINT_STORAGE_KEY, "1");
        }
      } catch (error) {
        console.warn("[PWA] Impossibile accedere al localStorage per memorizzare l'hint", error);
        setShouldShowHint(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) {
      return null;
    }

    setIsPrompting(true);
    setShouldShowHint(false);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setUserChoice(choice);
      console.info("[PWA] Risultato installazione", choice);
      return choice;
    } catch (error) {
      console.error("[PWA] Errore durante la richiesta di installazione", error);
      return null;
    } finally {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsPrompting(false);
    }
  }, []);

  const dismissHint = useCallback(() => {
    setShouldShowHint(false);
  }, []);

  const isInstallButtonDisabled = useMemo(() => {
    if (!canInstall) {
      return true;
    }

    if (isPrompting) {
      return true;
    }

    if (userChoice && userChoice.outcome !== "accepted") {
      return true;
    }

    return false;
  }, [canInstall, isPrompting, userChoice]);

  return {
    canInstall,
    promptInstall,
    isPrompting,
    userChoice,
    shouldShowHint,
    dismissHint,
    isInstallButtonDisabled,
  };
}

export type { InstallPromptChoice };
