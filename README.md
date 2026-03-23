# NBA Live Hub

Dashboard NBA completa per **regular season + playoff picture**, pensata per essere pubblicata su **GitHub + Vercel** e vista bene su smartphone e browser.

## Cosa include

- scoreboard live e partite del giorno
- prossime partite
- standings East / West
- playoff picture pronta per top 6 + play-in + chase
- route API interne Next.js
- refresh automatico lato client
- base pronta per dettaglio partita, bracket e squadre preferite

## Struttura chiave

```text
src/
  app/
    api/nba/
      health/route.ts
      overview/route.ts
    layout.tsx
    page.tsx
  components/
    DashboardClient.tsx
  lib/nba/
    constants.ts
    types.ts
    providers/
      espn.ts
```

## Provider attuale

Questa versione usa **ESPN public endpoints** lato server come base gratuita, quindi non richiede API key per iniziare.

Per una versione futura più stabile e documentata puoi sostituire il provider con balldontlie mantenendo la stessa UI.

## Avvio locale

```bash
npm install
npm run dev
```

Apri:

```text
http://localhost:3000
```

## Endpoint interni

- `/api/nba/health`
- `/api/nba/overview`

## Deploy su GitHub e Vercel

```bash
git add .
git commit -m "Refactor NBA app: regular season + playoff ready dashboard"
git push
```

Poi importa o aggiorna il repository su Vercel.

## Roadmap consigliata

1. pagina dettaglio partita `/game/[id]`
2. filtro squadre preferite
3. bracket playoff round-by-round
4. switch provider ESPN / balldontlie
5. cron o revalidate dedicato per finestre live

## Nota

Non è stato possibile eseguire qui una build completa con dipendenze installate dal registry, quindi dopo aver scompattato il progetto conviene fare un controllo locale con:

```bash
npm install
npm run build
```
