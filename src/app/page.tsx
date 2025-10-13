"use client";
import { useEffect, useState } from "react";
import StandingsTable from '@/components/StandingsTable';
import GameCard from '@/components/GameCard';

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
  startTimeET?: string;
};

const WEST_TEAMS = ['LAL', 'GSW', 'DEN', 'PHX', 'SAC', 'LAC', 'POR', 'UTA', 'OKC', 'MIN', 'NOP', 'DAL', 'SAS', 'MEM', 'HOU'];

function computeStandingsFromGames(games: Game[]): Team[] {
  const standings: Record<string, Team> = {};
  
  games.forEach(game => {
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
        const gamesRes = await fetch(`${API_BASE}/games?page=1&pageSize=100&sortBy=date&ascending=false`);
        
        if (!gamesRes.ok) throw new Error(`HTTP ${gamesRes.status}`);
        
        const gamesData = await gamesRes.json();
        const gamesList: Game[] = gamesData.data || [];
        
        setGames(gamesList);
        setRecentGames(gamesList.slice(0, 20));
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`API Error: ${errorMessage}`);
        console.error("NBA API Error:", err);
      }
      
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}></div>
      <p style={{color: '#666'}}>Loading NBA data...</p>
    </div>
  );
  
  const standings = computeStandingsFromGames(games.filter(g => !g.isPlayoff));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayGames = recentGames.filter(game => game.date.startsWith(todayStr));
  const upcomingGames = recentGames.filter(game => new Date(game.date) > new Date()).slice(0, 6);
  const finishedGames = recentGames.filter(game => game.homePts > 0 && game.visitorPts > 0).slice(0, 8);

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #f87171',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{color: '#b91c1c'}}>⚠️ {error}</p>
        </div>
      )}

      {/* Main Content */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '32px 16px'}}>
        
        {/* Today's Games */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            🔴 Today's Games
          </h2>
          {todayGames.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{color: '#6b7280'}}>No games scheduled for today</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {todayGames.map(game => (
                <GameCard key={game.gameId} game={game} type="today" />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Games */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            📅 Upcoming Games
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {upcomingGames.map(game => (
              <GameCard key={game.gameId} game={game} type="upcoming" />
            ))}
          </div>
        </section>

        {/* Standings */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            📊 Conference Standings
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px'
          }}>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '16px'
              }}>
                Eastern Conference
              </h3>
              <StandingsTable standings={standings.filter(t => t.conference === 'East').slice(0, 8)} />
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '16px'
              }}>
                Western Conference
              </h3>
              <StandingsTable standings={standings.filter(t => t.conference === 'West').slice(0, 8)} />
            </div>
          </div>
        </section>

        {/* Recent Results */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            📈 Recent Results
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {finishedGames.map(game => (
              <GameCard key={game.gameId} game={game} type="finished" />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
<footer style={{
  backgroundColor: 'white',
  borderTop: '1px solid #e5e7eb',
  padding: '24px 16px',
  textAlign: 'center'
}}>
  <div style={{fontSize: '14px', color: '#6b7280'}}>
    Data provided by <span style={{fontWeight: '500', color: '#1f2937'}}>NBA API</span> &bull; 
    Updated every 10 minutes
  </div>
</footer>

    </div>
  );
}
