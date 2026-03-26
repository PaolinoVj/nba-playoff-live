# NBA Live Hub

Dashboard NBA pensata per **regular season + playoff ready**, pubblicabile su **GitHub + Vercel** e leggibile bene su smartphone e browser.

## Stack dati in questa versione

- **ESPN public endpoints** per overview live e standings correnti
- **balldontlie** per storico partite interrogato on demand
- orari sempre convertiti in **Europe/Rome** lato app
- route API interne Next.js per non esporre direttamente i provider al browser

## Nuovo in questa patch

- pagina `/season` con filtro stagione / squadra / regular season / playoff
- route `/api/nba/games` per interrogare lo storico senza scaricare archivi locali
- route `/api/nba/teams` per popolare i filtri squadra con gli ID di balldontlie
- route `/api/nba/standings` per classifica corrente e playoff picture
- navigazione base in header tra dashboard e season explorer

## Struttura chiave

```text
src/
  app/
    api/nba/
      games/route.ts
      health/route.ts
      overview/route.ts
      standings/route.ts
      teams/route.ts
    season/page.tsx
    layout.tsx
    page.tsx
  components/
    DashboardClient.tsx
    SeasonExplorer.tsx
  lib/nba/
    constants.ts
    types.ts
    providers/
      balldontlie.ts
      espn.ts
```

## Variabili ambiente

Crea o aggiorna `.env.local`:

```bash
BALLDONTLIE_API_KEY=la_tua_api_key
```

> L'app legge anche il fallback `BALDONTLIE_API_KEY` (senza la seconda `L`) per evitare rotture su progetti Vercel già configurati con un nome legacy.

### Vercel (variabili criptate)

1. Apri **Project → Settings → Environment Variables**.
2. Inserisci `BALLDONTLIE_API_KEY` (oppure il legacy `BALDONTLIE_API_KEY`) nei target che usi (`Preview`/`Production`).
3. Fai un **Redeploy** dopo il salvataggio.
4. Verifica la configurazione con `/api/nba/health`: `providers.balldontlieConfigured` deve essere `true`.

Senza questa chiave:

- la home continua a funzionare con ESPN
- `/season` caricherà la classifica corrente
- lo storico partite via `/api/nba/games` e `/api/nba/teams` risponderà con messaggio di configurazione mancante

## Avvio locale

```bash
npm install
npm run dev
```

Apri:

- `http://localhost:3000`
- `http://localhost:3000/season`

## Endpoint interni

- `/api/nba/health`
- `/api/nba/overview`
- `/api/nba/standings`
- `/api/nba/teams`
- `/api/nba/games?season=2025&postseason=false&per_page=100`

## Build di controllo

```bash
npm run build
npm start
```
