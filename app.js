
/* STREET KINGS MANAGER - V7 SETTINGS / RESET / WELCOME PATCH */
(function(){
  "use strict";

  const SAVE_KEY = "streetKingsManagerSaveV7";
  const FIRST_KEY = "streetKingsWelcomeShownV7";

  function safeParse(v){ try { return JSON.parse(v); } catch(e){ return null; } }
  function saveState(data){
    try{
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version:7, savedAt:new Date().toISOString(), data:data
      }));
      return true;
    }catch(e){ return false; }
  }
  function loadState(){
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = safeParse(raw);
    return parsed && parsed.data ? parsed : null;
  }
  function resetGame(){
    if(!confirm("Neues Spiel starten?\n\nDer aktuelle Spielstand wird gelöscht.")) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(FIRST_KEY);
    location.reload();
  }

  // Public helpers so existing UI handlers can call them.
  window.streetKingsSave = function(){
    const manager = document.querySelector('[name="managerName"], #managerName, [data-setting="managerName"]')?.value || "Manager";
    const club = document.querySelector('[name="clubName"], #clubName, [data-setting="clubName"]')?.value || "FC Talblick";
    const arena = document.querySelector('[name="arenaName"], #arenaName, [data-setting="arenaName"]')?.value || "FC Talblick Street Arena";
    const current = window.state || {};
    current.managerName = manager;
    current.clubName = club;
    current.arenaName = arena;
    if(saveState(current)){
      const el=document.querySelector(".save-status");
      if(el) el.textContent="Zuletzt gespeichert: "+new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
      alert("Spielstand gespeichert.");
    } else alert("Speichern fehlgeschlagen.");
  };

  window.streetKingsExport = async function(){
    const current = window.state || {};
    const payload = {streetKingsManager:true,version:7,exportedAt:new Date().toISOString(),data:current};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const file = new File([blob],"street-kings-save.json",{type:"application/json"});
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({title:"Street Kings Manager Spielstand",files:[file]}); return; }catch(e){}
    }
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download="street-kings-save.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };

  window.streetKingsImport = function(){
    let input=document.getElementById("streetKingsImportInput");
    if(!input){
      input=document.createElement("input");
      input.type="file"; input.accept=".json,application/json"; input.id="streetKingsImportInput";
      input.style.display="none"; document.body.appendChild(input);
      input.addEventListener("change",()=>{
        const f=input.files && input.files[0]; if(!f) return;
        const r=new FileReader();
        r.onload=()=>{
          const p=safeParse(r.result);
          if(!p || !p.streetKingsManager || !p.data){ alert("Ungültiger Street-Kings-Spielstand."); return; }
          localStorage.setItem(SAVE_KEY,JSON.stringify({version:7,savedAt:new Date().toISOString(),data:p.data}));
          alert("Spielstand importiert. Das Spiel wird neu geladen.");
          location.reload();
        };
        r.readAsText(f);
      });
    }
    input.value=""; input.click();
  };

  // Capture buttons even if the old app did not wire them.
  document.addEventListener("click",function(e){
    const b=e.target.closest("button,[role='button'],a");
    if(!b) return;
    const txt=(b.textContent||"").trim().toUpperCase();
    if(txt.includes("SPEICHERN") && !txt.includes("EXPORT")){ e.preventDefault(); streetKingsSave(); return; }
    if(txt.includes("EXPORTIEREN")){ e.preventDefault(); streetKingsExport(); return; }
    if(txt.includes("IMPORTIEREN")){ e.preventDefault(); streetKingsImport(); return; }
    if(txt.includes("NEUES SPIEL")){ e.preventDefault(); resetGame(); return; }
  },true);

  // Ensure text fields actually persist and can be renamed.
  document.addEventListener("input",function(e){
    if(!e.target.matches("input")) return;
    const id=e.target.id||"";
    if(/managerName|clubName|arenaName/i.test(id)){
      window.state=window.state||{};
      if(/managerName/i.test(id)) window.state.managerName=e.target.value;
      if(/clubName/i.test(id)) window.state.clubName=e.target.value;
      if(/arenaName/i.test(id)) window.state.arenaName=e.target.value;
    }
  });

  function splash(){
    if(document.getElementById("skmSplash")) return;
    const s=document.createElement("div"); s.id="skmSplash";
    s.innerHTML=`<div class="skm-splash-card">
      <img src="./assets/screens/cover-talblick-mobile.jpg" onerror="this.src='./assets/screens/cover-talblick-mobile.jpeg'">
      <button id="skmSplashClose">STARTEN</button>
    </div>`;
    document.body.appendChild(s);
    document.getElementById("skmSplashClose").onclick=()=>{
      s.classList.add("hide"); setTimeout(()=>s.remove(),350);
      welcome();
    };
  }
  function welcome(){
    if(localStorage.getItem(FIRST_KEY)) return;
    const w=document.createElement("div"); w.id="skmWelcome";
    w.innerHTML=`<div class="skm-welcome-card">
      <div class="skm-welcome-kicker">STREET KINGS MANAGER</div>
      <h2>WILLKOMMEN BEI<br><span>FC TALBLICK</span></h2>
      <p><b>Street Kings Manager · Einrich Edition</b></p>
      <p>Dein Ziel: Baue deinen Verein auf, manage deinen Kader und kämpfe dich durch die Ligen.</p>
      <p>💾 Unter <b>Einstellungen</b> kannst du deinen Spielstand speichern, exportieren, importieren oder ein neues Spiel starten.</p>
      <button id="skmWelcomeClose">LOSLEGEN</button>
    </div>`;
    document.body.appendChild(w);
    document.getElementById("skmWelcomeClose").onclick=()=>{
      localStorage.setItem(FIRST_KEY,"1"); w.remove();
    };
  }

  function init(){
    // Restore saved settings into visible inputs if the app exposes them.
    const s=loadState();
    if(s && s.data){
      window.state=window.state||{};
      Object.assign(window.state,s.data);
      setTimeout(()=>{
        const map=[
          ["managerName",s.data.managerName],["clubName",s.data.clubName],["arenaName",s.data.arenaName]
        ];
        map.forEach(([id,v])=>{
          const el=document.getElementById(id);
          if(el && v!=null) el.value=v;
        });
      },100);
    }
    setTimeout(splash,80);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
