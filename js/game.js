class SpaceSimulation{
constructor(canvas,player){
 this.canvas=canvas;this.ctx=canvas.getContext("2d");this.player=player;
 this.time=0;this.last=performance.now();this.selected=null;this.rockets=[];this.stars=[];
 this.camera={x:149598,y:0,zoom:0.5};this.justPanned=false;
 this.focusedBodyId=null;
 this.shuttles=[];
 this.shuttleRoutes=[
  {id:"earth-moon",from:"earth",to:"moon",name:"TERRE ↔ LUNE",icon:"🌍",cost:0,speed:1.0,travel:3,dock:1},
  {id:"moon-mars",from:"moon",to:"mars",name:"LUNE ↔ MARS",icon:"🌙",cost:1500,speed:.82,travel:7,dock:1.5},
  {id:"mars-jupiter",from:"mars",to:"jupiter",name:"MARS ↔ JUPITER",icon:"🔴",cost:6000,speed:.72,travel:12,dock:2},
  {id:"jupiter-saturn",from:"jupiter",to:"saturn",name:"JUPITER ↔ SATURNE",icon:"🪐",cost:20000,speed:.62,travel:18,dock:2},
  {id:"saturn-uranus",from:"saturn",to:"uranus",name:"SATURNE ↔ URANUS",icon:"🛰️",cost:60000,speed:.55,travel:25,dock:2},
  {id:"uranus-neptune",from:"uranus",to:"neptune",name:"URANUS ↔ NEPTUNE",icon:"🌌",cost:150000,speed:.48,travel:32,dock:2}
 ];

 // Données astronomiques réelles : distances en milliers de km.
 // Les rayons, masses et périodes orbitales restent cohérents avec les données NASA.
 this.bodies=[
  {id:"sun",name:"Soleil",type:"star",x:0,y:0,vx:0,vy:0,massKg:1.98847e30,radius:695.7,color:"#ffd166"},
  {id:"mercury",name:"Mercure",type:"planet",x:57909,y:0,vx:0,vy:0,massKg:3.3011e23,radius:2.4395,color:"#b7a99a",base:true,orbitRadius:57909,orbitPeriodDays:87.969},
  {id:"venus",name:"Vénus",type:"planet",x:108210,y:0,vx:0,vy:0,massKg:4.8675e24,radius:6.052,color:"#d9a066",base:true,orbitRadius:108210,orbitPeriodDays:224.701},
  {id:"earth",name:"Terre",type:"planet",x:149598,y:0,vx:0,vy:0,massKg:5.9722e24,radius:6.371,color:"#4cc9f0",base:true,orbitRadius:149598,orbitPeriodDays:365.256},
  {id:"mars",name:"Mars",type:"planet",x:227956,y:0,vx:0,vy:0,massKg:6.4171e23,radius:3.3895,color:"#ef8354",base:true,orbitRadius:227956,orbitPeriodDays:686.980},
  {id:"jupiter",name:"Jupiter",type:"planet",x:778500,y:0,vx:0,vy:0,massKg:1.89813e27,radius:69.911,color:"#d6a36a",base:true,orbitRadius:778500,orbitPeriodDays:4332.59},
  {id:"saturn",name:"Saturne",type:"planet",x:1432041,y:0,vx:0,vy:0,massKg:5.6832e26,radius:58.232,color:"#e6c27a",base:true,orbitRadius:1432041,orbitPeriodDays:10755.699},
  {id:"uranus",name:"Uranus",type:"planet",x:2867043,y:0,vx:0,vy:0,massKg:8.6810e25,radius:25.362,color:"#8ed8e8",base:true,orbitRadius:2867043,orbitPeriodDays:30685.400},
  {id:"neptune",name:"Neptune",type:"planet",x:4514953,y:0,vx:0,vy:0,massKg:1.02409e26,radius:24.622,color:"#4d79ff",base:true,orbitRadius:4514953,orbitPeriodDays:60189.018},
  {id:"moon",name:"Lune",type:"moon",x:149982.4,y:0,vx:0,vy:0,massKg:7.342e22,radius:1.7374,color:"#cbd5e1",orbitParent:"earth",orbitRadius:384.4,orbitPeriodDays:27.321661,orbitAngle:0},
  {id:"phobos",name:"Phobos",type:"moon",x:237334,y:0,vx:0,vy:0,massKg:1.06e16,radius:.0113,color:"#8b8178",orbitParent:"mars",orbitRadius:9.378,orbitPeriodDays:.31891,orbitAngle:0},
  {id:"deimos",name:"Deimos",type:"moon",x:251415,y:0,vx:0,vy:0,massKg:2.4e15,radius:.0062,color:"#9c948d",orbitParent:"mars",orbitRadius:23.459,orbitPeriodDays:1.26244,orbitAngle:0},
  {id:"io",name:"Io",type:"moon",x:778921.8,y:0,vx:0,vy:0,massKg:8.932e22,radius:1.8215,color:"#f0c85a",orbitParent:"jupiter",orbitRadius:421.8,orbitPeriodDays:1.769138,orbitAngle:0},
  {id:"europa",name:"Europe",type:"moon",x:779171.1,y:0,vx:0,vy:0,massKg:4.8e22,radius:1.5608,color:"#d8d0b8",orbitParent:"jupiter",orbitRadius:671.1,orbitPeriodDays:3.551181,orbitAngle:1},
  {id:"ganymede",name:"Ganymède",type:"moon",x:779570.4,y:0,vx:0,vy:0,massKg:1.482e23,radius:2.6312,color:"#a78f72",orbitParent:"jupiter",orbitRadius:1070.4,orbitPeriodDays:7.154553,orbitAngle:2},
  {id:"callisto",name:"Callisto",type:"moon",x:780382.7,y:0,vx:0,vy:0,massKg:1.076e23,radius:2.4103,color:"#80786f",orbitParent:"jupiter",orbitRadius:1882.7,orbitPeriodDays:16.689017,orbitAngle:3},
  {id:"mimas",name:"Mimas",type:"moon",x:1432226.5,y:0,vx:0,vy:0,massKg:3.75e19,radius:.196,color:"#aeb5bd",orbitParent:"saturn",orbitRadius:185.52,orbitPeriodDays:.9424218,orbitAngle:0},
  {id:"enceladus",name:"Encelade",type:"moon",x:1432279,y:0,vx:0,vy:0,massKg:1.08e20,radius:.252,color:"#e7edf4",orbitParent:"saturn",orbitRadius:238.02,orbitPeriodDays:1.370218,orbitAngle:.8},
  {id:"tethys",name:"Téthys",type:"moon",x:1432335.7,y:0,vx:0,vy:0,massKg:6.17e20,radius:.531,color:"#c9cdd2",orbitParent:"saturn",orbitRadius:294.66,orbitPeriodDays:1.887802,orbitAngle:1.6},
  {id:"dione",name:"Dioné",type:"moon",x:1432418.4,y:0,vx:0,vy:0,massKg:1.096e21,radius:.56,color:"#c5c8cc",orbitParent:"saturn",orbitRadius:377.4,orbitPeriodDays:2.736915,orbitAngle:2.4},
  {id:"rhea",name:"Rhéa",type:"moon",x:1432568,y:0,vx:0,vy:0,massKg:2.307e21,radius:.764,color:"#b8bdc5",orbitParent:"saturn",orbitRadius:527.04,orbitPeriodDays:4.5175,orbitAngle:3.2},
  {id:"titan",name:"Titan",type:"moon",x:1433263,y:0,vx:0,vy:0,massKg:1.3452e23,radius:2.5747,color:"#d69b52",orbitParent:"saturn",orbitRadius:1221.87,orbitPeriodDays:15.945421,orbitAngle:4},
  {id:"hyperion",name:"Hypérion",type:"moon",x:1433542,y:0,vx:0,vy:0,massKg:5.6e18,radius:.205,color:"#9a846b",orbitParent:"saturn",orbitRadius:1500.93,orbitPeriodDays:21.276609,orbitAngle:4.8},
  {id:"iapetus",name:"Japet",type:"moon",x:1435602,y:0,vx:0,vy:0,massKg:1.806e21,radius:.7345,color:"#777b83",orbitParent:"saturn",orbitRadius:3560.85,orbitPeriodDays:79.330183,orbitAngle:5.6},
  {id:"miranda",name:"Miranda",type:"moon",x:2867172.8,y:0,vx:0,vy:0,massKg:6.6e19,radius:.2358,color:"#aeb7bd",orbitParent:"uranus",orbitRadius:129.846,orbitPeriodDays:1.413479,orbitAngle:0},
  {id:"ariel",name:"Ariel",type:"moon",x:2867233,y:0,vx:0,vy:0,massKg:1.35e21,radius:.5789,color:"#bfc5ca",orbitParent:"uranus",orbitRadius:190.929,orbitPeriodDays:2.520379,orbitAngle:1.2},
  {id:"umbriel",name:"Umbriel",type:"moon",x:2867309,y:0,vx:0,vy:0,massKg:1.172e21,radius:.5847,color:"#747a80",orbitParent:"uranus",orbitRadius:265.986,orbitPeriodDays:4.144177,orbitAngle:2.4},
  {id:"titania",name:"Titania",type:"moon",x:2867480,y:0,vx:0,vy:0,massKg:3.4e21,radius:.7889,color:"#aeb4ba",orbitParent:"uranus",orbitRadius:436.298,orbitPeriodDays:8.705869,orbitAngle:3.6},
  {id:"oberon",name:"Obéron",type:"moon",x:2867626,y:0,vx:0,vy:0,massKg:3.014e21,radius:.7614,color:"#8f949a",orbitParent:"uranus",orbitRadius:583.511,orbitPeriodDays:13.463237,orbitAngle:4.8},
  {id:"triton",name:"Triton",type:"moon",x:4515307.8,y:0,vx:0,vy:0,massKg:2.14e22,radius:1.3526,color:"#d5b4a0",orbitParent:"neptune",orbitRadius:354.76,orbitPeriodDays:5.876854,orbitAngle:0,orbitDirection:-1},
  {id:"nereid",name:"Néréide",type:"moon",x:4520466.4,y:0,vx:0,vy:0,massKg:3e19,radius:.17,color:"#9aa0a8",orbitParent:"neptune",orbitRadius:5513.4,orbitPeriodDays:360.13619,orbitAngle:2}
 ];

 for(const b of this.bodies){
  if(b.id!=="sun"&&b.type==="planet")b.vy=this.orbitalSpeed(b.orbitRadius);
  if(b.type==="moon"){
   const parent=this.getBody(b.orbitParent),dir=b.orbitDirection||1,a=b.orbitAngle||0;
   b.x=parent.x+Math.cos(a)*b.orbitRadius;b.y=parent.y+Math.sin(a)*b.orbitRadius;
   const local=this.orbitalSpeedAround(parent,b.orbitRadius);
   b.vx=parent.vx-dir*Math.sin(a)*local;b.vy=parent.vy+dir*Math.cos(a)*local;
  }
 }
 this.moonAngle=0;
 this.initExpeditions();
 this.resize();this.makeStars();addEventListener("resize",()=>this.resize());
 requestAnimationFrame(this.frame.bind(this));
}

distanceMeters(distanceUnits){return Math.max(distanceUnits,1e-9)*CONFIG.DISTANCE_SCALE_METERS}
accelerationScale(){return CONFIG.TIME_SCALE_SECONDS*CONFIG.TIME_SCALE_SECONDS/CONFIG.DISTANCE_SCALE_METERS}

orbitalSpeed(rUnits){
 const sun=this.getBody("sun");
 const r=this.distanceMeters(rUnits);
 const v=Math.sqrt(CONFIG.GRAVITATIONAL_CONSTANT*sun.massKg/r);
 return v*CONFIG.TIME_SCALE_SECONDS/CONFIG.DISTANCE_SCALE_METERS;
}

tech(id){return this.player.technologies?.[id]||0}
maxRockets(){return Math.max(1,this.shuttles.length)}
speedMultiplier(){return 1+this.tech("speed")*.12}
getRoute(id){return this.shuttleRoutes.find(r=>r.id===id)}
isRouteUnlocked(id){return Array.isArray(this.player.unlockedRoutes)&&this.player.unlockedRoutes.includes(id)}
routeEndpoint(route,direction){return direction===1?route.to:route.from}
routeOrigin(route,direction){return direction===1?route.from:route.to}
unlockRoute(id){
 const route=this.getRoute(id);
 if(!route||this.isRouteUnlocked(id))return {ok:false,message:"Ligne déjà débloquée."};
 if(!(this.player.unlockedBodies||[]).includes(route.from))return {ok:false,message:"Débloque d'abord la base de départ."};
 if(this.player.nova<route.cost)return {ok:false,message:"Pas assez de NOVA."};
 this.player.nova-=route.cost;
 this.player.unlockedRoutes.push(id);
 if(!this.player.unlockedBodies.includes(route.to))this.player.unlockedBodies.push(route.to);
 this.createShuttle(route);
 return {ok:true,route};
}
createShuttle(route){
 if(this.shuttles.some(s=>s.routeId===route.id))return;
 const s={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),routeId:route.id,direction:1,progress:0,state:"DOCKED",dockRemaining:1,age:0,distance:0,missions:0,x:0,y:0,path:[]};
 this.shuttles.push(s);this.updateShuttlePosition(s,0);
}
updateShuttlePosition(s,dt){
 const route=this.getRoute(s.routeId);if(!route)return;
 const from=this.getBody(this.routeOrigin(route,s.direction)),to=this.getBody(this.routeEndpoint(route,s.direction));
 if(!from||!to)return;
 const p=Math.max(0,Math.min(1,s.progress)),sx=from.x,sy=from.y,tx=to.x,ty=to.y;
 const dx=tx-sx,dy=ty-sy,len=Math.max(Math.hypot(dx,dy),1),nx=-dy/len,ny=dx/len;
 const arc=Math.min(len*.18,1200)*Math.sin(Math.PI*p);
 s.x=sx+(tx-sx)*p+nx*arc;s.y=sy+(ty-sy)*p+ny*arc;
 if(dt>0){s.path.push({x:s.x,y:s.y});if(s.path.length>120)s.path.shift();}
}
updateShuttles(dt){
 for(const s of this.shuttles){
  const route=this.getRoute(s.routeId);if(!route)continue;
  s.age+=dt;
  if(s.state==="DOCKED"){
   s.dockRemaining-=dt;this.updateShuttlePosition(s,0);
   if(s.dockRemaining<=0){s.state="OUTBOUND";s.progress=0;s.path=[];}
   continue;
  }
  const from=this.getBody(this.routeOrigin(route,s.direction)),to=this.getBody(this.routeEndpoint(route,s.direction));
  const distance=Math.max(Math.hypot(to.x-from.x,to.y-from.y),1);
  const duration=Math.max(1.8,Math.min(45,route.travel*Math.sqrt(distance/384.4)/(route.speed*this.speedMultiplier())));
  s.progress+=dt/duration;s.distance+=distance*dt/duration;this.updateShuttlePosition(s,dt);
  if(s.progress>=1){
   s.progress=1;s.state="DOCKED";s.dockRemaining=route.dock;s.missions++;s.direction*=-1;s.path=[];
   const arrived=this.getBody(this.routeOrigin(route,s.direction));
   if(arrived&&!this.player.unlockedBodies.includes(arrived.id))this.player.unlockedBodies.push(arrived.id);
   this.updateShuttlePosition(s,0);
  }
 }
}
shuttleForRoute(id){return this.shuttles.find(s=>s.routeId===id)}
shuttleStatus(s){
 if(!s)return "NON ACTIVE";
 const route=this.getRoute(s.routeId);
 if(s.state==="DOCKED")return "À QUAI";
 return "EN ROUTE → "+this.getBody(this.routeEndpoint(route,s.direction))?.name;
}
fuelMultiplier(){return 1/(1+this.tech("fuel")*.1)}


