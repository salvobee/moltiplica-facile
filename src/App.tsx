import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthButton } from "@/components/AuthButton";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import GuidedMode from "@/pages/GuidedMode";
import RandomMode from "@/pages/RandomMode";
import StatsPage from "@/pages/StatsPage";
import { Calculator, Dices, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router({ user }: { user: FirebaseUser | null }) {
  return (
    <Switch>
      <Route path="/">
        {() => <GuidedMode user={user} />}
      </Route>
      <Route path="/random">
        {() => <RandomMode user={user} />}
      </Route>
      <Route path="/stats">
        {() => <StatsPage user={user} />}
      </Route>
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { path: "/", label: "Esercizi Guidati", icon: Calculator, testId: "nav-guided" },
    { path: "/random", label: "Esercizi a Caso", icon: Dices, testId: "nav-random" },
    { path: "/stats", label: "Punteggio", icon: BarChart3, testId: "nav-stats" },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen notebook-grid flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-800 leading-tight">
                  Moltiplicazioni
                </h1>
                <p className="text-xs text-slate-500 leading-tight">
                  in Colonna
                </p>
              </div>
            </div>

            <AuthButton user={user} onAuthChange={setUser} />
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
                    <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container mx-auto py-6">
          <Router user={user} />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            <p>Impara le moltiplicazioni in colonna divertendoti!</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
