/* Street Kings Manager
   Browser reimplementation of the documented Grand Slam systems:
   team management, coaches, stadium upgrades, simulation, leagues,
   transfers, draft, sponsors, economics, stats, saves and dynamic squads.
*/
(() => {
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const clone = o => JSON.parse(JSON.stringify(o));
  const money = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const dateDE = d => new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  const uid = p => p + Math.random().toString(36).slice(2,9);
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const weighted = pairs => { const t=pairs.reduce((a,x)=>a+x[1],0); let r=Math.random()*t; for(const [v,w] of pairs){r-=w;if(r<=0)return v;} return pairs[pairs.length-1][0]; };

  const SPONSORS = [
    {id:'aarwerk',name:'AARWERK ENERGIE',tier:1,pay:12000,bonus:0.02,color:'#39ef9a'},
    {id:'taunus',name:'TAUNUS MOBIL',tier:2,pay:16000,bonus:0.03,color:'#65b7ff'},
    {id:'lahnprint',name:'LAHNPRINT',tier:1,pay:9500,bonus:0.015,color:'#f0c75c'},
    {id:'einrich',name:'EINRICH BAU & SERVICE',tier:3,pay:21000,bonus:0.04,color:'#ff8a65'},
    {id:'katzsport',name:'KATZ SPORTWERK',tier:2,pay:14500,bonus:0.025,color:'#c59cff'},
    {id:'talblick',name:'TALBLICK AUTO',tier:3,pay:23500,bonus:0.045,color:'#7ef0ff'}
  ];
  const TEAM_NAMES = [
    ['Talblick FC','Katzenelnbogen'],['Aar-Einrich United','Hahnstätten'],['Diez Street Crew','Diez'],['Lahn Kicker','Limburg'],
    ['Nastätten Blocks','Nastätten'],['Westerwald United','Holzhausen'],['Aarbergen City','Aarbergen'],['Dörsbach Boys','Dörsdorf'],
    ['Rhein-Lahn Five','Bad Ems'],['Taunus Tigers','Bad Schwalbach'],['Goldener Grund','Hünfelden'],['Lahnpark FC','Lahnau'],
    ['Wallraben Kickers','Koblenz-Land'],['Heidenrod 09','Heidenrod'],['Untertaunus Crew','Taunusstein'],['Loreley Street','St. Goarshausen'],
    ['Hochtaunus Royals','Idstein'],['Nassau Athletic','Nassau'],['Kannenbäcker FC','Montabaur'],['Aar Valley 05','Aar-Einrich'],
    ['Rheingau Five','Geisenheim'],['Lahnstein South','Lahnstein'],['Taunus Park','Niedernhausen'],['Kreispark United','Limburg']
  ];
  const FIRST = ['Jay','Rico','Dario','Karim','Matteo','Noah','Emir','Jonas','Luca','Timo','Matti','Leo','Elias','Nico','Sami','Finn','Milan','Ben','Yasin','Jan'];
  const LAST = ['Keller','Braun','Wagner','Reinhardt','Yilmaz','Schmidt','Koch','Fischer','Bauer','Klein','Weber','Lenz','Roth','Köhler','Seidel','Vogt','Meyer','Aydin','Neumann','Haas'];
  const HAIR = ['black','brown','blond','dark'];
  const SKIN = ['light','tan','dark'];
  const POS = ['GK','CB','CB','LW','RW','ST','MF','LB','RB','ST'];
  const PLAYER_FIRST=[...FIRST];
  const CITY_LINES=['Katzenelnbogen','Aar-Einrich','Rhein-Lahn','Untertaunus'];
  const WEATHER=[
    {name:'Klar',mult:1.01,icon:'☀️'},{name:'Bewölkt',mult:1,icon:'⛅'},{name:'Leichter Regen',mult:.98,icon:'🌧️'},{name:'Windig',mult:.97,icon:'💨'}
  ];

  function avatarSvg(player, accent='#41f3a5') {
    const skin = player.skin==='dark'?'#8d5a3d':player.skin==='tan'?'#bd8159':'#e2ad83';
    const hair = player.hair==='blond'?'#d2aa5c':player.hair==='brown'?'#604128':player.hair==='dark'?'#231d1d':'#151515';
    const kit=player.teamColor||accent;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges"><rect width="64" height="64" rx="10" fill="#0b171e"/><rect x="22" y="8" width="20" height="18" rx="6" fill="${skin}"/><rect x="20" y="7" width="24" height="8" rx="3" fill="${hair}"/><rect x="20" y="14" width="6" height="4" fill="${hair}"/><rect x="38" y="14" width="6" height="4" fill="${hair}"/><rect x="16" y="27" width="32" height="22" rx="5" fill="${kit}"/><rect x="12" y="31" width="7" height="17" rx="2" fill="${kit}"/><rect x="45" y="31" width="7" height="17" rx="2" fill="${kit}"/><rect x="22" y="49" width="8" height="12" fill="#d8dde0"/><rect x="34" y="49" width="8" height="12" fill="#d8dde0"/><rect x="25" y="19" width="4" height="4" fill="#071016"/><rect x="36" y="19" width="4" height="4" fill="#071016"/><rect x="27" y="23" width="10" height="2" fill="#7e3f30"/></svg>`)} `;
  }
  function logoSvg(){return 'assets/logo.svg'}

  function makePlayer(i, teamColor='#41f3a5', forcedPos=null, ratingBase=70){
    const pos=forcedPos||POS[i%POS.length];
    const age=17+Math.floor(Math.random()*14);
    const rating=clamp(Math.round(ratingBase+(Math.random()*16-7)),49,91);
    const skill={pace:0,shoot:0,pass:0,def:0,control:0,lead:0};
    const roleBias={GK:{def:9,control:3,pass:4,lead:2},CB:{def:10,lead:2,pass:3},LB:{pace:6,def:7,pass:4},RB:{pace:6,def:7,pass:4},MF:{pass:10,control:8,lead:3,shoot:2},LW:{pace:10,control:8,shoot:6,pass:4},RW:{pace:10,control:8,shoot:6,pass:4},ST:{shoot:12,pace:6,control:7,lead:1}}[pos];
    for(const k of Object.keys(skill)) skill[k]=clamp(Math.round(rating-12+Math.random()*14+(roleBias[k]||0)),35,97);
    const name=FIRST[i%FIRST.length]+' '+LAST[(i*7+Math.floor(i/3))%LAST.length];
    return {id:uid('p'),name,pos,age,rating,skill,salary:Math.round((rating*rating*3)+age*240),value:Math.round((rating*rating*18)+(28-age)*900),form:Math.round(90+Math.random()*10),teamColor,skin:pick(SKIN),hair:pick(HAIR),games:0,goals:0,assists:0,yellow:0};
  }
  function makeRoster(teamColor='#41f3a5', quality=68){
    const arr=[]; for(let i=0;i<10;i++) arr.push(makePlayer(i,teamColor,POS[i],quality)); return arr;
  }
  function teamObj(name,city,quality=60,tier=3,color=null){
    const c=color||pick(['#4ff6b1','#ff5e68','#65b7ff','#f2c75d','#b596ff','#71ecff','#ff9b63']);
    const roster=makeRoster(c,quality);
    return {id:uid('t'),name,city,quality,baseQuality:quality,teamColor:c,budget: tier===1?250000:tier===2?175000:110000,roster,coach:null,form:[pick(['W','D','L']),pick(['W','D','L']),pick(['W','D','L']),pick(['W','D','L']),pick(['W','D','L'])],stadium:{name:`${name} Street Arena`,capacity:120,level:1,upgrades:{}},sponsor:null,stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,homeRevenue:0},youth:1};
  }
  function buildTeams(){
    const tiers=[1,1,1,1,2,2,2,2,3,3,3,3,3,3,3,3];
    const out=[]; for(let i=0;i<TEAM_NAMES.length;i++){ const q=tiers[i]===1?76:tiers[i]===2?69:62; out.push(teamObj(TEAM_NAMES[i][0],TEAM_NAMES[i][1],q,tiers[i],i===0?'#41f3a5':null)); }
    return out;
  }
  function makeLeague(teams,name,level){
    const league={id:'L'+level,name,level,teams:teams.map(t=>t.id),schedule:[],standings:{},currentRound:1};
    for(const t of teams) league.standings[t.id]={teamId:t.id,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0};
    return league;
  }
  function roundRobin(teamIds){
    const ids=[...teamIds]; if(ids.length%2)ids.push(null); const rounds=[]; let n=ids.length;
    for(let r=0;r<n-1;r++){
      const round=[]; for(let i=0;i<n/2;i++){const a=ids[i],b=ids[n-1-i]; if(a&&b) round.push([r%2?a:b,r%2?b:a]);}
      rounds.push(round); ids.splice(1,0,ids.pop());
    }
    const games=[]; let roundNo=1;
    for(const rd of rounds){ for(const [home,away] of rd) games.push({id:uid('g'),round:roundNo,home,away,played:false,date:null,result:null}); roundNo++; }
    const second=games.map(g=>({...clone(g),id:uid('g'),home:g.away,away:g.home,played:false,result:null,round:g.round+rounds.length}));
    return games.concat(second);
  }

  const state={
    version:'1.0.0',firstRun:true,manager:'Manager',active:'home',week:1,date:new Date('2026-08-15T18:00:00'),season:1,leagues:{},teams:{},userTeamId:null,market:[],coaches:[],news:[],toast:null,
    teamTab:'overview',leagueTab:'table',marketFilter:'all',tactic:'4-1',draftTab:'silver',selectedPlayerId:null,notifications:2
  };

  function initState(){
    const saved=localStorage.getItem('streetKingsSave');
    if(saved){try{Object.assign(state,JSON.parse(saved)); state.date=new Date(state.date); state.firstRun=false; return;}catch(e){console.warn('Save invalid',e)}}
    const teams=buildTeams(); teams.forEach(t=>state.teams[t.id]=t); state.userTeamId=teams[0].id;
    state.leagues.L1=makeLeague(teams.slice(0,8),'Rhein-Lahn Premier',1);
    state.leagues.L2=makeLeague(teams.slice(8,16),'Taunus Pro League',2);
    state.leagues.L3=makeLeague(teams.slice(16,24),'Kreisstraße-Liga Katzenelnbogen',3);
    // User starts in the lowest league, mirroring the original manager progression model.
    state.leagues.L1.teams=[...teams.slice(1,8),teams[23]].map(t=>t.id);
    state.leagues.L2.teams=teams.slice(8,16).map(t=>t.id);
    state.leagues.L3.teams=[teams[0].id,...teams.slice(16,23).map(t=>t.id)];
    for(const l of Object.values(state.leagues)) l.schedule=[];
    for(const l of Object.values(state.leagues)) l.schedule=roundRobin(l.teams);
    state.teams[state.userTeamId].budget=250000; state.teams[state.userTeamId].stadium.capacity=180; state.teams[state.userTeamId].sponsor=clone(SPONSORS[1]);
    state.market=generateMarket(18);
    state.coaches=generateCoaches();
    state.news=[
      {title:'Willkommen in der Street-Liga',body:'Dein Club startet in Katzenelnbogen. Kleine Arena, große Ziele.',icon:'assets/ui/news.svg'},
      {title:'Neuer Bolzplatz geplant',body:'Die Region setzt auf mehr Street-Soccer-Plätze.',icon:'assets/stadium/stadium.svg'},
      {title:'Top-Talent aus Diez',body:'Ein 17-jähriger Flügelspieler taucht im Scouting-Radar auf.',icon:'assets/players/pix-03.svg'}
    ];
    recalcAll(); saveState();
  }
  function currentTeam(){return state.teams[state.userTeamId]}
  function currentLeague(){return Object.values(state.leagues).find(l=>l.teams.includes(state.userTeamId)) || state.leagues.L3}
  function isUserLeague(l){return l.teams.includes(state.userTeamId)}

  function generateMarket(count=15){ const out=[]; for(let i=0;i<count;i++){const p=makePlayer(200+i,pick(['#ff5e68','#65b7ff','#f1c75b','#b596ff']),pick(['GK','CB','LW','RW','MF','ST']),61+Math.random()*17); p.teamId=null;p.value=Math.round(p.value*0.85);out.push(p)} return out; }
  function generateCoaches(){
    return [
      {id:'c1',name:'Mika Härtel',role:'Offensiv',boost:7,form:0,price:15000,league:3,active:false},
      {id:'c2',name:'Rene Falk',role:'Defensiv',boost:6,form:0,price:13500,league:3,active:false},
      {id:'c3',name:'Sami Jäger',role:'Tempo',boost:8,form:0,price:18500,league:2,active:false},
      {id:'c4',name:'Lena Koch',role:'Allround',boost:7,form:0,price:17500,league:1,active:false},
      {id:'c5',name:'Milo Hartung',role:'Mentalität',boost:5,form:0,price:10500,league:3,active:false}
    ];
  }
  function effectiveCoachBoost(team=currentTeam()){
    if(!team.coach)return 0; const c=state.coaches.find(x=>x.id===team.coach); if(!c)return 0; c.form=Math.round(80+Math.random()*20); return c.boost*(c.form/100);
  }
  function teamStrength(team){
    const starters=team.roster.slice(0,5); const avg=starters.reduce((s,p)=>s+p.rating,0)/starters.length; return avg*(1+effectiveCoachBoost(team)/100)*(0.95+Math.random()*0.1)*(1+(team.form.filter(x=>x==='W').length-team.form.filter(x=>x==='L').length)*.012);
  }
  function recalcAll(){
    for(const l of Object.values(state.leagues)){
      for(const id of l.teams){ if(!l.standings[id])l.standings[id]={teamId:id,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0}; }
    }
  }
  function simulateMatch(home,away){
    const weather=pick(WEATHER); const hs=teamStrength(home)*(weather.mult)+(home.id===state.userTeamId?1.05:1); const as=teamStrength(away)*weather.mult;
    let lambdaH=clamp(1.8+(hs-as)/36,0.4,4.8),lambdaA=clamp(1.55+(as-hs)/38,0.35,4.4);
    const goals=lam=>{let L=Math.exp(-lam),k=0,p=1;while(p>L&&k<9){k++;p*=Math.random()}return Math.max(0,k-1)};
    let hg=goals(lambdaH),ag=goals(lambdaA); if(hg===ag&&Math.random()<.08){ if(Math.random()<.5)hg++; else ag++; }
    const scorers=[]; for(const [team,gs] of [[home,hg],[away,ag]])for(let i=0;i<gs;i++){const st=pick(team.roster.slice(1).filter(p=>['ST','LW','RW','MF'].includes(p.pos))||team.roster); if(st){st.goals++;st.games++;scorers.push({team:team.id,player:st.name})}}
    for(const p of home.roster) p.games++; for(const p of away.roster) p.games++;
    return {hg,ag,weather,scorers};
  }
  function applyResult(league,game,res){
    const H=state.teams[game.home],A=state.teams[game.away]; H.stats.played++;A.stats.played++; H.stats.gf+=res.hg;H.stats.ga+=res.ag;A.stats.gf+=res.ag;A.stats.ga+=res.hg;
    const sh=league.standings[H.id],sa=league.standings[A.id]; for(const s of [sh,sa])s.played++;
    if(res.hg>res.ag){H.stats.wins++;A.stats.losses++;sh.wins++;sh.points+=3;sa.losses++;}
    else if(res.hg<res.ag){A.stats.wins++;H.stats.losses++;sa.wins++;sa.points+=3;sh.losses++;}
    else{H.stats.draws++;A.stats.draws++;sh.draws++;sa.draws++;sh.points++;sa.points++;}
    sh.gf+=res.hg;sh.ga+=res.ag;sh.gd=sh.gf-sh.ga;sa.gf+=res.ag;sa.ga+=res.hg;sa.gd=sa.gf-sa.ga;
    H.form=[...(H.form||[]).slice(-4),res.hg>res.ag?'W':res.hg===res.ag?'D':'L']; A.form=[...(A.form||[]).slice(-4),res.ag>res.hg?'W':res.hg===res.ag?'D':'L'];
    // economy
    const sponsor=H.sponsor||null; const crowd=Math.round(H.stadium.capacity*(0.65+Math.random()*.3)); const ticket=H.id===state.userTeamId?crowd*9:0; H.budget+=ticket; H.stats.homeRevenue+=ticket; if(H.id===state.userTeamId && sponsor){H.budget+=sponsor.pay;}
    if(H.id===state.userTeamId) H.budget += res.hg>res.ag?5000:res.hg===res.ag?1800:0;
    if(A.id===state.userTeamId) A.budget += res.ag>res.hg?3000:0;
    game.played=true; game.result={hg:res.hg,ag:res.ag,weather:res.weather.name,scorers:res.scorers}; return game;
  }
  function nextUserGame(){ const l=currentLeague(); return l.schedule.find(g=>!g.played&&(g.home===state.userTeamId||g.away===state.userTeamId)); }
  function simulateNext(){
    const l=currentLeague(); const ng=nextUserGame(); if(!ng){seasonEnd();return}
    const round=ng.round; const roundGames=l.schedule.filter(g=>g.round===round&&!g.played); for(const g of roundGames){const H=state.teams[g.home],A=state.teams[g.away]; applyResult(l,g,simulateMatch(H,A));}
    state.week++; state.date=new Date(new Date(state.date).getTime()+7*86400000);
    for(const t of Object.values(state.teams)){ t.budget-=t.roster.reduce((s,p)=>s+p.salary,0)/12; if(t.budget<0)t.budget=0; }
    // player development
    for(const p of currentTeam().roster){ const delta=p.age<22?(Math.random()<.55?1:0):(Math.random()<.15?1:Math.random()<.25?-1:0); p.rating=clamp(p.rating+delta,40,96); for(const k of Object.keys(p.skill))p.skill[k]=clamp(p.skill[k]+(Math.random()<.25?1:0),35,99); }
    state.news.unshift({title:`Spieltag ${round} abgeschlossen`,body:`${state.teams[ng.home].name} gegen ${state.teams[ng.away].name} ist gespielt.`,icon:'assets/ui/ball.svg'}); state.news=state.news.slice(0,12);
    saveState(); toast(`Spieltag ${round} simuliert`,'Ergebnisse und Tabelle wurden aktualisiert.'); render();
  }
  function seasonEnd(){
    const l=currentLeague(); const sorted=standings(l);
    const idx=sorted.findIndex(x=>x.teamId===state.userTeamId); const promo=idx<=1; const releg=idx>=sorted.length-2;
    let msg=`Saison beendet. Platz ${idx+1} von ${sorted.length}.`;
    if(promo && l.level>1){moveLeague(l.level,l.level-1);msg+=' Aufstieg!';}
    if(releg && l.level<3){moveLeague(l.level,l.level+1);msg+=' Abstieg.';}
    state.season++;state.week=1;state.date=new Date(state.date.getTime()+30*86400000);
    for(const ll of Object.values(state.leagues)){ for(const s of Object.values(ll.standings)){s.played=0;s.wins=0;s.draws=0;s.losses=0;s.gf=0;s.ga=0;s.gd=0;s.points=0;} ll.schedule=roundRobin(ll.teams.map(id=>id)); ll.currentRound=1; }
    state.news.unshift({title:'Saisonabschluss',body:msg,icon:'assets/ui/trophy.svg'});saveState();toast('Neue Saison',msg);render();
  }
  function standings(l){ return Object.values(l.standings).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf); }
  function moveLeague(levelFrom,levelTo){
    const from=state.leagues['L'+levelFrom], to=state.leagues['L'+levelTo];
    from.teams=from.teams.filter(id=>id!==state.userTeamId);
    const replacement=to.teams[to.teams.length-1];
    to.teams=to.teams.filter(id=>id!==replacement);
    to.teams.push(state.userTeamId);
    if(replacement && !from.teams.includes(replacement)) from.teams.push(replacement);
  }
  function upgradeStadium(key){
    const t=currentTeam(); const lvl=t.stadium.upgrades[key]||0; const cost=Math.round(9000*Math.pow(2,lvl)); if(t.budget<cost){toast('Zu wenig Budget',`Benötigt ${money(cost)}.`);return;} t.budget-=cost;t.stadium.upgrades[key]=lvl+1;
    if(key==='capacity')t.stadium.capacity+=40; if(key==='lighting')t.stadium.capacity+=10; if(key==='stands')t.stadium.capacity+=80; toast('Stadion verbessert',`${key} auf Level ${lvl+1}.`);saveState();render();
  }
  function buyPlayer(id){ const t=currentTeam(); const p=state.market.find(x=>x.id===id); if(!p)return; if(t.roster.length>=12){toast('Kader voll','Maximum: 12 Spieler.');return;} if(t.budget<p.value){toast('Transfer gescheitert','Nicht genug Budget.');return;} t.budget-=p.value;t.roster.push({...p,id:uid('p'),teamColor:t.teamColor,teamId:t.id});state.market=state.market.filter(x=>x.id!==id);state.news.unshift({title:'Neuzugang',body:`${p.name} unterschreibt bei ${t.name}.`,icon:'assets/ui/transfer.svg'});saveState();render();}
  function sellPlayer(id){const t=currentTeam(); const p=t.roster.find(x=>x.id===id); if(!p || t.roster.indexOf(p)<5){toast('Spieler nicht verkäuflich','Die aktuelle Startelf braucht mindestens 5 Spieler.');return;} const val=Math.round(p.value*.8);t.roster=t.roster.filter(x=>x.id!==id);t.budget+=val;toast('Transfer abgeschlossen',`${p.name}: +${money(val)}`);saveState();render();}
  function hireCoach(id){const t=currentTeam(),c=state.coaches.find(x=>x.id===id); if(!c)return; if(t.coach){toast('Coach-Vertrag aktiv','Entlasse zuerst den aktuellen Coach.');return;}if(t.budget<c.price){toast('Zu wenig Budget','Coach-Vertrag kann nicht finanziert werden.');return;}t.budget-=c.price;t.coach=c.id;toast('Coach verpflichtet',`${c.name} (+${c.boost}%).`);saveState();render();}
  function fireCoach(){const t=currentTeam(); if(!t.coach)return;const c=state.coaches.find(x=>x.id===t.coach);t.budget-=c.price*2;t.coach=null;toast('Coach entlassen','Vertragsstrafe verbucht.');saveState();render();}
  function draft(type){
    const t=currentTeam(); const cfg={silver:{cost:7000,n:2,min:58,max:70},gold:{cost:14000,n:3,min:68,max:80},premium:{cost:26000,n:4,min:76,max:91}}[type]; if(t.budget<cfg.cost){toast('Draft nicht möglich','Budget reicht nicht.');return;} t.budget-=cfg.cost; const picks=[]; for(let i=0;i<cfg.n;i++){const p=makePlayer(900+i,t.teamColor,pick(['CB','MF','LW','RW','ST']),cfg.min+Math.random()*(cfg.max-cfg.min));p.value=Math.round(p.value*.6);p.salary=Math.round(p.salary*.8);p.draft=true;picks.push(p)} state.news.unshift({title:`${type[0].toUpperCase()+type.slice(1)} Draft`,body:`${picks.length} Talente stehen zur Auswahl.`,icon:'assets/ui/draft.svg'}); saveState(); openModal(`Draft – ${type.toUpperCase()}`,renderDraftModal(picks)); }
  function chooseDraft(p){const t=currentTeam(); if(t.roster.length>=12){toast('Kader voll','Entferne zuerst einen Spieler.');return;}t.roster.push(p);toast('Talent verpflichtet',p.name);closeModal();saveState();render();}
  function hireSponsor(id){const s=SPONSORS.find(x=>x.id===id);const t=currentTeam(); if(t.sponsor&&t.sponsor.id===id)return; if(t.sponsor&&s.tier<t.sponsor.tier){toast('Vertrag nicht verbessert','Der neue Sponsor hat eine niedrigere Stufe.');return;} t.sponsor=clone(s);toast('Sponsor unterschrieben',`${s.name} – ${money(s.pay)} / Spielwoche.`);saveState();render();}
  function switchPage(page){state.active=page;window.scrollTo({top:0,behavior:'smooth'});render();closeSidebar();}
  function saveState(){localStorage.setItem('streetKingsSave',JSON.stringify(state));}
  function resetState(){localStorage.removeItem('streetKingsSave');location.reload()}
  function toast(title,body=''){state.toast={title,body};const el=$('#toast');if(!el)return;el.querySelector('strong').textContent=title;el.querySelector('span').textContent=body;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),3200)}
  function openModal(title,bodyHtml,opts={}){const b=$('#modalBackdrop');b.innerHTML=`<div class="modal"><div class="modal-head"><strong>${title}</strong><button class="icon-btn" data-close>✕</button></div><div class="modal-body">${bodyHtml}</div>${opts.footer===false?'':`<div class="modal-foot"><button class="btn" data-close>Schließen</button></div>`}</div>`;b.classList.add('open');$$('[data-close]',b).forEach(x=>x.onclick=closeModal)}
  function closeModal(){$('#modalBackdrop').classList.remove('open');}
  function toggleSidebar(){$('.sidebar').classList.toggle('open')}
  function closeSidebar(){$('.sidebar').classList.remove('open')}
  function renderDraftModal(players){ return `<div class="player-grid">${players.map((p,i)=>`<div class="player-card"><div class="player-top"><div class="player-ident"><img src="${avatarSvg(p,currentTeam().teamColor)}"><div><strong>${p.name}</strong><span>${p.pos} · ${p.age} J.</span></div></div><div class="ovr">${p.rating}</div></div><div class="attrs">${attrBox('Tempo',p.skill.pace)}${attrBox('Schuss',p.skill.shoot)}${attrBox('Pass',p.skill.pass)}${attrBox('Def',p.skill.def)}</div><div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn primary" data-draft-index="${i}">Verpflichten</button></div></div>`).join('')}</div>` }
  function attrBox(k,v){return `<div class="attr"><b>${v}</b><span>${k}</span></div>`}

  function render(){
    const app=$('#app'); const t=currentTeam(); const l=currentLeague();
    app.innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><img src="${logoSvg()}"><div><h1>STREET KINGS</h1><small>MANAGER</small></div></div><nav class="nav">${navItem('home','⌂','Home')}${navItem('team','♟','Team')}${navItem('tactics','◈','Taktik')}${navItem('league','🏆','Liga')}${navItem('games','⚽','Spiele')}${navItem('market','↔','Transfermarkt')}${navItem('sponsors','◆','Sponsoren')}${navItem('stadium','▧','Stadion')}${navItem('finances','€','Finanzen')}${navItem('stats','▥','Statistiken')}${navItem('draft','✦','Draft')}${navItem('coaches','◎','Coaches')}${navItem('settings','⚙','Einstellungen')}</nav><div class="sidebar-footer"><b>Street Kings Manager</b><br>Play local. Go global.<br>Katzenelnbogen · S${state.season}</div></aside><main class="main"><header class="topbar"><div class="topbar-left"><button class="icon-btn mobile-menu" data-menu>☰</button><div class="club-chip"><img src="assets/crest-talblick.svg"><div><strong>${esc(t.name)}</strong><span>${esc(t.city)} · ${esc(l.name)}</span></div></div></div><div class="top-stats"><span class="chip">Saison ${state.season}</span><span class="chip">Woche ${state.week}</span><span class="chip">${dateDE(state.date)}</span><span class="chip money">${money(t.budget)}</span></div><div class="top-actions"><button class="icon-btn" data-page="finances">€</button><button class="icon-btn" data-notify>🔔</button><button class="icon-btn" data-page="settings">⚙</button></div></header><section class="content">${renderPage(state.active)}</section></main></div><div id="modalBackdrop" class="modal-backdrop"></div><div id="toast" class="toast"><strong></strong><span></span></div>`;
    bindEvents();
    if(state.firstRun){setTimeout(showWelcome,80);state.firstRun=false;saveState();}
  }
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function navItem(key,ico,label){return `<button class="${state.active===key?'active':''}" data-page="${key}"><span class="ico">${ico}</span><span>${label}</span></button>`}
  function renderPage(p){
    const map={home:renderHome,team:renderTeam,tactics:renderTactics,league:renderLeague,games:renderGames,market:renderMarket,sponsors:renderSponsors,stadium:renderStadium,finances:renderFinances,stats:renderStats,draft:renderDraft,coaches:renderCoaches,settings:renderSettings}; return (map[p]||renderHome)();
  }
  function renderHome(){ const t=currentTeam(),l=currentLeague(),ng=nextUserGame(); const opp=ng?(ng.home===t.id?state.teams[ng.away]:state.teams[ng.home]):null; const userHome=ng?.home===t.id; const stand=standings(l); return `<div class="page-head"><div><h2>Dein Club. Deine Straße.</h2><p>Katzenelnbogen · ${l.name} · Saison ${state.season}</p></div><div class="actions"><button class="btn" data-page="team">Kader</button><button class="btn primary" data-simulate>${ng?'Nächsten Spieltag simulieren':'Saison abschließen'}</button></div></div><section class="hero"><div class="hero-content"><div class="eyebrow">Street Soccer Manager</div><h2>SMALL TOWN. BIG DREAMS.</h2><p>Baue deinen Verein aus der Region auf, entwickle Talente, verbessere den Bolzplatz und geh auf Punktejagd.</p><div class="hero-pills"><span>⚽ 5er Street Soccer</span><span>📍 ${esc(t.city)}</span><span>🏟 ${esc(t.stadium.name)}</span><span>🎯 Aufstiegssystem</span></div></div></section><div class="grid dashboard"><div class="card">${renderNextMatch(ng,opp,userHome)}</div><div class="card">${renderStandingsCard(stand,l)}</div><div class="card">${renderNewsCard()}</div></div><div style="height:14px"></div><div class="lineup-wrap"><div class="card"><div class="card-title"><h3>Aufstellung <small>(4-1)</small></h3><button class="btn" data-page="tactics">Taktik</button></div>${renderField(t.roster.slice(0,5),t)}</div><div class="card"><div class="card-title"><h3>Teamstärke</h3><span class="tag">${Math.round(teamStrength(t))} OVR</span></div>${renderTeamMetrics(t)}<div style="height:10px"></div>${renderNextFixtures(l,t)}</div></div><div style="height:14px"></div><div class="grid three"><div class="card">${renderMarketMini()}</div><div class="card">${renderStadiumMini()}</div><div class="card">${renderSponsorMini()}</div></div><div style="height:14px"></div><div class="grid four"><div class="card metric-card"><div><div class="mini-note">Kontostand</div><div class="big-number">${money(t.budget)}</div></div><span class="tag">+${Math.round((t.sponsor?.bonus||0)*100)}% Sponsor</span></div><div class="card metric-card"><div><div class="mini-note">Zuschauer</div><div class="big-number">${t.stadium.capacity}</div></div><span class="muted">Level ${t.stadium.level}</span></div><div class="card metric-card"><div><div class="mini-note">Jugend</div><div class="big-number">${t.youth}</div></div><button class="btn" data-page="draft">Scouting</button></div><div class="card metric-card"><div><div class="mini-note">Trophäen</div><div class="big-number">${t.stats.wins>0?1:0}</div></div><span class="muted">Saison ${state.season}</span></div></div><div class="footer-note">Street Kings Manager v1.0 · Katzenelnbogen · built for the streets</div>` }
  function renderNextMatch(ng,opp,userHome){ const t=currentTeam(); if(!ng||!opp)return `<div class="empty">Keine offenen Ligaspiele. Saisonabschluss verfügbar.</div>`; return `<div class="card-title"><h3>Nächstes Spiel</h3><span class="tag blue">Spieltag ${ng.round}</span></div><div class="versus"><div class="team-side"><img src="${teamLogo( t)}"><strong>${esc(t.name)}</strong><small>${esc(t.city)}</small></div><div class="vs">VS</div><div class="team-side"><img src="${teamLogo(opp)}"><strong>${esc(opp.name)}</strong><small>${esc(opp.city)}</small></div></div><div class="form-row">${(t.form||[]).map(f=>`<span class="form-b ${f}">${f}</span>`).join('')}</div><div class="match-meta"><span>📅 ${dateDE(new Date(state.date.getTime()+7*86400000))}</span><span>📍 ${userHome?esc(t.stadium.name):esc(opp.stadium.name)}</span><span>🌙 ${pick(WEATHER).name}</span></div><div class="center-btn"><button class="btn primary" data-simulate>${userHome?'Heimspiel simulieren':'Auswärtsspiel simulieren'}</button></div>`}
  function renderStandingsCard(stand,l){ return `<div class="card-title"><h3>Tabelle</h3><button class="btn" data-page="league">Alle</button></div><table class="table"><thead><tr><th>#</th><th>Team</th><th>Sp</th><th>TD</th><th>Pkt</th></tr></thead><tbody>${stand.slice(0,6).map((s,i)=>{const tt=state.teams[s.teamId];return `<tr class="${s.teamId===state.userTeamId?'active':''}"><td class="rank">${i+1}</td><td><div class="team-cell"><img src="${teamLogo(tt)}"><span>${esc(tt.name)}</span></div></td><td>${s.played}</td><td>${s.gd>0?'+':''}${s.gd}</td><td class="rating">${s.points}</td></tr>`}).join('')}</tbody></table>`}
  function renderNewsCard(){return `<div class="card-title"><h3>News</h3><span class="muted">Regional</span></div><div class="news-list">${state.news.slice(0,3).map(n=>`<div class="news"><img src="${n.icon}"><div><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span></div></div>`).join('')}</div>`}
  function renderField(players,t){ const coords=[{x:50,y:15},{x:25,y:37},{x:75,y:37},{x:50,y:57},{x:50,y:83}]; return `<div class="field"><div class="center-circle"></div><div class="half-line"></div><div class="box"></div><div class="box bottom"></div>${players.map((p,i)=>`<div class="player-dot" style="left:${coords[i].x}%;top:${coords[i].y}%"><div class="avatar"><img src="${avatarSvg(p,t.teamColor)}"></div><b>${esc(p.name.split(' ')[0])} · ${p.pos} ${p.rating}</b></div>`).join('')}</div>` }
  function renderTeamMetrics(t){const a=t.roster.slice(0,5); const vals={Offensive:avg(a,x=>x.skill.shoot),Tempo:avg(a,x=>x.skill.pace),Defensive:avg(a,x=>x.skill.def),Kombination:avg(a,x=>x.skill.pass)};return Object.entries(vals).map(([k,v])=>`<div class="metric"><span>${k}</span><strong>${Math.round(v)}</strong></div><div class="bar"><span style="width:${clamp(v,0,100)}%"></span></div>`).join('')}
  function avg(a,fn){return a.reduce((s,x)=>s+fn(x),0)/a.length}
  function renderNextFixtures(l,t){const games=l.schedule.filter(g=>!g.played&&(g.home===t.id||g.away===t.id)).slice(0,4);return `<div class="card-title" style="margin-top:14px"><h4>Nächste Spiele</h4></div><div class="list">${games.map(g=>{const opp=state.teams[g.home===t.id?g.away:g.home];return `<div class="list-row"><div><strong>${esc(opp.name)}</strong><small>${g.home===t.id?'Heimspiel':'Auswärts'} · Spieltag ${g.round}</small></div><div class="right"><span class="tag ${g.home===t.id?'':'blue'}">${g.home===t.id?'H':'A'}</span></div></div>`}).join('')}</div>`}
  function renderMarketMini(){const m=state.market.slice(0,4);return `<div class="card-title"><h3>Transfermarkt</h3><button class="btn" data-page="market">Mehr</button></div><div class="list">${m.map(p=>`<div class="list-row"><div class="avatar-card" style="border:0;padding:0;background:none"><img src="${avatarSvg(p)}"><div><strong>${esc(p.name)}</strong><small>${p.pos} · ${p.age} J.</small></div></div><div class="right"><strong>${p.rating}</strong><small>${money(p.value)}</small></div></div>`).join('')}</div>`}
  function renderStadiumMini(){const t=currentTeam();return `<div class="card-title"><h3>Stadion</h3><button class="btn" data-page="stadium">Ausbau</button></div><div class="avatar-card"><img src="assets/stadium/stadium.svg"><div><strong>${esc(t.stadium.name)}</strong><small>${t.stadium.capacity} Plätze · Level ${t.stadium.level}</small></div></div><div style="height:9px"></div><div class="bar"><span style="width:${Math.min(100,t.stadium.level*16)}%"></span></div>`}
  function renderSponsorMini(){const t=currentTeam(),s=t.sponsor;return `<div class="card-title"><h3>Sponsor</h3><button class="btn" data-page="sponsors">Verträge</button></div><div class="avatar-card"><img src="assets/sponsors/${s?s.id:'aarwerk'}.svg"><div><strong>${s?esc(s.name):'Kein Sponsor'}</strong><small>${s?money(s.pay)+' / Woche':'Vertrag auswählen'}</small></div></div>`}

  function renderTeam(){const t=currentTeam(); return `<div class="page-head"><div><h2>Kader</h2><p>${t.roster.length}/12 Spieler · ${esc(t.name)}</p></div><div class="actions"><button class="btn" data-page="draft">Draft</button><button class="btn primary" data-page="market">Spieler suchen</button></div></div><div class="kpi-grid"><div class="kpi"><small>Team OVR</small><strong>${Math.round(teamStrength(t))}</strong></div><div class="kpi"><small>Kaderwert</small><strong>${money(t.roster.reduce((s,p)=>s+p.value,0))}</strong></div><div class="kpi"><small>Ø Alter</small><strong>${(t.roster.reduce((s,p)=>s+p.age,0)/t.roster.length).toFixed(1)}</strong></div><div class="kpi"><small>Tagesform</small><strong>${Math.round(t.roster.reduce((s,p)=>s+p.form,0)/t.roster.length)}%</strong></div></div><div style="height:12px"></div><div class="toolbar"><div class="tabs"><button class="tab ${state.teamTab==='overview'?'active':''}" data-teamtab="overview">Übersicht</button><button class="tab ${state.teamTab==='players'?'active':''}" data-teamtab="players">Spieler</button></div><div class="muted" style="font-size:11px">Startelf: 4 + 1 TW</div></div>${state.teamTab==='overview'?renderTeamOverview(t):renderTeamPlayers(t)}` }
  function renderTeamOverview(t){return `<div class="grid two"><div class="card">${renderField(t.roster.slice(0,5),t)}</div><div class="card"><div class="card-title"><h3>Positionsübersicht</h3></div><div class="list">${['GK','CB','MF','LW','RW','ST'].map(pos=>{const ps=t.roster.filter(p=>p.pos===pos);return `<div class="list-row"><div><strong>${pos}</strong><small>${ps.length} Spieler</small></div><div class="right"><strong>${ps.length?Math.round(ps.reduce((s,p)=>s+p.rating,0)/ps.length):'-'}</strong></div></div>`}).join('')}</div></div></div>`}
  function renderTeamPlayers(t){return `<div class="player-grid">${t.roster.map(p=>`<div class="player-card"><div class="player-top"><div class="player-ident"><img src="${avatarSvg(p,t.teamColor)}"><div><strong>${esc(p.name)}</strong><span>${p.pos} · ${p.age} J. · ${money(p.salary)}/Monat</span></div></div><div class="ovr">${p.rating}</div></div><div class="attrs">${attrBox('Tempo',p.skill.pace)}${attrBox('Schuss',p.skill.shoot)}${attrBox('Pass',p.skill.pass)}${attrBox('Def',p.skill.def)}</div><div style="display:flex;justify-content:flex-end;gap:6px;margin-top:10px"><button class="btn" data-player="${p.id}">Profil</button>${t.roster.indexOf(p)>=5?`<button class="btn danger" data-sell="${p.id}">Verkaufen</button>`:''}</div></div>`).join('')}</div>`}

  function renderTactics(){const t=currentTeam(); const presets=[['4-1','Kompakt'],['2-2-1','Offensiv'],['1-3-1','Pressing']];return `<div class="page-head"><div><h2>Taktik</h2><p>4 Feldspieler + 1 Torwart · Spielstil steuern</p></div><div class="actions">${presets.map(x=>`<button class="btn ${state.tactic===x[0]?'primary':''}" data-tactic="${x[0]}">${x[0]} · ${x[1]}</button>`).join('')}</div></div><div class="grid two"><div class="card">${renderField(t.roster.slice(0,5),t)}</div><div class="card"><div class="card-title"><h3>Teamparameter</h3><span class="tag">${Math.round(teamStrength(t))} OVR</span></div><div class="field-group"><label>Offensive Risiko</label><input type="range" min="0" max="100" value="${state.tactic==='1-3-1'?78:state.tactic==='2-2-1'?67:53}" class="input" data-tactslider="risk"></div><div class="field-group"><label>Pressing</label><input type="range" min="0" max="100" value="${state.tactic==='1-3-1'?84:state.tactic==='2-2-1'?62:48}" class="input" data-tactslider="press"></div><div class="field-group"><label>Tempo</label><input type="range" min="0" max="100" value="${state.tactic==='2-2-1'?76:state.tactic==='1-3-1'?69:58}" class="input" data-tactslider="pace"></div><div class="list-row"><div><strong>Coach-Bonus</strong><small>${t.coach?`+${Math.round(effectiveCoachBoost(t)*10)/10}%`:'Kein Coach'}</small></div><div class="right"><button class="btn" data-page="coaches">Coach</button></div></div></div></div>`}

  function renderLeague(){const l=currentLeague(); const stand=standings(l); return `<div class="page-head"><div><h2>Liga</h2><p>${esc(l.name)} · ${l.teams.length} Clubs · Auf- und Abstieg</p></div><div class="actions"><button class="btn" data-page="games">Spielplan</button></div></div><div class="toolbar"><div class="tabs"><button class="tab ${state.leagueTab==='table'?'active':''}" data-leaguetab="table">Tabelle</button><button class="tab ${state.leagueTab==='schedule'?'active':''}" data-leaguetab="schedule">Spielplan</button><button class="tab ${state.leagueTab==='teams'?'active':''}" data-leaguetab="teams">Teams</button></div><span class="tag">Top 2 ↑ · Bottom 2 ↓</span></div>${state.leagueTab==='table'?renderFullStandings(l,stand):state.leagueTab==='schedule'?renderSchedule(l):renderTeamsList(l)}`}
  function renderFullStandings(l,stand){return `<div class="card"><table class="table"><thead><tr><th>#</th><th>Team</th><th>Sp</th><th>S</th><th>U</th><th>N</th><th>TD</th><th>Pkt</th></tr></thead><tbody>${stand.map((s,i)=>{const t=state.teams[s.teamId];return `<tr class="${s.teamId===state.userTeamId?'active':''}"><td>${i+1}</td><td><div class="team-cell"><img src="${teamLogo(t)}"><span>${esc(t.name)} <small class="muted">${esc(t.city)}</small></span></div></td><td>${s.played}</td><td>${s.wins}</td><td>${s.draws}</td><td>${s.losses}</td><td>${s.gd>0?'+':''}${s.gd}</td><td class="rating">${s.points}</td></tr>`}).join('')}</tbody></table></div>`}
  function renderSchedule(l){const games=l.schedule.filter(g=>g.round>=state.week-1&&g.round<=state.week+5).slice(0,40);return `<div class="card"><div class="list">${games.map(g=>{const h=state.teams[g.home],a=state.teams[g.away];return `<div class="list-row"><div><strong>${esc(h.name)} vs ${esc(a.name)}</strong><small>Spieltag ${g.round}${g.played?' · '+g.result.hg+':'+g.result.ag:' · offen'}</small></div><div class="right"><span class="tag ${g.played?'':'blue'}">${g.played?'Fertig':'Geplant'}</span></div></div>`}).join('')}</div></div>`}
  function renderTeamsList(l){return `<div class="grid three">${l.teams.map(id=>{const t=state.teams[id];return `<div class="card"><div class="avatar-card"><img src="${teamLogo(t)}"><div><strong>${esc(t.name)}</strong><small>${esc(t.city)} · ${t.baseQuality} OVR</small></div></div><div style="height:9px"></div>${renderTeamMetricsMini(t)}</div>`}).join('')}</div>`}
  function renderTeamMetricsMini(t){const v=Math.round(teamStrength(t));return `<div class="metric"><span>Stärke</span><strong>${v}</strong></div><div class="bar"><span style="width:${v}%"></span></div>`}

  function renderGames(){const l=currentLeague(),ng=nextUserGame();return `<div class="page-head"><div><h2>Spiele</h2><p>Spieltag für Spieltag steuern · Wetter, Form, Coach und Heimvorteil fließen ein</p></div><div class="actions"><button class="btn primary" data-simulate>${ng?'Nächsten Spieltag simulieren':'Saison abschließen'}</button></div></div><div class="grid two"><div class="card">${ng?renderNextMatch(ng,state.teams[ng.home===currentTeam().id?ng.away:ng.home],ng.home===currentTeam().id):'<div class="empty">Keine offenen Spiele.</div>'}</div><div class="card"><div class="card-title"><h3>Simulation</h3><span class="tag gold">Real-Time Ready</span></div><div class="list-row"><div><strong>Form</strong><small>Teamform der letzten 5 Spiele</small></div><div class="right">${currentTeam().form.join(' · ')}</div></div><div class="list-row"><div><strong>Coach</strong><small>80–100% der Basissteigerung</small></div><div class="right">${currentTeam().coach?`+${Math.round(effectiveCoachBoost(currentTeam())*10)/10}%`:'–'}</div></div><div class="list-row"><div><strong>Wetter</strong><small>Leichter Einfluss auf Teamleistung</small></div><div class="right">${pick(WEATHER).icon}</div></div><div class="list-row"><div><strong>Heimvorteil</strong><small>Heimteam +5%</small></div><div class="right"><span class="tag">+5%</span></div></div></div></div><div style="height:12px"></div><div class="card"><div class="card-title"><h3>Ergebnisse</h3><span class="muted">Letzte 8 Ligaspiele</span></div><div class="list">${l.schedule.filter(g=>g.played&& (g.home===currentTeam().id||g.away===currentTeam().id)).slice(-8).reverse().map(g=>{const opp=state.teams[g.home===currentTeam().id?g.away:g.home];return `<div class="list-row"><div><strong>${esc(opp.name)}</strong><small>Spieltag ${g.round} · ${g.result.weather}</small></div><div class="right"><strong>${g.home===currentTeam().id?g.result.hg:g.result.ag}:${g.home===currentTeam().id?g.result.ag:g.result.hg}</strong><small>${g.home===currentTeam().id?'Heim':'Auswärts'}</small></div></div>`}).join('')||'<div class="empty">Noch keine Ergebnisse.</div>'}</div></div>`}

  function renderMarket(){const list=state.market.filter(p=>state.marketFilter==='all'||p.pos===state.marketFilter).sort((a,b)=>b.rating-a.rating); return `<div class="page-head"><div><h2>Transfermarkt</h2><p>Spieler kaufen, verkaufen und Kader entwickeln</p></div><div class="actions"><button class="btn" data-page="draft">Draft</button><button class="btn" data-market-refresh>Markt aktualisieren</button></div></div><div class="toolbar"><div class="tabs">${['all','GK','CB','MF','LW','RW','ST'].map(x=>`<button class="tab ${state.marketFilter===x?'active':''}" data-marketfilter="${x}">${x==='all'?'Alle':x}</button>`).join('')}</div><span class="tag">Budget ${money(currentTeam().budget)}</span></div><div class="player-grid">${list.map(p=>`<div class="player-card"><div class="player-top"><div class="player-ident"><img src="${avatarSvg(p)}"><div><strong>${esc(p.name)}</strong><span>${p.pos} · ${p.age} J.</span></div></div><div class="ovr">${p.rating}</div></div><div class="attrs">${attrBox('Tempo',p.skill.pace)}${attrBox('Schuss',p.skill.shoot)}${attrBox('Pass',p.skill.pass)}${attrBox('Def',p.skill.def)}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><span class="muted" style="font-size:10px">${money(p.value)}</span><button class="btn primary" data-buy="${p.id}">Kaufen</button></div></div>`).join('')}</div>`}

  function renderSponsors(){return `<div class="page-head"><div><h2>Sponsoren</h2><p>Regionale Partner · Wochenbudget · Bonus auf Einnahmen</p></div><span class="tag">Aktuell: ${currentTeam().sponsor?esc(currentTeam().sponsor.name):'kein Vertrag'}</span></div><div class="grid three">${SPONSORS.map(s=>`<div class="card"><div class="avatar-card"><img src="assets/sponsors/${s.id}.svg"><div><strong>${esc(s.name)}</strong><small>Stufe ${s.tier} · ${money(s.pay)} / Woche</small></div></div><div style="height:10px"></div><div class="metric"><span>Bonus</span><strong>+${Math.round(s.bonus*100)}%</strong></div><div style="height:8px"></div><button class="btn ${currentTeam().sponsor?.id===s.id?'':'primary'}" data-sponsor="${s.id}">${currentTeam().sponsor?.id===s.id?'Aktiv':'Vertrag anbieten'}</button></div>`).join('')}</div>`}
  function renderStadium(){const t=currentTeam();const ups=[['capacity','Kapazität'],['stands','Tribüne'],['lighting','Flutlicht'],['catering','Catering'],['merch','Merchandise'],['vip','VIP-Bereich'],['surface','Kunstrasen'],['fence','Banden'],['media','Medien',],['academy','Jugendzentrum']];return `<div class="page-head"><div><h2>Stadion</h2><p>${esc(t.stadium.name)} · Ausbaukosten steigen exponentiell</p></div><button class="btn" data-rename-stadium>Umbenennen</button></div><div class="grid two"><div class="card"><img src="assets/stadium/stadium.svg" style="width:100%;max-height:290px;object-fit:cover;border-radius:12px;image-rendering:pixelated"><div style="height:10px"></div><div class="kpi-grid"><div class="kpi"><small>Kapazität</small><strong>${t.stadium.capacity}</strong></div><div class="kpi"><small>Level</small><strong>${t.stadium.level}</strong></div><div class="kpi"><small>Monat</small><strong>${money(-Math.round(t.stadium.capacity*18))}</strong></div><div class="kpi"><small>Steuer</small><strong>${money(-Math.round(t.stadium.capacity*1.4))}</strong></div></div></div><div class="card"><div class="list">${ups.map(([k,label])=>{const lvl=t.stadium.upgrades[k]||0,cost=Math.round(9000*Math.pow(2,lvl));return `<div class="list-row"><div><strong>${label}</strong><small>Level ${lvl} · ${money(cost)}</small></div><div class="right"><button class="btn" data-upgrade="${k}">Ausbauen</button></div></div>`}).join('')}</div></div></div>`}
  function renderFinances(){const t=currentTeam();const wages=t.roster.reduce((s,p)=>s+p.salary,0);const stadiumCosts=Math.round(t.stadium.capacity*18);const sponsor=t.sponsor?.pay||0;return `<div class="page-head"><div><h2>Finanzen</h2><p>Budget, Gehälter, Spieltagseinnahmen und Sponsorengeld</p></div><button class="btn" data-export>Save exportieren</button></div><div class="kpi-grid"><div class="kpi"><small>Kontostand</small><strong>${money(t.budget)}</strong></div><div class="kpi"><small>Gehälter / Monat</small><strong>${money(wages)}</strong></div><div class="kpi"><small>Sponsor / Woche</small><strong>${money(sponsor)}</strong></div><div class="kpi"><small>Stadionkosten</small><strong>${money(stadiumCosts)}</strong></div></div><div style="height:12px"></div><div class="grid two"><div class="card"><div class="card-title"><h3>Cashflow</h3></div><div class="list"><div class="list-row"><div><strong>Sponsor</strong><small>Wöchentliche Zahlung</small></div><div class="right up">+${money(sponsor)}</div></div><div class="list-row"><div><strong>Tickets</strong><small>Ø pro Heimspiel</small></div><div class="right up">+${money(Math.round(t.stadium.capacity*0.8*9))}</div></div><div class="list-row"><div><strong>Gehälter</strong><small>Monatlich</small></div><div class="right down">-${money(wages)}</div></div><div class="list-row"><div><strong>Stadionbetrieb</strong><small>Monatlich</small></div><div class="right down">-${money(stadiumCosts)}</div></div></div></div><div class="card"><div class="card-title"><h3>Wirtschaftslogik</h3></div><div class="list-row"><div><strong>Ligaprämie</strong><small>Siege bringen Extra-Budget</small></div><div class="right">+${money(5000)}</div></div><div class="list-row"><div><strong>Steuer</strong><small>Skaliert mit Stadiongröße</small></div><div class="right">${money(Math.round(t.stadium.capacity*.5))}</div></div><div class="list-row"><div><strong>Kredit</strong><small>Für große Ausbauten</small></div><div class="right"><button class="btn" data-credit>Kredit</button></div></div></div></div>`}
  function renderStats(){const t=currentTeam(),all=t.roster.slice().sort((a,b)=>b.goals-a.goals);return `<div class="page-head"><div><h2>Statistiken</h2><p>Spieler- und Teamperformance über die Saison</p></div><span class="tag">${t.stats.wins} Siege · ${t.stats.goals||0} Team-Tore</span></div><div class="kpi-grid"><div class="kpi"><small>Spiele</small><strong>${t.stats.played}</strong></div><div class="kpi"><small>Siege</small><strong>${t.stats.wins}</strong></div><div class="kpi"><small>Tore</small><strong>${t.stats.gf}</strong></div><div class="kpi"><small>Gegentore</small><strong>${t.stats.ga}</strong></div></div><div style="height:12px"></div><div class="card"><table class="table"><thead><tr><th>Spieler</th><th>Pos</th><th>Rating</th><th>Sp</th><th>Tore</th><th>Assists</th><th>Form</th></tr></thead><tbody>${all.map(p=>`<tr><td><div class="team-cell"><img src="${avatarSvg(p,t.teamColor)}"><span>${esc(p.name)}</span></div></td><td>${p.pos}</td><td>${p.rating}</td><td>${p.games}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.form}%</td></tr>`).join('')}</tbody></table></div>`}
  function renderDraft(){return `<div class="page-head"><div><h2>Draft</h2><p>Talente ziehen und Kader aufbauen</p></div><span class="tag gold">Kader ${currentTeam().roster.length}/12</span></div><div class="grid three">${[['silver','Silver','2 Talente','€ 7.000'],['gold','Gold','3 Talente','€ 14.000'],['premium','Premium','4 Talente','€ 26.000']].map(x=>`<div class="card"><div class="card-title"><h3>${x[1]}</h3><span class="tag">${x[2]}</span></div><p class="muted" style="font-size:11px">${x[3]} · Rating-Band passend zur Liga</p><button class="btn primary" data-draft="${x[0]}">Draft öffnen</button></div>`).join('')}</div>`}
  function renderCoaches(){return `<div class="page-head"><div><h2>Coaches</h2><p>5–8% Boost, Tagesform und Ein-Saison-Verträge</p></div>${currentTeam().coach?'<button class="btn danger" data-firecoach>Coach entlassen</button>':''}</div><div class="grid three">${state.coaches.map(c=>`<div class="card"><div class="avatar-card"><img src="assets/players/coach.svg"><div><strong>${esc(c.name)}</strong><small>${c.role} · Stufe ${c.league}</small></div></div><div style="height:9px"></div><div class="metric"><span>Boost</span><strong>+${c.boost}%</strong></div><div class="metric"><span>Vertrag</span><strong>${money(c.price)}</strong></div><div style="height:10px"></div><button class="btn ${currentTeam().coach===c.id?'':'primary'}" data-coach="${c.id}">${currentTeam().coach===c.id?'Aktiv':'Verpflichten'}</button></div>`).join('')}</div>`}
  function renderSettings(){return `<div class="page-head"><div><h2>Einstellungen</h2><p>Speicherstand und Managerprofil</p></div></div><div class="grid two"><div class="card"><div class="field-group"><label>Managername</label><input class="input" id="managerName" value="${esc(state.manager)}"></div><div class="field-group"><label>Vereinsname</label><input class="input" id="teamName" value="${esc(currentTeam().name)}"></div><div class="field-group"><label>Stadionname</label><input class="input" id="stadiumName" value="${esc(currentTeam().stadium.name)}"></div><button class="btn primary" data-settings-save>Änderungen speichern</button></div><div class="card"><div class="list"><div class="list-row"><div><strong>Save exportieren</strong><small>JSON-Datei für Backup</small></div><button class="btn" data-export>Export</button></div><div class="list-row"><div><strong>Save importieren</strong><small>Lokalen JSON-Spielstand laden</small></div><button class="btn" data-import>Import</button></div><div class="list-row"><div><strong>Neues Spiel</strong><small>Alles lokal zurücksetzen</small></div><button class="btn danger" data-reset>Reset</button></div></div></div></div>`}
  function teamLogo(t){return t.id===state.userTeamId?'assets/crest-talblick.svg':`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges"><rect width="64" height="64" rx="14" fill="#0c171e"/><path d="M32 6 53 15v18c0 13-8 20-21 26C19 53 11 46 11 33V15Z" fill="${t.teamColor}"/><rect x="18" y="22" width="28" height="8" fill="#071016"/><rect x="28" y="17" width="8" height="18" fill="#071016"/></svg>`)}`}
  function bindEvents(){
    $$('[data-page]').forEach(b=>b.onclick=()=>switchPage(b.dataset.page));
    $('[data-menu]')?.addEventListener('click',toggleSidebar);
    $('[data-simulate]')?.addEventListener('click',simulateNext);
    $('[data-notify]')?.addEventListener('click',()=>openModal('News',state.news.map(n=>`<div class="news" style="margin-bottom:8px"><img src="${n.icon}"><div><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span></div></div>`).join('')));
    $$('[data-teamtab]').forEach(b=>b.onclick=()=>{state.teamTab=b.dataset.teamtab;render()});
    $$('[data-leaguetab]').forEach(b=>b.onclick=()=>{state.leagueTab=b.dataset.leaguetab;render()});
    $$('[data-marketfilter]').forEach(b=>b.onclick=()=>{state.marketFilter=b.dataset.marketfilter;render()});
    $('[data-market-refresh]')?.addEventListener('click',()=>{state.market=generateMarket(18);toast('Transfermarkt aktualisiert','Neue Spieler sind verfügbar.');render()});
    $$('[data-buy]').forEach(b=>b.onclick=()=>buyPlayer(b.dataset.buy));
    $$('[data-sell]').forEach(b=>b.onclick=()=>sellPlayer(b.dataset.sell));
    $$('[data-sponsor]').forEach(b=>b.onclick=()=>hireSponsor(b.dataset.sponsor));
    $$('[data-upgrade]').forEach(b=>b.onclick=()=>upgradeStadium(b.dataset.upgrade));
    $('[data-rename-stadium]')?.addEventListener('click',()=>{openModal('Stadion umbenennen',`<div class="field-group"><label>Neuer Name</label><input class="input" id="newStad" value="${esc(currentTeam().stadium.name)}"></div><div class="mini-note">Gebühr: € 5.000</div>`,{footer:false}); const m=$('#modalBackdrop'); m.querySelector('.modal-body').insertAdjacentHTML('afterend','<div class="modal-foot"><button class="btn" data-close>Abbrechen</button><button class="btn primary" id="saveStad">Umbenennen</button></div>');m.querySelector('[data-close]').onclick=closeModal;m.querySelector('#saveStad').onclick=()=>{const t=currentTeam();const v=$('#newStad',m).value.trim();if(!v)return;if(t.budget<5000){toast('Zu wenig Budget');return;}t.budget-=5000;t.stadium.name=v;closeModal();saveState();render();}});
    $$('[data-tactic]').forEach(b=>b.onclick=()=>{state.tactic=b.dataset.tactic;toast('Taktik geändert',state.tactic);render()});
    $$('[data-draft]').forEach(b=>b.onclick=()=>draft(b.dataset.draft));
    $$('[data-coach]').forEach(b=>b.onclick=()=>hireCoach(b.dataset.coach));
    $('[data-firecoach]')?.addEventListener('click',fireCoach);
    $$('[data-player]').forEach(b=>b.onclick=()=>{const p=currentTeam().roster.find(x=>x.id===b.dataset.player); if(!p)return;openModal(p.name,`<div class="avatar-card"><img src="${avatarSvg(p,currentTeam().teamColor)}"><div><strong>${p.pos} · ${p.rating} OVR</strong><small>${p.age} Jahre · Form ${p.form}%</small></div></div><div style="height:10px"></div><div class="attrs">${attrBox('Tempo',p.skill.pace)}${attrBox('Schuss',p.skill.shoot)}${attrBox('Pass',p.skill.pass)}${attrBox('Def',p.skill.def)}${attrBox('Kontrolle',p.skill.control)}${attrBox('Leadership',p.skill.lead)}</div>`)});
    $$('[data-draft-index]').forEach(b=>{b.onclick=()=>{const idx=Number(b.dataset.draftIndex); const cards=$$('.player-card',$('#modalBackdrop .modal-body')); const card=cards[idx]; const p=state._draftPlayers?.[idx]; if(p)chooseDraft(p)}});
    $('[data-settings-save]')?.addEventListener('click',()=>{state.manager=$('#managerName').value.trim()||'Manager';currentTeam().name=$('#teamName').value.trim()||currentTeam().name;currentTeam().stadium.name=$('#stadiumName').value.trim()||currentTeam().stadium.name;saveState();toast('Gespeichert','Managerprofil aktualisiert.');render()});
    $('[data-export]')?.addEventListener('click',exportSave); $('[data-import]')?.addEventListener('click',importSave); $('[data-reset]')?.addEventListener('click',()=>{if(confirm('Wirklich neuen Spielstand starten?'))resetState()});
    $$('[data-credit]').forEach(b=>b.onclick=()=>{const t=currentTeam();t.budget+=50000;toast('Liga-Kredit','€ 50.000 wurden aufgenommen.');saveState();render()});
    $('#modalBackdrop')?.addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
  }
  function showWelcome(){
    openModal('WILLKOMMEN BEI STREET KINGS MANAGER',`<div class="modal-hero"><h3>Katzenelnbogen. Deine Straße. Dein Club.</h3></div><p style="color:#b4c6ce;line-height:1.6">Übernimm einen Street-Soccer-Club aus der Region und entwickle ihn von der Kreisliga bis an die Spitze. 4 Feldspieler + 1 Torwart, Transfermarkt, Coaches, Sponsoren, Stadionausbau, Draft, Finanzen, Form, Wetter und Auf-/Abstieg.</p><div class="field-group"><label>Managername</label><input class="input" id="welcomeManager" value="${esc(state.manager)}"></div><div class="field-group"><label>Clubname</label><input class="input" id="welcomeTeam" value="${esc(currentTeam().name)}"></div><div class="checkbox"><input id="welcomeSkip" type="checkbox"> <label for="welcomeSkip">Willkommensfenster später nicht mehr anzeigen</label></div>`,{footer:false});
    const b=$('#modalBackdrop');b.querySelector('.modal-body').insertAdjacentHTML('afterend','<div class="modal-foot"><button class="btn primary" id="welcomeGo">LOS GEHT’S!</button></div>'); b.querySelector('#welcomeGo').onclick=()=>{state.manager=$('#welcomeManager',b).value.trim()||'Manager';currentTeam().name=$('#welcomeTeam',b).value.trim()||currentTeam().name;closeModal();saveState();render();toast('Willkommen',`Viel Erfolg, ${esc(state.manager)}.`)};
  }
  function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='street-kings-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
  function importSave(){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=()=>{const file=input.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);localStorage.setItem('streetKingsSave',JSON.stringify(d));location.reload()}catch(e){toast('Import fehlgeschlagen','Die JSON-Datei ist ungültig.')}};r.readAsText(file)};input.click();}

  // Patch draft click storage cleanly.
  const _draft=draft;
  draft=function(type){const t=currentTeam(); const cfg={silver:{cost:7000,n:2,min:58,max:70},gold:{cost:14000,n:3,min:68,max:80},premium:{cost:26000,n:4,min:76,max:91}}[type]; if(t.budget<cfg.cost){toast('Draft nicht möglich','Budget reicht nicht.');return;} t.budget-=cfg.cost; const picks=[]; for(let i=0;i<cfg.n;i++){const p=makePlayer(900+i,t.teamColor,pick(['CB','MF','LW','RW','ST']),cfg.min+Math.random()*(cfg.max-cfg.min));p.value=Math.round(p.value*.6);p.salary=Math.round(p.salary*.8);p.draft=true;picks.push(p)}state._draftPlayers=picks;openModal(`Draft – ${type.toUpperCase()}`,renderDraftModal(picks));saveState();};

  initState(); render();
})();
