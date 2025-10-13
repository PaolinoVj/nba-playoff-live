"use client";
import { useEffect, useState } from "react";

type TeamStanding = {
  name: string;
  abbr: string;
  w: number;
  l: number;
  pct: number;
  conf: "East" | "West";
};

type Game = {
  id: string;
  date: string;
  home: string;
  away: string;
  status: string;
};

const STANDINGS_API = (seasonType: number) =>
  `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings?seasontype=${seasonType}`;
const ESPN_SCORES = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

export default function HomePage() {
  const [standingsPre, setStandingsPre] = useState<TeamStanding[]>([]);
  const [standingsReg, setStandingsReg] = useState<TeamStanding[]>([]);
  const [seasonTab, setSeasonTab] = useState<"pre" | "reg">("pre");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch standings preseason e regular e partite
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Preseason standings
      const stPre = await fetch(STANDINGS_API(1)).then(r => r.json());
      const parsedPre: TeamStanding[] = [];
      stPre.children.forEach((conf: any) => {
        const confName = conf.name === "EAST" ? "East" : "West";
        conf.standings?.entries?.forEach((t: any) => {
          parsedPre.push({
            name: t.team.displayName,
            abbr: t.team.abbreviation,
            w: +t.stats.find((s: any) => s.name === "wins")?.value,
            l: +t.stats.find((s: any) => s.name === "losses")?.value,
            pct: +t.stats.find((s: any) => s.name === "winPercent")?.value,
            conf: confName
          });
        });
      });
      setStandingsPre(parsedPre);

      // Regular season standings
      const stReg = await fetch(STANDINGS_API(2)).then(r => r.json());
      const parsedReg: TeamStanding[] = [];
      stReg.children.forEach((conf: any) => {
        const confName = conf.name === "EAST" ? "East" : "West";
        conf.standings?.entries?.forEach((t: any) => {
          parsedReg.push({
            name: t.team.displayName,
            abbr: t.team.abbreviation,
            w: +t.stats.find((s: any) => s.name === "wins")?.value,
            l: +t.stats.find((s: any) => s.name === "losses")?.value,
            pct: +t.stats.find((s: any) => s.name === "winPercent")?.value,
            conf: confName
          });
        });
      });
      setStandingsReg(parsedReg);

      // Games oggi e prossimi
      const gd = await fetch(ESPN_SCORES).then(r => r.json());
      let gs: Game[] = [];
      if (gd.events) {
        gs = gd.events.map((ev: any) => {
          const c = ev.competitions[0];
          const home = c.competitors.find((x: any) => x.homeAway === "home").team.displayName;
          const away = c.competitors.find((x: any) => x.homeAway === "away").team.displayName;
          return {
            id: ev.id,
            date: ev.date,
            home, away,
            status: c.status.type.description,
          };
        });
      }
      setGames(gs);

      setLoading(false);
    }
    fetchData();
  }, []);

  const now = new Date();
  const todayGames = games.filter(g => {
    const d = new Date(g.date);
    return d.toDateString() === now.toDateString();
  });
  const nextGames = games.filter(g => new Date(g.date) > now).slice(0, 10);

  // Scegli quali standings visualizzare
  const standings = seasonTab === "pre" ? standingsPre : standingsReg;

  return (
    <div style={{maxWidth: 700, margin: "auto", padding: 24}}>
      <header style={{display:'flex',alignItems:'center',gap:18,marginBottom:32}}>
        <img src="https://logoeps.com/wp-content/uploads/2011/05/nba-logo-vector-01.png" alt="NBA Logo" width={48} />
        <div>
          <h1 style={{margin:0,fontSize:24,fontWeight:700}}>NBA 2025-26 Dashboard</h1>
          <span style={{color:"#666"}}>Risultati & Classifiche aggiornati</span>
        </div>
      </header>

      <div style={{display:"flex",gap:18,marginBottom:32}}>
        <button
          style={{padding:8, borderRadius:8, border:'none', fontWeight:700, background: seasonTab==="pre"?"#ef4444":"#e5e7eb", color: seasonTab==="pre"?"#fff":"#111"}}
          onClick={()=>setSeasonTab("pre")}
        >Preseason</button>
        <button
          style={{padding:8, borderRadius:8, border:'none', fontWeight:700, background: seasonTab==="reg"?"#ef4444":"#e5e7eb", color: seasonTab==="reg"?"#fff":"#111"}}
          onClick={()=>setSeasonTab("reg")}
        >Regular Season</button>
      </div>

      {loading && <div>Caricamento dati...</div>}

      {!loading && <>
      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,marginBottom:12}}>Partite di oggi</h2>
        {todayGames.length === 0 ? <p>Nessuna partita in programma.</p> : (
          <ul>
            {todayGames.map(g => (
              <li key={g.id}>
                <b>{g.away}</b> @ <b>{g.home}</b> - {new Date(g.date).toLocaleTimeString("it-IT",{hour:'2-digit',minute:'2-digit'})}
                <span style={{color: "#EF4444", marginLeft: 8}}>{g.status}</span>
                <a style={{marginLeft:10, fontSize:12}} target="_blank"
                   href={`https://www.google.com/search?q=${encodeURIComponent(g.home + " vs " + g.away)}&hl=it`} rel="noopener noreferrer">📊 Google</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,marginBottom:12}}>Prossime partite</h2>
        {nextGames.length === 0 ? <p>Nessuna partita.</p> : (
          <ul>
            {nextGames.map(g => (
              <li key={g.id}>
                <b>{g.away}</b> @ <b>{g.home}</b> - {new Date(g.date).toLocaleDateString("it-IT",{weekday:'short', day:'2-digit',month:'2-digit'})} {new Date(g.date).toLocaleTimeString("it-IT",{hour:'2-digit',minute:'2-digit'})}
                <a style={{marginLeft:10, fontSize:12}} target="_blank"
                   href={`https://www.google.com/search?q=${encodeURIComponent(g.home + " vs " + g.away)}&hl=it`} rel="noopener noreferrer">📊</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{fontSize:22,marginBottom:12}}>
          Classifica {seasonTab==="pre" ? "Preseason" : "Regular Season"}
        </h2>
        <div style={{display: 'flex', gap: 40}}>
          <div>
            <h3>East</h3>
            <table>
              <thead><tr><th>Squadra</th><th>V</th><th>P</th><th>%</th></tr></thead>
              <tbody>
                {standings.filter(t => t.conf === "East").sort((a,b)=>b.pct-a.pct).map(t => (
                  <tr key={t.abbr}><td>{t.name}</td><td>{t.w}</td><td>{t.l}</td><td>{t.pct.toFixed(3)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3>West</h3>
            <table>
              <thead><tr><th>Squadra</th><th>V</th><th>P</th><th>%</th></tr></thead>
              <tbody>
                {standings.filter(t => t.conf === "West").sort((a,b)=>b.pct-a.pct).map(t => (
                  <tr key={t.abbr}><td>{t.name}</td><td>{t.w}</td><td>{t.l}</td><td>{t.pct.toFixed(3)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </>}
    </div>
  );
}