initExpeditions(){this.expeditionMissions=[{id:"moon-scout",name:"Éclaireur lunaire",from:"earth",to:"moon",icon:"🌙",cost:120,reward:350,duration:9,desc:"Cartographier la Lune et installer une balise scientifique."},{id:"mars-first",name:"Première mission martienne",from:"earth",to:"mars",icon:"🔴",cost:450,reward:1100,duration:15,desc:"Atteindre Mars et rechercher des traces d'eau."},{id:"jupiter-probe",name:"Sonde Jupiter",from:"mars",to:"jupiter",icon:"🟠",cost:1400,reward:3200,duration:23,desc:"Traverser la ceinture externe et analyser Jupiter."},{id:"saturn-rings",name:"Mission Saturne",from:"jupiter",to:"saturn",icon:"🪐",cost:4200,reward:9000,duration:32,desc:"Observer les anneaux et déployer une station automatique."},{id:"titan-discovery",name:"Expédition Titan",from:"saturn",to:"titan",icon:"🛰️",cost:9000,reward:19000,duration:42,desc:"Explorer Titan et récupérer des données rares."},{id:"neptune-frontier",name:"Frontière de Neptune",from:"uranus",to:"neptune",icon:"🔵",cost:22000,reward:50000,duration:58,desc:"Pousser le réseau jusqu'aux confins du système."}];}
mission(id){return this.expeditionMissions.find(m=>m.id===id)}
missionUnlocked(m){if(!m)return false;const done=this.player.completedMissions||[],i=this.expeditionMissions.findIndex(x=>x.id===m.id);return i===0||done.includes(this.expeditionMissions[i-1]?.id)}
missionAvailable(m){return !!(m&&this.missionUnlocked(m)&&!this.rockets.some(r=>r.state!=="DISAPPEARED")&&this.player.nova>=m.cost&&this.player.unlockedBodies.includes(m.from)&&(this.player.unlockedBodies.includes(m.to)||(m.to==="titan"&&this.player.unlockedBodies.includes("saturn"))))}
bezierPoint(a,c1,c2,b,t){const u=1-t;return{x:u*u*u*a.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*b.y}}
launchExpedition(id){const m=this.mission(id);if(!m)return{ok:false,message:"Mission inconnue."};if(!this.missionAvailable(m))return{ok:false,message:"Mission indisponible : progression, coût ou mission précédente incorrect."};this.player.nova-=m.cost;const from=this.getBody(m.from),to=this.getBody(m.to),dx=to.x-from.x,dy=to.y-from.y,len=Math.max(Math.hypot(dx,dy),1),nx=-dy/len,ny=dx/len,side=Math.min(len*.22,25000)*(m.id.length%2?1:-1);const r={id:"exp-"+Date.now()+"-"+Math.random().toString(16).slice(2),missionId:m.id,fromId:m.from,toId:m.to,state:"TRAVEL",progress:0,age:0,distance:0,path:[],curveSide:side,active:true};this.rockets.push(r);this.updateExpeditionRocket(r,0);this.player.missions=(this.player.missions||0)+1;return{ok:true,mission:m}}
updateExpeditionRocket(r,dt){const m=this.mission(r.missionId),from=this.getBody(r.fromId),to=this.getBody(r.toId);if(!m||!from||!to){r.state="DISAPPEARED";return}const dx=to.x-from.x,dy=to.y-from.y,len=Math.max(Math.hypot(dx,dy),1),nx=-dy/len,ny=dx/len,side=r.curveSide,c1={x:from.x+dx*.30+nx*side,y:from.y+dy*.30+ny*side},c2={x:from.x+dx*.72+nx*side*.75,y:from.y+dy*.72+ny*side*.75},prev=this.bezierPoint(from,c1,c2,to,r.progress);if(dt>0)r.progress=Math.min(1,r.progress+dt/(Math.max(3,m.duration/(1+this.tech("speed")*.08+this.tech("navigation")*.05))));const p=this.bezierPoint(from,c1,c2,to,r.progress),look=this.bezierPoint(from,c1,c2,to,Math.min(1,r.progress+.002));r.x=p.x;r.y=p.y;r.distance+=Math.hypot(p.x-prev.x,p.y-prev.y);r.age+=dt;r.heading=Math.atan2(look.y-p.y,look.x-p.x);r.path.push(p);if(r.path.length>180)r.path.shift();if(r.progress>=1){r.state="ARRIVED";r.active=false;r.arrived=true;r.completedAt=performance.now();r.disappearAt=r.completedAt+1800;r.path=[from,c1,c2,to];if(!this.player.completedMissions)this.player.completedMissions=[];if(!this.player.completedMissions.includes(m.id))this.player.completedMissions.push(m.id);this.player.nova+=m.reward;if(m.to==="titan"&&!this.player.unlockedBodies.includes("titan"))this.player.unlockedBodies.push("titan");}}
updateExpeditions(dt){for(const r of this.rockets){if(r.state==="TRAVEL")this.updateExpeditionRocket(r,dt);else if(r.state==="ARRIVED"&&performance.now()>=r.disappearAt)r.state="DISAPPEARED"}}
drawExpeditionTrajectories(){const c=this.ctx;if(!Array.isArray(this.rockets))return;for(const r of this.rockets){if(r.state==="DISAPPEARED")continue;const from=this.getBody(r.fromId),to=this.getBody(r.toId);if(!from||!to)continue;const dx=to.x-from.x,dy=to.y-from.y,len=Math.max(Math.hypot(dx,dy),1),nx=-dy/len,ny=dx/len,side=r.curveSide,c1={x:from.x+dx*.30+nx*side,y:from.y+dy*.30+ny*side},c2={x:from.x+dx*.72+nx*side*.75,y:from.y+dy*.72+ny*side*.75};c.save();c.strokeStyle=r.state==="ARRIVED"?"rgba(74,222,128,.4)":"rgba(66,232,255,.34)";c.lineWidth=1.5;c.setLineDash([6,7]);c.beginPath();for(let i=0;i<=40;i++){const q=this.bezierPoint(from,c1,c2,to,i/40),p=this.worldToScreen(q.x,q.y);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)}c.stroke();c.restore()}}

