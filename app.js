const state={
  screen:"home", balance:46357, fans:77, week:1,
  players:[
    ["01","Mika","outfield-white.png"],["07","Tobi","outfield-white.png"],
    ["10","Zdvako","outfield-white.png"],["21","Kristijan","outfield-white.png"],
    ["99","Luca","goalkeeper-yellow.png"]
  ],
  market:[
    ["Rico","TW","outfield-white.png","12.500 €"],["Milan","ST","outfield-white.png","18.900 €"],
    ["Jonas","IV","outfield-white.png","9.750 €"],["Ben","ZM","outfield-white.png","15.200 €"]
  ]
};

const screens={
 home(){
   return `
   <div class="brand-banner"><img src="./assets/branding/logo-main.png" alt="STREET KINGS MANAGER" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=brand-fallback>STREET KINGS<em>MANAGER</em></div>'"></div>
   <div class="eyebrow">SAISON 1 · WOCHE ${state.week}<span style="float:right;color:var(--green);font-size:12px">${fmt(state.balance)} € · 😎 ${state.fans}</span></div>
   <section class="hero-card"><div class="hero-content"><h1 class="hero-title">STREET KINGS<em>MANAGER</em></h1><div class="hero-tag">SMALL TOWN<br>BIG DREAMS</div></div><div class="hero-bottom"><div class="town">KATZENELNBOGEN · AAR-EINRICH</div></div></section>
   <section class="next-match"><div><div class="eyebrow gold" style="margin-bottom:5px">NÄCHSTES SPIEL</div><div class="title">VS Taunus Park</div><div class="meta">Kreisliga · 18:00 · Bolzplatz Katzenelnbogen</div></div><button class="live-btn" data-action="simulate">LIVE</button></section>
   <div class="menu-grid">${tile("verein.png","VEREIN","club")}${tile("team.png","TEAM","team")}${tile("spielen.png","SPIELEN","play")}${tile("liga.png","LIGA","league")}${tile("transfers.png","TRANSFERS","transfers")}${tile("markt.png","MARKTPLATZ","market")}${tile("stadt.png","STADT","city")}${tile("news.png","NACHRICHTEN","news")}</div>
   <section class="section"><div class="section-head"><h2>AUFSTELLUNG</h2><button class="primary-btn" style="min-width:auto;padding:10px 12px" data-screen="team">TAKTIK</button></div><div class="panel"><div class="players">${state.players.map(p=>player(p)).join("")}</div></div></section>`;
 },
 club(){return page("VEREIN","Dein Club · Katzenelnbogen",`<div class="stat-grid"><div class="stat"><small>KONTO</small><strong>${fmt(state.balance)} €</strong></div><div class="stat"><small>FANS</small><strong>${state.fans}</strong></div><div class="stat"><small>SAISON</small><strong>1</strong></div><div class="stat"><small>PLATZ</small><strong>8.</strong></div></div><div class="section cards"><div class="row-card"><div><strong>Stadion</strong><small>Bolzplatz Katzenelnbogen</small></div><span class="gold">›</span></div><div class="row-card"><div><strong>Sponsoren</strong><small>2 aktive Verträge</small></div><span class="gold">›</span></div></div>`)},
 team(){return page("TEAM","Kader & Aufstellung",`<div class="panel"><div class="players">${state.players.map(p=>player(p)).join("")}</div></div><div class="section cards"><div class="row-card"><div><strong>Formation</strong><small>1–2–1 + Torwart</small></div><button class="primary-btn" data-action="toast" style="min-width:auto;padding:10px">ÄNDERN</button></div></div>`)},
 play(){return page("SPIELEN","Match Center",`<div class="next-match"><div><div class="eyebrow gold">NÄCHSTES SPIEL</div><div class="title">Taunus Park</div><div class="meta">Kreisliga · heute · 18:00</div></div><button class="live-btn" data-action="simulate">LIVE</button></div><div class="section cards"><div class="row-card"><div><strong>Freundschaftsspiel hinzufügen</strong><small>Neues Spiel ansetzen</small></div><button class="primary-btn" data-action="toast" style="min-width:auto;padding:10px">+</button></div></div>`)},
 market(){return page("MARKTPLATZ","Spieler · Auktionen · Angebote",`<div class="market-list">${state.market.map(p=>`<div class="market-player"><img src="./assets/players/${p[2]}" alt=""><div><strong>${p[0]}</strong><small>${p[1]} · Marktwert</small></div><div><div class="price">${p[3]}</div><button class="buy" data-action="buy">KAUFEN</button></div></div>`).join("")}</div>`)},
 league(){return page("LIGA","Kreisliga · Tabelle",`<div class="cards">${["Aar United","Nassau City","Rhein Kicker","Diezer Jungs","Taunus Park","Street Eagles","Limburg West","Katzenelnbogen"].map((x,i)=>`<div class="row-card"><strong>${i+1}. ${x}</strong><span>${Math.max(0,18-i*2)} Pkt.</span></div>`).join("")}</div>`)},
 transfers(){return page("TRANSFERS","Kaderplanung",`<div class="cards"><div class="row-card"><div><strong>Transferliste</strong><small>Spieler beobachten und Angebote senden</small></div><span class="gold">›</span></div><div class="row-card"><div><strong>Meine Angebote</strong><small>0 offene Angebote</small></div><span class="gold">›</span></div></div>`)},
 city(){return page("STADT","Katzenelnbogen · Aar-Einrich",`<div class="panel city-panel"><div><div class="eyebrow gold">DEINE HEIMAT</div><strong style="font-size:25px">SMALL TOWN · BIG DREAMS</strong></div></div>`)},
 news(){return page("NACHRICHTEN","Vereinsnews",`<div class="cards"><div class="row-card"><div><strong>Der Verein startet in die Saison</strong><small>Vorstand bestätigt den Kader.</small></div></div><div class="row-card"><div><strong>Markt geöffnet</strong><small>Neue Spieler sind verfügbar.</small></div></div><div class="row-card"><div><strong>Heimspiel heute</strong><small>Taunus Park kommt nach Katzenelnbogen.</small></div></div></div>`)},
 menu(){return page("MENÜ","Street Kings Manager",`<div class="cards">${["Statistiken","Finanzen","Stadion","Sponsoren","Jugend","Einstellungen"].map(x=>`<div class="row-card"><strong>${x}</strong><span class="gold">›</span></div>`).join("")}</div>`)},
 simulation(){return `
   <div class="match-head">
     <div class="eyebrow">LIVE · KREISLIGA</div>
     <div class="match-title"><span>KATZENELNBOGEN</span><b>VS</b><span>TAUNUS PARK</span></div>
   </div>
   <section class="live-match">
      <div class="match-top"><span id="liveStatus">ANPFIFF</span><span id="clock">00:00 / 02:00</span></div>
      <div class="scoreboard"><strong id="homeScore">0</strong><span>:</span><strong id="awayScore">0</strong></div>
      <div class="pitch-wrap">
        <div class="pitch" id="pitch">
          <div class="half-line"></div><div class="center-line"></div><div class="center-circle"></div>
          <div class="box left"></div><div class="box right"></div>
          <div class="goal left"></div><div class="goal right"></div>
          <div class="player-dot home gk" data-p="h0"><img src="./assets/players/goalkeeper-yellow.png" alt=""></div>
          <div class="player-dot home" data-p="h1"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot home" data-p="h2"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot home" data-p="h3"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot home" data-p="h4"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot away gk"><img src="./assets/players/goalkeeper-yellow.png" alt=""></div>
          <div class="player-dot away"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot away"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot away"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div class="player-dot away"><img src="./assets/players/outfield-white.png" alt=""></div>
          <div id="ball" class="ball"></div>
          <div id="flash" class="goal-flash"></div>
        </div>
      </div>
      <div id="events" class="events"></div>
   </section>`;
 }
};

