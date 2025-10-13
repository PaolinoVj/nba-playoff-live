"use client";
import { useEffect, useState } from "react";
import StandingsTable from '@/components/StandingsTable';
import { teamLogos } from "@/utils/nbaTeamLogos";

// ENDPOINT NBA UFFICIALI (gratuiti)
const NBA_TEAMS_URL = "https://stats.nba.com/stats/leagueteams?LeagueID=00&Season=2023-24";
const NBA_GAMES_URL = "https://stats.nba.com/stats/leaguegames?Direction=DESC&LeagueID=00&PlayerOrTeam=T&Season=2023-24&SeasonType=Regular+Season&Sorter=DATE";

export default function HomePage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Prova con NBA.com diretto
        console.log("Fetching NBA official data...");
        
        const teamsResp = await fetch(NBA_TEAMS_URL, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!teamsResp.ok) {
          throw new Error(`Teams API failed: ${teamsResp.status}`);
        }
        
        const teamsData = await teamsResp.json();
        console.log("Teams data:", teamsData);
        setTeams(teamsData.resultSets[0]?.rowSet || []);

        const gamesResp = await fetch(NBA_GAMES_URL, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!gamesResp.ok) {
          throw new Error(`Games API failed: ${gamesResp.status}`);
        }
        
        const gamesData = await gamesResp.json();
        console.log("Games data:", gamesData);
        setGames(gamesData.resultSets[0]?.rowSet?.slice(0, 20) || []);

        setDebugInfo(`Teams: ${teamsData.resultSets[0]?.rowSet?.length || 0}, Games: ${gamesData.resultSets[0]?.rowSet?.length || 0}`);

      } catch (e) { 
        console.error("Errore API NBA:", e); 
        setDebugInfo(`Error: ${e}`);
        
        // FALLBACK: Dati mock se API fallisce
        setTeams([
          ['Boston Celtics', 'BOS', 'Eastern'],
          ['Lakers', 'LAL', 'Western']
        ]);
        setGames([]);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return <div style={{padding:50}}>Caricamento dati NBA...</div>;

  return (
    <main style={{ backgroundColor: "#1d428a", color: "#fff", minHeight: "100vh", padding: 16 }}>
      <h1>🏀 NBA 2023-24 Regular Season Live</h1>
      
      <div style={{background:"#333", padding:"8px", margin:"8px 0", fontSize:"12px", borderRadius:"4px"}}>
        Debug: {debugInfo}
      </div>

      <section>
        <h2>Squadre NBA</h2>
        <ul style={{ columns: 2 }}>
          {teams.map((team, i) => (
            <li key={i}>
              <b>{team[1]}</b> - {team[2]}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Partite Recenti</h2>
        <ul>
          {games.length === 0 
            ? <li>API temporaneamente non disponibile - implementazione in corso...</li>
            : games.map((game, i) => (
                <li key={i}>Partita #{i + 1}: {JSON.stringify(game).substring(0, 100)}...</li>
              ))}
        </ul>
      </section>

      <footer style={{ marginTop: 32, opacity: 0.7 }}>
        <small>Dati by NBA.com | In sviluppo...</small>
      </footer>
    </main>
  );
}
