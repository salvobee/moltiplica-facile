import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

type FirebaseRuntimeConfig = {
  apiKey: string;
  projectId: string;
  appId: string;
  authDomain?: string;
  storageBucket?: string;
  measurementId?: string;
};

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: FirebaseRuntimeConfig;
  }
}

function resolveFirebaseConfig(): FirebaseRuntimeConfig {
  const runtimeConfig = window.__FIREBASE_CONFIG__;

  if (!runtimeConfig) {
    throw new Error(
      "Configurazione Firebase mancante. Assicurati di compilare public/firebase-config.js prima di avviare l'app.",
    );
  }

  const requiredKeys: (keyof FirebaseRuntimeConfig)[] = ["apiKey", "projectId", "appId"];
  const missing = requiredKeys.filter((key) => !runtimeConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Configurazione Firebase incompleta. Mancano: ${missing.join(", ")}. Aggiorna public/firebase-config.js con i valori corretti.`,
    );
  }

  const { projectId, authDomain, storageBucket, ...rest } = runtimeConfig;

  return {
    ...rest,
    projectId,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    storageBucket: storageBucket ?? `${projectId}.firebasestorage.app`,
  };
}

const firebaseConfig = resolveFirebaseConfig();

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
