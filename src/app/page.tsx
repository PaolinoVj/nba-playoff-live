"use client";
import { useEffect, useState } from "react";
import StandingsTable from '@/components/StandingsTable';
import GameCard from '@/components/GameCard';

// ESPN API (funziona!)
const ESPN_API = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";

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
  status: string;
  venue: string;
  broadcast?: string;
  homeTeamName?: string;
  visitorTeamName?: string;
};

// Conference mapping CORRETTA
const WEST_TEAMS = [
  'LAL', 'GSW', 'DEN', 'PHX', 'SAC', 'LAC', 'POR', 'UTA', 
  'OKC', 'MIN', 'NOP', 'DAL', 'SAS', 'MEM', 'HOU'
];

const EAST_TEAMS = [
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 
  'MIA', 'MIL', 'NYK', 'ORL', 'PHI', 'TOR', 'WAS'
];

// Helper per generare link Google
function getGoogleSearchLink(homeTeam: string, visitorTeam: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${homeTeam} vs ${visitorTeam} NBA live score stats`)}&hl=en`;
}

function computeStandingsFromGames(games: Game[]): Team[] {
  const standings: Record<string, Team> = {};
  
  games.forEach(game => {
    [game.homeTeam, game.visitorTeam].forEach(teamAbbr => {
      if (!standings[teamAbbr] && (WEST_TEAMS.includes(teamAbbr) || EAST_TEAMS.includes(teamAbbr))) {
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
    
    if (game.homePts > 0 && game.visitorPts > 0) {
      const homeAbbr = game.homeTeam;
      const visitorAbbr = game.visitorTeam;
      
      if (standings[homeAbbr]) {
        standings[homeAbbr].games++;
        if (game.homePts > game.visitorPts) {
          standings[homeAbbr].wins++;
        } else {
          standings[homeAbbr].losses++;
        }
      }
      
      if (standings[visitorAbbr]) {
        standings[visitorAbbr].games++;
        if (game.visitorPts > game.homePts) {
          standings[visitorAbbr].wins++;
        } else {
          standings[visitorAbbr].losses++;
        }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchESPNData() {
      setLoading(true);
      setError("");
      
      try {
        // Fetch oggi
        const todayRes = await fetch(`${ESPN_API}/scoreboard`);
        // Fetch domani  
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0].replace(/-/g, '');
        const upcomingRes = await fetch(`${ESPN_API}/scoreboard?dates=${tomorrowStr}`);
        
        if (!todayRes.ok && !upcomingRes.ok) {
          throw new Error('ESPN API non disponibile');
        }
        
        const allGames: Game[] = [];
        
        // Process today's games - FIX TYPESCRIPT
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          if (todayData.events) {
            todayData.events.forEach((event: Record<string, unknown>) => {
              const comp = event.competitions?.[0] as Record<string, unknown>;
              const competitors = comp?.competitors as Record<string, unknown>[];
              const homeTeam = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'home') as Record<string, unknown>;
              const awayTeam = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'away') as Record<string, unknown>;
              
              allGames.push({
                gameId: String(event.id || ''),
                date: String(event.date || ''),
                homeTeam: String((homeTeam?.team as Record<string, unknown>)?.abbreviation || ''),
                visitorTeam: String((awayTeam?.team as Record<string, unknown>)?.abbreviation || ''),
                homeTeamName: String((homeTeam?.team as Record<string, unknown>)?.displayName || ''),
                visitorTeamName: String((awayTeam?.team as Record<string, unknown>)?.displayName || ''),
                homePts: parseInt(String(homeTeam?.score || '0')),
                visitorPts: parseInt(String(awayTeam?.score || '0')),
                status: String((comp?.status as Record<string, unknown>)?.type?.description || ''),
                venue: String((comp?.venue as Record<string, unknown>)?.fullName || ''),
                broadcast: String((comp?.broadcasts as Record<string, unknown>[])?.[0]?.names?.[0] || event.broadcast || '')
              });
            });
          }
        }
        
        // Process upcoming games - FIX TYPESCRIPT  
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json();
          if (upcomingData.events) {
            upcomingData.events.forEach((event: Record<string, unknown>) => {
              const comp = event.competitions?.[0] as Record<string, unknown>;
              const competitors = comp?.competitors as Record<string, unknown>[];
              const homeTeam = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'home') as Record<string, unknown>;
              const awayTeam = competitors?.find((c: Record<string, unknown>) => c.homeAway === 'away') as Record<string, unknown>;
              
              allGames.push({
                gameId: String(event.id || ''),
                date: String(event.date || ''),
                homeTeam: String((homeTeam?.team as Record<string, unknown>)?.abbreviation || ''),
                visitorTeam: String((awayTeam?.team as Record<string, unknown>)?.abbreviation || ''),
                homeTeamName: String((homeTeam?.team as Record<string, unknown>)?.displayName || ''),
                visitorTeamName: String((awayTeam?.team as Record<string, unknown>)?.displayName || ''),
                homePts: parseInt(String(homeTeam?.score || '0')),
                visitorPts: parseInt(String(awayTeam?.score || '0')),
                status: String((comp?.status as Record<string, unknown>)?.type?.description || ''),
                venue: String((comp?.venue as Record<string, unknown>)?.fullName || ''),
                broadcast: String((comp?.broadcasts as Record<string, unknown>[])?.[0]?.names?.[0] || event.broadcast || '')
              });
            });
          }
        }
        
        setGames(allGames);
        
      } catch (err: unknown) {  // FIX TYPESCRIPT
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error("ESPN API Error:", err);
      }
      
      setLoading(false);
    }

    fetchESPNData();
    const interval = setInterval(fetchESPNData, 300000); // 5 minuti
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
        borderTop: '3px solid #ef4444',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}></div>
      <p style={{color: '#666', fontSize: '18px'}}>Loading NBA Live Data...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  
  const standings = computeStandingsFromGames(games);
  const now = new Date();
  
  // Filtri partite
  const liveGames = games.filter(g => 
    g.status.includes('Quarter') || g.status.includes('Half') || g.status === 'In Progress'
  );
  const todayGames = games.filter(g => {
    const gameDate = new Date(g.date);
    return gameDate.toDateString() === now.toDateString();
  });
  const upcomingGames = games.filter(g => {
    const gameDate = new Date(g.date);
    return gameDate > now && g.homePts === 0 && g.visitorPts === 0;
  }).slice(0, 8);
  const finishedGames = games.filter(g => 
    (g.homePts > 0 && g.visitorPts > 0) || g.status === 'Final'
  ).slice(0, 8);

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #f87171',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{color: '#b91c1c', margin: 0}}>⚠️ {error}</p>
        </div>
      )}

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '32px 16px'}}>
        
        {/* Live Games - Priorità massima */}
        {liveGames.length > 0 && (
          <section style={{marginBottom: '48px'}}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ef4444',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🔴 LIVE NOW
              <span style={{
                fontSize: '14px',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {liveGames.length}
              </span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {liveGames.map(game => (
                <div key={game.gameId} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #ef4444'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <span style={{color: '#ef4444', fontWeight: '600', fontSize: '14px'}}>{game.status}</span>
                    <a 
                      href={getGoogleSearchLink(game.homeTeamName || game.homeTeam, game.visitorTeamName || game.visitorTeam)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#4285f4',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textDecoration: 'none'
                      }}
                    >
                      📊 Stats
                    </a>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{textAlign: 'center', flex: 1}}>
                      <p style={{fontWeight: '600', fontSize: '16px', margin: '0 0 4px 0'}}>{game.visitorTeam}</p>
                      <p style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>{game.visitorPts}</p>
                    </div>
                    <div style={{fontSize: '20px', color: '#666', margin: '0 16px'}}>@</div>
                    <div style={{textAlign: 'center', flex: 1}}>
                      <p style={{fontWeight: '600', fontSize: '16px', margin: '0 0 4px 0'}}>{game.homeTeam}</p>
                      <p style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>{game.homePts}</p>
                    </div>
                  </div>
                  {game.broadcast && (
                    <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '12px', margin: 0}}>
                      📺 {game.broadcast}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's Games */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            📅 Today&apos;s Schedule ({todayGames.length})
          </h2>
          {todayGames.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{color: '#6b7280', margin: 0}}>No games scheduled for today</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
            ⏰ Upcoming Games ({upcomingGames.length})
          </h2>
          {upcomingGames.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p style={{color: '#6b7280', margin: 0}}>No upcoming games found</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {upcomingGames.map(game => (
                <div key={game.gameId} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <span style={{color: '#059669', fontWeight: '500', fontSize: '14px'}}>{game.status}</span>
                    <a 
                      href={getGoogleSearchLink(game.homeTeamName || game.homeTeam, game.visitorTeamName || game.visitorTeam)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#4285f4',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textDecoration: 'none'
                      }}
                    >
                      📊 Preview
                    </a>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{fontWeight: '600', fontSize: '16px'}}>{game.visitorTeam}</span>
                    <span style={{color: '#666', fontSize: '14px'}}>@</span>
                    <span style={{fontWeight: '600', fontSize: '16px'}}>{game.homeTeam}</span>
                  </div>
                  <div style={{textAlign: 'center', marginTop: '8px'}}>
                    <p style={{fontSize: '12px', color: '#666', margin: 0}}>
                      🏟️ {game.venue} {game.broadcast && `• 📺 ${game.broadcast}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Standings */}
        <section style={{marginBottom: '48px'}}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            🏆 Conference Standings
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
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
              <StandingsTable standings={standings.filter(t => t.conference === 'East').slice(0, 10)} />
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
              <StandingsTable standings={standings.filter(t => t.conference === 'West').slice(0, 10)} />
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
            📈 Recent Results ({finishedGames.length})
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

      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        <div style={{fontSize: '14px', color: '#6b7280'}}>
          Data provided by <span style={{fontWeight: '500', color: '#1f2937'}}>ESPN API</span> - Updated every 5 minutes
        </div>
      </footer>
    </div>
  );
}