function fmt(n){return n.toLocaleString("de-DE")}
function tile(icon,label,screen){return `<button class="menu-tile" data-screen="${screen}"><span class="tile-icon"><img src="./assets/icons/${icon}" alt="" onerror="this.outerHTML='<span class=\\'fallback-icon\\'>◈</span>'"></span><b>${label}</b></button>`}
function player(p){return `<div class="player"><img src="./assets/players/${p[2]}" alt=""><div class="num">${p[0]}</div><small>${p[1]}</small></div>`}
function page(title,sub,body){return `<div class="page-title">${title}</div><div class="eyebrow">${sub}</div>${body}`}
function render(){
  const view=screens[state.screen]||screens.home;
  document.getElementById("screen").innerHTML=view();
  document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>{state.screen=b.dataset.screen;render();window.scrollTo(0,0)}));
  document.querySelectorAll("[data-action='simulate']").forEach(b=>b.addEventListener("click",startSimulation));
  document.querySelectorAll("[data-action='toast']").forEach(b=>b.addEventListener("click",()=>toast("Funktion wird vorbereitet.")));
  document.querySelectorAll("[data-action='buy']").forEach(b=>b.addEventListener("click",()=>toast("Spieler beobachtet – Angebotssystem folgt.")));
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.screen===state.screen));
  if(state.screen==="simulation") requestAnimationFrame(()=>startAnimation());
}