resize(){this.canvas.width=Math.max(1,this.canvas.clientWidth);this.canvas.height=Math.max(1,this.canvas.clientHeight)}
makeStars(){for(let i=0;i<240;i++)this.stars.push({x:Math.random(),y:Math.random(),r:.3+Math.random()*1.3,a:.2+Math.random()*.65})}


screenToWorld(x,y){return{x:(x-this.canvas.width/2)/this.camera.zoom+this.camera.x,y:(y-this.canvas.height/2)/this.camera.zoom+this.camera.y}}
worldToScreen(x,y){return{x:this.canvas.width/2+(x-this.camera.x)*this.camera.zoom,y:this.canvas.height/2+(y-this.camera.y)*this.camera.zoom}}

zoomAt(x,y,factor){
 const before=this.screenToWorld(x,y);
 this.camera.zoom=Math.max(.0005,Math.min(20,this.camera.zoom*factor));
 const after=this.screenToWorld(x,y);
 this.camera.x+=before.x-after.x;this.camera.y+=before.y-after.y;
 if(this.focusedBodyId)this.updateFocus();
}
handleWheel(x,y,delta){this.zoomAt(x,y,delta<0?1.15:.87)}
pan(dx,dy){
  this.camera.x-=dx/this.camera.zoom;this.camera.y-=dy/this.camera.zoom;
  if(this.focusedBodyId)this.clearFocus();
  this.justPanned=true;
}
resetView(){this.clearFocus();this.camera={x:149598,y:0,zoom:0.5}}
getBody(id){return this.bodies.find(b=>b.id===id)}
isFocusedOn(id){return this.focusedBodyId===id}
focusBody(id){
 const b=this.getBody(id);
 if(!b)return false;
 this.focusedBodyId=id;
 this.camera.x=b.x;this.camera.y=b.y;
 return true;
}
clearFocus(){this.focusedBodyId=null}
updateFocus(){
 if(!this.focusedBodyId)return;
 const b=this.getBody(this.focusedBodyId);
 if(!b){this.clearFocus();return;}
 this.camera.x=b.x;this.camera.y=b.y;
}

