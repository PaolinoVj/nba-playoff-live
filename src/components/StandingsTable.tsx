import React from "react";
import { teamLogos } from "@/utils/nbaTeamLogos";

type TeamStanding = {
  team: string;
  wins: number;
  losses: number;
  pct: number;
  conference: string;
  games?: number;
};

export default function StandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead style={{backgroundColor: '#f9fafb'}}>
          <tr>
            <th style={{
              padding: '12px 16px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Team
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              W
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              L
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              PCT
            </th>
          </tr>
        </thead>
        <tbody style={{backgroundColor: 'white'}}>
          {standings.map((st, index) => (
            <tr key={st.team} style={{borderBottom: '1px solid #f3f4f6'}}>
              <td style={{padding: '12px 16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    minWidth: '24px'
                  }}>
                    {index + 1}
                  </span>
                  <img 
                    src={teamLogos[st.team] || "/favicon.jpg"} 
                    alt={st.team} 
                    style={{width: '24px', height: '24px', objectFit: 'contain'}}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {st.team}
                  </span>
                </div>
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {st.wins}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {st.losses}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {st.pct.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
