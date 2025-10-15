import { Calculator, Divide, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function OperationSelector() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-sm font-semibold">
          <Sparkles className="w-4 h-4 mr-1" /> Nuovo hub operazioni
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
          Scegli il tipo di operazione in colonna
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Allenati con percorsi guidati o esercizi casuali. Le divisioni stanno arrivando: per ora puoi iniziare
          con le moltiplicazioni e tenere d'occhio le novità.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-sky-300">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-sky-500 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-800">Moltiplicazioni</CardTitle>
            <p className="text-slate-600 text-sm">
              Modalità guidata e casuale per allenarti con le moltiplicazioni in colonna.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => setLocation("/multiplication/guided")}>Modalità guidata</Button>
            <Button variant="outline" onClick={() => setLocation("/multiplication/random")}>
              Modalità casuale
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-amber-300">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-amber-400 flex items-center justify-center">
              <Divide className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-800">Divisioni</CardTitle>
            <p className="text-slate-600 text-sm">
              Stiamo costruendo gli esercizi per le divisioni in colonna. Torna presto per provarli.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button disabled className="justify-center">Modalità guidata (presto)</Button>
            <Button disabled variant="outline" className="justify-center">
              Modalità casuale (presto)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
