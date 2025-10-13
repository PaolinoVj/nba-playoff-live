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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{gameDate.toLocaleDateString()}</span>
          {isLive && <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">LIVE</span>}
          {type === 'upcoming' && game.startTimeET && <span>{game.startTimeET}</span>}
          {game.isPlayoff && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">PLAYOFF</span>}
        </div>
      </div>

      {/* Teams */}
      <div className="p-4">
        {/* Visitor Team */}
        <div className={`flex items-center justify-between mb-3 pb-3 border-b border-gray-100 ${visitorWin && type === 'finished' ? 'font-semibold' : ''}`}>
          <div className="flex items-center space-x-3">
            <img 
              src={teamLogos[game.visitorTeam] || "/favicon.jpg"} 
              alt={game.visitorTeam} 
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium text-gray-900">{game.visitorTeam}</span>
          </div>
          {type === 'finished' && (
            <span className={`text-lg font-bold ${visitorWin ? 'text-gray-900' : 'text-gray-400'}`}>
              {game.visitorPts}
            </span>
          )}
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between ${homeWin && type === 'finished' ? 'font-semibold' : ''}`}>
          <div className="flex items-center space-x-3">
            <img 
              src={teamLogos[game.homeTeam] || "/favicon.jpg"} 
              alt={game.homeTeam} 
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium text-gray-900">{game.homeTeam}</span>
          </div>
          {type === 'finished' && (
            <span className={`text-lg font-bold ${homeWin ? 'text-gray-900' : 'text-gray-400'}`}>
              {game.homePts}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 truncate">
        {game.arena}
      </div>
    </div>
  );
}
