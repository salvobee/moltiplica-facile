import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogIn, LogOut, User } from "lucide-react";
import { signInWithPopup, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiApple } from "react-icons/si";

interface AuthButtonProps {
  user: FirebaseUser | null;
  onAuthChange: (user: FirebaseUser | null) => void;
}

export function AuthButton({ user, onAuthChange }: AuthButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuthChange(result.user);
      
      // Sync local data to cloud
      const { getGuestStats, getGuestExercises, clearGuestData } = await import("@/lib/storage");
      const { syncLocalDataToCloud, updateUserProfile } = await import("@/lib/firestore");
      
      const localStats = getGuestStats();
      const localExercises = getGuestExercises();
      
      if (localStats.totalExercises > 0) {
        await syncLocalDataToCloud(result.user.uid, localStats, localExercises);
        clearGuestData();
        toast({
          title: "Dati sincronizzati!",
          description: `${localStats.totalExercises} esercizi caricati nel cloud`,
        });
      }
      
      // Update user profile
      await updateUserProfile(
        result.user.uid,
        result.user.displayName || "Utente",
        result.user.photoURL || undefined
      );
      
      setShowDialog(false);
      toast({
        title: "Accesso effettuato!",
        description: `Benvenuto ${result.user.displayName}!`,
      });
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      onAuthChange(result.user);
      
      // Sync local data to cloud
      const { getGuestStats, getGuestExercises, clearGuestData } = await import("@/lib/storage");
      const { syncLocalDataToCloud, updateUserProfile } = await import("@/lib/firestore");
      
      const localStats = getGuestStats();
      const localExercises = getGuestExercises();
      
      if (localStats.totalExercises > 0) {
        await syncLocalDataToCloud(result.user.uid, localStats, localExercises);
        clearGuestData();
        toast({
          title: "Dati sincronizzati!",
          description: `${localStats.totalExercises} esercizi caricati nel cloud`,
        });
      }
      
      // Update user profile
      await updateUserProfile(
        result.user.uid,
        result.user.displayName || "Utente",
        result.user.photoURL || undefined
      );
      
      setShowDialog(false);
      toast({
        title: "Accesso effettuato!",
        description: `Benvenuto ${result.user.displayName || 'utente'}!`,
      });
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onAuthChange(null);
      toast({
        title: "Disconnesso",
        description: "Hai effettuato il logout con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground">{user.displayName}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} data-testid="button-logout">
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Esci</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)} data-testid="button-login">
        <LogIn className="w-4 h-4 mr-2" />
        Accedi
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Accedi per salvare i tuoi progressi</DialogTitle>
            <DialogDescription className="text-base">
              Effettua l'accesso per sincronizzare i tuoi punteggi e partecipare alla classifica della classe!
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="lg"
              variant="outline"
              className="w-full justify-center gap-3"
              data-testid="button-google-signin"
            >
              <SiGoogle className="w-5 h-5" />
              Continua con Google
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={loading}
              size="lg"
              variant="outline"
              className="w-full justify-center gap-3"
              data-testid="button-apple-signin"
            >
              <SiApple className="w-5 h-5" />
              Continua con Apple
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Continuando, i tuoi dati locali verranno sincronizzati nel cloud
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
