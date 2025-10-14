import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGuestStats } from "@/lib/storage";
import { getUserStats, saveExercise } from "@/lib/firestore";
import { Trophy, Calculator, Star, TrendingUp } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import type { UserStats } from "@shared/schema";

interface StatsPageProps {
  user: FirebaseUser | null;
}

export default function StatsPage({ user }: StatsPageProps) {
  const [stats, setStats] = useState<UserStats>(getGuestStats());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserStats(user.uid).then((cloudStats) => {
        if (cloudStats) {
          setStats(cloudStats);
        }
        setLoading(false);
      });
    } else {
      setStats(getGuestStats());
    }
  }, [user]);

  const averageScore = stats.totalExercises > 0 
    ? Math.round(stats.totalScore / stats.totalExercises) 
    : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {user ? 'Le Tue Statistiche' : 'Statistiche Ospite'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {user ? 'Continua così!' : 'Accedi per salvare i tuoi progressi e vedere la classifica'}
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-card-border">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-exercises">
              {stats.totalExercises}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Esercizi Completati
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-card-border">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-score">
              {stats.totalScore}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Punti Totali
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-card-border">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-average-score">
              {averageScore}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Media Punti
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-card-border">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {user ? '?' : '-'}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Posizione Classifica
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      <Card className="border-2 border-card-border">
        <CardHeader>
          <CardTitle className="text-xl">Esercizi per Difficoltà</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-difficulty-1">
                {stats.exercisesByDifficulty[1]}
              </div>
              <div className="text-sm text-muted-foreground">Facile</div>
              <div className="text-xs text-muted-foreground mt-1">2 cifre × 1 cifra</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-difficulty-2">
                {stats.exercisesByDifficulty[2]}
              </div>
              <div className="text-sm text-muted-foreground">Medio</div>
              <div className="text-xs text-muted-foreground mt-1">2 cifre × 2 cifre</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="text-difficulty-3">
                {stats.exercisesByDifficulty[3]}
              </div>
              <div className="text-sm text-muted-foreground">Difficile</div>
              <div className="text-xs text-muted-foreground mt-1">3 cifre × 2 cifre</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard placeholder */}
      {!user && (
        <Card className="border-2 border-accent bg-accent/5">
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Vuoi vedere la classifica?
            </h3>
            <p className="text-muted-foreground">
              Accedi con Google o Apple per sincronizzare i tuoi progressi e competere con i tuoi compagni di classe!
            </p>
          </CardContent>
        </Card>
      )}

      {user && (
        <Card className="border-2 border-card-border">
          <CardHeader>
            <CardTitle className="text-xl">Classifica della Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              La classifica verrà implementata nella prossima versione con Cloud Functions
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
