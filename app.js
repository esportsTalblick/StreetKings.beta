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

  const APP_KEY = 'streetKingsSaveV4';
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
    {id:'rheinholz',name:'RHEINHOLZ',tier:1,pay:12000,bonus:0.02,accent:'#f4d03f',asset:'assets/sponsors/sponsor-1.png'},
    {id:'nova',name:'NOVA SERVICE',tier:2,pay:16500,bonus:0.03,accent:'#22c55e',asset:'assets/sponsors/sponsor-2.png'},
    {id:'talblick',name:'TALBLICK SPORT',tier:2,pay:18500,bonus:0.035,accent:'#ef4444',asset:'assets/sponsors/sponsor-3.png'},
    {id:'ksk',name:'KREISSPARKASSE RHEIN-LAHN',tier:2,pay:21000,bonus:0.04,accent:'#d71920',asset:'assets/sponsors/sponsor-2.png'},
    {id:'autohaus',name:'AUTOHAUS BELZER',tier:3,pay:24500,bonus:0.045,accent:'#6fb7ff',asset:'assets/sponsors/sponsor-3.png'},
    {id:'regional',name:'AAR-EINRICH PARTNER',tier:3,pay:28000,bonus:0.05,accent:'#f59e0b',asset:'assets/sponsors/banner.png'}
  ];
  const TEAM_NAMES = [["Street Kings","Katzenelnbogen"],["Taunus Park FC","Hahnstätten"],["Limburg United","Limburg"],["Diezer SV","Diez"],["Nassau FC","Nassau"],["Bad Ems 1911","Bad Ems"],["FC Talblick","Aarbergen"],["Aar Tal FC","Aarbergen"],["VfR Einrich","Klingelbach"],["Blau-Weiss Allendorf","Allendorf"],["TuS Hünstätten","Hünstätten"],["SV Holzhausen","Holzhausen"],["FC Scheidt","Scheidt"],["Viktoria Berg","Berg"],["SG Lahn Blick","Lahnstein"],["FC Zollhaus","Zollhaus"],["SV Oberneisen","Oberneisen"],["RSV Heistern","Heistern"],["FC Dörsdorf","Dörsdorf"],["SV Rettert","Rettert"],["TuS Eisenbach","Eisenbach"],["SV Kördorf","Körsdorf"],["FC Netzen","Netzen"],["SG Flacht","Flacht"],["SV Niederneisen","Niederneisen"],["FC Kaldorf","Kaldorf"]];

  const state = {
    version:'4.0.0', firstRun:true, teamChosen:false, manager:'Manager', active:'home', season:1, week:1,
    date:new Date('2026-08-15T18:00:00'), userTeamId:null, teams:{}, leagues:{}, market:[], coaches:[], news:[],
    friendlies:[], marketFilter:'all', tactic:'1-2-2', tactics:{pressing:62,risk:50,tempo:58,passing:56}, notifications:2,
    trophies:0, fans:77, lastMatch:null, liveMatch:null
  };

  function playerAvatar(p, accent='#41f3a5', small=false){
    return p?.pos==='GK' ? 'assets/players/goalkeeper-yellow.png' : 'assets/players/outfield-white.png';
  }

  function crest(team){return team?.logo || 'assets/branding/crest-mini.png';}

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

  function slugify(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}

  function teamObj(name,city,quality,tier,color){
    const c=color || pick(TEAM_COLORS);
    return {id:uid('t'),name,city,quality,baseQuality:quality,teamColor:c,budget:tier===1?310000:tier===2?205000:125000,logo:'assets/clubs/'+slugify(name)+'.png',roster:makeRoster(c,quality),coach:null,coachBoost:0,
      form:['W','D','W','L','S'],stadium:{name:`${name} Street Arena`,capacity:180,level:1,upgrades:{}},sponsor:null,
      stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,homeRevenue:0,shots:0,xg:0},youth:2,titles:0};
  }

  function buildTeams(){
    return TEAM_NAMES.map((x,i)=>teamObj(x[0],x[1],i<9?74:i<18?68:62,i<9?1:i<18?2:3,i===0?'#39f2a5':null));
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

  function generateMarket(n=48){
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
      try{
        const d=JSON.parse(raw); const oldVersion=String(d.version||'0');
        Object.assign(state,d); normalizeState();
        if(oldVersion!=='4.0.0'){ state.version='4.0.0'; state.firstRun=true; state.teamChosen=false; }
        return;
      }catch(e){console.warn('Save konnte nicht geladen werden',e);}
    }
    const teams=buildTeams(); teams.forEach(t=>state.teams[t.id]=t); state.userTeamId=teams[0].id;
    state.leagues.L1=makeLeague(teams.slice(0,9),'Kreisliga A',1);
    state.leagues.L2=makeLeague(teams.slice(9,18),'Kreisliga B',2);
    state.leagues.L3=makeLeague(teams.slice(18,26),'Kreisliga C',3);
    const t=currentTeam(); t.sponsor={...SPONSORS[0]}; t.stadium.capacity=220;
    state.market=generateMarket(48); state.coaches=generateCoaches();
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
    const leagueSizes=Object.values(state.leagues||{}).map(l=>Array.isArray(l.teams)?l.teams.length:0).sort((a,b)=>a-b);
    const validStructure=Object.keys(state.teams||{}).length===26 && leagueSizes.join(',')==='8,9,9';
    if(!validStructure){
      const oldManager=state.manager||'Manager';
      const oldBudget=Number(state.teams?.[state.userTeamId]?.budget||46357);
      state.teams={};state.leagues={};
      const teams=buildTeams(); teams.forEach(t=>state.teams[t.id]=t); state.userTeamId=teams[0].id;
      state.leagues.L1=makeLeague(teams.slice(0,9),'Kreisliga A',1);
      state.leagues.L2=makeLeague(teams.slice(9,18),'Kreisliga B',2);
      state.leagues.L3=makeLeague(teams.slice(18,26),'Kreisliga C',3);
      state.manager=oldManager;
      state.market=generateMarket(48); state.coaches=generateCoaches();
      state.news=[
        {title:'26 Clubs · 3 Ligen',body:'Die neue Street-Kings-Landschaft rund um Katzenelnbogen ist online.',kind:'city'},
        {title:'Live-Simulation verbessert',body:'5 gegen 5, Ballbewegung, Spieleranimation und Spielereignisse laufen jetzt sichtbar.',kind:'result'},
        {title:'Marktplatz geöffnet',body:'Neue Talente aus Aar-Einrich und Rhein-Lahn warten auf Angebote.',kind:'market'}
      ];
      state.friendlies=[];
      state.season=1;state.week=1;state.date=new Date('2026-08-15T18:00:00');state.lastMatch=null;state.liveMatch=null;
      state.version='4.0.0';
      state.teamChosen=false; state.firstRun=true;
      const ut=currentTeam();ut.budget=Math.max(46357,oldBudget);ut.sponsor={...SPONSORS[0]};ut.stadium.capacity=220;
      state.firstRun=false;saveState();
      return;
    }
    Object.values(state.teams||{}).forEach(t=>{t.logo=t.logo||('assets/clubs/'+slugify(t.name)+'.png');});
    if(state.teams && !state.teams[state.userTeamId]) state.userTeamId=Object.keys(state.teams)[0];
    state.market=Array.isArray(state.market)?state.market:generateMarket(48); if(state.market.length<30) state.market=generateMarket(48); state.coaches=Array.isArray(state.coaches)?state.coaches:generateCoaches(); state.teamChosen = !!state.teamChosen; state.fans = state.fans || 77; state.news=Array.isArray(state.news)?state.news:[]; state.friendlies=Array.isArray(state.friendlies)?state.friendlies:[];
    state.date=new Date(state.date||Date.now());
    Object.values(state.teams||{}).forEach(t=>{
      t.roster ||= makeRoster(t.teamColor||'#39f2a5',t.quality||65); t.stats ||= {played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,homeRevenue:0,shots:0,xg:0}; t.form ||= ['W','D','W','L','S'];
      t.stadium ||= {name:`${t.name} Street Arena`,capacity:180,level:1,upgrades:{}}; t.stadium.upgrades ||= {}; t.youth ||= 1; t.budget ||= 120000; t.logo ||= `assets/clubs/${slugify(t.name)}.svg`;
    });
    Object.values(state.leagues||{}).forEach(l=>{l.standings ||= {};l.schedule ||= [];});
    state.liveMatch=null; state.version='4.0.0';
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

  const EMOJI = {
    home:'🏠', team:'👥', tactics:'🎯', games:'⚽', league:'🏆', transfers:'↔️',
    market:'💰', city:'🏙️', news:'📰', sponsors:'💼', stadium:'🏟️', finances:'💶',
    stats:'📊', draft:'🌱', coaches:'🧑‍💼', settings:'⚙️', youth:'🧒', scouting:'🔎',
    club:'🏰', save:'💾', back:'◀️', next:'▶️', menu:'☰', trophy:'🏆'
  };
  const emoji = key => `<span class="emoji-icon" aria-hidden="true">${EMOJI[key]||'•'}</span>`;

  function renderShell(){
    const t=currentTeam(), l=currentLeague();
    const bottom=[['home','home','Home'],['team','team','Verein'],['games','games','Spielen'],['market','market','Markt'],['more','menu','Menü']];
    return `<div class="mobile-app">
      <header class="mobile-topbar">
        <button class="brand-lockup" data-page="home" aria-label="Home">
          <img src="assets/branding/logo-shield.png" alt="Street Kings">
          <span><strong>STREET KINGS</strong><em>MANAGER</em></span>
        </button>
        <div class="top-head-right">
          <div class="club-mini"><img src="${crest(t)}" alt=""><span><b>${esc(t.name)}</b><small>${esc(t.city)}</small></span></div>
          <div class="money-mini"><small>S${state.season} · W${state.week}</small><b>${money(t.budget)}</b></div>
          <button class="round-icon" data-notify aria-label="Benachrichtigungen">●</button>
        </div>
      </header>
      <main id="view" class="view"></main>
      <nav class="bottom-nav">${bottom.map(([k,ico,label])=>`<button data-bottom="${k}" class="${state.active===k?'active':''}"><span>${emoji(ico)}</span><small>${label}</small></button>`).join('')}</nav>
      <div id="modalRoot"></div>
      <div id="toast" class="toast"><strong id="toastTitle"></strong><span id="toastBody"></span></div>
    </div>`;
  }

  function pageHead(title,sub,action=''){return `<div class="page-head"><div><div class="eyebrow">STREET KINGS · ${esc(currentTeam().city).toUpperCase()}</div><h1>${title}</h1><p>${sub}</p></div>${action?`<div class="page-action">${action}</div>`:''}</div>`;}
  function card(title,body,cls=''){return `<section class="card ${cls}"><div class="card-title"><h2>${title}</h2></div>${body}</section>`;}

  function renderHome(){
    const t=currentTeam(),l=currentLeague(),ng=nextUserGame(); const opp=ng?state.teams[ng.home===t.id?ng.away:ng.home]:null;
    const stand=standings(l), liveListings=state.market.slice().sort((a,b)=>b.currentPrice-a.currentPrice).slice(0,4);
    const quick=[['team','team','Verein'],['tactics','tactics','Team'],['games','games','Spielen'],['league','league','Liga'],['transfers','transfers','Transfers'],['market','market','Marktplatz'],['city','city','Stadt'],['news','news','News']];
    return `<section class="home-screen">
      <div class="home-meta"><div><span>SAISON ${state.season}</span><b>· WOCHE ${state.week}</b></div><div><strong>${money(t.budget)}</strong><span> · 😎 ${Math.round(teamStrength(t))}</span></div></div>
      <section class="home-hero exact-sheet-hero">
        <div class="hero-overlay"></div>
        <img class="home-logo-sheet" src="assets/branding/logo-main.png" alt="STREET KINGS MANAGER">
        <div class="hero-words"><span>KATZENELNBOGEN · AAR-EINRICH</span></div>
        <div class="hero-tag">SMALL TOWN<br>BIG DREAMS</div>
      </section>
      <div class="next-match-banner">
        <div><small>NÄCHSTES SPIEL</small><b>${ng&&opp?`VS ${esc(opp.name)}`:'SAISONABSCHLUSS'}</b><span>${ng?'Kreisliga · 18:00 · Bolzplatz Katzenelnbogen':'Neue Saison vorbereiten'}</span></div>
        <button class="gold-btn" data-simulate="1">${ng?'LIVE':'START'}</button>
      </div>
      <div class="quick-grid">${quick.map(([p,i,lbl])=>`<button data-page="${p}"><span>${emoji(i)}</span><b>${lbl}</b></button>`).join('')}</div>
      ${renderSponsorHome(t)}
      ${renderLineupCard()}
      <div class="design-split"><div>${card('TABELLE · '+esc(l.name),`<div class="table-list compact">${stand.slice(0,5).map((s,i)=>{const tt=state.teams[s.teamId];return `<div class="table-row ${tt.id===t.id?'me':''}"><b>${i+1}</b><img src="${crest(tt)}"><span>${esc(tt.name)}</span><small>${s.points} P</small></div>`}).join('')}</div><button class="ghost-btn wide" data-page="league">MEHR</button>`)}</div><div>${card('LIVE-MARKT',`<div class="market-mini-list">${liveListings.map(p=>`<button class="market-mini" data-player="${p.id}"><img src="${playerAvatar(p,p.teamColor,true)}"><span><b>${esc(p.name.split(' ')[0])}</b><small>${marketLabel(p.pos)} · ${p.rating}</small></span><strong>${money(p.currentPrice)}</strong></button>`).join('')}</div><button class="ghost-btn wide" data-page="market">MARKTPLATZ ÖFFNEN</button>`)}</div></div>
      ${card('NEWS AUS DER REGION',`<div class="news-stack">${state.news.slice(0,3).map(n=>`<article><div class="news-thumb ${n.kind}">${n.kind==='market'?'↔':n.kind==='stadium'?'▤':'✦'}</div><div><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p></div></article>`).join('')}</div>`)}
    </section>`;
  }

  function renderSponsorHome(t){
    const s=t.sponsor||SPONSORS[0];
    return `<section class="card sponsor-home-card"><div class="sponsor-home-top"><div><div class="section-kicker">HAUPTSPONSOR</div><h2>${esc(s.name)}</h2><p>${money(s.pay)} / Woche · Bonus +${Math.round(s.bonus*100)}%</p></div><img src="${s.asset}" alt="${esc(s.name)}"></div><button class="ghost-btn wide" data-page="sponsors">SPONSOR-MENÜ ÖFFNEN</button></section>`;
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
      ${card('Trikots',`<div class="kit-showcase"><div><img src="assets/kits/home.png"><small>HOME</small></div><div><img src="assets/kits/away.png"><small>AWAY</small></div><div><img src="assets/kits/third.png"><small>THIRD</small></div><div><img src="assets/kits/goalkeeper.png"><small>KEEPER</small></div></div><div class="kit-sponsor-line"><span>HAUPTSPONSOR</span><b>${esc((t.sponsor||SPONSORS[0]).name)}</b><img src="${(t.sponsor||SPONSORS[0]).asset}" alt=""></div>`)}
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

  function sponsorAsset(id){const s=SPONSORS.find(x=>x.id===id);return s?.asset||'assets/sponsors/banner.png';}

  function renderTransfers(){
    const t=currentTeam();
    const outgoing=t.roster.filter((p,i)=>i>=5).slice(0,6);
    return `${pageHead('Transfers','Kaderbewegungen · Verkauf · Einkauf',`<button class="gold-btn" data-page="market">MARKTPLATZ</button>`)}
      ${card('Dein Kader',`<div class="transfer-summary"><span><b>${t.roster.length}/12</b><small>KADER</small></span><span><b>${money(t.budget)}</b><small>BUDGET</small></span><span><b>${state.market.length}</b><small>ANGEBOTE</small></span></div>`)}
      ${card('Verkaufen',`<div class="player-list">${outgoing.map(p=>`<article class="player-row"><button class="player-main" data-player="${p.id}"><img src="${playerAvatar(p,t.teamColor,true)}"><div><strong>${esc(p.name)}</strong><span>${marketLabel(p.pos)} · ${p.rating} OVR</span></div></button><b>${money(p.value)}</b><button class="small-btn danger" data-sell="${p.id}">VERK.</button></article>`).join('')||'<div class="empty">Keine Bankspieler verfügbar.</div>'}</div>`)}
      ${card('Schnellzugriff',`<div class="action-grid"><button class="action-tile" data-page="market"><b>48+</b><small>MARKT</small></button><button class="action-tile" data-page="team"><b>12</b><small>KADER</small></button><button class="action-tile" data-page="sponsors"><b>€</b><small>SPONSOR</small></button></div>`)}
    `;
  }

  function renderSponsors(){
    const t=currentTeam(); return `${pageHead('Sponsoren','Partner aus Katzenelnbogen und Umgebung')}
      <div class="sponsor-current">${t.sponsor?`<div><span>HAUPTSPONSOR</span><strong>${esc(t.sponsor.name)}</strong><small>${money(t.sponsor.pay)} / Woche · +${Math.round(t.sponsor.bonus*100)}% Bonus</small></div><img class="sponsor-logo" src="${sponsorAsset(t.sponsor.id)}" alt=""><div class="sponsor-badge" style="--a:${t.sponsor.accent}">${esc(t.sponsor.name.split(' ')[0])}</div>`:'<div><strong>Kein Hauptsponsor</strong></div>'}</div>
      <div class="stack">${SPONSORS.map(s=>`<section class="card sponsor-card"><img class="sponsor-logo" src="${sponsorAsset(s.id)}" alt=""><div class="sponsor-badge" style="--a:${s.accent}">${esc(s.name.split(' ')[0])}</div><div><strong>${esc(s.name)}</strong><span>Stufe ${s.tier} · ${money(s.pay)} / Woche</span><span>Bonus +${Math.round(s.bonus*100)}%</span></div><button class="small-btn ${t.sponsor?.id===s.id?'':'gold'}" data-sponsor="${s.id}">${t.sponsor?.id===s.id?'AKTIV':'VERTRAG'}</button></section>`).join('')}</div>`;
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

  function renderCity(){
    const t=currentTeam();
    return `${pageHead('Stadt','Katzenelnbogen · Aar-Einrich',`<span class="rank-pill">REGION</span>`)}
      ${card('Katzenelnbogen',`<div class="city-scene"><img src="assets/city/city-bg.png" alt="Katzenelnbogen"><div class="city-sign">KATZENELNBOGEN</div></div><div class="region-stats"><span><b>3</b><small>LIGEN</small></span><span><b>25</b><small>TEAMS</small></span><span><b>${state.fans||77}</b><small>FANS</small></span></div>`)}
      ${card('Regionale Ziele',`<div class="region-list"><button data-page="league"><span class="emoji-mini">${emoji("league")}</span><span><b>Kreisliga A–C</b><small>26 Clubs · 3 Ligen</small></span><i>›</i></button><button data-page="market"><span class="emoji-mini">${emoji("market")}</span><span><b>Marktplatz</b><small>48+ Spieler · Auktionen</small></span><i>›</i></button><button data-page="sponsors"><span class="emoji-mini">${emoji("sponsors")}</span><span><b>Sponsoren</b><small>Partner aus Aar-Einrich</small></span><i>›</i></button></div>`)}
    `;
  }

  function renderNews(){
    return `${pageHead('News','Vereins- und Regionalmeldungen',`<span class="rank-pill">LIVE</span>`)}
      ${card('Aktuell',`<div class="news-full">${state.news.map(n=>`<article><div class="news-thumb ${n.kind}">${n.kind==='market'?'↔':n.kind==='stadium'?'▤':n.kind==='result'?'⚽':'✦'}</div><div><strong>${esc(n.title)}</strong><p>${esc(n.body)}</p><small>${dateDE(new Date())} · ${timeDE(new Date())}</small></div></article>`).join('')}</div>`)}
    `;
  }

  function renderMore(){
    const items=[['transfers','transfers','Transfers'],['tactics','tactics','Taktik'],['league','league','Liga'],['sponsors','sponsors','Sponsoren'],['stadium','stadium','Arena'],['finances','finances','Finanzen'],['stats','stats','Statistiken'],['draft','draft','Draft'],['coaches','coaches','Coaches'],['city','city','Stadt'],['news','news','News'],['settings','settings','Einstellungen']];
    return `${pageHead('Mehr','Alle Manager-Systeme')}${card('Menü',`<div class="menu-grid">${items.map(([k,i,l])=>`<button data-page="${k}"><span>${emoji(i)}</span><b>${l}</b></button>`).join('')}</div>`)}${card('Region',`<div class="region-card"><strong>Katzenelnbogen</strong><span>Aar-Einrich · Rhein-Lahn · Untertaunus</span><p>Scouting, Sponsoren und Gegner kommen aus der Region und wachsen mit deinem Verein.</p></div>`)}`;
  }

  function renderPage(){
    const map={home:renderHome,team:renderTeam,tactics:renderTactics,league:renderLeague,games:renderGames,market:renderMarket,transfers:renderTransfers,sponsors:renderSponsors,stadium:renderStadium,finances:renderFinances,stats:renderStats,draft:renderDraft,coaches:renderCoaches,settings:renderSettings,more:renderMore,city:renderCity,news:renderNews};
    $('#view').innerHTML=(map[state.active]||renderHome)();
  }

  function render(){
    $('#app').innerHTML=renderShell();
    renderPage();
    if(state.firstRun && !state.liveMatch){setTimeout(showWelcome,120);}
  }

  function openModal(title,body,opts={}){
    const root=$('#modalRoot'); if(!root)return;
    root.innerHTML=`<div class="modal-layer ${opts.full?'full':''}" id="activeModal"><div class="modal-sheet"><div class="modal-bar"><div>${opts.kicker?`<span>${esc(opts.kicker)}</span>`:''}<strong>${title}</strong></div>${opts.lock?'':`<button class="close-btn" data-close>×</button>`}</div><div class="modal-body">${body}</div>${opts.footer??''}</div></div>`;
    if(!opts.lock)$('#activeModal')?.addEventListener('click',e=>{if(e.target.id==='activeModal')closeModal();});
  }
  function closeModal(){if(state.liveMatch)return;$('#modalRoot').innerHTML='';}

  function showWelcome(){
    const leagueData=[['L1','LIGA 1 · KREISLIGA A'],['L2','LIGA 2 · KREISLIGA B'],['L3','LIGA 3 · KREISLIGA C']];
    const tabs=leagueData.map(([id,label],i)=>`<div class="team-select-group"><h3>${label}</h3><div class="team-select-grid">${state.leagues[id].teams.map(tid=>{const t=state.teams[tid];return `<button class="team-select-card ${state.userTeamId===tid?'selected':''}" data-select-team="${tid}"><img src="${crest(t)}" alt=""><strong>${esc(t.name)}</strong><small>${esc(t.city)}</small></button>`}).join('')}</div></div>`).join('');
    openModal('DEIN CLUB · WÄHLE DEIN TEAM',`<div class="welcome-art"><img src="assets/branding/logo-main.png" alt="STREET KINGS MANAGER"><strong>KATZENELNBOGEN · AAR-EINRICH</strong><span>26 CLUBS · 3 LIGEN</span></div><p class="modal-copy">Bevor du startest, wählst du den Verein, den du als Manager übernimmst. Du bekommst dessen Kader, Farben, Stadion und Startbudget.</p><label class="input-label">Managername<input class="text-input" id="welcomeManager" value="${esc(state.manager)}"></label><div class="team-select-scroll">${tabs}</div>`,{lock:true,kicker:'START · CLUB WÄHLEN',full:false});
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

  function createLiveSim(H,A){
    const homeBases=[[8,50],[28,30],[28,70],[48,35],[53,50]], awayBases=[[92,50],[72,70],[72,30],[52,65],[47,50]];
    const makeSide=(team,side,bases)=>team.roster.slice(0,5).map((p,i)=>({id:p.id,name:p.name,pos:p.pos,rating:p.rating,side,index:i,x:bases[i][0],y:bases[i][1],bx:bases[i][0],by:bases[i][1]}));
    return {players:{home:makeSide(H,'home',homeBases),away:makeSide(A,'away',awayBases)},ball:{x:53,y:50,side:'home',index:4,mode:'hold',sx:53,sy:50,tx:53,ty:50,start:0,duration:0},nextDecisionAt:performance.now()+900,lastCommentAt:0,action:null,phase:'kickoff'};
  }

  const HALF_MS=60000, HALF_BREAK_MS=4000, TOTAL_MATCH_MS=HALF_MS*2+HALF_BREAK_MS;

  function startLiveMatch(game,type){
    const H=state.teams[game.home], A=state.teams[game.away], weather=pick(WEATHER); if(!H||!A)return;
    state.liveMatch={
      gameId:game.id,type,home:H.id,away:A.id,hg:0,ag:0,weather,
      started:performance.now(),elapsed:0,matchClock:0,phase:'first',
      duration:TOTAL_MATCH_MS,halfShown:false,secondHalf:false,
      events:[{t:0,text:`ANPFIFF · ${weather.icon} ${weather.name}` ,kind:'start'}],
      possession:50,shotsH:0,shotsA:0,cornersH:0,cornersA:0,fouls:0,
      savesH:0,savesA:0,yellowH:0,yellowA:0,
      sim:createLiveSim(H,A)
    };
    renderLiveMatch();
    cancelAnimationFrame(window.__liveRAF);
    window.__liveRAF=requestAnimationFrame(runLiveFrame);
  }

  function runLiveFrame(now){
    const lm=state.liveMatch;if(!lm)return;
    lm.elapsed=now-lm.started;
    if(lm.elapsed>=lm.duration){lm.elapsed=lm.duration;lm.matchClock=120000;updateLiveDOM(now);finishLiveMatch();return;}
    if(lm.elapsed<HALF_MS){
      lm.matchClock=lm.elapsed;lm.phase='first';
    }else if(lm.elapsed<HALF_MS+HALF_BREAK_MS){
      lm.matchClock=HALF_MS;lm.phase='halftime';
      if(!lm.halfShown){
        lm.halfShown=true;
        addLiveEvent(`HALBZEIT · ${lm.hg}:${lm.ag} · ${Math.round(lm.possession)}% Ballbesitz`, 'halftime');
        showHalftimeOverlay();
      }
      updateLiveDOM(now);
      window.__liveRAF=requestAnimationFrame(runLiveFrame);
      return;
    }else{
      if(!lm.secondHalf){lm.secondHalf=true;lm.phase='second';hideHalftimeOverlay();addLiveEvent('ANPFIFF 2. HALBZEIT · Weiter geht’s!','start');}
      lm.matchClock=HALF_MS+(lm.elapsed-(HALF_MS+HALF_BREAK_MS));lm.phase='second';
    }
    updateLiveSimulation(now);
    updateLiveDOM(now);
    window.__liveRAF=requestAnimationFrame(runLiveFrame);
  }

  function findSimPlayer(lm,side,index){return lm.sim.players[side]?.[index]||null}
  function currentHolder(lm){return findSimPlayer(lm,lm.sim.ball.side,lm.sim.ball.index)}
  function otherSide(side){return side==='home'?'away':'home'}
  function attackDir(side){return side==='home'?1:-1}
  function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function nearestOpponent(lm,p){
    const opp=lm.sim.players[otherSide(p.side)]||[];
    return opp.reduce((best,x)=>!best||distance(p,x)<distance(p,best)?x:best,null);
  }
  function addLiveEvent(text,kind='neutral'){
    const lm=state.liveMatch;if(!lm)return;
    lm.events.unshift({t:Math.floor(lm.matchClock/1000),text,kind});
    lm.events=lm.events.slice(0,12);
    updateLiveFeedOnly();
    const label=$('#liveActionLabel');if(label){label.textContent=kind==='goal'?'TOR!':kind.toUpperCase();}
  }
  function currentGoalX(side){return side==='home'?100:0}

  function setupBallTravel(lm,toSide,toIndex,duration,mode,tx=null,ty=null){
    const b=lm.sim.ball, holder=currentHolder(lm);
    b.mode=mode;b.sx=b.x;b.sy=b.y;
    const target=findSimPlayer(lm,toSide,toIndex);
    b.tx=tx??target?.x??b.x;b.ty=ty??target?.y??b.y;
    b.start=performance.now();b.duration=duration;b.side=toSide;b.index=toIndex;b.arc=(mode==='shot'||mode==='cross'||mode==='corner')?.35:.08;
    if(holder){holder.bx=holder.x;holder.by=holder.y;}
  }

  function choosePassTarget(lm,holder){
    const mates=(lm.sim.players[holder.side]||[]).filter(p=>p.index!==holder.index);
    if(!mates.length)return null;
    const dir=attackDir(holder.side);
    mates.sort((a,b)=>{
      const scoreA=dir*(a.x-holder.x)*1.5-distance(a,holder)*.25;
      const scoreB=dir*(b.x-holder.x)*1.5-distance(b,holder)*.25;
      return scoreB-scoreA;
    });
    return pick(mates.slice(0,Math.min(4,mates.length)))||mates[0];
  }

  function chooseSetPiece(lm,holder,now,type){
    const side=holder.side, dir=attackDir(side);
    const nearGoal=(dir>0&&holder.x>88)||(dir<0&&holder.x<12);
    if(type==='corner'){
      const x=dir>0?97:3, y=Math.random()<.5?8:92;
      lm.sim.action={type:'corner',side,index:holder.index,startX:x,startY:y,tx:dir>0?83:17,ty:50,start:now,duration:1100};
      lm.sim.ball.x=x;lm.sim.ball.y=y;lm.sim.ball.sx=x;lm.sim.ball.sy=y;lm.sim.ball.mode='corner';lm.sim.ball.tx=dir>0?78:22;lm.sim.ball.ty=50;lm.sim.ball.start=now;lm.sim.ball.duration=1100;lm.sim.ball.arc=.7;
      lm[side==='home'?'cornersH':'cornersA']++;
      addLiveEvent(`ECKBALL! ${side==='home'?'Katzenelnbogen':'Taunus Park'} bringt den Ball in den Strafraum.`,'corner');
      return;
    }
    if(type==='throw'){
      const x=dir>0?Math.random()*90+4:Math.random()*90+6; const y=Math.random()<.5?3:97;
      const target=choosePassTarget(lm,holder)||holder;
      lm.sim.action={type:'throw',side,index:target.index,startX:x,startY:y,tx:target.x,ty:target.y,start:now,duration:800};
      lm.sim.ball.x=x;lm.sim.ball.y=y;lm.sim.ball.sx=x;lm.sim.ball.sy=y;lm.sim.ball.mode='throw';lm.sim.ball.tx=target.x;lm.sim.ball.ty=target.y;lm.sim.ball.start=now;lm.sim.ball.duration=800;lm.sim.ball.arc=.45;
      addLiveEvent(`EINWURF · ${target.name.split(' ')[0]} bekommt den Ball.`,'throw');
      return;
    }
    const tx=dir>0?78:22,ty=clamp(50+(Math.random()-.5)*25,25,75);
    lm.sim.action={type:'free',side,index:holder.index,startX:holder.x,startY:holder.y,tx,ty,start:now,duration:950};
    lm.sim.ball.mode='free';lm.sim.ball.sx=holder.x;lm.sim.ball.sy=holder.y;lm.sim.ball.tx=tx;lm.sim.ball.ty=ty;lm.sim.ball.start=now;lm.sim.ball.duration=950;lm.sim.ball.arc=.45;
    addLiveEvent(`FREISTOSS · ${holder.name.split(' ')[0]} bringt ihn scharf rein.`,'free');
  }

  function chooseLiveAction(now){
    const lm=state.liveMatch,sim=lm.sim,b=sim.ball,holder=currentHolder(lm);if(!holder)return;
    const goalX=currentGoalX(holder.side),goalDist=Math.abs(goalX-b.x),opp=nearestOpponent(lm,holder);
    const underPressure=opp&&distance(holder,opp)<11;
    const nearSideline=b.y<7||b.y>93, nearGoal=(holder.side==='home'?b.x>88:b.x<12);
    const r=Math.random();

    if(r<0.035){chooseSetPiece(lm,holder,now,'throw');return}
    if((nearGoal||goalDist<20)&&r<0.16){chooseSetPiece(lm,holder,now,'corner');return}
    if(r>=0.16&&r<0.21){chooseSetPiece(lm,holder,now,'free');return}
    if(nearSideline&&r<0.33){chooseSetPiece(lm,holder,now,'throw');return}

    if(goalDist<30 && r<0.58){
      const tx=goalX===100?99:1, ty=clamp(50+(Math.random()-.5)*35,18,82);
      sim.action={type:'shot',side:holder.side,index:holder.index,startX:b.x,startY:b.y,tx,ty,start:now,duration:650+Math.random()*300};
      b.mode='shot';b.sx=b.x;b.sy=b.y;b.tx=tx;b.ty=ty;b.start=now;b.duration=sim.action.duration;b.arc=.62;
      lm[holder.side==='home'?'shotsH':'shotsA']++;
      addLiveEvent(`SCHUSS! ${holder.name.split(' ')[0]} zieht ab.`,'shot');return;
    }

    if(underPressure&&r<0.30){
      const side=otherSide(holder.side), defenders=lm.sim.players[side]||[];
      const target=defenders.reduce((best,p)=>!best||distance(p,holder)<distance(best,holder)?p:best,null);
      if(target){
        sim.action={type:'tackle',side,index:target.index,startX:b.x,startY:b.y,tx:target.x,ty:target.y,start:now,duration:430};
        setupBallTravel(lm,side,target.index,430,'tackle',target.x,target.y);
        addLiveEvent(`ZWEIKAMPF! ${target.name.split(' ')[0]} geht dazwischen.`,'tackle');return;
      }
    }

    if(nearGoal&&r<0.76){
      const tx=goalX===100?90:10,ty=clamp(50+(Math.random()-.5)*40,18,82);
      const target=choosePassTarget(lm,holder)||holder;
      sim.action={type:'cross',side:holder.side,index:holder.index,startX:b.x,startY:b.y,tx:target.x,ty:ty,start:now,duration:900};
      b.mode='cross';b.sx=b.x;b.sy=b.y;b.tx=tx;b.ty=ty;b.start=now;b.duration=900;b.arc=.9;
      addLiveEvent(`${holder.name.split(' ')[0]} schlägt die Flanke in den Strafraum.`,'cross');return;
    }

    if(r<0.74){
      const target=choosePassTarget(lm,holder);
      if(target&&target!==holder){
        const d=distance(holder,target);
        // Receiver moves into passing lane.
        target.x=clamp(target.x+attackDir(holder.side)*(3+Math.random()*6),6,94);
        sim.action={type:'pass',side:target.side,index:target.index,startX:b.x,startY:b.y,tx:target.x,ty:target.y,start:now,duration:420+d*8};
        setupBallTravel(lm,target.side,target.index,sim.action.duration,'pass',target.x,target.y);
        addLiveEvent(`${holder.name.split(' ')[0]} spielt den Pass auf ${target.name.split(' ')[0]}.`,'pass');return;
      }
    }

    // Carry/dribble
    const step=(5+Math.random()*10)*attackDir(holder.side);
    holder.x=clamp(holder.x+step,6,94);
    holder.y=clamp(holder.y+(Math.random()-.5)*16,10,90);
    sim.action={type:'dribble',side:holder.side,index:holder.index,startX:b.x,startY:b.y,tx:holder.x,ty:holder.y,start:now,duration:620+Math.random()*400};
    b.mode='dribble';b.sx=b.x;b.sy=b.y;b.tx=holder.x;b.ty=holder.y;b.start=now;b.duration=sim.action.duration;b.arc=.02;
    addLiveEvent(`${holder.name.split(' ')[0]} nimmt Tempo auf und dribbelt.`,'dribble');
  }

  function updateLiveSimulation(now){
    const lm=state.liveMatch,sim=lm.sim,b=sim.ball;
    for(const side of ['home','away']){
      const players=sim.players[side]||[];
      players.forEach((p,i)=>{
        const formation=side==='home'?[[8,50],[27,30],[27,70],[46,34],[50,55]][i]:[[92,50],[73,70],[73,30],[54,66],[50,45]][i];
        const dx=clamp((b.x-50)*0.18,-10,10)*attackDir(side);
        const dy=clamp((b.y-50)*0.22,-13,13);
        let targetX=formation[0]+dx,targetY=formation[1]+dy;
        const holder=(side===b.side&&i===b.index&&b.mode==='hold');
        if(!holder){
          // Active players chase, others keep shape.
          if(distance(p,b)<18 || (sim.action&&sim.action.side===side&&sim.action.index===i)){targetX=b.x+(Math.random()-.5)*2;targetY=b.y+(Math.random()-.5)*2;}
          p.x+= (targetX-p.x)*0.085; p.y+=(targetY-p.y)*0.085;
        }
        p.x=clamp(p.x,4,96);p.y=clamp(p.y,6,94);
      });
    }

    if(sim.action){
      const a=sim.action,prog=clamp((now-a.start)/a.duration,0,1);
      const e=prog<.5?2*prog*prog:1-Math.pow(-2*prog+2,2)/2;
      b.x=a.startX+(a.tx-a.startX)*e;b.y=a.startY+(a.ty-a.startY)*e;
      b.z=Math.sin(Math.PI*e)*(b.arc||0);
      const actor=findSimPlayer(lm,a.side,a.index);
      if(actor&&(a.type==='dribble'||a.type==='tackle')){actor.x=b.x;actor.y=b.y;}
      if(prog>=1)resolveLiveAction(now,a);
    }else{
      const holder=currentHolder(lm);
      if(holder&&b.mode==='hold'){b.x=holder.x+attackDir(holder.side)*1.2;b.y=holder.y-4;b.z=0;}
      if(now>=sim.nextDecisionAt)chooseLiveAction(now);
    }

    // Add occasional tactical incidents, independent of current action.
    if(!sim.nextIncidentAt)sim.nextIncidentAt=now+4000+Math.random()*6000;
    if(now>sim.nextIncidentAt&&!sim.action){
      const holder=currentHolder(lm);
      if(holder&&Math.random()<0.45)addLiveEvent(`TRIBÜNENRAUSCHEN · ${holder.side==='home'?'Heimfans':'Gästeblock'} werden laut.`,'crowd');
      sim.nextIncidentAt=now+5000+Math.random()*9000;
    }
    lm.possession=clamp(lm.possession+(b.side==='home'?0.09:-0.09),28,72);
  }

  function resolveLiveAction(now,a){
    const lm=state.liveMatch,sim=lm.sim,b=sim.ball;
    if(!sim.action)return;
    const keeperH=sim.players.home?.[0], keeperA=sim.players.away?.[0];
    if(a.type==='shot'){
      const keeper=otherSide(a.side)==='home'?keeperH:keeperA;
      const shooter=findSimPlayer(lm,a.side,a.index);
      const power=shooter?.rating||68;
      const distToGoal=Math.abs(currentGoalX(a.side)-b.x);
      const onTarget=0.48+clamp((power-60)/220,-.12,.14)-distToGoal/260;
      const roll=Math.random();
      if(roll<onTarget){
        const saveRoll=Math.random();
        if(saveRoll<0.30){
          if(a.side==='home')lm.savesA++;else lm.savesH++;
          if(keeper){keeper.x=a.side==='home'?94:6;keeper.y=b.y;keeper.saveAnim=now;}
          addLiveEvent(`PARADE! ${keeper?.name?.split(' ')[0]||'Der Keeper'} lenkt den Ball um den Pfosten.`,'save');
          resetForRestart(lm,otherSide(a.side),'corner',now); 
        }else if(saveRoll<0.40){
          addLiveEvent('PFOSTEN! Der Ball klatscht gegen den Pfosten.','chance');
          resetForRestart(lm,otherSide(a.side),'goalKick',now);
        }else{
          if(a.side==='home')lm.hg++;else lm.ag++;
          if(shooter){const real=state.teams[a.side==='home'?lm.home:lm.away].roster.find(p=>p.id===shooter.id);if(real){real.goals++;real.form=clamp(real.form+3,50,100);}}
          addLiveEvent(`TOOOR!!! ${shooter?.name?.split(' ')[0]||'Angreifer'} trifft · ${lm.hg}:${lm.ag}`,'goal');
          const flash=$('#liveGoalFlash');if(flash){flash.classList.remove('show');void flash.offsetWidth;flash.classList.add('show');}
          celebrateGoal(lm,a.side,now);
          setTimeout(()=>resetAfterGoal(a.side),900);
          sim.action=null;return;
        }
      }else{
        addLiveEvent(Math.random()<.55?'KNAPP! Der Abschluss geht am Tor vorbei.':'BLOCK! Die Abwehr wirft sich dazwischen.','chance');
        resetForRestart(lm,otherSide(a.side),'goalKick',now);
      }
    }else if(a.type==='pass'||a.type==='throw'){
      b.mode='hold';b.side=a.side;b.index=a.index;b.x=a.tx;b.y=a.ty;b.z=0;sim.nextDecisionAt=now+180+Math.random()*420;
      if(a.type==='throw')addLiveEvent(`Ball wieder im Spiel.`,'throw');
    }else if(a.type==='cross'||a.type==='corner'||a.type==='free'){
      // Cross/set-piece creates an immediate attacking duel or header.
      const attacking=a.side, opponents=sim.players[otherSide(attacking)]||[];
      const target=findSimPlayer(lm,attacking,Math.min(a.index+1,4))||currentHolder(lm);
      if(Math.random()<0.5){
        const shooter=target||currentHolder(lm);
        const tx=currentGoalX(attacking)===100?98:2;
        sim.action={type:'header',side:attacking,index:shooter?.index||4,startX:b.x,startY:b.y,tx,ty:50+(Math.random()-.5)*25,start:now,duration:600};
        b.mode='shot';b.sx=b.x;b.sy=b.y;b.tx=tx;b.ty=50+(Math.random()-.5)*25;b.start=now;b.duration=600;b.arc=.48;
        lm[attacking==='home'?'shotsH':'shotsA']++;
        addLiveEvent(`KOPFBALL! ${shooter?.name?.split(' ')[0]||'Angreifer'} setzt ihn aufs Tor.`,'header');
      }else{
        const def=opponents[Math.floor(Math.random()*opponents.length)];
        b.mode='hold';b.side=def?.side||otherSide(attacking);b.index=def?.index||0;b.x=def?.x||b.x;b.y=def?.y||b.y;b.z=0;sim.nextDecisionAt=now+300;
        addLiveEvent('GEKLÄRT! Die Abwehr bekommt den Ball weg.','clear');
      }
    }else if(a.type==='tackle'){
      b.mode='hold';b.side=a.side;b.index=a.index;b.z=0;sim.nextDecisionAt=now+250;
    }else if(a.type==='dribble'||a.type==='header'){
      if(a.type==='header'){
        const power=state.teams[a.side==='home'?lm.home:lm.away].roster[a.index]?.rating||68;
        if(Math.random()<0.18+(power-60)/240){
          if(a.side==='home')lm.hg++;else lm.ag++;
          addLiveEvent(`TOOOR!!! Kopfballtreffer · ${lm.hg}:${lm.ag}`,'goal');
          const flash=$('#liveGoalFlash');if(flash){flash.classList.remove('show');void flash.offsetWidth;flash.classList.add('show');}
          celebrateGoal(lm,a.side,now);setTimeout(()=>resetAfterGoal(a.side),900);sim.action=null;return;
        }else{
          addLiveEvent('PARADE! Der Keeper ist dran.','save');resetForRestart(lm,otherSide(a.side),'corner',now);
        }
      }else{
        b.mode='hold';b.side=a.side;b.index=a.index;b.z=0;sim.nextDecisionAt=now+220+Math.random()*420;
      }
    }
    sim.action=null;
  }

  function resetForRestart(lm,side,type,now){
    const sim=lm.sim,dir=attackDir(side);
    if(type==='corner'){const x=dir>0?97:3,y=Math.random()<.5?7:93;sim.ball={x,y,side,index:4,mode:'hold',sx:x,sy:y,tx:x,ty:y,z:0,start:0,duration:0};addLiveEvent(`ECKBALL · ${side==='home'?'Katzenelnbogen':'Taunus Park'} rückt auf.`,'corner');}
    else{sim.ball={x:dir>0?12:88,y:50,side,index:0,mode:'hold',sx:dir>0?12:88,sy:50,tx:dir>0?12:88,ty:50,z:0,start:0,duration:0};}
    sim.nextDecisionAt=now+650+Math.random()*700;
  }
  function resetAfterGoal(scoringSide){
    const lm=state.liveMatch,sim=lm.sim,side=otherSide(scoringSide),homeBases=[[8,50],[27,30],[27,70],[46,34],[50,55]],awayBases=[[92,50],[73,70],[73,30],[54,66],[50,45]];
    sim.players.home.forEach((p,i)=>{p.x=homeBases[i][0];p.y=homeBases[i][1]});
    sim.players.away.forEach((p,i)=>{p.x=awayBases[i][0];p.y=awayBases[i][1]});
    sim.ball={x:side==='home'?50:50,y:50,side,index:4,mode:'hold',sx:50,sy:50,tx:50,ty:50,z:0,start:0,duration:0};sim.nextDecisionAt=performance.now()+1100;
  }
  function celebrateGoal(lm,side,now){
    const players=lm.sim.players[side]||[];
    players.slice(1).forEach((p,i)=>{p.x=side==='home'?Math.min(92,72+i*4):Math.max(8,28-i*4);p.y=50+(i-1.5)*7;p.celebrate=now;});
    const label=$('#liveActionLabel');if(label){label.textContent='TOR!';label.classList.add('goal');setTimeout(()=>label.classList.remove('goal'),850);}
  }

  function renderLiveMatch(){
    const lm=state.liveMatch,H=state.teams[lm.home],A=state.teams[lm.away];
    const makePlayers=(side,team)=>lm.sim.players[side].map((p,i)=>`<div class="live-player ${side}" data-side="${side}" data-index="${i}"><img src="${i===0?'assets/players/goalkeeper-yellow.png':'assets/players/outfield-white.png'}" alt=""><b>${esc(p.name.split(' ')[0])}</b></div>`).join('');
    openModal('LIVE SIMULATION',`
      <div class="live-score"><div><img src="${crest(H)}"><strong>${esc(H.name)}</strong></div><div><span class="live-time" id="liveTime">00:00</span><b id="liveScore">0 : 0</b><small id="liveHalfLabel">${esc(lm.weather.name)} · 1. HZ</small></div><div><img src="${crest(A)}"><strong>${esc(A.name)}</strong></div></div>
      <div class="live-action-banner" id="liveActionBanner"><span id="liveActionLabel">ANPFIFF</span><small id="liveActionText">Der Ball rollt.</small></div>
      <div class="live-field-wrap">
        <div class="live-field" id="liveField">
          <div class="field-mark center"></div><div class="field-mark line"></div><div class="field-mark box top"></div><div class="field-mark box bottom"></div><div class="field-mark goal left"></div><div class="field-mark goal right"></div>
          ${makePlayers('home',H)}${makePlayers('away',A)}
          <div class="live-ball" id="liveBall"></div>
          <div class="live-goal-flash" id="liveGoalFlash"></div>
          <div class="setpiece-zone" id="setpieceZone"></div>
        </div>
        <div class="live-minimap" id="liveMinimap"></div>
      </div>
      <div class="live-stat-row"><span>Ballbesitz <b id="livePoss">50% · 50%</b></span><span>Schüsse <b id="liveShots">0 · 0</b></span><span>Ecken <b id="liveCorners">0 · 0</b></span></div>
      <div class="live-feed" id="liveFeed">${lm.events.map(e=>`<article class="event ${e.kind}"><small>0:00</small><span>${esc(e.text)}</span></article>`).join('')}</div>
      <div class="live-progress"><div><span id="livePhaseText">1. HALBZEIT · ECHTZEIT</span><b id="liveRemaining">01:00</b></div><i><em id="liveBar"></em></i></div>
      <div class="halftime-overlay" id="halfTimeOverlay" aria-hidden="true">
        <div class="halftime-box"><div class="halftime-title">HALBZEIT</div><div class="halftime-score"><span>${esc(H.name)}</span><strong id="halfScore">0 : 0</strong><span>${esc(A.name)}</span></div>
        <div class="halftime-stats"><span><b id="halfPossH">50%</b><small>Ballbesitz</small><b id="halfPossA">50%</b></span><span><b id="halfShotsH">0</b><small>Schüsse</small><b id="halfShotsA">0</b></span><span><b id="halfCornersH">0</b><small>Ecken</small><b id="halfCornersA">0</b></span></div><p>Kurze Pause · Taktik wird neu sortiert …</p></div>
      </div>
    </div>`,{lock:true,full:true,kicker:'VORSTAND · LIVEBEOBACHTUNG'});
    updateLiveDOM();
  }

  function showHalftimeOverlay(){
    const lm=state.liveMatch;if(!lm)return;const o=$('#halfTimeOverlay');if(!o)return;
    o.classList.add('show');o.setAttribute('aria-hidden','false');
    const h=Math.round(lm.possession),a=100-h;
    $('#halfScore')&&( $('#halfScore').textContent=`${lm.hg} : ${lm.ag}` );
    $('#halfPossH')&&( $('#halfPossH').textContent=`${h}%` ); $('#halfPossA')&&( $('#halfPossA').textContent=`${a}%` );
    $('#halfShotsH')&&( $('#halfShotsH').textContent=lm.shotsH ); $('#halfShotsA')&&( $('#halfShotsA').textContent=lm.shotsA );
    $('#halfCornersH')&&( $('#halfCornersH').textContent=lm.cornersH ); $('#halfCornersA')&&( $('#halfCornersA').textContent=lm.cornersA );
  }
  function hideHalftimeOverlay(){const o=$('#halfTimeOverlay');if(o){o.classList.remove('show');o.setAttribute('aria-hidden','true');}}
  function updateLiveFeedOnly(){const feed=$('#liveFeed'),lm=state.liveMatch;if(feed&&lm)feed.innerHTML=lm.events.map(e=>`<article class="event ${e.kind}"><small>${Math.floor(e.t/60)}:${String(e.t%60).padStart(2,'0')}</small><span>${esc(e.text)}</span></article>`).join('');}
  function updateLiveDOM(){
    const lm=state.liveMatch;if(!lm)return;
    const left=Math.max(0,120000-lm.matchClock);
    const time=$('#liveTime'),score=$('#liveScore'),rem=$('#liveRemaining'),bar=$('#liveBar'),poss=$('#livePoss'),shots=$('#liveShots'),corners=$('#liveCorners');
    if(time)time.textContent=liveClock(lm.matchClock);
    if(score)score.textContent=`${lm.hg} : ${lm.ag}`;
    if(rem)rem.textContent=lm.phase==='halftime'?'PAUSE':liveClock(left);
    if(bar)bar.style.width=`${clamp(lm.matchClock/120000*100,0,100)}%`;
    if(poss)poss.textContent=`${Math.round(lm.possession)}% · ${100-Math.round(lm.possession)}%`;
    if(shots)shots.textContent=`${lm.shotsH} · ${lm.shotsA}`;
    if(corners)corners.textContent=`${lm.cornersH} · ${lm.cornersA}`;
    const half=$('#liveHalfLabel'); if(half)half.textContent=`${esc(lm.weather.name)} · ${lm.phase==='second'?'2. HZ':lm.phase==='halftime'?'HALBZEIT':'1. HZ'}`;
    const phase=$('#livePhaseText'); if(phase)phase.textContent=lm.phase==='second'?'2. HALBZEIT · ECHTZEIT':lm.phase==='halftime'?'HALBZEIT':'1. HALBZEIT · ECHTZEIT';
    ['home','away'].forEach(side=>lm.sim.players[side].forEach((p,i)=>{const el=$(`.live-player[data-side="${side}"][data-index="${i}"]`);if(el){el.style.left=`${p.x}%`;el.style.top=`${p.y}%`;el.classList.toggle('active',side===lm.sim.ball.side&&i===lm.sim.ball.index);if(p.celebrate&&performance.now()-p.celebrate<1000)el.classList.add('celebrate');else el.classList.remove('celebrate')}}));
    const b=lm.sim.ball,ball=$('#liveBall');
    if(ball){ball.style.left=`${b.x}%`;ball.style.top=`${b.y}%`;ball.style.setProperty('--ballZ',String(b.z||0));ball.classList.toggle('in-flight',b.mode!=='hold');}
    const action=lm.sim.action,label=$('#liveActionLabel'),text=$('#liveActionText');
    if(label)label.textContent=action?({pass:'PASS',dribble:'DRIBBLING',shot:'SCHUSS',tackle:'ZWEIKAMPF',corner:'ECKBALL',free:'FREISTOSS',throw:'EINWURF',cross:'FLANKE',header:'KOPFBALL'}[action.type]||action.type.toUpperCase()):'LIVE';
    if(text)text.textContent=action?`Ball unterwegs · ${action.type==='shot'?'Torabschluss!':'Spielzug läuft …'}`:'Spielaufbau';
    updateLiveFeedOnly();
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
    const homeRevenue=Math.round(H.stadium.capacity*(0.64+Math.random()*0.28)*9);H.budget+=homeRevenue+(H.sponsor?.pay||0);A.budget+=(A.sponsor?.pay||0);H.stats.homeRevenue+=homeRevenue;
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
    const el=e.target.closest('[data-page],[data-bottom],[data-simulate],[data-close],[data-welcome],[data-player],[data-sell],[data-buy],[data-bid],[data-watch],[data-tactic],[data-marketfilter],[data-market-refresh],[data-sponsor],[data-upgrade],[data-credit],[data-export],[data-import],[data-reset],[data-draft],[data-draft-index],[data-coach],[data-firecoach],[data-settings-save],[data-select-team],[data-add-game],[data-create-friendly],[data-notify],[data-fixture],[data-rename-stadium]');
    if(!el)return;
    if(state.liveMatch)return; // Vorstand-Livefenster blockiert andere Navigation bis zum Schlusspfiff
    if(el.dataset.page)go(el.dataset.page);
    else if(el.dataset.bottom)go(el.dataset.bottom==='more'?'more':el.dataset.bottom);
    else if(el.dataset.simulate)simulateButton();
    else if(el.dataset.close)closeModal();
    else if(el.dataset.welcome){state.manager=($('#welcomeManager')?.value||'Manager').trim()||'Manager';currentTeam().name=($('#welcomeTeam')?.value||currentTeam().name).trim()||currentTeam().name;state.firstRun=false;saveState();closeModal();render();toast('Willkommen',`Los geht's, ${state.manager}.`);}
    else if(el.dataset.selectTeam){const t=state.teams[el.dataset.selectTeam];if(t){state.userTeamId=t.id;state.manager=($('#welcomeManager')?.value||state.manager).trim()||'Manager';t.sponsor=t.sponsor||{...SPONSORS[0]};state.teamChosen=true;state.firstRun=false;saveState();closeModal();state.active='home';render();toast('Club gewählt',`${t.name} · ${t.city}`);}}
    else if(el.dataset.player)openPlayer(el.dataset.player);
    else if(el.dataset.sell)sellPlayer(el.dataset.sell);
    else if(el.dataset.buy)buyPlayer(el.dataset.buy);
    else if(el.dataset.bid)bidPlayer(el.dataset.bid);
    else if(el.dataset.watch){const p=state.market.find(x=>x.id===el.dataset.watch);if(p){p.watch=!p.watch;render();}}
    else if(el.dataset.tactic){state.tactic=el.dataset.tactic;saveState();renderPage();}
    else if(el.dataset.marketfilter){state.marketFilter=el.dataset.marketfilter;renderPage();}
    else if(el.dataset.marketRefresh){state.market=generateMarket(48);saveState();renderPage();toast('Marktplatz aktualisiert','Neue Live-Angebote sind da.');}
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
