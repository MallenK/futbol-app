async function getJSON(p){ const r = await fetch(p,{cache:'no-store'}); return r.json(); }

async function main(){
  const live = document.getElementById('live');
  try{
    const current = await getJSON('data/bl1/current.json');   // lo creará Actions
    const md = current.GroupOrderID;
    const matches = await getJSON(`data/bl1/md-${md}.json`);
    const media = await getJSON('data/media/teams.json');     // escudos de TheSportsDB
    const badgeByName = Object.fromEntries((media.teams||[]).map(t=>[t.name,t.badge]));

    live.innerHTML = matches.map(m=>{
      const h = m.Team1.TeamName, a = m.Team2.TeamName;
      const last = m.MatchResults?.at(-1);
      const res = m.MatchIsFinished ? `${last?.PointsTeam1 ?? ''}–${last?.PointsTeam2 ?? ''}`
                : last ? `${last?.PointsTeam1 ?? ''}–${last?.PointsTeam2 ?? ''}` : '—';
      const date = new Date(m.MatchDateTimeUTC).toLocaleString();
      const bh = badgeByName[h] || '', ba = badgeByName[a] || '';
      return `<li>
        ${bh?`<img src="${bh}" alt="">`:''}<span>${h}</span>
        <strong>${res}</strong>
        <span>${a}</span>${ba?`<img src="${ba}" alt="">`:''}
        <small>${date}</small>
      </li>`;
    }).join('') || '<li>Sin datos</li>';
  }catch(e){
    live.textContent = 'Error cargando datos';
    console.error(e);
  }
}
main();
