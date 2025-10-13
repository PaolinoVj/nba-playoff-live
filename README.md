***

# NBA Regular Season Live 2024-25

**Web App aggiornata in tempo reale sulla stagione NBA 2024-25.**

## Funzionalità

- **Live standings** delle conference NBA (classifiche in tempo reale)
- **Partite del giorno** e risultati degli ultimi incontri
- **Lista squadre NBA** aggiornata con info e abbreviazioni
- **Aggiornamento automatico** ogni 10 minuti durante la stagione
- **Design NBA moderno**, mobile responsive
- Nessuna dipendenza da file JSON manuali: tutti i dati arrivano dalle API pubbliche `balldontlie.io`

## Tecnologie

- **Next.js** + **React** (Typescript supportato)
- **fetch API** REST per collegamento ai dati NBA live
- **CSS personalizzato/NBA style** (modificabile tramite `globals.css`)
- **Compatibilità mobile** migliorata

## Come usare

1. **Clona o aggiorna** il repository:

   ```
   git clone https://github.com/PaolinoVj/nba-playoff-live.git
   cd nba-playoff-live
   ```

2. **Installa le dipendenze** (se nuove):

   ```
   npm install
   ```

3. **Avvia l'app in locale**:

   ```
   npm run dev
   ```

4. Visita `http://localhost:3000` per vedere la dashboard live NBA 2024-25.

## Configurazione & Personalizzazione

- Tutti gli stili principali sono in **`src/app/globals.css`**.
- Modifica o estendi il componente `page.tsx` per nuove funzioni (es. standings più avanzate, statistiche giocatori, dettagli partita).
- Vuoi cambiare tema colore? Modifica le variabili :root in `globals.css`.

## Fonti dati

- Tutti i dati sono ottenuti da: [balldontlie.io API](https://balldontlie.io)
  - **/teams** — lista squadre
  - **/games** — partite per stagione, data, stato

## Note

- Il servizio balldontlie.io fornisce aggiornamenti rapidi e gratuiti, ma per classifiche avanzate può servire un extra processing client-side.
- La struttura del frontend è pronta per accogliere temi custom e componenti aggiuntivi!

***