/*
 * Gravité newtonienne + correction relativiste faible.
 *
 * Newton : a = G M / r²
 * Einstein/Schwarzschild : la correction devient importante lorsque r
 * approche le rayon de Schwarzschild et/ou lorsque la vitesse devient
 * relativiste. Dans le système solaire elle reste volontairement minuscule,
 * ce qui est justement cohérent avec la physique réelle.
 */
gravityFromBody(b,x,y,vx,vy){
 const dx=b.x-x,dy=b.y-y;
 const distanceUnits=Math.max(Math.hypot(dx,dy),1e-6);
 const r=this.distanceMeters(distanceUnits);
 const G=CONFIG.GRAVITATIONAL_CONSTANT;
 const c=CONFIG.SPEED_OF_LIGHT;

 const newton=G*b.massKg/(r*r);

 // Rayon de Schwarzschild : rs = 2GM/c²
 const rs=2*G*b.massKg/(c*c);

 // Correction post-newtonienne simple, adaptée à une simulation de jeu.
 // Elle est négligeable loin d'un objet compact et augmente près de celui-ci.
 const velocityUnits=Math.hypot(vx,vy);
 const velocityMetersPerSecond=velocityUnits*CONFIG.DISTANCE_SCALE_METERS/CONFIG.TIME_SCALE_SECONDS;
 const beta2=Math.min(.999999,(velocityMetersPerSecond/c)**2);
 const relativisticFactor=1+(1.5*rs/r)+(0.5*beta2);

 const acceleration=newton*relativisticFactor*this.accelerationScale();
 return{
  ax:dx/distanceUnits*acceleration,
  ay:dy/distanceUnits*acceleration,
  newtonAcceleration:newton,
  relativisticFactor,
  schwarzschildRadius:rs
 };
}

