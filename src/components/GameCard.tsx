import React from 'react';
import { teamLogos } from '@/utils/nbaTeamLogos';

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

interface GameCardProps {
  game: Game;
  type: 'today' | 'upcoming' | 'finished';
}

export default function GameCard({ game, type }: GameCardProps) {
  const gameDate = new Date(game.date);
  const isLive = type === 'today' && game.homePts === 0 && game.visitorPts === 0;
  const homeWin = game.homePts > game.visitorPts;
  const visitorWin = game.visitorPts > game.homePts;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{fontSize: '12px', color: '#6b7280'}}>
          {gameDate.toLocaleDateString()}
        </span>
        {isLive && (
          <span style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '500'
          }}>
            LIVE
          </span>
        )}
        {type === 'upcoming' && game.startTimeET && (
          <span style={{fontSize: '12px', color: '#6b7280'}}>
            {game.startTimeET}
          </span>
        )}
        {game.isPlayoff && (
          <span style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '500'
          }}>
            PLAYOFF
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{padding: '16px'}}>
        {/* Visitor Team */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f3f4f6',
          fontWeight: visitorWin && type === 'finished' ? '600' : 'normal'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <img 
              src={teamLogos[game.visitorTeam] || "/favicon.jpg"} 
              alt={game.visitorTeam} 
              style={{width: '32px', height: '32px', objectFit: 'contain'}}
            />
            <span style={{fontWeight: '500', color: '#1f2937'}}>
              {game.visitorTeam}
            </span>
          </div>
          {type === 'finished' && (
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: visitorWin ? '#1f2937' : '#9ca3af'
            }}>
              {game.visitorPts}
            </span>
          )}
        </div>

        {/* Home Team */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: homeWin && type === 'finished' ? '600' : 'normal'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <img 
              src={teamLogos[game.homeTeam] || "/favicon.jpg"} 
              alt={game.homeTeam} 
              style={{width: '32px', height: '32px', objectFit: 'contain'}}
            />
            <span style={{fontWeight: '500', color: '#1f2937'}}>
              {game.homeTeam}
            </span>
          </div>
          {type === 'finished' && (
            <span style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: homeWin ? '#1f2937' : '#9ca3af'
            }}>
              {game.homePts}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#f9fafb',
        fontSize: '12px',
        color: '#6b7280',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {game.arena}
      </div>
    </div>
  );
}
