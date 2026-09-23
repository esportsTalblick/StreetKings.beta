/*
 * STREET KINGS: MANAGER — mobile-first browser edition
 * Replacement file: app.js
 * - 100% touch-oriented navigation
 * - 5-a-side: 4 outfield + 1 GK
 * - 120 second live match simulation
 * - dynamic transfer marketplace with live listings/auctions
 * - fixtures/friendlies, draft, coaches, sponsors, stadium, finances, stats
 * - local save + JSON export/import
 */
(() => {
  'use strict';

  const APP_KEY = 'streetKingsSaveV2';
  const LEGACY_KEY = 'streetKingsSave';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money = n => new Intl.NumberFormat('de-DE', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(Math.round(n || 0));
  const dateDE = d => new Date(d).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit'});
  const timeDE = d => new Date(d).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const uid = p => `${p}_${Math.random().toString(36).slice(2,10)}`;
  const avg = (arr, fn) => arr.length ? arr.reduce((s,x)=>s+fn(x),0)/arr.length : 0;

  const POSITIONS = ['GK','CB','LB','RB','MF','LW','RW','ST'];
  const FIRST = ['Jay','Rico','Dario','Karim','Matteo','Noah','Emir','Jonas','Luca','Timo','Matti','Leo','Elias','Nico','Sami','Finn','Milan','Ben','Yasin','Jan','Mika','Nils','Toni','Amin'];
  const LAST = ['Keller','Braun','Wagner','Reinhardt','Yilmaz','Schmidt','Koch','Fischer','Bauer','Klein','Weber','Lenz','Roth','Köhler','Seidel','Vogt','Meyer','Aydin','Neumann','Haas','Jäger','Hartung','Demir','Kovac'];
  const HAIR = ['black','brown','blond','dark'];
  const SKIN = ['light','tan','dark'];
  const TEAM_COLORS = ['#39f2a5','#ff5c67','#6fb7ff','#f3c54f','#be9cff','#6ee7f5','#ff9f68','#f47edc'];
  const WEATHER = [
    {name:'Klar',mult:1.02,icon:'☀',pitch:'Trocken'},
    {name:'Bewölkt',mult:1.00,icon:'☁',pitch:'Normal'},
    {name:'Leichter Regen',mult:0.97,icon:'☂',pitch:'Rutschig'},
    {name:'Windig',mult:0.96,icon:'≋',pitch:'Windig'}
  ];
  const SPONSORS = [
    {id:'rewe',name:'REWE Katzenelnbogen',tier:1,pay:11000,bonus:0.02,accent:'#ef233c'},
    {id:'ksk',name:'Kreissparkasse Rhein-Lahn',tier:2,pay:16000,bonus:0.03,accent:'#e51c2e'},
    {id:'schaefer',name:'Schäfer Garten & Landschaft',tier:2,pay:14500,bonus:0.025,accent:'#57b957'},
    {id:'belzer',name:'Autohaus Belzer',tier:3,pay:21500,bonus:0.04,accent:'#9ea9b2'},
    {id:'aarwerk',name:'AARWERK Energie',tier:3,pay:24000,bonus:0.045,accent:'#ffd34d'},
    {id:'talblick',name:'Talblick Sport',tier:3,pay:27000,bonus:0.05,accent:'#45f2b0'}
  ];
  const TEAM_NAMES = [
    ['Talblick FC','Katzenelnbogen'],['Aar-Einrich United','Hahnstätten'],['Diez Street Crew','Diez'],['Lahn Kicker','Limburg'],
    ['Nastätten Blocks','Nastätten'],['Westerwald United','Holzhausen'],['Aarbergen City','Aarbergen'],['Dörsbach Boys','Dörsdorf'],
    ['Rhein-Lahn Five','Bad Ems'],['Taunus Tigers','Bad Schwalbach'],['Goldener Grund','Hünfelden'],['Lahnpark FC','Lahnau'],
    ['Wallraben Kickers','Koblenz-Land'],['Heidenrod 09','Heidenrod'],['Untertaunus Crew','Taunusstein'],['Loreley Street','St. Goarshausen'],
    ['Hochtaunus Royals','Idstein'],['Nassau Athletic','Nassau'],['Kannenbäcker FC','Montabaur'],['Aar Valley 05','Aar-Einrich'],
    ['Rheingau Five','Geisenheim'],['Lahnstein South','Lahnstein'],['Taunus Park','Niedernhausen'],['Kreispark United','Limburg']
  ];

  const state = {
    version:'2.0.0', firstRun:true, manager:'Manager', active:'home', season:1, week:1,
    date:new Date('2026-08-15T18:00:00'), userTeamId:null, teams:{}, leagues:{}, market:[], coaches:[], news:[],
    friendlies:[], marketFilter:'all', tactic:'1-2-2', tactics:{pressing:62,risk:50,tempo:58,passing:56}, notifications:2,
    trophies:0, lastMatch:null, liveMatch:null
  };

  function playerAvatar(p, accent='#41f3a5', small=false){
    const skin = p.skin==='dark'?'#87573e':p.skin==='tan'?'#b97a54':'#dfad84';
    const hair = p.hair==='blond'?'#d5ad63':p.hair==='brown'?'#5b402d':p.hair==='dark'?'#241d1b':'#121212';
    const kit = p.teamColor || accent;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${small?52:76}" height="${small?52:76}" shape-rendering="crispEdges"><rect width="100%" height="100%" rx="12" fill="#081118"/><rect x="25%" y="12%" width="50%" height="28%" rx="8" fill="${skin}"/><rect x="22%" y="10%" width="56%" height="14%" rx="6" fill="${hair}"/><rect x="19%" y="38%" width="62%" height="32%" rx="6" fill="${kit}"/><rect x="13%" y="43%" width="13%" height="26%" fill="${kit}"/><rect x="74%" y="43%" width="13%" height="26%" fill="${kit}"/><rect x="32%" y="69%" width="13%" height="23%" fill="#dce4e8"/><rect x="55%" y="69%" width="13%" height="23%" fill="#dce4e8"/><rect x="34%" y="29%" width="6%" height="6%" fill="#071016"/><rect x="60%" y="29%" width="6%" height="6%" fill="#071016"/></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function crest(team){
    if(team && team.id===state.userTeamId && team.name==='Talblick FC') return 'assets/crest-talblick.svg';
    const c = team?.teamColor || '#39f2a5';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges"><path d="M32 4 56 14v20c0 15-9 24-24 27C17 58 8 49 8 34V14Z" fill="#071016"/><path d="M32 8 52 16v17c0 12-7 20-20 24-13-4-20-12-20-24V16Z" fill="${c}"/><path d="M19 27h26v7H19zM27 20h10v22H27z" fill="#071016"/></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function makePlayer(seed, teamColor='#39f2a5', forcedPos=null, base=67){
    const pos=forcedPos||pick(POSITIONS), age=17+Math.floor(Math.random()*12);
    const rating=clamp(Math.round(base + (Math.random()*18-9)), 48, 92);
    const bias={GK:{def:12,pass:4,control:4},CB:{def:13,pass:4},LB:{pace:7,def:8,pass:5},RB:{pace:7,def:8,pass:5},MF:{pass:11,control:9,shoot:3},LW:{pace:10,control:9,shoot:5,pass:3},RW:{pace:10,control:9,shoot:5,pass:3},ST:{shoot:13,pace:7,control:8}}[pos];
    const skill={pace:0,shoot:0,pass:0,def:0,control:0,lead:0};
    Object.keys(skill).forEach(k=>skill[k]=clamp(Math.round(rating-10+Math.random()*14+(bias?.[k]||0)),35,98));
    const name=`${FIRST[seed%FIRST.length]} ${LAST[(seed*5+Math.floor(seed/4))%LAST.length]}`;
    return {id:uid('p'),name,pos,age,rating,skill,salary:Math.round(700+rating*rating*1.8+age*70),value:Math.round(30000+rating*rating*20+(24-age)*1700),form:Math.round(78+Math.random()*22),teamColor,skin:pick(SKIN),hair:pick(HAIR),games:0,goals:0,assists:0,yellow:0,marketHeat:Math.random()};
  }

  function makeRoster(teamColor, quality){
    const pos=['GK','CB','LB','RB','ST','MF','LW','RW','ST','MF'];
    return pos.map((p,i)=>makePlayer(i+Math.round(Math.random()*3),teamColor,p,quality));
  }

  function teamObj(name,city,quality,tier,color){
    const c=color || pick(TEAM_COLORS);
    return {id:uid('t'),name,city,quality,baseQuality:quality,teamColor:c,budget:tier===1?310000:tier===2?205000:125000,roster:makeRoster(c,quality),coach:null,coachBoost:0,
      form:['W','D','W','L','S'],stadium:{name:`${name} Street Arena`,capacity:180,level:1,upgrades:{}},sponsor:null,
      stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,homeRevenue:0,shots:0,xg:0},youth:2,titles:0};
  }

  function buildTeams(){
    return TEAM_NAMES.map((x,i)=>teamObj(x[0],x[1],i<8?74:i<16?68:62,i<8?1:i<16?2:3,i===0?'#39f2a5':null));
  }

  function makeLeague(teams,name,level){
    const l={id:`L${level}`,name,level,teams:teams.map(t=>t.id),schedule:[],standings:{},currentRound:1};
    l.teams.forEach(id=>l.standings[id]={teamId:id,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0});
    l.schedule=roundRobin(l.teams); return l;
  }

  function roundRobin(ids){
    const arr=[...ids], hasBye=arr.length%2===1; if(hasBye)arr.push(null); const n=arr.length, first=[];
    for(let r=0;r<n-1;r++){
      const games=[]; for(let i=0;i<n/2;i++){const a=arr[i],b=arr[n-1-i]; if(a&&b)games.push({id:uid('g'),round:r+1,home:r%2?a:b,away:r%2?b:a,played:false,result:null});}
      first.push(games); arr.splice(1,0,arr.pop());
    }
    const games=first.flat();
    const returnLeg=games.map(g=>({id:uid('g'),round:g.round+n-1,home:g.away,away:g.home,played:false,result:null}));
    return [...games,...returnLeg];
  }

  function generateMarket(n=18){
    const out=[]; for(let i=0;i<n;i++){
      const p=makePlayer(100+i,pick(TEAM_COLORS),pick(['GK','CB','LB','RB','MF','LW','RW','ST']),61+Math.random()*18);
      p.teamId=null; p.value=Math.round(p.value*(0.72+Math.random()*0.28)); p.currentPrice=p.value; p.listingEndsAt=Date.now()+90000+Math.random()*150000; p.watch=false; p.bids=0;
      out.push(p);
    }
    return out;
  }

  function generateCoaches(){
    return [
      {id:'c1',name:'Mika Härtel',role:'Offensive',boost:7,price:15000,league:3},
      {id:'c2',name:'Rene Falk',role:'Defensive',boost:6,price:14000,league:3},
      {id:'c3',name:'Sami Jäger',role:'Tempo',boost:8,price:18500,league:2},
      {id:'c4',name:'Lena Koch',role:'Allround',boost:7,price:17500,league:1},
      {id:'c5',name:'Milo Hartung',role:'Mentalität',boost:5,price:10500,league:3}
    ];
  }

  function initState(){
    const raw=localStorage.getItem(APP_KEY)||localStorage.getItem(LEGACY_KEY);
    if(raw){
      try{const d=JSON.parse(raw); Object.assign(state,d); normalizeState(); state.firstRun=!!d.firstRun; return;}catch(e){console.warn('Save konnte nicht geladen werden',e);}
    }
    const teams=buildTeams(); teams.forEach(t=>state.teams[t.id]=t); state.userTeamId=teams[0].id;
    // User club starts in the regional third tier.
    state.leagues.L1=makeLeague(teams.slice(0,8),'Rhein-Lahn Premier',1);
    state.leagues.L2=makeLeague(teams.slice(8,16),'Taunus Pro League',2);
    state.leagues.L3=makeLeague([teams[0],...teams.slice(16,23)],'Kreisstraße-Liga Katzenelnbogen',3);
    state.leagues.L1.teams=teams.slice(1,8).map(t=>t.id).concat([teams[23].id]);
    state.leagues.L2.teams=teams.slice(8,16).map(t=>t.id);
    Object.values(state.leagues).forEach(l=>{l.teams.forEach(id=>l.standings[id] ||= {teamId:id,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0});l.schedule=roundRobin(l.teams);});
    const t=currentTeam(); t.sponsor={...SPONSORS[0]}; t.stadium.capacity=220;
    state.market=generateMarket(); state.coaches=generateCoaches();
    state.news=[
      {title:'Willkommen in Katzenelnbogen',body:'Dein Street-Soccer-Club startet. Die Stadt schaut zu.',kind:'city'},
      {title:'Bolzplatz im Fokus',body:'Mit Ausbau, Licht und Tribüne wird aus dem Platz eine echte Arena.',kind:'stadium'},
      {title:'Marktplatz geöffnet',body:'Neue Talente aus Aar-Einrich und Rhein-Lahn warten auf Angebote.',kind:'market'}
    ];
    state.friendlies=[];
    state.firstRun=true;
    saveState();
  }

  function normalizeState(){
    state.active=state.active||'home'; state.tactic=state.tactic||'1-2-2'; state.tactics=state.tactics||{pressing:62,risk:50,tempo:58,passing:56};
    state.market=Array.isArray(state.market)?state.market:generateMarket(); state.coaches=Array.isArray(state.coaches)?state.coaches:generateCoaches(); state.news=Array.isArray(state.news)?state.news:[]; state.friendlies=Array.isArray(state.friendlies)?state.friendlies:[];
    state.date=new Date(state.date||Date.now());
    Object.values(state.teams||{}).forEach(t=>{
      t.roster ||= makeRoster(t.teamColor||'#39f2a5',t.quality||65); t.stats ||= {played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,homeRevenue:0,shots:0,xg:0}; t.form ||= ['W','D','W','L','S'];
      t.stadium ||= {name:`${t.name} Street Arena`,capacity:180,level:1,upgrades:{}}; t.stadium.upgrades ||= {}; t.youth ||= 1; t.budget ||= 120000;
    });
    Object.values(state.leagues||{}).forEach(l=>{l.standings ||= {};l.schedule ||= [];});
    state.liveMatch=null;
  }

  function saveState(){
    const clean={...state,liveMatch:null,date:new Date(state.date).toISOString()};
    localStorage.setItem(APP_KEY,JSON.stringify(clean));
  }

  function currentTeam(){return state.teams[state.userTeamId];}
  function currentLeague(){return Object.values(state.leagues).find(l=>l.teams.includes(state.userTeamId)) || state.leagues.L3;}
  function standings(l){return Object.values(l.standings).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf);}
  function nextUserGame(){
    const league=currentLeague(); return league?.schedule.find(g=>!g.played && (g.home===state.userTeamId || g.away===state.userTeamId));
  }
  function teamStrength(t){
    const starters=t.roster.slice(0,5); const base=avg(starters,p=>p.rating); const coach=state.coaches.find(c=>c.id===t.coach); const boost=coach?coach.boost:0; const form=(t.form||[]).filter(x=>x==='W').length-(t.form||[]).filter(x=>x==='L').length;
    return base*(1+boost/100)*(1+form*0.012);
  }
  function marketLabel(pos){return pos==='GK'?'TW':pos;}

  function toast(title,body=''){const el=$('#toast');if(!el)return;$('#toastTitle',el).textContent=title;$('#toastBody',el).textContent=body;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),3200);}

  function addNews(title,body,kind='news'){
    state.news.unshift({title,body,kind}); state.news=state.news.slice(0,20);
  }

  function resetState(){localStorage.removeItem(APP_KEY);localStorage.removeItem(LEGACY_KEY);location.reload();}

  function renderShell(){
    const t=currentTeam(), l=currentLeague();
    const bottom=[['home','⌂','Home'],['team','♟','Verein'],['games','⚽','Spielen'],['market','🛒','Markt'],['more','☰','Menü']];
    return `<div class="mobile-app">
      <header class="mobile-topbar">
        <button class="brand-lockup" data-page="home" aria-label="Home">
          <img src="assets/logo.svg" alt="Street Kings">
          <span><strong>STREET KINGS</strong><em>MANAGER</em></span>
        </button>
        <div class="top-head-right">
          <div class="club-mini"><img src="${crest(t)}" alt=""><span><b>${esc(t.name)}</b><small>${esc(t.city)}</small></span></div>
          <div class="money-mini"><small>S${state.season} · W${state.week}</small><b>${money(t.budget)}</b></div>
          <button class="round-icon" data-notify aria-label="Benachrichtigungen">●</button>
        </div>
      </header>
      <main id="view" class="view"></main>
      <nav class="bottom-nav">${bottom.map(([k,ico,label])=>`<button data-bottom="${k}" class="${state.active===k?'active':''}"><span>${ico}</span><small>${label}</small></button>`).join('')}</nav>
      <div id="modalRoot"></div>
      <div id="toast" class="toast"><strong id="toastTitle"></strong><span id="toastBody"></span></div>
    </div>`;
  }

  function pageHead(title,sub,action=''){return `<div class="page-head"><div><div class="eyebrow">STREET KINGS · ${esc(currentTeam().city).toUpperCase()}</div><h1>${title}</h1><p>${sub}</p></div>${action?`<div class="page-action">${action}</div>`:''}</div>`;}
  function card(title,body,cls=''){return `<section class="card ${cls}"><div class="card-title"><h2>${title}</h2></div>${body}</section>`;}

  function renderHome(){
    const t=currentTeam(),l=currentLeague(),ng=nextUserGame(); const opp=ng?state.teams[ng.home===t.id?ng.away:ng.home]:null;
    const stand=standings(l), liveListings=state.market.slice().sort((a,b)=>b.currentPrice-a.currentPrice).slice(0,4);
    const quick=[['team','♟','Verein'],['team','👥','Team'],['games','⚽','Spielen'],['league','🏆','Liga'],['market','↔','Transfers'],['market','🛒','Marktplatz'],['more','🏙','Stadt'],['settings','▤','News']];
    return `<section class="home-screen">
      <div class="home-meta"><div><span>SAISON ${state.season}</span><b>· WOCHE ${state.week}</b></div><div><strong>${money(t.budget)}</strong><span> · 😎 ${Math.round(teamStrength(t))}</span></div></div>
      <section class="home-hero">
        <div class="hero-overlay"></div>
        <div class="hero-words"><strong>STREET KINGS</strong><em>MANAGER</em><span>KATZENELNBOGEN · AAR-EINRICH</span></div>
        <div class="hero-tag">SMALL TOWN<br>BIG DREAMS</div>
      </section>
      <div class="next-match-banner">
        <div><small>NÄCHSTES SPIEL</small><b>${ng&&opp?`VS ${esc(opp.name)}`:'SAISONABSCHLUSS'}</b><span>${ng?'Kreisliga · 18:00 · Bolzplatz Katzenelnbogen':'Neue Saison vorbereiten'}</span></div>
        <button class="gold-btn" data-simulate="1">${ng?'LIVE':'START'}</button>
      </div>
      <div class="quick-grid">${quick.map(([p,i,lbl])=>`<button data-page="${p}"><span>${i}</span><b>${lbl}</b></button>`).join('')}</div>
      ${renderLineupCard()}
      <div class="design-split"><div>${card('TABELLE · '+esc(l.name),`<div class="table-list compact">${stand.slice(0,5).map((s,i)=>{const tt=state.teams[s.teamId];return `<div class="table-row ${tt.id===t.id?'me':''}"><b>${i+1}</b><img src="${crest(tt)}"><span>${esc(tt.name)}</span><small>${s.points} P</small></div>`}).join('')}</div><button class="ghost-btn wide" data-page="league">MEHR</button>`)}</div><div>${card('LIVE-MARKT',`<div class="market-mini-list">${liveListings.map(p=>`<button class="market-mini" data-player="${p.id}"><img src="${playerAvatar(p,p.teamColor,true)}"><span><b>${esc(p.name.split(' ')[0])}</b><small>${marketLabel(p.pos)} · ${p.rating}</small></span><strong>${money(p.currentPrice)}</strong></button>`).join('')}</div><button class="ghost-btn wide" data-page="market">MARKTPLATZ ÖFFNEN</button>`)}</div></div>
      ${card('NEWS AUS DER REGION',`<div class="news-stack">${state.news.slice(0,3).map(n=>`<article><div class="news-thumb ${n.kind}">${n.kind==='market'?'↔':n.kind==='stadium'?'▤':'✦'}</div><div><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p></div></article>`).join('')}</div>`)}
    </section>`;
  }

  function renderNextMatchCard(ng,opp){
    const t=currentTeam(); if(!ng||!opp)return card('Nächstes Spiel','<div class="empty">Keine Ligaspiele offen.</div>');
    const home=ng.home===t.id;
    return `<section class="card next-match"><div class="section-kicker">NÄCHSTES SPIEL · SPIELTAG ${ng.round}</div><div class="match-versus"><div><img src="${crest(t)}"><strong>${esc(t.name)}</strong><small>${esc(t.city)}</small></div><div class="versus-text">VS</div><div><img src="${crest(opp)}"><strong>${esc(opp.name)}</strong><small>${esc(opp.city)}</small></div></div><div class="match-meta"><span>◷ ${dateDE(new Date(state.date.getTime()+7*86400000))} · 18:00</span><span>⌖ ${home?esc(t.stadium.name):esc(opp.stadium.name)}</span><span>${pick(WEATHER).icon} ${pick(WEATHER).name}</span></div><button class="gold-btn wide" data-simulate="1">LIVE SIMULATION STARTEN · 2:00</button></section>`;
  }

  function formationPositions(){
    const map={
      '1-2-2':[{x:50,y:86},{x:23,y:58},{x:77,y:58},{x:30,y:30},{x:70,y:30}],
      '1-1-2':[{x:50,y:86},{x:50,y:57},{x:27,y:33},{x:73,y:33},{x:50,y:19}],
      '1-3-1':[{x:50,y:86},{x:21,y:57},{x:50,y:46},{x:79,y:57},{x:50,y:22}]
    }; return map[state.tactic]||map['1-2-2'];
  }

  function renderLineupCard(){
    const t=currentTeam(),players=t.roster.slice(0,5), coords=formationPositions();
    return `<section class="card lineup-card"><div class="section-head"><div><div class="section-kicker">AUFSTELLUNG</div><h2>4 + 1 · ${esc(state.tactic)}</h2></div><button class="ghost-btn" data-page="tactics">Taktik</button></div><div class="field-mobile"><div class="field-mark center"></div><div class="field-mark box top"></div><div class="field-mark box bottom"></div><div class="field-mark line"></div>${players.map((p,i)=>`<button class="field-player" style="left:${coords[i].x}%;top:${coords[i].y}%" data-player="${p.id}"><img src="${playerAvatar(p,t.teamColor,true)}"><b>${esc(p.name.split(' ')[0])}</b><span>${marketLabel(p.pos)} ${p.rating}</span></button>`).join('')}</div><div class="team-bars"><div><span>OFF</span><b>${Math.round(avg(players,p=>p.skill.shoot))}</b><i><em style="width:${avg(players,p=>p.skill.shoot)}%"></em></i></div><div><span>PASS</span><b>${Math.round(avg(players,p=>p.skill.pass))}</b><i><em style="width:${avg(players,p=>p.skill.pass)}%"></em></i></div><div><span>DEF</span><b>${Math.round(avg(players,p=>p.skill.def))}</b><i><em style="width:${avg(players,p=>p.skill.def)}%"></em></i></div></div></section>`;
  }

  function renderTeam(){
    const t=currentTeam();
    return `${pageHead('Verein','Kader, Spielerentwicklung und Startelf',`<button class="gold-btn" data-page="draft">DRAFT</button>`)}
      <div class="kpi-strip"><span><b>${Math.round(teamStrength(t))}</b><small>OVR</small></span><span><b>${t.roster.length}/12</b><small>KADER</small></span><span><b>${money(t.roster.reduce((s,p)=>s+p.value,0))}</b><small>WERT</small></span></div>
      ${card('Kader',`<div class="player-list">${t.roster.map((p,i)=>`<article class="player-row"><button class="player-main" data-player="${p.id}"><img src="${playerAvatar(p,t.teamColor,true)}"><div><strong>${esc(p.name)}</strong><span>${marketLabel(p.pos)} · ${p.age} J. · Form ${p.form}%</span></div></button><div class="player-rating"><b>${p.rating}</b><small>${i<5?'STARTER':'BANK'}</small></div><button class="small-btn danger" data-sell="${p.id}" ${i<5?'disabled':''}>VERK.</button></article>`).join('')}</div>`)}
      ${card('Entwicklung',`<div class="stats-bars"><div><span>Tempo</span><b>${Math.round(avg(t.roster,p=>p.skill.pace))}</b><i><em style="width:${avg(t.roster,p=>p.skill.pace)}%"></em></i></div><div><span>Schuss</span><b>${Math.round(avg(t.roster,p=>p.skill.shoot))}</b><i><em style="width:${avg(t.roster,p=>p.skill.shoot)}%"></em></i></div><div><span>Pass</span><b>${Math.round(avg(t.roster,p=>p.skill.pass))}</b><i><em style="width:${avg(t.roster,p=>p.skill.pass)}%"></em></i></div><div><span>Def</span><b>${Math.round(avg(t.roster,p=>p.skill.def))}</b><i><em style="width:${avg(t.roster,p=>p.skill.def)}%"></em></i></div></div>`)}
    `;
  }

  function renderTactics(){
    const formations=['1-2-2','1-1-2','1-3-1'];
    return `${pageHead('Taktik','Touch-Steuerung für dein 5er-System')}
      ${card('Formation',`<div class="segmented">${formations.map(f=>`<button class="seg ${state.tactic===f?'active':''}" data-tactic="${f}">${f}</button>`).join('')}</div>${renderLineupCard()}`)}
      ${card('Matchplan',`<div class="range-row"><label>Pressing <b>${state.tactics.pressing}</b></label><input type="range" min="20" max="95" value="${state.tactics.pressing}" data-range="pressing"></div><div class="range-row"><label>Risiko <b>${state.tactics.risk}</b></label><input type="range" min="15" max="90" value="${state.tactics.risk}" data-range="risk"></div><div class="range-row"><label>Tempo <b>${state.tactics.tempo}</b></label><input type="range" min="25" max="95" value="${state.tactics.tempo}" data-range="tempo"></div><div class="range-row"><label>Passspiel <b>${state.tactics.passing}</b></label><input type="range" min="25" max="95" value="${state.tactics.passing}" data-range="passing"></div>`)}
    `;
  }

  function renderLeague(){
    const l=currentLeague(),stand=standings(l);
    return `${pageHead('Liga',esc(l.name),`<span class="rank-pill">${stand.findIndex(x=>x.teamId===state.userTeamId)+1}. Platz</span>`)}
      ${card('Tabelle',`<div class="league-list">${stand.map((s,i)=>{const t=state.teams[s.teamId];return `<div class="league-row ${t.id===state.userTeamId?'me':''}"><b>${i+1}</b><img src="${crest(t)}"><div><strong>${esc(t.name)}</strong><span>${esc(t.city)}</span></div><strong>${s.points}</strong><small>${s.gf}:${s.ga}</small></div>`}).join('')}</div>`)}
      ${card('Auf- & Abstieg',`<div class="promotion"><span><b>▲</b> Platz 1–2</span><span class="muted">Aufstieg</span><span><b class="red-txt">▼</b> letzter 2</span><span class="muted">Abstieg</span></div>`)}
    `;
  }

  function renderGames(){
    const l=currentLeague(),t=currentTeam(),leagueGames=l.schedule.filter(g=>g.home===t.id||g.away===t.id).slice(0,8), friendlies=state.friendlies.filter(g=>!g.played);
    const games=[...leagueGames.map(g=>({...g,type:'Liga'})),...friendlies.map(g=>({...g,type:'Freundschaft'}))].sort((a,b)=>(a.played?1:0)-(b.played?1:0)).slice(0,10);
    return `${pageHead('Spiele','Liga, Freundschaft und Live-Simulation',`<button class="gold-btn" data-add-game>SPIEL HINZUFÜGEN</button>`)}
      ${card('Nächste Spiele',`<div class="fixture-list">${games.map(g=>{const home=state.teams[g.home], away=state.teams[g.away];return `<button class="fixture-row" data-fixture="${g.id}" data-fixture-type="${g.type}"><div><span class="date-box">${g.played?'FT':dateDE(new Date(state.date.getTime()+Math.max(1,g.round-state.week)*7*86400000))}</span></div><div><strong>${esc(home?.name||'Team')} <span>vs</span> ${esc(away?.name||'Team')}</strong><small>${g.type} · ${g.played?`${g.result?.hg ?? ''}:${g.result?.ag ?? ''}`:'18:00'}</small></div><b>${g.played?'›':'LIVE'}</b></button>`}).join('')}</div>`)}
    `;
  }

  function renderMarket(){
    const filters=['all','GK','CB','LB','RB','MF','LW','RW','ST'];
    let list=state.market.filter(p=>state.marketFilter==='all'||p.pos===state.marketFilter).slice().sort((a,b)=>b.rating-a.rating);
    return `${pageHead('Marktplatz','Live-Angebote · Auktionen · Talente',`<button class="gold-btn" data-market-refresh>REFRESH</button>`)}
      <div class="market-live"><span class="live-dot"></span><strong>LIVE-MARKT</strong><span>Preise bewegen sich automatisch</span></div>
      ${card('Filter',`<div class="scroll-tabs">${filters.map(f=>`<button class="seg ${state.marketFilter===f?'active':''}" data-marketfilter="${f}">${f==='all'?'Alle':marketLabel(f)}</button>`).join('')}</div>`)}
      ${card('Spieler',`<div class="market-list">${list.map(p=>`<article class="market-row"><img src="${playerAvatar(p,p.teamColor,true)}"><div class="market-player"><strong>${esc(p.name)}</strong><span>${marketLabel(p.pos)} · ${p.age} J. · Form ${p.form}%</span><div><b>${p.rating}</b><small>Marktwert</small></div></div><div class="market-price"><b>${money(p.currentPrice)}</b><small>${Math.max(0,Math.ceil((p.listingEndsAt-Date.now())/1000))}s</small><button class="small-btn gold" data-buy="${p.id}">SOFORT</button><button class="small-btn" data-bid="${p.id}">BIETEN</button></div><button class="heart ${p.watch?'on':''}" data-watch="${p.id}">♥</button></article>`).join('')}</div>`)}
      ${card('Live-Auktionen',`<div class="auction-box"><div class="auction-head"><span class="live-dot"></span><strong>Nächstes Highlight</strong><span class="danger-txt">${Math.max(0,Math.ceil((state.market[0]?.listingEndsAt-Date.now())/1000))}s</span></div><p>Spieler wechseln live den Preis. Ein Gebot blockiert dein Budget erst bei erfolgreichem Abschluss.</p><button class="ghost-btn wide" data-market-refresh>Neue Spieler suchen</button></div>`)}
    `;
  }

  function renderSponsors(){
    const t=currentTeam(); return `${pageHead('Sponsoren','Partner aus Katzenelnbogen und Umgebung')}
      <div class="sponsor-current">${t.sponsor?`<div><span>HAUPTSPONSOR</span><strong>${esc(t.sponsor.name)}</strong><small>${money(t.sponsor.pay)} / Woche · +${Math.round(t.sponsor.bonus*100)}% Bonus</small></div><div class="sponsor-badge" style="--a:${t.sponsor.accent}">${esc(t.sponsor.name.split(' ')[0])}</div>`:'<div><strong>Kein Hauptsponsor</strong></div>'}</div>
      <div class="stack">${SPONSORS.map(s=>`<section class="card sponsor-card"><div class="sponsor-badge" style="--a:${s.accent}">${esc(s.name.split(' ')[0])}</div><div><strong>${esc(s.name)}</strong><span>Stufe ${s.tier} · ${money(s.pay)} / Woche</span><span>Bonus +${Math.round(s.bonus*100)}%</span></div><button class="small-btn ${t.sponsor?.id===s.id?'':'gold'}" data-sponsor="${s.id}">${t.sponsor?.id===s.id?'AKTIV':'VERTRAG'}</button></section>`).join('')}</div>`;
  }

  function renderStadium(){
    const t=currentTeam(); const ups=[['capacity','Kapazität','Mehr Zuschauer'],['stands','Tribüne','Mehr Stimmung'],['lighting','Flutlicht','Abendspiele'],['catering','Catering','Mehr Umsatz'],['merch','Merch','Vereinsumsatz'],['vip','VIP','Premiumgäste'],['surface','Kunstrasen','Wetterbonus'],['fence','Banden','Sponsorplätze'],['media','Medien','News-Reichweite'],['academy','Jugendzentrum','Talentbonus']];
    return `${pageHead('Arena','Dein Bolzplatz wird zum Street-Soccer-Hotspot',`<button class="ghost-btn" data-rename-stadium>UMBENENNEN</button>`)}
      ${card(esc(t.stadium.name),`<div class="stadium-art"><div class="fence"></div><div class="lights"></div><div class="court"></div><div class="crowd"></div></div><div class="kpi-strip"><span><b>${t.stadium.capacity}</b><small>PLÄTZE</small></span><span><b>${t.stadium.level}</b><small>LEVEL</small></span><span><b>${money(t.budget)}</b><small>BUDGET</small></span></div>`)}
      ${card('Ausbau',`<div class="upgrade-list">${ups.map(([k,label,desc])=>{const lvl=t.stadium.upgrades[k]||0,cost=Math.round(9000*Math.pow(1.8,lvl));return `<div class="upgrade-row"><div><strong>${label}</strong><span>${desc} · Lvl ${lvl}</span></div><b>${money(cost)}</b><button class="small-btn gold" data-upgrade="${k}">+</button></div>`}).join('')}</div>`)}
    `;
  }

  function renderFinances(){
    const t=currentTeam(),wages=t.roster.reduce((s,p)=>s+p.salary,0),sponsor=t.sponsor?.pay||0,stad=Math.round(t.stadium.capacity*18);
    return `${pageHead('Finanzen','Budget, Cashflow und Vereinswirtschaft',`<button class="ghost-btn" data-export>EXPORT</button>`)}
      <div class="kpi-strip"><span><b>${money(t.budget)}</b><small>BUDGET</small></span><span><b>${money(sponsor)}</b><small>SPONSOR/W</small></span><span><b>${money(wages)}</b><small>GEHÄLTER</small></span></div>
      ${card('Cashflow',`<div class="finance-row"><span>Sponsor</span><b class="green-txt">+${money(sponsor)}</b></div><div class="finance-row"><span>Heimspiele</span><b class="green-txt">+${money(Math.round(t.stadium.capacity*0.75*9))}</b></div><div class="finance-row"><span>Gehälter</span><b class="red-txt">-${money(wages)}</b></div><div class="finance-row"><span>Arena</span><b class="red-txt">-${money(stad)}</b></div><div class="finance-row total"><span>Spieltag-Budget</span><b>${money(t.budget)}</b></div>`)}
      ${card('Finanzaktionen',`<div class="action-grid"><button class="action-tile" data-credit><b>50K</b><small>KREDIT</small></button><button class="action-tile" data-page="sponsors"><b>SP</b><small>SPONSOREN</small></button><button class="action-tile" data-page="stadium"><b>+</b><small>AUSBAU</small></button><button class="action-tile" data-export><b>JSON</b><small>SAVE</small></button></div>`)}
    `;
  }

  function renderStats(){
    const t=currentTeam(), all=[...t.roster].sort((a,b)=>b.goals-a.goals||b.rating-a.rating);
    return `${pageHead('Statistiken','Spieler, Form und Saisonfortschritt')}
      <div class="kpi-strip"><span><b>${t.stats.played}</b><small>SPIELE</small></span><span><b>${t.stats.gf}</b><small>TORE</small></span><span><b>${t.stats.ga}</b><small>GEGENTORE</small></span><span><b>${t.stats.xg.toFixed(1)}</b><small>xG</small></span></div>
      ${card('Spieler-Stats',`<div class="player-stats">${all.map(p=>`<div class="stat-row"><img src="${playerAvatar(p,t.teamColor,true)}"><div><strong>${esc(p.name)}</strong><span>${marketLabel(p.pos)} · ${p.rating}</span></div><b>${p.goals}</b><small>T</small><b>${p.assists}</b><small>A</small><span>${p.form}%</span></div>`).join('')}</div>`)}
    `;
  }

  function renderDraft(){
    return `${pageHead('Draft','Talente verpflichten und entwickeln')}
      <div class="stack">${[['silver','SILVER',7000,2,58,70],['gold','GOLD',14000,3,68,80],['premium','PREMIUM',26000,4,76,91]].map(x=>`<section class="card draft-card"><div class="card-title"><h2>${x[1]}</h2><span class="tag">${x[3]} TALENTE</span></div><p>${money(x[2])} · Rating ${x[4]}–${x[5]}</p><button class="gold-btn wide" data-draft="${x[0]}">DRAFT ÖFFNEN</button></section>`).join('')}</div>`;
  }

  function renderCoaches(){
    const t=currentTeam(); return `${pageHead('Coaches','Boosts für Spielplan, Form und Entwicklung')}
      <div class="stack">${state.coaches.map(c=>`<section class="card coach-card"><div class="coach-avatar">${c.name.split(' ').map(x=>x[0]).join('')}</div><div><strong>${esc(c.name)}</strong><span>${esc(c.role)} · +${c.boost}%</span><span>${money(c.price)} Vertrag</span></div><button class="small-btn ${t.coach===c.id?'':'gold'}" data-coach="${c.id}">${t.coach===c.id?'AKTIV':'VERPFL.'}</button></section>`).join('')}</div>`;
  }

  function renderSettings(){
    const t=currentTeam(); return `${pageHead('Einstellungen','Profile, Savegames und Spielstart')}
      ${card('Managerprofil',`<label class="input-label">Managername<input class="text-input" id="managerName" value="${esc(state.manager)}"></label><label class="input-label">Vereinsname<input class="text-input" id="teamName" value="${esc(t.name)}"></label><label class="input-label">Arena<input class="text-input" id="stadiumName" value="${esc(t.stadium.name)}"></label><button class="gold-btn wide" data-settings-save>SPEICHERN</button>`)}
      ${card('Spielstand',`<div class="action-grid"><button class="action-tile" data-export><b>↑</b><small>EXPORT</small></button><button class="action-tile" data-import><b>↓</b><small>IMPORT</small></button><button class="action-tile danger-tile" data-reset><b>↻</b><small>NEUES SPIEL</small></button></div>`)}
      ${card('Über das Spiel',`<p class="muted">Street Kings: Manager · Browser Edition · Katzenelnbogen · 5er Street Soccer · Touch-first UI</p>`)}
    `;
  }

  function renderMore(){
    const items=[['tactics','◈','Taktik'],['league','🏆','Liga'],['sponsors','◆','Sponsoren'],['stadium','▧','Arena'],['finances','€','Finanzen'],['stats','▥','Statistiken'],['draft','✦','Draft'],['coaches','◎','Coaches'],['settings','⚙','Einstellungen']];
    return `${pageHead('Mehr','Alle Manager-Systeme')}${card('Menü',`<div class="menu-grid">${items.map(([k,i,l])=>`<button data-page="${k}"><span>${i}</span><b>${l}</b></button>`).join('')}</div>`)}${card('Region',`<div class="region-card"><strong>Katzenelnbogen</strong><span>Aar-Einrich · Rhein-Lahn · Untertaunus</span><p>Scouting, Sponsoren und Gegner kommen aus der Region und wachsen mit deinem Verein.</p></div>`)}`;
  }

  function renderPage(){
    const map={home:renderHome,team:renderTeam,tactics:renderTactics,league:renderLeague,games:renderGames,market:renderMarket,sponsors:renderSponsors,stadium:renderStadium,finances:renderFinances,stats:renderStats,draft:renderDraft,coaches:renderCoaches,settings:renderSettings,more:renderMore};
    $('#view').innerHTML=(map[state.active]||renderHome)();
  }

  function render(){
    $('#app').innerHTML=renderShell();
    renderPage();
    if(state.firstRun && !state.liveMatch){setTimeout(showWelcome,120);state.firstRun=false;saveState();}
  }

  function openModal(title,body,opts={}){
    const root=$('#modalRoot'); if(!root)return;
    root.innerHTML=`<div class="modal-layer ${opts.full?'full':''}" id="activeModal"><div class="modal-sheet"><div class="modal-bar"><div>${opts.kicker?`<span>${esc(opts.kicker)}</span>`:''}<strong>${title}</strong></div>${opts.lock?'':`<button class="close-btn" data-close>×</button>`}</div><div class="modal-body">${body}</div>${opts.footer??''}</div></div>`;
    if(!opts.lock)$('#activeModal')?.addEventListener('click',e=>{if(e.target.id==='activeModal')closeModal();});
  }
  function closeModal(){if(state.liveMatch)return;$('#modalRoot').innerHTML='';}

  function showWelcome(){
    const t=currentTeam();
    openModal('WILLKOMMEN BEI STREET KINGS',`<div class="welcome-art"><div class="crown">♛</div><strong>MANAGE · BUILD · PLAY</strong><span>Katzenelnbogen</span></div><p class="modal-copy">Übernimm deinen eigenen 5er-Street-Soccer-Club. 4 Feldspieler + 1 Torwart. Spiele 2-Minuten-Live-Simulationen, handle Transfers, Sponsoren, Arena, Draft und Finanzen.</p><label class="input-label">Managername<input class="text-input" id="welcomeManager" value="${esc(state.manager)}"></label><label class="input-label">Vereinsname<input class="text-input" id="welcomeTeam" value="${esc(t.name)}"></label><label class="check-row"><input id="welcomeRemember" type="checkbox"> Beim nächsten Start nicht mehr anzeigen</label><button class="gold-btn wide" data-welcome>LOS GEHT'S</button>`,{lock:true,kicker:'STREET KINGS · MOBILE'});
  }

  function openPlayer(id){
    const p=currentTeam().roster.find(x=>x.id===id)||state.market.find(x=>x.id===id); if(!p)return;
    openModal(esc(p.name),`<div class="player-modal"><img src="${playerAvatar(p,p.teamColor)}"><div><span>${marketLabel(p.pos)} · ${p.age} J.</span><strong>${p.rating} OVR</strong><p>Form ${p.form}% · Marktwert ${money(p.value)}</p></div></div><div class="attrs-grid">${Object.entries({Tempo:p.skill.pace,Schuss:p.skill.shoot,Pass:p.skill.pass,Def:p.skill.def,Kontrolle:p.skill.control,Mental:p.skill.lead}).map(([k,v])=>`<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>`,{kicker:'SPIELERPROFIL'});
  }

  function addFriendly(){
    const t=currentTeam(), candidates=Object.values(state.teams).filter(x=>x.id!==t.id);
    const body=`<p class="modal-copy">Wähle einen Gegner aus der Region. Freundschaftsspiele verändern die Ligatabelle nicht, bringen aber Einnahmen und Form.</p><select class="text-input" id="friendlyOpp">${candidates.map(x=>`<option value="${x.id}">${esc(x.name)} · ${esc(x.city)}</option>`).join('')}</select><label class="check-row"><input id="friendlyHome" type="checkbox" checked> Heimspiel</label><button class="gold-btn wide" data-create-friendly>SPIEL ANSETZEN</button>`;
    openModal('SPIEL HINZUFÜGEN',body,{kicker:'FREUNDSCHAFT'});
  }

  function createFriendly(){
    const oppId=$('#friendlyOpp')?.value, home=$('#friendlyHome')?.checked; if(!oppId)return;
    const t=currentTeam(); const game={id:uid('f'),home:home?t.id:oppId,away:home?oppId:t.id,round:0,played:false,result:null,type:'Freundschaft',createdAt:Date.now()};
    state.friendlies.push(game); addNews('Freundschaftsspiel angesetzt',`${state.teams[game.home].name} vs. ${state.teams[game.away].name}`,'games'); saveState(); closeModal(); state.active='games'; render(); toast('Spiel angesetzt','Der Termin liegt im Spiele-Menü.');
  }

  function simulateButton(){
    if(state.liveMatch)return;
    const leagueGame=nextUserGame();
    if(leagueGame){startLiveMatch(leagueGame,'league');return;}
    const friendly=state.friendlies.find(g=>!g.played); if(friendly){startLiveMatch(friendly,'friendly');return;}
    finishSeason();
  }

  function finishSeason(){
    const l=currentLeague(), sorted=standings(l), idx=sorted.findIndex(x=>x.teamId===state.userTeamId); let text=`Platz ${idx+1}.`;
    if(idx<=1 && l.level>1){moveLeague(l.level,l.level-1);text+=' Aufstieg!';currentTeam().titles += idx===0?1:0;}
    else if(idx>=sorted.length-2 && l.level<3){moveLeague(l.level,l.level+1);text+=' Abstieg.';}
    state.season++;state.week=1;state.date=new Date(state.date.getTime()+35*86400000);
    Object.values(state.leagues).forEach(ll=>{Object.keys(ll.standings).forEach(id=>ll.standings[id]={teamId:id,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0});ll.schedule=roundRobin(ll.teams);});
    currentTeam().roster.forEach(p=>{if(p.age<23 && Math.random()<.65)p.rating=clamp(p.rating+1,45,97);p.form=clamp(p.form+Math.round(Math.random()*8-4),55,99);});
    addNews('Neue Saison',text,'trophy');saveState();render();toast('Saison abgeschlossen',text);
  }

  function moveLeague(from,to){
    const a=state.leagues['L'+from], b=state.leagues['L'+to]; a.teams=a.teams.filter(id=>id!==state.userTeamId); if(!b.teams.includes(state.userTeamId))b.teams[b.teams.length-1] && b.teams.push(state.userTeamId); const excess=a.teams[a.teams.length-1]; if(excess && !b.teams.includes(excess))b.teams[b.teams.length-1]=excess;
  }

  function matchStrengthSnapshot(home,away,weather){
    const h=teamStrength(home)*(weather?.mult||1)*(home.id===state.userTeamId?1.06:1); const a=teamStrength(away)*(weather?.mult||1); return {h,a};
  }

  function liveClock(ms){const s=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

  function startLiveMatch(game,type){
    const H=state.teams[game.home], A=state.teams[game.away], weather=pick(WEATHER); if(!H||!A)return;
    state.liveMatch={gameId:game.id,type,home:H.id,away:A.id,hg:0,ag:0,weather,started:Date.now(),elapsed:0,duration:120000,nextEvent:1200,events:[{t:0,text:`Anstoß! ${weather.icon} ${weather.name}`,kind:'start'}],possession:50,shotsH:0,shotsA:0};
    renderLiveMatch();
    clearInterval(window.__liveTimer); clearInterval(window.__liveEventTimer);
    window.__liveTimer=setInterval(liveTick,1000);
    window.__liveEventTimer=setTimeout(liveEventTick,1000);
  }

  function liveTick(){
    if(!state.liveMatch){clearInterval(window.__liveTimer);return;}
    state.liveMatch.elapsed=Date.now()-state.liveMatch.started;
    updateLiveDOM();
    if(state.liveMatch.elapsed>=state.liveMatch.duration)finishLiveMatch();
  }

  function liveEventTick(){
    const lm=state.liveMatch; if(!lm)return;
    const remain=lm.duration-lm.elapsed; if(remain<=0)return;
    createLiveEvent();
    const delay=2600+Math.random()*4200;
    clearTimeout(window.__liveEventTimer); window.__liveEventTimer=setTimeout(liveEventTick,delay);
  }

  function createLiveEvent(){
    const lm=state.liveMatch,H=state.teams[lm.home],A=state.teams[lm.away],s=matchStrengthSnapshot(H,A,lm.weather), diff=s.h-s.a;
    const attackHome=Math.max(0.25,0.5+diff/170+(state.tactics.risk-50)/350);
    const homeGets=Math.random()<attackHome;
    const team=homeGets?H:A, opp=homeGets?A:H;
    const r=Math.random();
    lm.possession=clamp(lm.possession+(homeGets?Math.random()*8:-Math.random()*8),25,75);
    let text='',kind='neutral';
    if(r<0.055){
      if(homeGets)lm.hg++;else lm.ag++;
      const scorers=team.roster.filter(p=>['ST','LW','RW','MF'].includes(p.pos)); const p=pick(scorers.length?scorers:team.roster);
      if(p){p.goals++;p.form=clamp(p.form+3,50,100);}
      text=`TOR! ${p?.name||'Angreifer'} trifft! ${lm.hg}:${lm.ag}`; kind='goal';
      addNews('LIVE-Tor',`${team.name}: ${p?.name||'Treffer'} · ${lm.hg}:${lm.ag}`,'ball');
    }else if(r<0.16){lm[homeGets?'shotsH':'shotsA']++;text=`Chance für ${team.name}! Schuss aufs Tor.`;kind='chance';}
    else if(r<0.24){text=`Parade! ${opp.name} hält den Druck aus.`;kind='save';}
    else if(r<0.31){text=`Gelbe Karte für ${team.name}.`;kind='card';team.roster[Math.floor(Math.random()*team.roster.length)].yellow++;}
    else if(r<0.43){text=`${team.name} mit starkem Pressing.`;kind='press';}
    else if(r<0.53){text=`Taktik greift: ${team.name} verlagert das Spiel.`;kind='tactic';}
    else{text=`${team.name}: Ballbesitzphase im letzten Drittel.`;kind='neutral';}
    lm.events.unshift({t:Math.round(lm.elapsed/1000),text,kind}); lm.events=lm.events.slice(0,16);
    updateLiveDOM();
  }

  function renderLiveMatch(){
    const lm=state.liveMatch,H=state.teams[lm.home],A=state.teams[lm.away];
    openModal('LIVE SIMULATION',`<div class="live-score"><div><img src="${crest(H)}"><strong>${esc(H.name)}</strong></div><div><span class="live-time" id="liveTime">00:00</span><b id="liveScore">${lm.hg} : ${lm.ag}</b><small>${lm.weather.icon} ${esc(lm.weather.name)}</small></div><div><img src="${crest(A)}"><strong>${esc(A.name)}</strong></div></div><div class="live-field"><div class="field-mark center"></div><div class="field-mark line"></div><div class="live-ball" id="liveBall"></div><div class="live-token home-t1"></div><div class="live-token home-t2"></div><div class="live-token home-t3"></div><div class="live-token away-t1"></div><div class="live-token away-t2"></div><div class="live-token away-t3"></div></div><div class="live-status"><div><span>Ballbesitz</span><b id="livePoss">${Math.round(lm.possession)}% · ${100-Math.round(lm.possession)}%</b></div><div><span>Schüsse</span><b id="liveShots">${lm.shotsH} · ${lm.shotsA}</b></div></div><div class="live-feed" id="liveFeed">${lm.events.map(e=>`<article class="event ${e.kind}"><small>${Math.floor(e.t/60)}:${String(e.t%60).padStart(2,'0')}</small><span>${esc(e.text)}</span></article>`).join('')}</div><div class="live-progress"><div><span>Simulation läuft…</span><b id="liveRemaining">02:00</b></div><i><em id="liveBar"></em></i></div>`,{lock:true,full:true,kicker:'VORSTAND · LIVEBEOBACHTUNG'});
    updateLiveDOM();
  }

  function updateLiveDOM(){
    const lm=state.liveMatch;if(!lm)return; const left=Math.max(0,lm.duration-lm.elapsed);
    const time=$('#liveTime'),score=$('#liveScore'),rem=$('#liveRemaining'),bar=$('#liveBar'),poss=$('#livePoss'),shots=$('#liveShots'),feed=$('#liveFeed');
    if(time)time.textContent=liveClock(lm.elapsed); if(score)score.textContent=`${lm.hg} : ${lm.ag}`; if(rem)rem.textContent=liveClock(left); if(bar)bar.style.width=`${clamp(lm.elapsed/lm.duration*100,0,100)}%`; if(poss)poss.textContent=`${Math.round(lm.possession)}% · ${100-Math.round(lm.possession)}%`; if(shots)shots.textContent=`${lm.shotsH} · ${lm.shotsA}`;
    if(feed)feed.innerHTML=lm.events.map(e=>`<article class="event ${e.kind}"><small>${Math.floor(e.t/60)}:${String(e.t%60).padStart(2,'0')}</small><span>${esc(e.text)}</span></article>`).join('');
    const ball=$('#liveBall'), tokens=$$('.live-token'); tokens.forEach((el,i)=>{const base=[['home-t1',27,65],['home-t2',40,48],['home-t3',58,45],['away-t1',73,35],['away-t2',58,55],['away-t3',42,58]][i]; if(base)el.style.transform=`translate(${Math.sin((lm.elapsed/800)+i)*8}px,${Math.cos((lm.elapsed/700)+i)*5}px)`;}); if(ball)ball.style.transform=`translate(${Math.sin(lm.elapsed/420)*55}px,${Math.cos(lm.elapsed/520)*35}px)`;
  }

  function finishLiveMatch(){
    const lm=state.liveMatch;if(!lm)return; clearInterval(window.__liveTimer);clearTimeout(window.__liveEventTimer);
    const game = findGame(lm.gameId,lm.type), H=state.teams[lm.home], A=state.teams[lm.away];
    if(!game){state.liveMatch=null;closeModal();render();return;}
    applyFinalResult(game,lm.hg,lm.ag,lm.weather,lm.type,lm.shotsH,lm.shotsA);
    state.lastMatch={...lm,finished:Date.now()};state.liveMatch=null;
    const win=H.id===state.userTeamId?lm.hg>lm.ag:lm.ag>lm.hg; const draw=lm.hg===lm.ag;
    addNews('Spiel beendet',`${H.name} ${lm.hg}:${lm.ag} ${A.name}`,'result');saveState();
    $('#modalRoot').innerHTML=''; render(); toast(draw?'Remis':win?'Sieg!':'Niederlage',`${H.name} ${lm.hg}:${lm.ag} ${A.name}`);
  }

  function findGame(id,type){
    if(type==='friendly')return state.friendlies.find(g=>g.id===id);
    for(const l of Object.values(state.leagues)){const g=l.schedule.find(x=>x.id===id);if(g)return g;} return null;
  }

  function applyFinalResult(game,hg,ag,weather,type,shotsH=0,shotsA=0){
    const H=state.teams[game.home],A=state.teams[game.away]; if(game.played)return;
    H.stats.played++;A.stats.played++;H.stats.gf+=hg;H.stats.ga+=ag;A.stats.gf+=ag;A.stats.ga+=hg;H.stats.shots+=shotsH;A.stats.shots+=shotsA;H.stats.xg+=Math.max(.2,hg*.8+shotsH*.12);A.stats.xg+=Math.max(.2,ag*.8+shotsA*.12);
    if(hg>ag){H.stats.wins++;A.stats.losses++;if(H.id===state.userTeamId)H.stats.points+=3;} else if(hg<ag){A.stats.wins++;H.stats.losses++;if(A.id===state.userTeamId)A.stats.points+=3;} else {H.stats.draws++;A.stats.draws++;}
    H.form=[...(H.form||[]).slice(-4),hg>ag?'W':hg===ag?'D':'L']; A.form=[...(A.form||[]).slice(-4),ag>hg?'W':ag===hg?'D':'L'];
    H.roster.slice(0,5).forEach(p=>p.games++);A.roster.slice(0,5).forEach(p=>p.games++);
    const homeRevenue=Math.round(H.stadium.capacity*(0.64+Math.random()*0.28)*9);H.budget+=homeRevenue+(H.sponsor?.pay||0);H.stats.homeRevenue+=homeRevenue;
    if(H.id===state.userTeamId)H.budget+=hg>ag?5000:hg===ag?1800:0;if(A.id===state.userTeamId)A.budget+=ag>hg?3500:0;
    if(type==='league'){
      const l=currentLeague(); const sh=l.standings[H.id],sa=l.standings[A.id]; if(sh&&sa){sh.played++;sa.played++;sh.gf+=hg;sh.ga+=ag;sa.gf+=ag;sa.ga+=hg;sh.gd=sh.gf-sh.ga;sa.gd=sa.gf-sa.ga;if(hg>ag){sh.wins++;sa.losses++;sh.points+=3;}else if(hg<ag){sa.wins++;sh.losses++;sa.points+=3;}else{sh.draws++;sa.draws++;sh.points++;sa.points++;}}
      game.played=true;game.result={hg,ag,weather:weather.name};
      state.week++;state.date=new Date(state.date.getTime()+7*86400000);
      // monthly wage pulse + player development
      Object.values(state.teams).forEach(t=>{t.budget=Math.max(0,t.budget-t.roster.reduce((s,p)=>s+p.salary,0)/12);});
      currentTeam().roster.forEach(p=>{if(p.age<22&&Math.random()<.58)p.rating=clamp(p.rating+1,45,97);p.form=clamp(p.form+Math.round(Math.random()*10-4),50,100);});
    }else{
      game.played=true;game.result={hg,ag,weather:weather.name};state.friendlies=state.friendlies.filter(g=>g.id!==game.id);state.week=Math.max(1,state.week);H.budget+=H.id===state.userTeamId?2500:0;A.budget+=A.id===state.userTeamId?2500:0;
    }
  }

  function buyPlayer(id){
    const t=currentTeam(),p=state.market.find(x=>x.id===id);if(!p)return;if(t.roster.length>=12){toast('Kader voll','Maximal 12 Spieler.');return;}if(t.budget<p.currentPrice){toast('Nicht genug Budget',money(p.currentPrice));return;}
    t.budget-=p.currentPrice;t.roster.push({...p,id:uid('p'),teamId:t.id,teamColor:t.teamColor,currentPrice:undefined,listingEndsAt:undefined});state.market=state.market.filter(x=>x.id!==id);addNews('Neuzugang',`${p.name} unterschreibt bei ${t.name}.`,'market');saveState();render();toast('Transfer abgeschlossen',p.name);
  }

  function bidPlayer(id){
    const p=state.market.find(x=>x.id===id);if(!p)return;p.bids=(p.bids||0)+1;p.marketHeat=clamp((p.marketHeat||0)+.18,0,1);const offered=Math.round(p.currentPrice*(0.96+Math.random()*.08));
    toast('Gebot abgegeben',`${p.name}: ${money(offered)}`); setTimeout(()=>{if(Math.random()<0.58){const t=currentTeam(); if(t.roster.length<12&&t.budget>=offered){t.budget-=offered;t.roster.push({...p,id:uid('p'),teamId:t.id,teamColor:t.teamColor});state.market=state.market.filter(x=>x.id!==id);addNews('Auktion gewonnen',`${p.name} kommt nach Katzenelnbogen.`,'market');saveState();render();toast('Auktion gewonnen',p.name);}else toast('Gebot verloren','Budget oder Kaderplatz reicht nicht.');}else toast('Auktion verloren',`${p.name} ging an einen anderen Club.`);},2200);
  }

  function upgradeStadium(k){
    const t=currentTeam(),lvl=t.stadium.upgrades[k]||0,cost=Math.round(9000*Math.pow(1.8,lvl));if(t.budget<cost){toast('Budget fehlt',`Benötigt ${money(cost)}.`);return;}t.budget-=cost;t.stadium.upgrades[k]=lvl+1;t.stadium.level=Math.max(t.stadium.level,lvl+2);if(k==='capacity')t.stadium.capacity+=40;if(k==='stands')t.stadium.capacity+=70;if(k==='lighting')t.stadium.capacity+=12;addNews('Arena verbessert',`${t.stadium.name}: ${k} auf Level ${lvl+1}.`,'stadium');saveState();render();toast('Ausbau fertig',`${k} · Level ${lvl+1}`);
  }

  function hireSponsor(id){const t=currentTeam(),s=SPONSORS.find(x=>x.id===id);if(!s)return;if(t.sponsor&&s.tier<t.sponsor.tier){toast('Vertrag nicht besser','Dieser Sponsor ist eine niedrigere Stufe.');return;}t.sponsor={...s};addNews('Sponsor an Bord',`${s.name} unterstützt ${t.name}.`,'sponsor');saveState();render();toast('Sponsor unterschrieben',s.name);}
  function hireCoach(id){const t=currentTeam(),c=state.coaches.find(x=>x.id===id);if(!c)return;if(t.coach){toast('Bereits Coach aktiv','Entlasse zuerst den aktuellen Coach.');return;}if(t.budget<c.price){toast('Budget fehlt',money(c.price));return;}t.budget-=c.price;t.coach=c.id;saveState();render();toast('Coach verpflichtet',`${c.name} +${c.boost}%`);}
  function fireCoach(){const t=currentTeam();if(!t.coach)return;const c=state.coaches.find(x=>x.id===t.coach);t.budget=Math.max(0,t.budget-Math.round(c.price*.35));t.coach=null;saveState();render();toast('Coach entlassen','Vertragsstrafe verbucht.');}
  function sellPlayer(id){const t=currentTeam(),idx=t.roster.findIndex(p=>p.id===id);if(idx<5||idx<0){toast('Starter geschützt','Verkaufe zuerst einen Bankspieler.');return;}const p=t.roster[idx],val=Math.round(p.value*.72);t.roster.splice(idx,1);t.budget+=val;saveState();render();toast('Spieler verkauft',`${p.name} · +${money(val)}`);}

  function draft(type){
    const cfg={silver:{cost:7000,n:2,min:58,max:70},gold:{cost:14000,n:3,min:68,max:80},premium:{cost:26000,n:4,min:76,max:91}}[type],t=currentTeam();if(!cfg)return;if(t.budget<cfg.cost){toast('Draft nicht möglich','Budget reicht nicht.');return;}t.budget-=cfg.cost;const p=[];for(let i=0;i<cfg.n;i++)p.push(makePlayer(500+i,t.teamColor,pick(['CB','MF','LW','RW','ST']),cfg.min+Math.random()*(cfg.max-cfg.min)));openModal(`DRAFT · ${type.toUpperCase()}`,p.map((x,i)=>`<div class="draft-pick"><img src="${playerAvatar(x,t.teamColor,true)}"><div><strong>${esc(x.name)}</strong><span>${marketLabel(x.pos)} · ${x.rating}</span></div><b>${money(x.value)}</b><button class="small-btn gold" data-draft-index="${i}">NEHMEN</button></div>`).join(''),{kicker:'YOUTH MARKET',footer:''});state._draftPlayers=p;saveState();}

  function chooseDraft(i){const t=currentTeam(),p=state._draftPlayers?.[i];if(!p)return;if(t.roster.length>=12){toast('Kader voll','Maximal 12 Spieler.');return;}t.roster.push({...p,id:uid('p'),teamId:t.id});delete state._draftPlayers;saveState();closeModal();render();toast('Talent verpflichtet',p.name);}

  function exportSave(){const blob=new Blob([JSON.stringify({...state,liveMatch:null},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='street-kings-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
  function importSave(){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=()=>{const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);localStorage.setItem(APP_KEY,JSON.stringify(d));location.reload();}catch(e){toast('Import fehlgeschlagen','JSON ist ungültig.');}};r.readAsText(f);};input.click();}

  function tickMarket(){
    const now=Date.now();
    state.market.forEach(p=>{
      const trend=(Math.random()-.49)*(p.marketHeat>.5?0.018:0.011);
      p.currentPrice=clamp(Math.round(p.currentPrice*(1+trend)),Math.round(p.value*.72),Math.round(p.value*1.22));
      if(p.listingEndsAt<now){p.listingEndsAt=now+90000+Math.random()*150000;p.currentPrice=Math.round(p.value*(0.9+Math.random()*.15));p.bids=0;}
    });
    if(state.active==='market'&&!state.liveMatch)renderPage();
  }

  function bindGlobal(){
    document.addEventListener('click',handleClick);
    document.addEventListener('input',handleInput);
    setInterval(tickMarket,5000);
  }

  function go(page){state.active=page;window.scrollTo({top:0,behavior:'smooth'});renderPage();}

  function handleInput(e){
    const r=e.target?.dataset?.range;if(r){state.tactics[r]=Number(e.target.value);const b=e.target.parentElement?.querySelector('label b');if(b)b.textContent=state.tactics[r];saveState();}
  }

  function handleClick(e){
    const el=e.target.closest('[data-page],[data-bottom],[data-simulate],[data-close],[data-welcome],[data-player],[data-sell],[data-buy],[data-bid],[data-watch],[data-tactic],[data-marketfilter],[data-market-refresh],[data-sponsor],[data-upgrade],[data-credit],[data-export],[data-import],[data-reset],[data-draft],[data-draft-index],[data-coach],[data-firecoach],[data-settings-save],[data-add-game],[data-create-friendly],[data-notify],[data-fixture],[data-rename-stadium]');
    if(!el)return;
    if(state.liveMatch)return; // Vorstand-Livefenster blockiert andere Navigation bis zum Schlusspfiff
    if(el.dataset.page)go(el.dataset.page);
    else if(el.dataset.bottom)go(el.dataset.bottom==='more'?'more':el.dataset.bottom);
    else if(el.dataset.simulate)simulateButton();
    else if(el.dataset.close)closeModal();
    else if(el.dataset.welcome){state.manager=($('#welcomeManager')?.value||'Manager').trim()||'Manager';currentTeam().name=($('#welcomeTeam')?.value||currentTeam().name).trim()||currentTeam().name;state.firstRun=false;saveState();closeModal();render();toast('Willkommen',`Los geht's, ${state.manager}.`);}
    else if(el.dataset.player)openPlayer(el.dataset.player);
    else if(el.dataset.sell)sellPlayer(el.dataset.sell);
    else if(el.dataset.buy)buyPlayer(el.dataset.buy);
    else if(el.dataset.bid)bidPlayer(el.dataset.bid);
    else if(el.dataset.watch){const p=state.market.find(x=>x.id===el.dataset.watch);if(p){p.watch=!p.watch;render();}}
    else if(el.dataset.tactic){state.tactic=el.dataset.tactic;saveState();renderPage();}
    else if(el.dataset.marketfilter){state.marketFilter=el.dataset.marketfilter;renderPage();}
    else if(el.dataset.marketRefresh){state.market=generateMarket(18);saveState();renderPage();toast('Marktplatz aktualisiert','Neue Live-Angebote sind da.');}
    else if(el.dataset.sponsor)hireSponsor(el.dataset.sponsor);
    else if(el.dataset.upgrade)upgradeStadium(el.dataset.upgrade);
    else if(el.dataset.credit){const t=currentTeam();t.budget+=50000;saveState();render();toast('Kredit aufgenommen','+50.000 € Vereinsbudget.');}
    else if(el.dataset.export)exportSave();
    else if(el.dataset.import)importSave();
    else if(el.dataset.reset&&confirm('Neuen Spielstand starten?'))resetState();
    else if(el.dataset.draft)draft(el.dataset.draft);
    else if(el.dataset.draftIndex)chooseDraft(Number(el.dataset.draftIndex));
    else if(el.dataset.coach)hireCoach(el.dataset.coach);
    else if(el.dataset.firecoach)fireCoach();
    else if(el.dataset.settingsSave){currentTeam().name=($('#teamName')?.value||currentTeam().name).trim()||currentTeam().name;currentTeam().stadium.name=($('#stadiumName')?.value||currentTeam().stadium.name).trim()||currentTeam().stadium.name;state.manager=($('#managerName')?.value||state.manager).trim()||'Manager';saveState();render();toast('Gespeichert','Profil aktualisiert.');}
    else if(el.dataset.addGame)addFriendly();
    else if(el.dataset.createFriendly)createFriendly();
    else if(el.dataset.notify){openModal('NEWS',state.news.map(n=>`<article class="news-modal"><b>${esc(n.title)}</b><span>${esc(n.body)}</span></article>`).join(''),{kicker:'REGIONALE NEWS'});}
    else if(el.dataset.fixture){const g=findGame(el.dataset.fixture,el.dataset.fixtureType==='Freundschaft'?'friendly':'league');if(g&&!g.played)startLiveMatch(g,el.dataset.fixtureType==='Freundschaft'?'friendly':'league');else toast('Spiel bereits gespielt',g?.result?`${g.result.hg}:${g.result.ag}`:'');}
    else if(el.dataset.renameStadium){openModal('ARENA UMBENENNEN',`<label class="input-label">Neuer Name<input class="text-input" id="newStadiumName" value="${esc(currentTeam().stadium.name)}"></label><button class="gold-btn wide" data-save-stadium>UMBENENNEN · 5.000 €</button>`,{kicker:'ARENA'});}
    else if(el.dataset.saveStadium){const t=currentTeam(),v=($('#newStadiumName')?.value||'').trim();if(!v)return;if(t.budget<5000){toast('Budget fehlt','Benötigt 5.000 €');return;}t.budget-=5000;t.stadium.name=v;saveState();closeModal();render();}
  }

  // Small second-level handlers for modal buttons that are rendered dynamically.
  document.addEventListener('click',e=>{const b=e.target.closest('[data-save-stadium]');if(b){const t=currentTeam(),v=($('#newStadiumName')?.value||'').trim();if(!v)return;if(t.budget<5000){toast('Budget fehlt','Benötigt 5.000 €');return;}t.budget-=5000;t.stadium.name=v;saveState();closeModal();render();}});

  initState();
  render();
  bindGlobal();
})();