gravityAt(x,y,vx=0,vy=0,ignoreId){
 let ax=0,ay=0;
 for(const b of this.bodies){
  if(b.id===ignoreId)continue;
  const g=this.gravityFromBody(b,x,y,vx,vy);
  ax+=g.ax;ay+=g.ay;
 }
 return{ax,ay}
}

updateBodies(dt){
 const sun=this.getBody("sun");
 for(const b of this.bodies){
  if(b.type!=="planet")continue;
  const dx=b.x-sun.x,dy=b.y-sun.y,r=Math.hypot(dx,dy)||1;
  const angle=Math.atan2(dy,dx),angular=2*Math.PI/(b.orbitPeriodDays*24),nextAngle=angle+angular*dt;
  b.x=sun.x+Math.cos(nextAngle)*r;b.y=sun.y+Math.sin(nextAngle)*r;
  b.vx=-Math.sin(nextAngle)*r*angular;b.vy=Math.cos(nextAngle)*r*angular;
 }
 for(const b of this.bodies){
  if(b.type!=="moon")continue;
  const parent=this.getBody(b.orbitParent);if(!parent)continue;
  const dir=b.orbitDirection||1,angular=2*Math.PI/(b.orbitPeriodDays*24);
  b.orbitAngle=(b.orbitAngle||0)+dir*angular*dt;
  b.x=parent.x+Math.cos(b.orbitAngle)*b.orbitRadius;
  b.y=parent.y+Math.sin(b.orbitAngle)*b.orbitRadius;
  const local=this.orbitalSpeedAround(parent,b.orbitRadius);
  b.vx=parent.vx-dir*Math.sin(b.orbitAngle)*local;
  b.vy=parent.vy+dir*Math.cos(b.orbitAngle)*local;
 }
}

bodySphereOfInfluence(body){
 const sun=this.getBody("sun");
 if(!sun||body.id==="sun")return 0;
 const parentDistance=Math.max(Math.hypot(body.x-sun.x,body.y-sun.y),body.radius*3);
 const hill=parentDistance*Math.pow(body.massKg/(3*sun.massKg),1/3);
 return Math.max(body.radius*3,hill*.65);
}

