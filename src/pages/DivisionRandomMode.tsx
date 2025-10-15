import { CalendarClock, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { User as FirebaseUser } from "firebase/auth";

interface DivisionRandomModeProps {
  user?: FirebaseUser | null;
}

export default function DivisionRandomMode(_props: DivisionRandomModeProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
          Divisioni casuali
        </h1>
        <p className="text-lg text-slate-600">
          Presto potrai generare divisioni in colonna con livelli di difficoltà progressivi per metterti alla prova.
        </p>
      </div>

      <Card className="border-2 border-dashed border-sky-400 bg-sky-50/40">
        <CardHeader className="flex flex-col items-center text-center gap-2">
          <Construction className="w-12 h-12 text-sky-500" />
          <CardTitle className="text-xl font-semibold text-slate-800">
            Generatore in lavorazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600 text-center">
          <p>
            Stiamo lavorando al generatore di divisioni: potrai scegliere il grado di difficoltà, salvare i
            risultati e confrontarli con le tue statistiche complessive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/multiplication/random")}>
              Allenati con moltiplicazioni casuali
            </Button>
            <Button onClick={() => setLocation("/")}>
              <CalendarClock className="w-4 h-4 mr-2" />
              Torna più tardi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
