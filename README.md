[English version](README-en.md)

# Moltiplica Facile

Moltiplica Facile è un'app web educativa pensata per alunni e famiglie che vogliono allenarsi con le moltiplicazioni in colonna senza rinunciare al divertimento. L'interfaccia a quaderno, le illustrazioni e i feedback animati creano un ambiente accogliente, mentre la logica guidata accompagna passo dopo passo anche chi è alle prime armi.

## ✨ Perché Moltiplica Facile
- **Percorso guidato interattivo**: inserisci due numeri e l'app ti porta attraverso ogni singolo passaggio, con istruzioni contestuali e controlli in tempo reale sugli errori.
- **Sfide rapide a difficoltà crescente**: scegli un livello (facile, medio, difficile) e genera esercizi casuali per misurare i progressi in autonomia.
- **Statistiche chiare e motivanti**: visualizza esercizi completati, punteggi totali, media e distribuzione per difficoltà, con invito a salire in classifica.
- **Momenti di festa**: al completamento di ogni esercizio arrivano confetti, punteggi e messaggi incoraggianti per rinforzare i risultati.

## 🎮 Modalità di esercizio
- **Esercizi guidati** – Ideale per ripassare con un insegnante digitale: puoi ricominciare in qualsiasi momento e ricevi suggerimenti graduali se ti blocchi.
- **Esercizi a caso** – Perfetti per allenarsi in autonomia: basta scegliere la difficoltà e l'app genera una nuova operazione pronta da risolvere.

## 📊 Progressi e gamificazione
Le performance vengono tracciate automaticamente sia per ospiti sia per utenti autenticati. Le dashboard mostrano conteggi, punteggi medi e suggeriscono di accedere per sincronizzare i progressi con la futura classifica della classe.

## 🔐 Accesso e sincronizzazione
Chi effettua l'accesso con Google o Apple sincronizza nel cloud gli esercizi svolti offline, mantenendo punteggi e storici coerenti tra dispositivi. Se preferisci restare ospite, i dati restano salvati nel browser e possono essere migrati più tardi.

## 🛠️ Stack tecnologico
- **Framework**: React + TypeScript con router Wouter e gestione dati via TanStack Query.
- **Build**: Vite con Tailwind CSS 4 per styling moderno e pattern "notebook" riutilizzabile.
- **Backend-as-a-Service**: Firebase per autenticazione, sincronizzazione esercizi e leaderboard futura.

## 🚀 Come eseguirla in locale
1. Installa le dipendenze: `npm install`
2. Avvia l'ambiente di sviluppo: `npm run dev`
3. Esegui il build di produzione: `npm run build`
4. Controlla i tipi TypeScript: `npm run check`

Tutti gli script sono definiti in `package.json` e sfruttano la toolchain Vite.

## 📁 Struttura del progetto
- `src/App.tsx` contiene layout, routing e navigazione a tab.
- `src/pages/` raggruppa le modalità (guidata, casuale, statistiche).
- `src/components/` ospita l'esperienza interattiva: input numerici, suggerimenti, celebrazioni.
- `src/lib/` gestisce logica di moltiplicazione, storage locale e integrazione Firebase.

## 🤝 Contribuire
Le issue e le pull request sono benvenute. Mantieni il tono educativo dell'interfaccia, scrivi componenti accessibili e preferisci test manuali con studenti o famiglie prima di proporre modifiche importanti.

Buon divertimento con le moltiplicazioni!
