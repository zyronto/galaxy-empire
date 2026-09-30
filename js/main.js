let player,simulation;
const $=id=>document.getElementById(id);
function showRuntimeError(error){
 const message=error?.stack||error?.message||String(error);
 console.error("GALAXY EMPIRE runtime error:",error);
 let box=$("runtimeError");
 if(!box){
  box=document.createElement("div");
  box.id="runtimeError";
  box.style.cssText="position:fixed;inset:18px;z-index:99999;padding:22px;background:#160b12;color:#fff;border:2px solid #ff5577;border-radius:14px;font:14px/1.5 Consolas,monospace;white-space:pre-wrap;overflow:auto;box-shadow:0 20px 80px rgba(0,0,0,.65)";
  document.body.appendChild(box);
 }
 box.textContent="ERREUR GALAXY EMPIRE\\n\\n"+message;
}
addEventListener("error",e=>showRuntimeError(e.error||e.message));
addEventListener("unhandledrejection",e=>showRuntimeError(e.reason));
function init(){
 player=SaveSystem.load();simulation=new SpaceSimulation($("spaceCanvas"),player);simulation.resetView();
 for(const id of player.unlockedRoutes||[]){const route=simulation.getRoute(id);if(route)simulation.createShuttle(route)}
 bindTools();bindPanel();bindShuttle();bindExpeditions();renderAll();
 setInterval(()=>{Economy.addNova(player,Economy.getNovaPerMinute(player,simulation)/60);SaveSystem.save(player);renderHud()},1000);
 setInterval(renderAll,500);
}
function bindTools(){document.querySelectorAll(".tool-button").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel)))}
function bindPanel(){
 bindMapControls();$("closePanel").addEventListener("click",closePanel);
 $("closeSelection").addEventListener("click",()=>$("selectionCard").classList.add("hidden"));
 $("focusSelection").addEventListener("click",()=>{const b=simulation.selected;if(!b)return;if(simulation.isFocusedOn(b.id))simulation.clearFocus();else simulation.focusBody(b.id);showSelection(b)});
 $("spaceCanvas").addEventListener("click",e=>{const r=$("spaceCanvas").getBoundingClientRect(),b=simulation.handleClick(e.clientX-r.left,e.clientY-r.top);if(b)showSelection(b)});
}
function bindExpeditions(){$("expeditionList").addEventListener("click",e=>{const b=e.target.closest("[data-mission]");if(!b)return;const res=simulation.launchExpedition(b.dataset.mission);$("expeditionMessage").textContent=res.ok?"🚀 Mission lancée : trajectoire calculée jusqu’à la cible.":"⚠️ "+res.message;if(res.ok)SaveSystem.save(player);renderAll()})}
function renderExpeditions(){
 const list=$("expeditionList");
 if(!list||!simulation||!Array.isArray(simulation.expeditionMissions)){if(list)list.innerHTML="<div class='empty'>Système d’expéditions en cours d’initialisation…</div>";return}
 list.innerHTML=simulation.expeditionMissions.map(m=>{
  const done=(player.completedMissions||[]).includes(m.id),unlocked=simulation.missionUnlocked(m),active=simulation.rockets.some(r=>r.missionId===m.id&&r.state!=="DISAPPEARED"),available=simulation.missionAvailable(m);
  let action;
  if(done)action='<span class="line-state">✓ TERMINÉE</span>';
  else if(active)action='<span class="line-state">🚀 EN VOL</span>';
  else if(unlocked)action='<button class="line-buy" data-mission="'+m.id+'" '+(available?'':'disabled')+'>LANCER · '+m.cost.toLocaleString("fr-FR")+' NOVA</button>';
  else action='<span class="line-state">🔒 PROGRESSION</span>';
  return '<div class="mission-card '+(done?'done':'')+'"><div class="mission-route"><span>'+m.icon+'</span><div><h3>'+m.name+'</h3><p>'+m.desc+'</p><small>'+simulation.getBody(m.from).name+' → '+simulation.getBody(m.to).name+' · '+m.duration+' s · récompense '+m.reward.toLocaleString("fr-FR")+' NOVA</small></div></div>'+action+'</div>';
 }).join("");
}
function openPanel(id){$("sidePanel").classList.remove("hidden");document.querySelectorAll(".panel-section").forEach(s=>s.classList.toggle("active",s.id==="panel-"+id));document.querySelectorAll(".tool-button").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));$("panelTitle").textContent={lines:"NAVETTES",expeditions:"EXPÉDITIONS",planets:"MONDES",technologies:"TECHNOLOGIES",fleet:"FLOTTE"}[id]||id.toUpperCase();renderAll()}
function closePanel(){$("sidePanel").classList.add("hidden");document.querySelectorAll(".tool-button").forEach(b=>b.classList.remove("active"))}
function bindMapControls(){
 const canvas=$("spaceCanvas"),zoomLabel=$("zoomValue"),updateZoom=()=>zoomLabel.textContent=Math.round(simulation.camera.zoom*100)+"%";let dragging=false,lastX=0,lastY=0,moved=false;
 canvas.addEventListener("wheel",e=>{e.preventDefault();const r=canvas.getBoundingClientRect();simulation.handleWheel(e.clientX-r.left,e.clientY-r.top,e.deltaY);updateZoom()},{passive:false});
 canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.hypot(dx,dy)>1)moved=true;if(moved)simulation.pan(dx,dy);lastX=e.clientX;lastY=e.clientY});
 const stop=e=>{if(!dragging)return;dragging=false;if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId)};canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",()=>dragging=false);
 $("zoomIn").addEventListener("click",()=>{simulation.zoomAt(canvas.width/2,canvas.height/2,1.25);updateZoom()});$("zoomOut").addEventListener("click",()=>{simulation.zoomAt(canvas.width/2,canvas.height/2,.8);updateZoom()});$("resetView").addEventListener("click",()=>{simulation.resetView();updateZoom()});updateZoom();
}
function bindShuttle(){$("linesList").addEventListener("click",e=>{const b=e.target.closest("[data-route]");if(!b)return;const res=simulation.unlockRoute(b.dataset.route);$("lineMessage").textContent=res.ok?"🚀 Ligne activée : la navette commence son service.":"⚠️ "+res.message;if(res.ok)SaveSystem.save(player);renderAll()})}
function renderLines(){
 $("linesList").innerHTML=simulation.shuttleRoutes.map((r,i)=>{
  const unlocked=simulation.isRouteUnlocked(r.id),s=simulation.shuttleForRoute(r.id),from=simulation.getBody(r.from),to=simulation.getBody(r.to),cost=r.cost===0?"GRATUIT":r.cost.toLocaleString("fr-FR")+" NOVA";
  const button=unlocked?"<span class='line-state'>"+(s?simulation.shuttleStatus(s):"PRÊTE")+"</span>":"<button class='line-buy' data-route='"+r.id+"' "+(player.nova<r.cost?"disabled":"")+">"+(r.cost===0?"ACTIVER":"DÉBLOQUER · "+cost)+"</button>";
  return "<div class='line-card "+(unlocked?"unlocked":"locked")+"'><div class='line-route'><span>"+(unlocked?"🚀":"🔒")+"</span><div><h3>"+from.name+" ↔ "+to.name+"</h3><p>"+r.name+" · "+(r.cost===0?"ligne de départ":"coût "+cost)+"</p></div></div>"+button+"</div>";
 }).join("");
}
function renderPlanets(){
 const planets=simulation.bodies.filter(b=>b.type==="planet"),moons=simulation.bodies.filter(b=>b.type==="moon");
 const ph=planets.map(b=>{const u=player.unlockedBodies.includes(b.id);return "<button type='button' class='object-card celestial-list-item "+(u?"":"locked-object")+"' data-body='"+b.id+"'><div><h3>"+(u?"":"🔒 ")+b.name+"</h3><p>Rayon "+b.radius.toFixed(3)+" · orbite "+b.orbitPeriodDays+" j</p></div><span class='state'>"+(simulation.isFocusedOn(b.id)?"SUIVI":u?"🎯 VOIR":"VERROUILLÉ")+"</span></button>"}).join("");
 const mh=moons.map(b=>{const parent=simulation.getBody(b.orbitParent),u=player.unlockedBodies.includes(b.id);return "<button type='button' class='object-card celestial-list-item "+(u?"":"locked-object")+"' data-body='"+b.id+"'><div><h3>🌙 "+(u?"":"🔒 ")+b.name+"</h3><p>"+(parent?.name||"")+" · "+b.orbitPeriodDays+" j</p></div><span class='state'>"+(simulation.isFocusedOn(b.id)?"SUIVI":u?"🎯 VOIR":"VERROUILLÉ")+"</span></button>"}).join("");
 $("planetsList").innerHTML="<div class='list-heading'>PLANÈTES</div>"+ph+"<div class='list-heading'>LUNES PRINCIPALES ("+moons.length+")</div>"+mh;boxPlanetsBind();
}
function boxPlanetsBind(){document.querySelectorAll("#planetsList [data-body]").forEach(btn=>btn.addEventListener("click",()=>{const b=simulation.getBody(btn.dataset.body);if(!b||!player.unlockedBodies.includes(b.id))return;simulation.focusBody(b.id);showSelection(b);renderPlanets()}))}
function renderTech(){
 const box=$("technologyList");box.innerHTML=TECHNOLOGY_ORDER.map(id=>{const t=getTechnology(id),l=player.technologies[id]||0,cost=getTechnologyCost(id,l),max=l>=t.maxLevel;return "<div class='tech-card'><div class='tech-icon'>"+t.icon+"</div><div><h3>"+t.name+"</h3><p>"+t.description+"</p><div class='tech-level'>Niveau "+l+"/"+t.maxLevel+"</div></div><button data-tech='"+id+"' "+(max||player.nova<cost?"disabled":"")+">"+(max?"MAX":cost.toLocaleString("fr-FR")+" ✦")+"</button></div>"}).join("");
 box.querySelectorAll("[data-tech]").forEach(b=>b.addEventListener("click",()=>buyTech(b.dataset.tech)));
}
function buyTech(id){const l=player.technologies[id]||0,cost=getTechnologyCost(id,l);if(!Number.isFinite(cost)||player.nova<cost)return;player.nova-=cost;player.technologies[id]=l+1;SaveSystem.save(player);renderAll()}
function renderFleet(){
 const list=$("fleetList");$("fleetCount").textContent=simulation.shuttles.length+" navette"+(simulation.shuttles.length>1?"s":"");
 list.innerHTML=simulation.shuttles.length?simulation.shuttles.map(s=>{const r=simulation.getRoute(s.routeId),from=simulation.getBody(simulation.routeOrigin(r,s.direction)),to=simulation.getBody(simulation.routeEndpoint(r,s.direction));return "<div class='object-card shuttle-fleet-card'><div><h3>🚀 "+r.name+"</h3><p>"+(s.state==="DOCKED"?"À quai à "+from.name:"En route vers "+to.name)+" · "+s.missions+" voyage"+(s.missions>1?"s":"")+"</p></div><span class='state'>"+Math.round(s.progress*100)+"%</span></div>"}).join(""):"<div class='empty'>Aucune navette. Active ta première ligne.</div>";
}
function showSelection(b){simulation.selected=b;$("selectionCard").classList.remove("hidden");$("selectionType").textContent=b.type==="star"?"ÉTOILE":b.type==="moon"?"LUNE":"PLANÈTE";$("selectionName").textContent=b.name;const u=player.unlockedBodies.includes(b.id);$("selectionInfo").textContent=u?"Base accessible · les navettes peuvent desservir ce monde.":"Monde encore verrouillé par la progression.";$("focusSelection").textContent=simulation.isFocusedOn(b.id)?"🎯 ARRÊTER LE SUIVI":"🎯 SUIVRE CET OBJET"}
function renderHud(){const production=Economy.getNovaPerMinute(player,simulation);$("nova").textContent=Math.floor(player.nova).toLocaleString("fr-FR");$("novaPerMinute").textContent=production.toFixed(1).replace(".",",");$("activeRockets").textContent=simulation.shuttles.length;$("maxRockets").textContent=simulation.shuttleRoutes.filter(r=>simulation.isRouteUnlocked(r.id)).length||1;$("simTime").textContent=formatTime(simulation.time);$("simStatus").textContent=simulation.shuttles.length?"Réseau de navettes actif":"Débloque ta première ligne"}
function renderAll(){
 try{renderHud()}catch(e){showRuntimeError(e)}
 try{renderLines()}catch(e){showRuntimeError(e)}
 try{renderTech()}catch(e){showRuntimeError(e)}
 try{renderPlanets()}catch(e){showRuntimeError(e)}
 try{renderFleet()}catch(e){showRuntimeError(e)}
 try{renderExpeditions()}catch(e){showRuntimeError(e)}
}
function formatTime(sec){sec=Number.isFinite(sec)?Math.max(0,sec):0;const days=Math.floor(sec/86400),hours=Math.floor(sec/3600)%24,minutes=Math.floor(sec/60)%60;return days+" j "+String(hours).padStart(2,"0")+" h "+String(minutes).padStart(2,"0")+" min"}
addEventListener("load",init);