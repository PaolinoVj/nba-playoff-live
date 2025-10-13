import React from "react";
import { teamLogos } from "@/utils/nbaTeamLogos";

type TeamStanding = {
  team: string;
  wins: number;
  losses: number;
  pct: number;
  conference: string;
};

export default function StandingsTable({
  standings,
  teamLogos
}: {
  standings: TeamStanding[],
  teamLogos: Record<string, string>
}) {
  return (
    <table style={{
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      color: "#222",
      borderRadius: 8,
      marginBottom: 24
    }}>
      <thead style={{ background: "#1d428a", color: "#fff" }}>
        <tr>
          <th>SQUADRA</th>
          <th>W</th>
          <th>L</th>
          <th>%</th>
          <th>CONF</th>
        </tr>
      </thead>
      <tbody>
        {standings.map(st => (
          <tr key={st.team}>
            <td>
              <img src={teamLogos[st.team]} alt={st.team} style={{ width: 28, verticalAlign: "middle", marginRight: 7 }} />
              <b>{st.team}</b>
            </td>
            <td>{st.wins}</td>
            <td>{st.losses}</td>
            <td>{st.pct.toFixed(3)}</td>
            <td>{st.conference}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
