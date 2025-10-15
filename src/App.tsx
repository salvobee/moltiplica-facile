import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthButton } from "@/components/AuthButton";
import { getAuthClient } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { BarChart3, Calculator, Dices, DivideSquare, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { toast } from "@/hooks/use-toast";

const OperationSelector = lazy(() => import("@/pages/OperationSelector"));
const MultiplicationGuidedMode = lazy(() => import("@/pages/MultiplicationGuidedMode"));
const MultiplicationRandomMode = lazy(() => import("@/pages/MultiplicationRandomMode"));
const DivisionGuidedMode = lazy(() => import("@/pages/DivisionGuidedMode"));
const DivisionRandomMode = lazy(() => import("@/pages/DivisionRandomMode"));
const StatsPage = lazy(() => import("@/pages/StatsPage"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function Router({ user }: { user: FirebaseUser | null }) {
  return (
    <Switch>
      <Route path="/">
        {() => <OperationSelector />}
      </Route>
      <Route path="/multiplication/guided">
        {() => <MultiplicationGuidedMode user={user} />}
      </Route>
      <Route path="/multiplication/random">
        {() => <MultiplicationRandomMode user={user} />}
      </Route>
      <Route path="/division/guided">
        {() => <DivisionGuidedMode user={user} />}
      </Route>
      <Route path="/division/random">
        {() => <DivisionRandomMode user={user} />}
      </Route>
      <Route path="/stats">
        {() => <StatsPage user={user} />}
      </Route>
      <Route path="/:rest*">
        {() => <NotFoundPage />}
      </Route>
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [location, setLocation] = useLocation();
  const {
    canInstall,
    promptInstall,
    userChoice,
    shouldShowHint,
    dismissHint,
    isInstallButtonDisabled,
  } = useInstallPrompt();

  useEffect(() => {
    if (!shouldShowHint) {
      return;
    }

    const { dismiss } = toast({
      title: "Installa l'app",
      description: "Aggiungila alla schermata principale per un accesso rapido.",
      duration: 6000,
    });

    dismissHint();

    return () => {
      dismiss();
    };
  }, [shouldShowHint, dismissHint]);

  const handlePromptInstall = useCallback(async () => {
    const result = await promptInstall();

    if (!result) {
      return;
    }

    const accepted = result.outcome === "accepted";

    toast({
      title: accepted ? "Installazione avviata" : "Installazione annullata",
      description: accepted
        ? "Troverai l'app nella schermata principale del tuo dispositivo."
        : "Puoi riprovare a installare l'app in un secondo momento.",
      variant: accepted ? "success" : "default",
      duration: 6000,
    });

    console.info("[PWA] Install prompt outcome", result);
  }, [promptInstall]);

  const showInstallButton = useMemo(() => {
    if (canInstall) {
      return true;
    }

    if (userChoice && userChoice.outcome !== "accepted") {
      return true;
    }

    return false;
  }, [canInstall, userChoice]);

  const installButtonDisabled = useMemo(() => {
    if (!canInstall && userChoice && userChoice.outcome !== "accepted") {
      return true;
    }

    return isInstallButtonDisabled;
  }, [canInstall, userChoice, isInstallButtonDisabled]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const [authClient, { onAuthStateChanged }] = await Promise.all([
          getAuthClient(),
          import("firebase/auth"),
        ]);

        unsubscribe = onAuthStateChanged(authClient, (firebaseUser) => {
          if (isMounted) {
            setUser(firebaseUser);
          }
        });
      } catch (error) {
        console.error("Errore durante l'inizializzazione di Firebase Auth", error);
      }
    })();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const navItems = [
    {
      path: "/",
      label: "Operazioni",
      shortLabel: "Hub",
      icon: Sparkles,
      testId: "nav-operations",
    },
    {
      path: "/multiplication/guided",
      label: "Moltiplicazioni guidate",
      shortLabel: "Molt. G",
      icon: Calculator,
      testId: "nav-multiplication-guided",
    },
    {
      path: "/multiplication/random",
      label: "Moltiplicazioni casuali",
      shortLabel: "Molt. C",
      icon: Dices,
      testId: "nav-multiplication-random",
    },
    {
      path: "/division/guided",
      label: "Divisioni guidate",
      shortLabel: "Div. G",
      icon: DivideSquare,
      testId: "nav-division-guided",
    },
    {
      path: "/division/random",
      label: "Divisioni casuali",
      shortLabel: "Div. C",
      icon: DivideSquare,
      testId: "nav-division-random",
    },
    { path: "/stats", label: "Statistiche", shortLabel: "Stats", icon: BarChart3, testId: "nav-stats" },
  ];

  const headerInfo = useMemo(() => {
    if (location.startsWith("/multiplication")) {
      return {
        title: "Moltiplicazioni",
        subtitle: "in colonna",
        icon: Calculator,
        iconBg: "bg-sky-500",
      };
    }

    if (location.startsWith("/division")) {
      return {
        title: "Divisioni",
        subtitle: "in colonna",
        icon: DivideSquare,
        iconBg: "bg-amber-500",
      };
    }

    if (location === "/stats") {
      return {
        title: "Operazioni in colonna",
        subtitle: "Tieni traccia dei progressi",
        icon: BarChart3,
        iconBg: "bg-emerald-500",
      };
    }

    return {
      title: "Operazioni in colonna",
      subtitle: "Scegli la modalità di allenamento",
      icon: Sparkles,
      iconBg: "bg-sky-500",
    };
  }, [location]);

  const footerText = useMemo(() => {
    if (location.startsWith("/multiplication")) {
      return "Allena le moltiplicazioni in colonna con percorsi guidati e sfide casuali.";
    }

    if (location.startsWith("/division")) {
      return "Le divisioni in colonna stanno arrivando: resta connesso per le novità!";
    }

    if (location === "/stats") {
      return "Consulta i tuoi progressi complessivi sulle operazioni in colonna.";
    }

    return "Scegli l'operazione in colonna con cui vuoi allenarti oggi.";
  }, [location]);

  const HeaderIcon = headerInfo.icon;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen notebook-grid flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${headerInfo.iconBg}`}>
                <HeaderIcon className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-800 leading-tight">
                  {headerInfo.title}
                </h1>
                <p className="text-xs text-slate-500 leading-tight">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showInstallButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePromptInstall}
                  disabled={installButtonDisabled}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Installa l'app</span>
                </Button>
              )}
              <AuthButton user={user} onAuthChange={setUser} />
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="sticky top-[73px] z-40 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setLocation(item.path)}
                    className="flex-shrink-0 gap-2"
                    data-testid={item.testId}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden text-xs">{item.shortLabel}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container mx-auto py-6">
          <Suspense fallback={<div className="text-center py-10 text-slate-500">Caricamento...</div>}>
            <Router user={user} />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            <p>{footerText}</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
