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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              W
            </th>
            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              L
            </th>
            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              PCT
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((st, index) => (
            <tr key={st.team} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    {index + 1}
                  </span>
                  <img 
                    src={teamLogos[st.team] || "/favicon.jpg"} 
                    alt={st.team} 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {st.team}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                {st.wins}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                {st.losses}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                {st.pct.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
