"use client";
import { useEffect, useState } from "react";
import StandingsTable from '@/components/StandingsTable';
import { teamLogos } from "@/utils/nbaTeamLogos";

// API NBA FUNZIONANTE
const API_BASE = "https://api.server.nbaapi.com/api";

type Team = {
  team: string;
  games: number;
  wins: number;
  losses: number;
  pct: number;
  conference: string;
};

type Game = {
  gameId: string;
  date: string;
  homeTeam: string;
  visitorTeam: string;
  homePts: number;
  visitorPts: number;
  isPlayoff: boolean;
  arena: string;
};

// Mappa squadre NBA per conference (semplificata)
const WEST_TEAMS = ['LAL', 'GSW', 'DEN', 'PHX', 'SAC', 'LAC', 'POR', 'UTA', 'OKC', 'MIN', 'NOP', 'DAL', 'SAS', 'MEM', 'HOU'];

function computeStandingsFromGames(games: Game[]): Team[] {
  const standings: Record<string, Team> = {};
  
  games.forEach(game => {
    // Inizializza squadre se non esistono
    [game.homeTeam, game.visitorTeam].forEach(teamAbbr => {
      if (!standings[teamAbbr]) {
        standings[teamAbbr] = {
          team: teamAbbr,
          games: 0,
          wins: 0,
          losses: 0,
          pct: 0,
          conference: WEST_TEAMS.includes(teamAbbr) ? 'West' : 'East'
        };
      }
    });
    
    // Conta vittorie/sconfitte solo per partite concluse
    if (game.homePts > 0 || game.visitorPts > 0) {
      standings[game.homeTeam].games++;
      standings[game.visitorTeam].games++;
      
      if (game.homePts > game.visitorPts) {
        standings[game.homeTeam].wins++;
        standings[game.visitorTeam].losses++;
      } else if (game.visitorPts > game.homePts) {
        standings[game.visitorTeam].wins++;
        standings[game.homeTeam].losses++;
      }
    }
  });
  
  // Calcola percentuali e ordina
  return Object.values(standings)
    .map(team => ({
      ...team,
      pct: team.games > 0 ? team.wins / team.games : 0
    }))
    .sort((a, b) => b.pct - a.pct);
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      
      try {
        // Partite recenti (per standings)
        const gamesRes = await fetch(`${API_BASE}/games?page=1&pageSize=100&sortBy=date&ascending=false`);
        
        if (!gamesRes.ok) throw new Error(`HTTP ${gamesRes.status}`);
        
        const gamesData = await gamesRes.json();
        const gamesList: Game[] = gamesData.data || [];
        
        setGames(gamesList);
        setRecentGames(gamesList.slice(0, 15));
        
      } catch (err: any) {
        setError(`Errore API: ${err.message}`);
        console.error("NBA API Error:", err);
      }
      
      setLoading(false);
    }

    fetchData();
    // Aggiorna ogni 10 minuti
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{padding: 50, textAlign: 'center', background: '#1d428a', color: '#fff', minHeight: '100vh'}}>
      🏀 Caricamento dati NBA...
    </div>
  );
  
  const standings = computeStandingsFromGames(games.filter(g => !g.isPlayoff));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayGames = recentGames.filter(game => game.date.startsWith(todayStr));

  return (
    <main style={{ backgroundColor: "#1d428a", color: "#fff", minHeight: "100vh", padding: 16 }}>
      <h1>🏀 NBA 2024-25 Live Stats</h1>
      
      {error && (
        <div style={{background:"#c8102e", padding:"12px", margin:"12px 0", borderRadius:"6px"}}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Partite di oggi */}
      <section style={{marginBottom: 30}}>
        <h2>🔥 Partite di Oggi</h2>
        {todayGames.length === 0 ? (
          <p>Nessuna partita programmata oggi.</p>
        ) : (
          <ul style={{listStyle: "none", padding: 0}}>
            {todayGames.map(game => (
              <li key={game.gameId} style={{
                background: "#2d5aa0", 
                margin: "8px 0", 
                padding: "12px", 
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <strong>{game.homeTeam} vs {game.visitorTeam}</strong>
                  <br />
                  <small>{game.arena}</small>
                </div>
                <div style={{textAlign: "right"}}>
                  {game.homePts > 0 ? (
                    <strong>{game.homePts} - {game.visitorPts}</strong>
                  ) : (
                    <span>In programma</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Standings */}
      <section style={{marginBottom: 30}}>
        <h2>📊 Classifica Eastern Conference</h2>
        <StandingsTable standings={standings.filter(t => t.conference === 'East').slice(0, 8)} />
        
        <h2>📊 Classifica Western Conference</h2>
        <StandingsTable standings={standings.filter(t => t.conference === 'West').slice(0, 8)} />
      </section>

      {/* Partite recenti */}
      <section>
        <h2>📈 Ultimi Risultati</h2>
        <ul style={{listStyle: "none", padding: 0}}>
          {recentGames.slice(0, 8).map(game => (
            <li key={game.gameId} style={{
              background: "#ffffff15", 
              margin: "6px 0", 
              padding: "10px", 
              borderRadius: "6px",
              fontSize: "0.9em"
            }}>
              <strong>{game.homeTeam} {game.homePts}</strong> - 
              <strong>{game.visitorPts} {game.visitorTeam}</strong>
              <small style={{marginLeft: 12, opacity: 0.7}}>
                {new Date(game.date).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <footer style={{ marginTop: 40, textAlign: "center", opacity: 0.8, fontSize: "0.9em" }}>
        Dati live da <strong>nbaapi.com</strong> • Aggiornamento automatico ogni 10 min
      </footer>
    </main>
  );
}
