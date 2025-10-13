"use client";
import { useEffect, useState } from "react";
import StandingsTable from '@/components/StandingsTable';
import { teamLogos } from "@/utils/nbaTeamLogos";

const TEAMS_ENDPOINT = "https://api.balldontlie.io/v1/teams";
const GAMES_ENDPOINT = "https://api.balldontlie.io/v1/games";
const SEASON = 2024;

type Team = {
  id: number;
  full_name: string;
  abbreviation: string;
  city: string;
  conference: string;
};

type Game = {
  id: number;
  home_team: { id: number; full_name: string; conference: string };
  visitor_team: { id: number; full_name: string; conference: string };
  home_team_score: number;
  visitor_team_score: number;
  status: string;
  date: string;
};

type TeamStanding = {
  team: string;
  wins: number;
  losses: number;
  pct: number;
  conference: string;
};

function computeStandings(games: Game[]): TeamStanding[] {
  const standings: Record<string, TeamStanding> = {};
  for (const g of games) {
    if (!standings[g.home_team.full_name]) {
      standings[g.home_team.full_name] = {
        team: g.home_team.full_name,
        wins: 0, losses: 0, pct: 0, conference: g.home_team.conference
      };
    }
    if (!standings[g.visitor_team.full_name]) {
      standings[g.visitor_team.full_name] = {
        team: g.visitor_team.full_name,
        wins: 0, losses: 0, pct: 0, conference: g.visitor_team.conference
      };
    }
    if (g.status === "Final") {
      if (g.home_team_score > g.visitor_team_score) {
        standings[g.home_team.full_name].wins++;
        standings[g.visitor_team.full_name].losses++;
      } else if (g.home_team_score < g.visitor_team_score) {
        standings[g.visitor_team.full_name].wins++;
        standings[g.home_team.full_name].losses++;
      }
    }
  }
  Object.values(standings).forEach(t => {
    const total = t.wins + t.losses;
    t.pct = total > 0 ? t.wins / total : 0;
  });
  return Object.values(standings).sort((a, b) => b.pct - a.pct);
}

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]); // ✅ Fixed: Team[] instead of any[]
  const [gamesToday, setGamesToday] = useState<Game[]>([]);
  const [recentResults, setRecentResults] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const teamsResp = await fetch(TEAMS_ENDPOINT);
        setTeams((await teamsResp.json()).data);
        const todayStr = new Date().toISOString().split("T")[0];
        const gamesResp = await fetch(`${GAMES_ENDPOINT}?dates[]=${todayStr}&season=${SEASON}&per_page=25`);
        setGamesToday((await gamesResp.json()).data);
        const recentResp = await fetch(`${GAMES_ENDPOINT}?season=${SEASON}&end_date=${todayStr}&per_page=10`);
        setRecentResults((await recentResp.json()).data);
        const allResp = await fetch(`${GAMES_ENDPOINT}?season=${SEASON}&per_page=100`);
        setAllGames((await allResp.json()).data);
      } catch (e) { console.error("Errore API NBA:", e); }
      setLoading(false);
    }
    fetchAll();
    const interval = setInterval(fetchAll, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Caricamento dati NBA 2024-25...</div>;
  const standingsArray = computeStandings(allGames.filter(g => g.status === "Final"));

  return (
    <main style={{ backgroundColor: "#1d428a", color: "#fff", minHeight: "100vh", padding: 16 }}>
      <h1>🏀 NBA 2024-25 Regular Season Live</h1>
      <section>
        <h2>Classifica Conference (Top 10 Eastern)</h2>
        <StandingsTable standings={standingsArray.filter(t => t.conference === "East").slice(0,10)} />
        <h2>Classifica Conference (Top 10 Western)</h2>
        <StandingsTable standings={standingsArray.filter(t => t.conference === "West").slice(0,10)} />
      </section>
      <section>
        <h2>Partite di oggi</h2>
        <ul>
          {gamesToday.length === 0
            ? <li>Nessuna partita programmata oggi.</li>
            : gamesToday.map(game => (
                <li key={game.id}>
                  <img src={teamLogos[game.home_team.full_name]} alt={game.home_team.full_name} style={{width:22,verticalAlign:'middle',marginRight:4}}/>
                  {game.home_team.full_name} vs
                  <img src={teamLogos[game.visitor_team.full_name]} alt={game.visitor_team.full_name} style={{width:22,verticalAlign:'middle',marginRight:4, marginLeft:7}}/>
                  {game.visitor_team.full_name}
                  {" | "}
                  {game.status === "Final" ? `${game.home_team_score} - ${game.visitor_team_score}` : game.status}
                  {" | "}
                  {game.date.split("T")[0]}
                </li>
              ))}
        </ul>
      </section>
      <section>
        <h2>Ultimi risultati</h2>
        <ul>
          {recentResults.map(game => (
            <li key={game.id}>
              <img src={teamLogos[game.home_team.full_name]} alt={game.home_team.full_name} style={{width:22,verticalAlign:'middle',marginRight:4}}/>
              {game.home_team.full_name} {game.home_team_score} -
              <img src={teamLogos[game.visitor_team.full_name]} alt={game.visitor_team.full_name} style={{width:22,verticalAlign:'middle',marginRight:4,marginLeft:7}}/>
              {game.visitor_team.full_name} {game.visitor_team_score}
              ({game.date.split("T")[0]})
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Squadre NBA</h2>
        <ul style={{ columns: 3 }}>
          {teams.map(team => (
            <li key={team.id}>
              <img src={teamLogos[team.full_name]} alt={team.full_name} style={{width:22,verticalAlign:'middle',marginRight:8}}/>
              <b>{team.full_name}</b> ({team.abbreviation}) - {team.city}
            </li>
          ))}
        </ul>
      </section>
      <footer style={{ marginTop: 32, opacity: 0.7 }}>
        <small>Dati live by <a href="https://balldontlie.io" style={{ color: "#fff" }}>balldontlie.io</a> | Auto-refresh ogni 10 minuti.</small>
      </footer>
    </main>
  );
}
