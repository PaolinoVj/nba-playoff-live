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
    <table style={{
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      color: "#222",
      borderRadius: 8,
      marginBottom: 24,
      fontSize: "0.9em"
    }}>
      <thead style={{ background: "#1d428a", color: "#fff" }}>
        <tr>
          <th style={{padding: "8px", textAlign: "left"}}>SQUADRA</th>
          <th style={{padding: "8px", textAlign: "center"}}>W</th>
          <th style={{padding: "8px", textAlign: "center"}}>L</th>
          <th style={{padding: "8px", textAlign: "center"}}>%</th>
        </tr>
      </thead>
      <tbody>
        {standings.map(st => (
          <tr key={st.team}>
            <td style={{padding: "8px"}}>
              <img 
                src={teamLogos[st.team] || "/favicon.jpg"} 
                alt={st.team} 
                style={{ width: 24, height: 24, borderRadius: 4, verticalAlign: "middle", marginRight: 8 }} 
              />
              <b>{st.team}</b>
            </td>
            <td style={{padding: "8px", textAlign: "center"}}>{st.wins}</td>
            <td style={{padding: "8px", textAlign: "center"}}>{st.losses}</td>
            <td style={{padding: "8px", textAlign: "center"}}>{st.pct.toFixed(3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