let matchTimer=null, animFrame=null;
function startSimulation(){
  if(matchTimer) return;
  state.screen="simulation";render();
}
function startAnimation(){
  const nodes=[...document.querySelectorAll(".player-dot")];
  const ball=document.getElementById("ball"),events=document.getElementById("events");
  if(!ball||!events) return;
  let elapsed=0, homeScore=0, awayScore=0, lastEvent=-1;
  const homePos=[[8,50],[28,28],[30,72],[48,35],[48,65]];
  const awayPos=[[92,50],[72,28],[70,72],[52,35],[52,65]];
  let bx=50, by=50, dir=1, phase=0;
  let eventLog=[
    "Anstoß – Katzenelnbogen spielt kurz hinten herum.",
    "Taunus Park presst hoch.",
    "Mika nimmt den Ball am rechten Flügel mit.",
    "Chance! Abschluss knapp am Pfosten vorbei.",
    "Starker Zweikampf im Mittelfeld.",
    "Luca hält sicher.",
    "Konter über die linke Seite.",
    "Zdvako zieht ab!"
  ];
  const start=performance.now();
  function addEvent(msg,goal=false){
    const row=document.createElement("div");row.className="event-row"+(goal?" goal-event":"");
    row.innerHTML=`<span>${document.getElementById("clock")?.textContent?.split(" / ")[0]||""}</span>${msg}`;
    events.prepend(row);while(events.children.length>4)events.lastChild.remove();
    if(goal){document.getElementById("flash")?.classList.add("show");setTimeout(()=>document.getElementById("flash")?.classList.remove("show"),500)}
  }
  addEvent(eventLog[0]);
  function tick(now){
    if(state.screen!=="simulation") return;
    elapsed=Math.min(120,(now-start)/1000);
    phase+=0.032;
    document.getElementById("clock").textContent=`${String(Math.floor(elapsed/60)).padStart(2,"0")}:${String(Math.floor(elapsed%60)).padStart(2,"0")} / 02:00`;
    document.getElementById("liveStatus").textContent=elapsed<2?"ANPFIFF":(elapsed>=118?"NACHSPION":"LIVE");
    const sway=Math.sin(phase*1.7);
    nodes.forEach((n,i)=>{
      const home=n.classList.contains("home");
      const idx=i % 5;
      const base=(home?homePos:awayPos)[idx];
      const wave=Math.sin(phase+(idx*1.4))*(idx===0?1.5:5.5);
      const waveY=Math.cos(phase*1.3+(idx*1.1))*(idx===0?1.2:4);
      n.style.left=`${Math.max(4,Math.min(96,base[0]+(home?1:-1)*wave/3))}%`;
      n.style.top=`${Math.max(10,Math.min(90,base[1]+waveY))}%`;
    });
    bx += dir*(0.18+0.05*Math.sin(phase*1.2));
    by = 50 + 32*Math.sin(phase*0.63);
    if(bx>88){bx=88;dir=-1}else if(bx<12){bx=12;dir=1}
    ball.style.left=`${bx}%`;ball.style.top=`${by}%`;
    const second=Math.floor(elapsed);
    if(second%12===0 && second!==lastEvent){lastEvent=second;addEvent(eventLog[(second/12)%eventLog.length|0]);}
    if(second===44 && homeScore===0){homeScore=1;document.getElementById("homeScore").textContent=homeScore;addEvent("TOOOR! Katzenelnbogen trifft zum 1:0!",true)}
    if(second===82 && awayScore===0){awayScore=1;document.getElementById("awayScore").textContent=awayScore;addEvent("Ausgleich! Taunus Park macht das 1:1.",true)}
    if(elapsed>=120){finishMatch();return}
    animFrame=requestAnimationFrame(tick);
  }
  animFrame=requestAnimationFrame(tick);
}
function finishMatch(){
  cancelAnimationFrame(animFrame);matchTimer=null;
  const status=document.getElementById("liveStatus"); if(status) status.textContent="ABPFIFF";
  toast("Abpfiff – 1 : 1 gespeichert.");
  state.week=Math.min(34,state.week+1);
  setTimeout(()=>{state.screen="home";render()},1800);
}
function toast(msg){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove("show"),1800)}

render();