captureRocket(r,body){
 const dx=r.x-body.x,dy=r.y-body.y;
 const distance=Math.max(Math.hypot(dx,dy),body.radius+0.5);
 const relativeVx=r.vx-body.vx,relativeVy=r.vy-body.vy;
 const relativeSpeed=Math.hypot(relativeVx,relativeVy);
 const escape=this.orbitalSpeedAround(body,distance)*Math.sqrt(2);

 // Une fusée très rapide peut effectuer un survol sans être capturée.
 if(distance>body.radius*2.5 && relativeSpeed>escape*1.25)return false;

 const orbitRadius=Math.max(body.radius+10,Math.min(distance,body.radius+24));
 const radialAngle=Math.atan2(dy,dx);
 const angularMomentum=dx*relativeVy-dy*relativeVx;
 const direction=angularMomentum>=0?1:-1;

 r.orbitingBody=body.id;
 r.landingBody=body.id;
 r.orbitRadius=orbitRadius;
 r.orbitAngle=radialAngle;
 r.orbitTurns=0;
 r.landingProgress=0;
 r.state="ORBIT";
 r.x=body.x+Math.cos(radialAngle)*orbitRadius;
 r.y=body.y+Math.sin(radialAngle)*orbitRadius;
 r.vx=body.vx-direction*Math.sin(radialAngle)*this.orbitalSpeedAround(body,orbitRadius);
 r.vy=body.vy+direction*Math.cos(radialAngle)*this.orbitalSpeedAround(body,orbitRadius);
 return true;
}

orbitalSpeedAround(body,rUnits){
 const r=this.distanceMeters(Math.max(rUnits,1e-6));
 const v=Math.sqrt(CONFIG.GRAVITATIONAL_CONSTANT*body.massKg/r);
 return v*CONFIG.TIME_SCALE_SECONDS/CONFIG.DISTANCE_SCALE_METERS;
}

updateOrbitalRocket(r,dt){
 const body=this.getBody(r.orbitingBody);
 if(!body){r.active=false;r.failed=true;return;}

 const direction=r.orbitDirection||1;
 const angularVelocity=this.orbitalSpeedAround(body,r.orbitRadius)/Math.max(r.orbitRadius,1e-6);
 const previous=r.orbitAngle;
 r.orbitAngle+=direction*angularVelocity*dt;
 r.orbitTurns+=Math.abs(r.orbitAngle-previous)/(Math.PI*2);

 if(r.orbitTurns>=1.5){
  r.state="LANDING";
  r.landingProgress=0;
  r.landingStartRadius=r.orbitRadius;
 }

 if(r.state==="LANDING"){
  r.landingProgress=Math.min(1,r.landingProgress+dt/2.0);
  const eased=r.landingProgress*r.landingProgress*(3-2*r.landingProgress);
  r.orbitRadius=r.landingStartRadius+(body.radius+0.6-r.landingStartRadius)*eased;

  if(r.landingProgress>=1){
   r.x=body.x+Math.cos(r.orbitAngle)*(body.radius+0.6);
   r.y=body.y+Math.sin(r.orbitAngle)*(body.radius+0.6);
   r.active=false;
   r.arrived=true;
   r.failed=false;
   r.state="ARRIVED";
   r.landedOn=body.name;
   r.disappearAt=performance.now()+1000;
   return;
  }
 }

 r.x=body.x+Math.cos(r.orbitAngle)*r.orbitRadius;
 r.y=body.y+Math.sin(r.orbitAngle)*r.orbitRadius;
 const tangentialSpeed=this.orbitalSpeedAround(body,r.orbitRadius);
 r.vx=body.vx-direction*Math.sin(r.orbitAngle)*tangentialSpeed;
 r.vy=body.vy+direction*Math.cos(r.orbitAngle)*tangentialSpeed;
 r.distance+=Math.abs(angularVelocity*r.orbitRadius*dt);
 r.age+=dt;
 r.path.push({x:r.x,y:r.y});
 if(r.path.length>CONFIG.MAX_TRAIL_POINTS)r.path.shift();
}

handlePlanetArrival(r,b){
 const dx=r.x-b.x,dy=r.y-b.y;
 const d=Math.max(Math.hypot(dx,dy),1e-6);
 r.x=b.x+dx*(b.radius+0.15)/d;
 r.y=b.y+dy*(b.radius+0.15)/d;
 r.active=false;
 r.arrived=true;
 r.failed=false;
 r.state="ARRIVED";
 r.landedOn=b.name;
 r.disappearAt=performance.now()+1000;
}

