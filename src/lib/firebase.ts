import type { FirebaseApp } from "firebase/app";
import type { Auth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

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

let firebaseAppPromise: Promise<FirebaseApp> | null = null;

async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!firebaseAppPromise) {
    firebaseAppPromise = import("firebase/app").then(async ({ initializeApp, getApps }) => {
      const existing = getApps();
      if (existing.length > 0) {
        return existing[0]!;
      }
      const config = resolveFirebaseConfig();
      return initializeApp(config);
    });
  }
  return firebaseAppPromise;
}

let authPromise: Promise<Auth> | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;
let appleProviderInstance: OAuthProvider | null = null;
let firestorePromise: Promise<Firestore> | null = null;

export async function getAuthClient(): Promise<Auth> {
  if (!authPromise) {
    authPromise = getFirebaseApp().then(async (app) => {
      const { getAuth } = await import("firebase/auth");
      return getAuth(app);
    });
  }
  return authPromise;
}

export async function getGoogleProvider(): Promise<GoogleAuthProvider> {
  if (!googleProviderInstance) {
    const { GoogleAuthProvider } = await import("firebase/auth");
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
}

export async function getAppleProvider(): Promise<OAuthProvider> {
  if (!appleProviderInstance) {
    const { OAuthProvider } = await import("firebase/auth");
    appleProviderInstance = new OAuthProvider("apple.com");
  }
  return appleProviderInstance;
}

export async function getFirestoreClient(): Promise<Firestore> {
  if (!firestorePromise) {
    firestorePromise = getFirebaseApp().then(async (app) => {
      const { getFirestore } = await import("firebase/firestore");
      return getFirestore(app);
    });
  }
  return firestorePromise;
}
