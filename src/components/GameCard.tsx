type GameCardProps = {
  game: {
    gameId: string;
    homeTeam: string;
    visitorTeam: string;
    homePts: number;
    visitorPts: number;
    status: string;
    broadcast?: string;
    venue?: string;
    homeTeamName?: string;
    visitorTeamName?: string;
  };
  type: 'today' | 'upcoming' | 'finished';
};

// Helper per generare link Google
function getGoogleSearchLink(homeTeam: string, visitorTeam: string, type: string): string {
  let query = '';
  switch(type) {
    case 'finished':
      query = `${homeTeam} vs ${visitorTeam} NBA final score recap highlights`;
      break;
    case 'today':
    case 'upcoming':
      query = `${homeTeam} vs ${visitorTeam} NBA live score stats preview`;
      break;
    default:
      query = `${homeTeam} vs ${visitorTeam} NBA`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
}

export default function GameCard({ game, type }: GameCardProps) {
  const getStatusColor = () => {
    switch(type) {
      case 'finished': return '#059669';
      case 'today': return '#dc2626';
      case 'upcoming': return '#d97706';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch(type) {
      case 'finished': return '✅';
      case 'today': return '🔴';
      case 'upcoming': return '⏰';
      default: return '📅';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: type === 'today' ? '1px solid #ef4444' : '1px solid #e5e7eb'
    }}>
      {/* Header con status e link Google */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
        <span style={{
          color: getStatusColor(),
          fontWeight: '500',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {getStatusIcon()} {game.status}
        </span>
        <a 
          href={getGoogleSearchLink(
            game.homeTeamName || game.homeTeam,
            game.visitorTeamName || game.visitorTeam,
            type
          )}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#4285f4',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          {type === 'finished' ? '📊 Recap' : '📈 Stats'}
        </a>
      </div>
      
      {/* Teams e Score */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
        <div style={{textAlign: 'center', flex: 1}}>
          <p style={{fontWeight: '600', fontSize: '16px', margin: '0 0 4px 0'}}>{game.visitorTeam}</p>
          {type === 'finished' && (
            <p style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>{game.visitorPts}</p>
          )}
        </div>
        <div style={{fontSize: '16px', color: '#666', margin: '0 16px'}}>
          {type === 'finished' ? 'vs' : '@'}
        </div>
        <div style={{textAlign: 'center', flex: 1}}>
          <p style={{fontWeight: '600', fontSize: '16px', margin: '0 0 4px 0'}}>{game.homeTeam}</p>
          {type === 'finished' && (
            <p style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>{game.homePts}</p>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      {(game.venue || game.broadcast) && (
        <div style={{fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px'}}>
          {game.venue && `🏟️ ${game.venue}`}
          {game.venue && game.broadcast && ' • '}
          {game.broadcast && `📺 ${game.broadcast}`}
        </div>
      )}
    </div>
  );
}
