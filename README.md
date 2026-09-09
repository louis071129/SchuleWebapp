# NOCH

Ein Fortschrittsanzeiger für den Schultag. Beantwortet in unter zwei
Sekunden Blickzeit eine Frage: wie viel ist geschafft — vom aktuellen
Block bis hoch zu den Ferien.

Kein Backend, keine Auth, kein Laufzeit-Netzwerkcall. Alles läuft lokal
im Browser (IndexedDB), als installierbare, offline-fähige PWA.

## Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test
```

Die Zeit-Engine (`src/lib/time-engine`) trägt den Kern der Logik -
Blockberechnung, Sonderfälle (Wochenende, Ferien, Feiertage), Halbjahr-
und Ferien-Fortschritt - und ist entsprechend ausführlich getestet.

## Struktur

- `src/lib/time-engine` — reine Zeit-/Kalenderlogik, keine React-Abhängigkeit
- `src/lib/db` — IndexedDB-Persistenz (Konfiguration, zäh-Marker)
- `src/lib/analytics` — Heatmap-Auswertung der zäh-Marker
- `src/lib/archive` — Tagesstreifen-Archiv (Datenaufbereitung + PNG-Export)
- `src/lib/jetzt` — Ebenen-Logik (Block/Tag/Woche/bis Ferien) des Hauptscreens
- `src/components` — UI
- `src/data/holidays` — statische Ferientermine aller 16 Bundesländer

## Deploy

```bash
npx vercel --prod
```

Erfordert eine angemeldete Vercel-CLI (`vercel login`).
