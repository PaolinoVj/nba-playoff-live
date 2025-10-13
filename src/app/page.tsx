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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading NBA data...</p>
      </div>
    </div>
  );
  
  const standings = computeStandingsFromGames(games.filter(g => !g.isPlayoff));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayGames = recentGames.filter(game => game.date.startsWith(todayStr));
  const upcomingGames = recentGames.filter(game => new Date(game.date) > new Date()).slice(0, 6);
  const finishedGames = recentGames.filter(game => game.homePts > 0 && game.visitorPts > 0).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">⚠️ {error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Today's Games */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            🔴 Today's Games
          </h2>
          {todayGames.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">No games scheduled for today</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {todayGames.map(game => (
                <GameCard key={game.gameId} game={game} type="today" />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Games */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📅 Upcoming Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingGames.map(game => (
              <GameCard key={game.gameId} game={game} type="upcoming" />
            ))}
          </div>
        </section>

        {/* Standings */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Conference Standings</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Eastern Conference</h3>
              <StandingsTable standings={standings.filter(t => t.conference === 'East').slice(0, 8)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Western Conference</h3>
              <StandingsTable standings={standings.filter(t => t.conference === 'West').slice(0, 8)} />
            </div>
          </div>
        </section>

        {/* Recent Results */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            📈 Recent Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {finishedGames.map(game => (
              <GameCard key={game.gameId} game={game} type="finished" />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            Data provided by <span className="font-medium text-gray-900">NBA API</span> • 
            Updated every 10 minutes
          </div>
        </div>
      </footer>
    </div>
  );
}