updateRocket(r,dt){
 if(r.state==="ORBIT"||r.state==="LANDING"){
  this.updateOrbitalRocket(r,dt);
  return;
 }
 if(r.state==="ARRIVED"){
  if(performance.now()>=r.disappearAt)r.state="DISAPPEARED";
  return;
 }
 if(r.state==="DISAPPEARED")return;

 // Intégration fine : plusieurs petits pas évitent les sauts de plusieurs
 // heures et rendent la courbure gravitationnelle visible et stable.
 const subSteps=Math.max(1,Math.ceil(dt/0.08));
 const h=dt/subSteps;

 for(let step=0;step<subSteps;step++){
  const grav=this.gravityAt(r.x,r.y,r.vx,r.vy);
  r.vx+=grav.ax*h;
  r.vy+=grav.ay*h;

  const oldX=r.x,oldY=r.y;
  r.x+=r.vx*h;
  r.y+=r.vy*h;

  const moved=Math.hypot(r.x-oldX,r.y-oldY);
  r.distance+=moved;
  r.age+=h;
  r.fuel-=CONFIG.FUEL_CONSUMPTION*h*this.fuelMultiplier();

  // Collision balayée : même une fusée rapide ne peut traverser une planète
  // entre deux images.
  for(const b of this.bodies){
   if(b.id==="sun")continue;
   const dx=r.x-b.x,dy=r.y-b.y;
   const d=Math.hypot(dx,dy);
   const segmentX=oldX-b.x,segmentY=oldY-b.y;
   const segLen2=Math.max(moved*moved,1e-12);
   const t=Math.max(0,Math.min(1,-(segmentX*(r.x-oldX)+segmentY*(r.y-oldY))/segLen2));
   const closestX=oldX+(r.x-oldX)*t,closestY=oldY+(r.y-oldY)*t;
   const sweptDistance=Math.hypot(closestX-b.x,closestY-b.y);

   const hasMovedAway=r.age>0.01;
   if(hasMovedAway&&(d<=b.radius+0.6||sweptDistance<=b.radius+0.6)){
    this.handlePlanetArrival(r,b);
    return;
   }
  }

  let nearest=null,nearestD=Infinity;
  for(const b of this.bodies){
   const d=Math.hypot(r.x-b.x,r.y-b.y);
   if(d<nearestD){nearest=b;nearestD=d}
  }

  if(nearest&&nearest.id!=="sun"&&nearestD<28&&nearestD<r.closestDistance){
   r.closestBody=nearest.id;
   r.closestDistance=nearestD;
  }

  // Capture orbitale uniquement dans la sphère d'influence.
  if(nearest&&nearest.id!=="sun"){
   const soi=this.bodySphereOfInfluence(nearest);
   if(nearestD<=soi&&this.captureRocket(r,nearest)){
    r.orbitDirection=(r.vx-nearest.vx)*(r.y-nearest.y)-(r.vy-nearest.vy)*(r.x-nearest.x)>=0?1:-1;
    return;
   }
  }

  r.path.push({x:r.x,y:r.y});
  if(r.path.length>CONFIG.MAX_TRAIL_POINTS)r.path.shift();
 }
}

update(dt){
 const simDt=dt*CONFIG.SIMULATION_SPEED;
 this.updateBodies(simDt);
 this.updateFocus();
 this.updateShuttles(dt);
 this.updateExpeditions(dt);
 this.time+=simDt;
}

frame(now){
 const dt=Math.min(.05,(now-this.last)/1000);
 this.last=now;this.update(dt);this.draw(now);
 requestAnimationFrame(this.frame.bind(this));
}

draw(now){
 const c=this.ctx,w=this.canvas.width,h=this.canvas.height;
 const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.75);
 g.addColorStop(0,"#0b1835");g.addColorStop(1,"#010208");
 c.fillStyle=g;c.fillRect(0,0,w,h);

 for(const s of this.stars){
  c.globalAlpha=s.a*(.75+.25*Math.sin(now*.001+s.x*20));
  c.fillStyle="#dff7ff";c.beginPath();c.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);c.fill();
 }
 c.globalAlpha=1;

 this.drawOrbits();
 this.drawExpeditionTrajectories();
 for(const b of this.bodies)this.drawBody(b);
 this.drawSystemCenter();
 this.drawShuttles();
 for(const r of this.rockets)this.drawRocket(r);
}

drawSystemCenter(){
 const c=this.ctx,p=this.worldToScreen(0,0);
 if(p.x>-80&&p.x<this.canvas.width+80&&p.y>-80&&p.y<this.canvas.height+80){
  c.save();c.strokeStyle="rgba(255,209,102,.08)";c.lineWidth=1;
  c.beginPath();c.arc(p.x,p.y,22*this.camera.zoom,0,Math.PI*2);c.stroke();c.restore();
 }
}

drawOrbits(){
 const c=this.ctx;
 for(const b of this.bodies.filter(x=>x.orbitRadius)){
  const center=b.type==="moon"&&b.orbitParent?this.getBody(b.orbitParent):this.getBody("sun");
  if(!center)continue;
  const s=this.worldToScreen(center.x,center.y);
  const rx=b.orbitRadius*this.camera.zoom;
  if(rx<2||rx>Math.max(this.canvas.width,this.canvas.height)*2)continue;
  c.strokeStyle=b.type==="moon"?"rgba(148,163,184,.08)":"rgba(148,163,184,.12)";
  c.lineWidth=1;
  c.beginPath();c.arc(s.x,s.y,rx,0,Math.PI*2);c.stroke();
 }
}

