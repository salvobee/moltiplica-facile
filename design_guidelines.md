# Design Guidelines - App Moltiplicazioni in Colonna

## Design Approach

**Reference-Based Approach**: Ispirato alle migliori app educative per bambini (Khan Academy Kids, Duolingo) con adattamento al contesto scolastico italiano e al vincolo dello sfondo a quadretti.

**Design Principles**:
- Familiarity First: L'interfaccia deve ricordare il quaderno di scuola
- Giocoso ma Serio: Elementi colorati e divertenti senza distrarre dall'apprendimento
- Feedback Immediato: Conferme visive positive per ogni azione corretta
- Semplicità Cognitiva: Un solo focus alla volta, guida chiara passo-passo

---

## Core Design Elements

### A. Color Palette

**Primary Colors**:
- Primary Blue: 210 85% 45% - Pulsanti principali e elementi interattivi
- Success Green: 145 70% 45% - Feedback positivi, risposte corrette
- Error Red: 0 75% 55% - Suggerimenti di errore (usare con delicatezza)
- Notebook Background: 35 20% 96% - Sfondo base chiaro tipo carta
- Grid Lines: 210 15% 75% - Linee quadretti sottili

**Accent Colors**:
- Sunshine Yellow: 45 95% 60% - Badge, stelle, celebrazioni
- Soft Purple: 265 60% 65% - Elementi secondari, decorazioni

**Dark Mode**: Non necessario per questo progetto educativo

### B. Typography

**Font Families**:
- Primary: 'Comic Neue' (Google Fonts) - Chiara, leggibile, amichevole per bambini
- Numbers: 'Roboto Mono' (Google Fonts) - Monospace per allineamento perfetto dei numeri in colonna
- Fallback: system-ui, sans-serif

**Type Scale**:
- Hero/Titoli: text-4xl (36px) font-bold
- Numeri operazione: text-6xl (60px) font-mono su mobile, text-8xl (96px) su tablet/desktop
- Istruzioni: text-lg (18px) font-medium
- Feedback: text-xl (20px) font-semibold
- Pulsanti: text-base (16px) font-semibold

### C. Layout System

**Spacing Primitives**: Utilizzeremo principalmente unità Tailwind di 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2 (8px)
- Component spacing: p-4, gap-4 (16px)  
- Section spacing: p-6, p-8 (24-32px)
- Large gaps: gap-12, gap-16 (48-64px)

**Grid System**:
- Mobile-first: Layout verticale singola colonna
- Breakpoints: sm:640px, md:768px, lg:1024px
- Containers: max-w-4xl per l'area di lavoro principale
- Quaderno a quadretti: Background pattern CSS con linee ogni 20px

**Component Positioning**:
- Fixed Header: Logo + Punteggio + Menu (h-16)
- Main Area: Scrollable, centrata con max-w-4xl mx-auto
- Action Bar: Sticky bottom su mobile per input/conferma

### D. Component Library

**Navigation Components**:
- Top Bar: Logo a sinistra, punteggio al centro, menu hamburger a destra
- Tab Navigation: "Esercizi Guidati" / "Esercizi a Caso" / "Classifica" con indicatore attivo

**Input Components**:
- Numero Input: Large touch-friendly boxes (min-h-16) con bordi arrotondati
- Numeric Keypad: Griglia 3x4 custom per inserimento numeri su mobile
- Riporto Input: Piccoli box circolari sopra le colonne dei numeri

**Display Components**:
- Operazione Display: Griglia di numeri allineati in colonna con linee di separazione
- Prodotti Parziali: Righe separate con offset per gli zeri iniziali
- Riporti: Numeri piccoli (text-sm) in alto a destra sopra ogni cifra

**Feedback Components**:
- Success Card: Border verde, icona check, messaggio incoraggiante, animazione bounce
- Hint Card: Border giallo, icona lightbulb, suggerimento graduale
- Error Indicator: Shake animation + bordo rosso temporaneo
- Progress Bar: Barra orizzontale che mostra il progresso nell'operazione

**Modal/Overlay**:
- Auth Modal: Centrato, sfondo blur, opzioni Google/Apple con icone grandi
- Results Summary: Full screen celebration con confetti CSS, punteggio totale, bottone "Nuova Operazione"

**Cards/Lists**:
- Classifica Row: Avatar + Nome + Punteggio + Posizione badge
- Esercizio Card: Difficoltà badge + Operazione + Data/Ora

### E. Visual Elements

**Quadretti Background**:
```
background-image: 
  linear-gradient(0deg, hsl(210 15% 75%) 1px, transparent 1px),
  linear-gradient(90deg, hsl(210 15% 75%) 1px, transparent 1px);
background-size: 20px 20px;
```

**Icons**: Heroicons per UI (menu, check, lightbulb, star)

**Animations** (usare con parsimonia):
- Correct Answer: Scale bounce (scale-105) + green glow
- Wrong Answer: Shake animation (translate-x)
- Completion: Confetti particles CSS + fade-in success message
- Button Press: Scale down (active:scale-95)

**Illustrations**: 
- Empty States: Icona matita grande + testo incoraggiante
- Success States: Emoji celebrativa (🎉, ⭐, 👏) + messaggio

---

## Responsive Behavior

**Mobile (< 768px)**:
- Stack verticale completo
- Numeri operazione: text-5xl per visibilità
- Numeric keypad fisso in basso
- Tab navigation in sticky header

**Tablet (768px - 1024px)**:
- Numeri operazione: text-7xl
- Sidebar opzionale per statistiche
- Dual column per classifica

**Desktop (> 1024px)**:
- Layout centrato max-w-6xl
- Numeri operazione: text-8xl
- Sidebar persistente con statistiche in tempo reale

---

## Key Interactions

1. **Tap numero** → Highlight box + numeric keypad appears
2. **Correct answer** → Green checkmark + encouraging sound + next step unlocks
3. **Wrong answer** → Gentle shake + hint card slides in + retry option
4. **Complete operation** → Confetti animation + score display + "Nuova Operazione" CTA
5. **Sign in prompt** → Subtle banner top "Salva i tuoi progressi" → modal on tap