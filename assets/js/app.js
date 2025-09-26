async function getJSON(p){
  const r = await fetch(p + (p.includes('?')?'&':'?') + 'v=' + Date.now(), {cache:'no-store'});
  if(!r.ok) throw new Error(p+' '+r.status);
  return r.json();
}

async function main(){
  const live = document.getElementById('live');
  try{
    const current = await getJSON('data/bl1/current.json');
    const md = Number(current?.GroupOrderID ?? 0);

    const [media, curr, prev] = await Promise.all([
      getJSON('data/media/teams.json').catch(()=>({teams:[]})),
      getJSON(`data/bl1/md-${md}.json`).catch(()=>[]),
      md>1 ? getJSON(`data/bl1/md-${md-1}.json`).catch(()=>[]) : Promise.resolve([])
    ]);

    const matches = (Array.isArray(curr) && curr.length) ? curr : prev;
    console.log({md, lenCurr: curr.length||0, lenPrev: prev.length||0});

    if(!Array.isArray(matches) || matches.length===0){
      live.innerHTML = '<li>Sin datos de la jornada. Revisa SEASON en .github/workflows/fetch.yml.</li>';
      return;
    }

    const badgeByName = Object.fromEntries((media.teams||[]).map(t=>[t.name,t.badge]));

    live.innerHTML = matches.map(m=>{
      const h = m?.Team1?.TeamName || '—';
      const a = m?.Team2?.TeamName || '—';
      const lastRes = Array.isArray(m?.MatchResults) && m.MatchResults.length ? m.MatchResults.at(-1) : null;
      const goals = Array.isArray(m?.Goals) ? m.Goals : [];
      const scoreFromGoals = goals.reduce((s,g)=>{
        if(g?.GoalGetterID && g?.IsOvertime===false){ 
          if(g.ScoreTeam1!=null && g.ScoreTeam2!=null) s=[g.ScoreTeam1,g.ScoreTeam2];
        }
        return s;
      }, null);
      const res = lastRes ? `${lastRes.PointsTeam1 ?? ''}–${lastRes.PointsTeam2 ?? ''}`
                 : scoreFromGoals ? `${scoreFromGoals[0]}–${scoreFromGoals[1]}` : '—';

      const date = m?.MatchDateTimeUTC ? new Date(m.MatchDateTimeUTC).toLocaleString() : '';
      const bh = badgeByName[h] || '', ba = badgeByName[a] || '';
      return `<li>
        ${bh?`<img src="${bh}" alt="">`:''}<span>${h}</span>
        <strong>${res}</strong>
        <span>${a}</span>${ba?`<img src="${ba}" alt="">`:''}
        <small>${date}</small>
      </li>`;
    }).join('');
  }catch(e){
    console.error(e);
    live.textContent = 'Error cargando datos';
  }
}
main();
