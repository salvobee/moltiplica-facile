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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          {user ? 'Le Tue Statistiche' : 'Statistiche Ospite'}
        </h1>
        <p className="text-lg text-slate-600">
          {user ? 'Continua così!' : 'Accedi per salvare i tuoi progressi e vedere la classifica'}
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-sky-600" />
            </div>
            <div className="text-3xl font-bold text-slate-800" data-testid="text-total-exercises">
              {stats.totalExercises}
            </div>
            <div className="text-sm text-slate-600 text-center">
              Esercizi Completati
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-200/40 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-slate-800" data-testid="text-total-score">
              {stats.totalScore}
            </div>
            <div className="text-sm text-slate-600 text-center">
              Punti Totali
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-800" data-testid="text-average-score">
              {averageScore}
            </div>
            <div className="text-sm text-slate-600 text-center">
              Media Punti
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300">
          <CardContent className="p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-sky-600" />
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {user ? '?' : '-'}
            </div>
            <div className="text-sm text-slate-600 text-center">
              Posizione Classifica
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      <Card className="border-2 border-slate-300">
        <CardHeader>
          <CardTitle className="text-xl">Esercizi per Difficoltà</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1" data-testid="text-difficulty-1">
                {stats.exercisesByDifficulty[1]}
              </div>
              <div className="text-sm text-slate-600">Facile</div>
              <div className="text-xs text-slate-500 mt-1">2 cifre × 1 cifra</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1" data-testid="text-difficulty-2">
                {stats.exercisesByDifficulty[2]}
              </div>
              <div className="text-sm text-slate-600">Medio</div>
              <div className="text-xs text-slate-500 mt-1">2 cifre × 2 cifre</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1" data-testid="text-difficulty-3">
                {stats.exercisesByDifficulty[3]}
              </div>
              <div className="text-sm text-slate-600">Difficile</div>
              <div className="text-xs text-slate-500 mt-1">3 cifre × 2 cifre</div>
            </div>

            <div className="flex flex-col items-center p-4 bg-slate-100 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1" data-testid="text-difficulty-4">
                {stats.exercisesByDifficulty[4] ?? 0}
              </div>
              <div className="text-sm text-slate-600">Difficilissimo</div>
              <div className="text-xs text-slate-500 mt-1">3 cifre × 3 cifre</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard placeholder */}
      {!user && (
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Vuoi vedere la classifica?
            </h3>
            <p className="text-slate-600">
              Accedi con Google o Apple per sincronizzare i tuoi progressi e competere con i tuoi compagni di classe!
            </p>
          </CardContent>
        </Card>
      )}

      {user && (
        <Card className="border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="text-xl">Classifica della Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-600">
              La classifica verrà implementata prossimamente...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
