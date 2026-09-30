let player,simulation;
const $=id=>document.getElementById(id);

function init(){
 player=SaveSystem.load();
 simulation=new SpaceSimulation($("spaceCanvas"),player); simulation.resetView();
 bindTools();bindPanel();bindLaunch();renderAll();
 setInterval(()=>{
  const r=getRocket(player.currentRocket);
  Economy.addNova(player,Economy.getNovaPerMinute(player,r)/60);
  SaveSystem.save(player);
  renderHud();
 },1000);
 setInterval(renderAll,500);
}
function bindTools(){
 document.querySelectorAll(".tool-button").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel)));
}
function bindPanel(){
 bindMapControls();
 $("closePanel").addEventListener("click",closePanel);
 $("closeSelection").addEventListener("click",()=> $("selectionCard").classList.add("hidden"));
 $("spaceCanvas").addEventListener("click",e=>{
  const r=$("spaceCanvas").getBoundingClientRect();
  const b=simulation.handleClick(e.clientX-r.left,e.clientY-r.top);
  if(b)showSelection(b);
 });
 $("launchAngle").addEventListener("input",()=>{
  simulation.setAimAngle($("launchAngle").value);
  $("angleValue").textContent=(Number($("launchAngle").value)>=0?"+":"")+$("launchAngle").value+"°";
 });
}
function openPanel(id){
 $("sidePanel").classList.remove("hidden");
 document.querySelectorAll(".panel-section").forEach(s=>s.classList.toggle("active",s.id==="panel-"+id));
 document.querySelectorAll(".tool-button").forEach(b=>b.classList.toggle("active",b.dataset.panel===id));
 $("panelTitle").textContent={launch:"LANCEMENT",planets:"MONDES",technologies:"TECHNOLOGIES",fleet:"FLOTTE"}[id]||id.toUpperCase();
 renderAll();
}
function closePanel(){
 $("sidePanel").classList.add("hidden");
 document.querySelectorAll(".tool-button").forEach(b=>b.classList.remove("active"));
}
function bindMapControls(){
 const canvas=$("spaceCanvas"),zoomLabel=$("zoomValue");
 const updateZoom=()=>zoomLabel.textContent=Math.round(simulation.camera.zoom*100)+"%";
 let dragging=false,lastX=0,lastY=0,moved=false;
 canvas.addEventListener("wheel",e=>{
  e.preventDefault();const r=canvas.getBoundingClientRect();
  simulation.handleWheel(e.clientX-r.left,e.clientY-r.top,e.deltaY);updateZoom();
 },{passive:false});
 canvas.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener("pointermove",e=>{
  if(!dragging)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;
  if(Math.hypot(dx,dy)>1)moved=true;
  if(moved)simulation.pan(dx,dy);
  lastX=e.clientX;lastY=e.clientY;
 });
 const stop=e=>{
  if(!dragging)return;
  dragging=false;
  if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 };
 canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",()=>dragging=false);
 $("zoomIn").addEventListener("click",()=>{simulation.zoomAt(canvas.width/2,canvas.height/2,1.25);updateZoom()});
 $("zoomOut").addEventListener("click",()=>{simulation.zoomAt(canvas.width/2,canvas.height/2,.8);updateZoom()});
 $("resetView").addEventListener("click",()=>{simulation.resetView();updateZoom()});
 updateZoom();
}
function bindLaunch(){
 $("launchOrigin").addEventListener("change",()=>{
  simulation.setAimOrigin($("launchOrigin").value);renderLaunch();
 });
 $("launchButton").addEventListener("click",()=>{
  const res=simulation.launch($("launchOrigin").value,Number($("launchAngle").value));
  $("launchMessage").textContent=res.ok?"🚀 Fusée lancée en trajectoire libre : la gravité prend le relais.":"⚠️ "+res.message;
  if(res.ok)SaveSystem.save(player);
  renderAll();
 });
}
function renderLaunch(){
 const bodies=simulation.bodies.filter(b=>b.base);
 const oldO=$("launchOrigin").value||simulation.aimOriginId||"earth";
 $("launchOrigin").innerHTML=bodies.map(b=>"<option value='"+b.id+"'>"+b.name+"</option>").join("");
 $("launchOrigin").value=bodies.some(b=>b.id===oldO)?oldO:"earth";
 simulation.setAimOrigin($("launchOrigin").value);
 const rocket=getRocket(player.currentRocket);
 $("launchRocketName").textContent=rocket.name;
 $("launchSpeed").textContent=Math.round(CONFIG.ROCKET_SPEED_BASE*simulation.speedMultiplier())+" u/s";
 $("launchFuel").textContent="100 %";
 const full=simulation.rockets.filter(r=>r.active).length>=simulation.maxRockets();
 $("launchButton").disabled=full;
 if(full&&$("launchMessage").textContent==="")$("launchMessage").textContent="⚠️ Flotte complète.";
}
function renderTech(){
 const box=$("technologyList");
 box.innerHTML=TECHNOLOGY_ORDER.map(id=>{
  const t=getTechnology(id),l=player.technologies[id]||0,cost=getTechnologyCost(id,l),max=l>=t.maxLevel;
  return "<div class='tech-card'><div class='tech-icon'>"+t.icon+"</div><div><h3>"+t.name+"</h3><p>"+t.description+"</p><div class='tech-level'>Niveau "+l+"/"+t.maxLevel+"</div></div><button data-tech='"+id+"' "+(max||player.nova<cost?"disabled":"")+">"+(max?"MAX":cost.toLocaleString("fr-FR")+" ✦")+"</button></div>";
 }).join("");
 box.querySelectorAll("[data-tech]").forEach(b=>b.addEventListener("click",()=>buyTech(b.dataset.tech)));
}
function buyTech(id){
 const l=player.technologies[id]||0,cost=getTechnologyCost(id,l);
 if(!Number.isFinite(cost)||player.nova<cost)return;
 player.nova-=cost;player.technologies[id]=l+1;SaveSystem.save(player);renderAll();
}
function renderPlanets(){
 $("planetsList").innerHTML=simulation.bodies.filter(b=>b.base).map(b=>{
  const n=simulation.rockets.filter(r=>r.origin===b.id&&r.active).length;
  return "<div class='object-card'><div><h3>"+b.name+"</h3><p>Base · "+n+" fusée(s) en départ</p></div><span class='state'>"+(b.id===simulation.aimOriginId?"SÉLECTIONNÉ":"BASE")+"</span></div>";
 }).join("");
}
function renderFleet(){
 const list=$("fleetList"),active=simulation.rockets.filter(r=>r.active);
 $("fleetCount").textContent=active.length+" / "+simulation.maxRockets();
 list.innerHTML=active.length?active.map(r=>{
  const o=simulation.getBody(r.origin),d=simulation.getBody(r.destination);
  return "<div class='object-card'><div><h3>🚀 "+(o?.name||"?")+" → "+(d?.name||"?")+"</h3><p>Pilote automatique · carburant "+Math.max(0,Math.round(r.fuel))+"%</p></div><span class='state'>EN VOL</span></div>";
 }).join(""):"<div class='empty'>Aucune fusée en vol.</div>";
}
function showSelection(b){
 $("selectionCard").classList.remove("hidden");
 $("selectionType").textContent=b.type==="star"?"ÉTOILE":b.type==="moon"?"LUNE":"PLANÈTE";
 $("selectionName").textContent=b.name;
 $("selectionInfo").textContent=b.base?"Base interplanétaire : tu peux lancer une fusée depuis ce monde.":"Corps céleste : sa gravité influence les trajectoires.";
}
function renderHud(){
 const r=getRocket(player.currentRocket);
 $("nova").textContent=Math.floor(player.nova).toLocaleString("fr-FR");
 $("novaPerMinute").textContent=Economy.getNovaPerMinute(player,r).toFixed(1).replace(".",",");
 $("activeRockets").textContent=simulation.rockets.filter(r=>r.active).length;
 $("maxRockets").textContent=simulation.maxRockets();
 $("simTime").textContent=formatTime(simulation.time);
 $("simStatus").textContent=simulation.rockets.some(r=>r.active)?"Trajectoires libres":"Bac à sable gravitationnel";
}
function renderAll(){renderHud();renderLaunch();renderTech();renderPlanets();renderFleet()}
function formatTime(sec){sec=Number.isFinite(sec)?Math.max(0,sec):0;const days=Math.floor(sec/86400),hours=Math.floor(sec/3600)%24,minutes=Math.floor(sec/60)%60;return days+" j "+String(hours).padStart(2,"0")+" h "+String(minutes).padStart(2,"0")+" min"}
addEventListener("load",init);