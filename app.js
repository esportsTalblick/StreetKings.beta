const state={
  screen:"home",
  balance:46357,
  fans:77,
  week:1,
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
   <div class="brand-banner">
     <img src="./assets/branding/logo-main.png" alt="STREET KINGS MANAGER" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=brand-fallback>STREET KINGS<em>MANAGER</em></div>'">
   </div>
   <div class="eyebrow">SAISON 1 · WOCHE ${state.week}<span style="float:right;color:var(--green);font-size:12px">${fmt(state.balance)} € · 😎 ${state.fans}</span></div>
   <section class="hero-card">
     <div class="hero-content">
       <h1 class="hero-title">STREET KINGS<em>MANAGER</em></h1>
       <div class="hero-tag">SMALL TOWN<br>BIG DREAMS</div>
     </div>
     <div class="hero-bottom"><div class="town">KATZENELNBOGEN · AAR-EINRICH</div></div>
   </section>
   <section class="next-match">
     <div><div class="eyebrow gold" style="margin-bottom:5px">NÄCHSTES SPIEL</div><div class="title">VS Taunus Park</div><div class="meta">Kreisliga · 18:00 · Bolzplatz Katzenelnbogen</div></div>
     <button class="live-btn" data-action="simulate">LIVE</button>
   </section>
   <div class="menu-grid">
     ${tile("verein.png","VEREIN","club")}
     ${tile("team.png","TEAM","team")}
     ${tile("spielen.png","SPIELEN","play")}
     ${tile("liga.png","LIGA","league")}
     ${tile("transfers.png","TRANSFERS","transfers")}
     ${tile("markt.png","MARKTPLATZ","market")}
     ${tile("stadt.png","STADT","city")}
     ${tile("news.png","NACHRICHTEN","news")}
   </div>
   <section class="section"><div class="section-head"><h2>AUFSTELLUNG</h2><button class="primary-btn" style="min-width:auto;padding:10px 12px" data-screen="team">TAKTIK</button></div>
     <div class="panel"><div class="players">${state.players.map(p=>player(p)).join("")}</div></div>
   </section>`;
 },
 club(){return page("VEREIN","Dein Club · Katzenelnbogen",`
   <div class="stat-grid">
    <div class="stat"><small>KONTO</small><strong>${fmt(state.balance)} €</strong></div>
    <div class="stat"><small>FANS</small><strong>${state.fans}</strong></div>
    <div class="stat"><small>SAISON</small><strong>1</strong></div>
    <div class="stat"><small>PLATZ</small><strong>8.</strong></div>
   </div>
   <div class="section cards"><div class="row-card"><div><strong>Stadion</strong><small>Bolzplatz Katzenelnbogen</small></div><span class="gold">›</span></div>
   <div class="row-card"><div><strong>Sponsoren</strong><small>2 aktive Verträge</small></div><span class="gold">›</span></div></div>`)},
 team(){return page("TEAM","Kader & Aufstellung",`<div class="panel"><div class="players">${state.players.map(p=>player(p)).join("")}</div></div><div class="section cards"><div class="row-card"><div><strong>Formation</strong><small>1–2–1 + Torwart</small></div><button class="primary-btn" data-action="toast" style="min-width:auto;padding:10px">ÄNDERN</button></div></div>`)},
 play(){return page("SPIELEN","Match Center",`<div class="next-match"><div><div class="eyebrow gold">NÄCHSTES SPIEL</div><div class="title">Taunus Park</div><div class="meta">Kreisliga · heute · 18:00</div></div><button class="live-btn" data-action="simulate">LIVE</button></div><div class="section cards"><div class="row-card"><div><strong>Freundschaftsspiel hinzufügen</strong><small>Neues Spiel ansetzen</small></div><button class="primary-btn" data-action="toast" style="min-width:auto;padding:10px">+</button></div></div>`)},
 market(){return page("MARKTPLATZ","Spieler · Auktionen · Angebote",`<div class="market-list">${state.market.map(p=>`<div class="market-player"><img src="./assets/players/${p[2]}" alt=""><div><strong>${p[0]}</strong><small>${p[1]} · Marktwert</small></div><div><div class="price">${p[3]}</div><button class="buy" data-action="buy">KAUFEN</button></div></div>`).join("")}</div>`)},
 league(){return page("LIGA","Kreisliga · Tabelle",`<div class="cards">${["1. Aar United","2. Nassau City","3. Rhein Kicker","4. Diezer Jungs","5. Taunus Park","6. Street Eagles","7. Limburg West","8. Katzenelnbogen"].map((x,i)=>`<div class="row-card"><strong>${x}</strong><span>${i+1===8?"8":"–"}</span></div>`).join("")}</div>`)},
 transfers(){return page("TRANSFERS","Kaderplanung",`<div class="cards"><div class="row-card"><div><strong>Transferliste</strong><small>Spieler beobachten und Angebote senden</small></div><span class="gold">›</span></div><div class="row-card"><div><strong>Meine Angebote</strong><small>0 offene Angebote</small></div><span class="gold">›</span></div></div>`)},
 city(){return page("STADT","Katzenelnbogen · Aar-Einrich",`<div class="panel" style="min-height:330px;background:url('./assets/city/stadt-bg.png') center/cover;display:flex;align-items:end"><div><div class="eyebrow gold">DEINE HEIMAT</div><strong style="font-size:25px">SMALL TOWN · BIG DREAMS</strong></div></div>`)},
 news(){return page("NACHRICHTEN","Vereinsnews",`<div class="cards"><div class="row-card"><div><strong>Der Verein startet in die Saison</strong><small>Vorstand bestätigt den Kader.</small></div></div><div class="row-card"><div><strong>Markt geöffnet</strong><small>Neue Spieler sind verfügbar.</small></div></div><div class="row-card"><div><strong>Heimspiel heute</strong><small>Taunus Park kommt nach Katzenelnbogen.</small></div></div></div>`)},
 menu(){return page("MENÜ","Street Kings Manager",`<div class="cards">${["Statistiken","Finanzen","Stadion","Sponsoren","Jugend","Einstellungen"].map(x=>`<div class="row-card"><strong>${x}</strong><span class="gold">›</span></div>`).join("")}</div>`)},
 simulation(){return `<div class="eyebrow">LIVE · KREISLIGA</div><div class="page-title">KATZENELNBOGEN <span>VS</span> TAUNUS PARK</div><div id="matchPanel" class="panel" style="min-height:430px;text-align:center"><div style="font-family:'Press Start 2P';font-size:11px;color:var(--gold)">LIVE-SIMULATION</div><div id="score" style="font-size:58px;font-weight:900;margin:35px 0 12px">0 : 0</div><div id="clock" style="color:#8b938f">00:00 / 02:00</div><div id="events" style="margin-top:28px;text-align:left"></div></div>`}
};

function fmt(n){return n.toLocaleString("de-DE")}
function tile(icon,label,screen){return `<button class="menu-tile" data-screen="${screen}"><span class="tile-icon"><img src="./assets/icons/${icon}" alt="" onerror="this.outerHTML='<span class=\\'fallback-icon\\'>◈</span>'"></span><b>${label}</b></button>`}
function player(p){return `<div class="player"><img src="./assets/players/${p[2]}" alt="" onerror="this.style.display='none'"><div class="num">${p[0]}</div><small>${p[1]}</small></div>`}
function page(title,sub,body){return `<div class="page-title">${title} <span></span></div><div class="eyebrow">${sub}</div>${body}`}
function render(){
 const view=screens[state.screen]||screens.home;
 document.getElementById("screen").innerHTML=view();
 document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>{state.screen=b.dataset.screen;render();window.scrollTo(0,0)}));
 document.querySelectorAll("[data-action='simulate']").forEach(b=>b.addEventListener("click",startSimulation));
 document.querySelectorAll("[data-action='toast']").forEach(b=>b.addEventListener("click",()=>toast("Funktion wird vorbereitet.")));
 document.querySelectorAll("[data-action='buy']").forEach(b=>b.addEventListener("click",()=>toast("Spieler beobachtet – Angebotssystem folgt.")));
 document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.screen===state.screen));
}
function toast(msg){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove("show"),1800)}
function startSimulation(){
 state.screen="simulation";render();let sec=0,a=0,b=0;const events=["Anstoß! Katzenelnbogen hat den Ball.","Chance aus der Distanz!","Starke Parade des Keepers.","Konter über die rechte Seite.","Pfosten! Beinahe das 1:0.","TOOOR! Katzenelnbogen trifft.","Taunus Park antwortet.","Letzte Minute – alles nach vorne!"];
 const timer=setInterval(()=>{sec++;document.getElementById("clock").textContent=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")} / 02:00`;if(sec%15===0){const ev=events[Math.floor(sec/15)%events.length];document.getElementById("events").insertAdjacentHTML("afterbegin",`<div style="padding:9px 0;border-bottom:1px solid #252b29;font-size:13px"><span class="gold">${String(sec/60|0).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}</span> · ${ev}</div>`)}if(sec===42)a=1;if(sec===78)b=1;document.getElementById("score").textContent=`${a} : ${b}`;if(sec>=120){clearInterval(timer);toast("Abpfiff! Ergebnis gespeichert.");state.week++;setTimeout(()=>{state.screen="home";render()},1800)}},1000);
}
render();
