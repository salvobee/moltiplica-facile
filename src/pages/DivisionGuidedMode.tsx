import { BookOpenCheck, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { User as FirebaseUser } from "firebase/auth";

interface DivisionGuidedModeProps {
  user?: FirebaseUser | null;
}

export default function DivisionGuidedMode(_props: DivisionGuidedModeProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Divisioni guidate
        </h1>
        <p className="text-lg text-slate-600">
          Stiamo preparando un percorso guidato per risolvere le divisioni in colonna passo dopo passo.
        </p>
      </div>

      <Card className="border-2 border-dashed border-amber-400 bg-amber-50/40">
        <CardHeader className="flex flex-col items-center text-center gap-2">
          <Construction className="w-12 h-12 text-amber-500" />
          <CardTitle className="text-xl font-semibold text-slate-800">
            Modalità in arrivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600 text-center">
          <p>
            La modalità guidata per le divisioni è in fase di sviluppo. A breve potrai allenarti con spiegazioni
            passo passo, suggerimenti e correzioni automatiche come per le moltiplicazioni.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/multiplication/guided")}> 
              <BookOpenCheck className="w-4 h-4 mr-2" />
              Allenati con le moltiplicazioni guidate
            </Button>
            <Button onClick={() => setLocation("/")}>Torna alla scelta operazione</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