drawBody(b){
 const c=this.ctx,p=this.worldToScreen(b.x,b.y),r=Math.max(2,b.radius*this.camera.zoom);if(p.x<-100||p.x>this.canvas.width+100||p.y<-100||p.y>this.canvas.height+100)return;c.save();
 if(b.type==="star"){const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r*6);glow.addColorStop(0,"rgba(255,255,220,.98)");glow.addColorStop(.2,"rgba(255,205,80,.65)");glow.addColorStop(1,"rgba(255,130,30,0)");c.fillStyle=glow;c.beginPath();c.arc(p.x,p.y,r*6,0,Math.PI*2);c.fill();c.fillStyle="#fff6bd";c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();}
 else{c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.clip();const base=b.color||"#64748b",g=c.createRadialGradient(p.x-r*.38,p.y-r*.45,1,p.x+r*.2,p.y+r*.2,r*1.15);g.addColorStop(0,"#fff");g.addColorStop(.12,base);g.addColorStop(.68,base);g.addColorStop(1,"#070b15");c.fillStyle=g;c.fillRect(p.x-r-2,p.y-r-2,r*2+4,r*2+4);const seed=[...b.id].reduce((a,ch)=>a+ch.charCodeAt(0),0);c.globalAlpha=.22;if(["jupiter","saturn","uranus","neptune"].includes(b.id)){for(let i=-3;i<=3;i++){c.fillStyle=i%2?"#fff":"#111827";c.fillRect(p.x-r,p.y+i*r*.24,r*2,r*.1)}}if(b.id==="earth"){c.fillStyle="#49b96d";for(let i=0;i<7;i++){const aa=(seed+i*1.7)%6.28,rr=r*(.25+((seed+i*13)%45)/100);c.beginPath();c.ellipse(p.x+Math.cos(aa)*r*.42,p.y+Math.sin(aa)*r*.48,Math.max(1,rr*.55),Math.max(1,rr*.3),aa,0,Math.PI*2);c.fill()}}if(b.id==="mars"){c.fillStyle="#f4b08a";for(let i=0;i<5;i++){const aa=(i*2.1+seed)%6.28;c.beginPath();c.arc(p.x+Math.cos(aa)*r*.45,p.y+Math.sin(aa)*r*.45,Math.max(1,r*.13),0,Math.PI*2);c.fill()}}if(b.type==="moon"){c.fillStyle="#fff";for(let i=0;i<Math.min(10,Math.max(2,Math.floor(r/3)+2));i++){const aa=(seed+i*2.37)%6.28;c.globalAlpha=.1;c.beginPath();c.arc(p.x+Math.cos(aa)*r*.55,p.y+Math.sin(aa)*r*.55,Math.max(.6,r*.16),0,Math.PI*2);c.fill()}}c.globalAlpha=1;c.restore();c.save();if(b.id==="saturn"&&r>3){c.strokeStyle="rgba(220,200,155,.72)";c.lineWidth=Math.max(1,r*.12);c.beginPath();c.ellipse(p.x,p.y,r*1.65,r*.48,-.18,0,Math.PI*2);c.stroke();c.strokeStyle="rgba(255,255,255,.28)";c.lineWidth=Math.max(1,r*.04);c.beginPath();c.ellipse(p.x,p.y,r*1.35,r*.39,-.18,0,Math.PI*2);c.stroke()}if((b.type==="planet"&&this.player.unlockedBodies?.includes(b.id))||b.id==="moon"){c.strokeStyle="rgba(66,232,255,.5)";c.lineWidth=1;c.beginPath();c.arc(p.x,p.y,r+3,0,Math.PI*2);c.stroke()}c.restore();if(r>=2.2){c.fillStyle="#dbeafe";c.font=(r>8?"11px":"9px")+" Segoe UI";c.textAlign="center";c.fillText(b.name,p.x,p.y+r+15)}}

drawRocket(r){if(!r||r.state==="DISAPPEARED")return;const c=this.ctx,p=this.worldToScreen(r.x,r.y);if(p.x<-60||p.x>this.canvas.width+60||p.y<-60||p.y>this.canvas.height+60)return;if(r.path.length>1){c.save();c.strokeStyle=r.state==="ARRIVED"?"rgba(74,222,128,.48)":"rgba(66,232,255,.5)";c.lineWidth=2;c.beginPath();r.path.forEach((q,i)=>{const s=this.worldToScreen(q.x,q.y);i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y)});c.stroke();c.restore()}if(r.state==="ARRIVED")return;const ang=Number.isFinite(r.heading)?r.heading:0;c.save();c.translate(p.x,p.y);c.rotate(ang);c.shadowBlur=14;c.shadowColor="#42e8ff";c.fillStyle="#42e8ff";c.beginPath();c.moveTo(16,0);c.lineTo(-9,-7);c.lineTo(-5,0);c.lineTo(-9,7);c.closePath();c.fill();c.fillStyle="#f8fafc";c.beginPath();c.moveTo(10,0);c.lineTo(-5,-4);c.lineTo(-2,4);c.closePath();c.fill();c.fillStyle="#ffb703";c.beginPath();c.moveTo(-8,0);c.lineTo(-16,-3);c.lineTo(-13,0);c.lineTo(-16,3);c.closePath();c.fill();c.restore()}

drawShuttles(){
 const c=this.ctx;
 for(const s of this.shuttles){
  if(s.path.length>1){c.save();c.strokeStyle="rgba(66,232,255,.25)";c.lineWidth=1.5;c.beginPath();s.path.forEach((q,i)=>{const p=this.worldToScreen(q.x,q.y);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)});c.stroke();c.restore();}
  const p=this.worldToScreen(s.x,s.y);if(p.x<-60||p.x>this.canvas.width+60||p.y<-60||p.y>this.canvas.height+60)continue;
  const route=this.getRoute(s.routeId),from=this.getBody(this.routeOrigin(route,s.direction)),to=this.getBody(this.routeEndpoint(route,s.direction));
  const a=Math.atan2(to.y-from.y,to.x-from.x);
  c.save();c.translate(p.x,p.y);c.rotate(a);c.shadowBlur=16;c.shadowColor="#42e8ff";
  c.fillStyle="#42e8ff";c.beginPath();c.moveTo(14,0);c.lineTo(-8,-6);c.lineTo(-5,0);c.lineTo(-8,6);c.closePath();c.fill();
  c.fillStyle="#f8fafc";c.beginPath();c.moveTo(9,0);c.lineTo(-5,-4);c.lineTo(-3,4);c.closePath();c.fill();c.restore();
 }
}

handleClick(x,y){
 if(this.justPanned){this.justPanned=false;return null}
 const p=this.screenToWorld(x,y);
 const hits=this.bodies.map(b=>({b,d:Math.hypot(p.x-b.x,p.y-b.y),hitRadius:Math.max(18/Math.max(this.camera.zoom,.0005),b.radius+12)}))
  .filter(v=>v.d<v.hitRadius).sort((a,b)=>a.d-b.d);
 if(hits[0]){this.selected=hits[0].b;return hits[0].b}
 return null;
}
}