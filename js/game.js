class SpaceSimulation{
constructor(canvas,player){
 this.canvas=canvas;this.ctx=canvas.getContext("2d");this.player=player;
 this.time=0;this.last=performance.now();this.selected=null;this.rockets=[];this.stars=[];
 this.camera={x:149598,y:0,zoom:0.5};this.justPanned=false;
 this.focusedBodyId=null;
 this.aimOriginId="earth";this.aimAngle=0;this.launchMode="sandbox";

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
maxRockets(){return CONFIG.BASE_MAX_ACTIVE_ROCKETS+this.tech("fleet")}
speedMultiplier(){return 1+this.tech("speed")*.12}
fuelMultiplier(){return 1/(1+this.tech("fuel")*.1)}

resize(){this.canvas.width=Math.max(1,this.canvas.clientWidth);this.canvas.height=Math.max(1,this.canvas.clientHeight)}
makeStars(){for(let i=0;i<240;i++)this.stars.push({x:Math.random(),y:Math.random(),r:.3+Math.random()*1.3,a:.2+Math.random()*.65})}

setAimAngle(v){this.aimAngle=Math.max(-180,Math.min(180,Number(v)||0))}
setAimOrigin(id){if(this.bodies.some(b=>b.id===id&&b.base))this.aimOriginId=id}

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

launch(originId,angle){
 const active=this.rockets.filter(r=>r.active).length;
 if(active>=this.maxRockets())return{ok:false,message:"Toutes les places de la flotte sont occupées."};

 const o=this.getBody(originId);
 if(!o||!o.base)return{ok:false,message:"Planète de départ invalide."};

 const safeAngle=Math.max(-180,Math.min(180,Number(angle)||0));

 // Convention unique de lancement : angle absolu dans le plan de l'écran.
 // 0° = droite, +90° = haut, -90° = bas, ±180° = gauche.
 // Le même vecteur définit le point de surface ET la direction initiale.
 // On n'ajoute volontairement PAS la vitesse orbitale de la planète :
 // sinon la fusée ne partirait plus dans l'angle demandé.
 const a=safeAngle*Math.PI/180;
 const dirX=Math.cos(a);
 const dirY=-Math.sin(a);

 const spawnRadius=o.radius+0.8;
 const rocket=getRocket(this.player.currentRocket);
 const speed=CONFIG.ROCKET_SPEED_BASE*rocket.speed*this.speedMultiplier();
 const r={
  id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),
  origin:o.id,destination:null,
  launchAngle:safeAngle,
  launchDirectionX:dirX,
  launchDirectionY:dirY,
  heading:Math.atan2(dirY,dirX),
  x:o.x+dirX*spawnRadius,
  y:o.y+dirY*spawnRadius,
  vx:dirX*speed,
  vy:dirY*speed,
  fuel:CONFIG.ROCKET_FUEL_START,distance:0,age:0,path:[],active:true,arrived:false,failed:false,
  closestBody:null,closestDistance:Infinity,slingshots:0,
  state:"FLIGHT",orbitingBody:null,orbitAngle:0,orbitRadius:0,orbitTurns:0,
  landingProgress:0,landingBody:null
 };
 r.path.push({x:r.x,y:r.y});
 this.rockets.push(r);
 this.selected=r;
 this.player.missions=(this.player.missions||0)+1;
 return{ok:true,rocket:r}
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
 for(const r of this.rockets)if(r.active)this.updateRocket(r,simDt);
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
 for(const b of this.bodies)this.drawBody(b);
 this.drawSystemCenter();
  this.drawAimArrow();
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
 const c=this.ctx,p=this.worldToScreen(b.x,b.y),r=Math.max(2,b.radius*this.camera.zoom);
 if(p.x<-80||p.x>this.canvas.width+80||p.y<-80||p.y>this.canvas.height+80)return;

 c.save();c.shadowBlur=r*2;c.shadowColor=b.color;
 if(b.type==="star"){
  const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r*5);
  glow.addColorStop(0,"rgba(255,244,180,.95)");
  glow.addColorStop(.35,"rgba(255,177,70,.35)");
  glow.addColorStop(1,"rgba(255,150,40,0)");
  c.fillStyle=glow;c.beginPath();c.arc(p.x,p.y,r*5,0,Math.PI*2);c.fill();
  c.fillStyle="#fff1a8";c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();
 }else{
  const g=c.createRadialGradient(p.x-r*.35,p.y-r*.4,1,p.x,p.y,r);
  g.addColorStop(0,"#fff");g.addColorStop(.18,b.color);g.addColorStop(1,"#111827");
  c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();
  if(b.base){
   c.shadowBlur=0;c.strokeStyle="rgba(66,232,255,.7)";c.lineWidth=1.5;
   c.beginPath();c.arc(p.x,p.y,r+4,0,Math.PI*2);c.stroke();
  }
 }
 c.restore();

 c.fillStyle="#dbeafe";c.font="10px Segoe UI";c.textAlign="center";
 c.fillText(b.name,p.x,p.y+r+16);
}

drawRocket(r){
 if(r.state==="DISAPPEARED")return;
 const c=this.ctx,p=this.worldToScreen(r.x,r.y);
 const a=r.age<0.25&&Number.isFinite(r.heading)?r.heading:Math.atan2(r.vy,r.vx);
 if(p.x<-50||p.x>this.canvas.width+50||p.y<-50||p.y>this.canvas.height+50)return;

 if(r.path.length>1){
  c.save();c.strokeStyle=r.failed?"rgba(239,68,68,.35)":"rgba(66,232,255,.3)";
  c.lineWidth=1.5;c.beginPath();
  r.path.forEach((q,i)=>{const s=this.worldToScreen(q.x,q.y);i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y)});
  c.stroke();c.restore();
 }

 c.save();c.translate(p.x,p.y);c.rotate(a);c.shadowBlur=12;c.shadowColor="#42e8ff";
 c.fillStyle="#42e8ff";c.beginPath();c.moveTo(-18,0);c.lineTo(-28,-4);c.lineTo(-21,0);c.lineTo(-28,4);c.closePath();c.fill();
 c.fillStyle="#f8fafc";c.beginPath();c.moveTo(10,0);c.lineTo(-7,-5);c.lineTo(-5,5);c.closePath();c.fill();
 c.fillStyle="#42e8ff";c.beginPath();c.arc(1,0,2.5,0,Math.PI*2);c.fill();c.restore();
}


drawAimArrow(){
 const o=this.getBody(this.aimOriginId);if(!o)return;
 const a=Number(this.aimAngle)*Math.PI/180;
 const dirX=Math.cos(a);
 const dirY=-Math.sin(a);
 const surfaceX=o.x+dirX*(o.radius+0.2);
 const surfaceY=o.y+dirY*(o.radius+0.2);
 const p=this.worldToScreen(surfaceX,surfaceY);
 const len=Math.max(55,Math.min(145,85*this.camera.zoom));
 const ex=p.x+dirX*len,ey=p.y+dirY*len,c=this.ctx;

 c.save();c.strokeStyle="#42e8ff";c.fillStyle="#42e8ff";c.shadowColor="#42e8ff";
 c.shadowBlur=10;c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(ex,ey);c.stroke();
 c.shadowBlur=0;
 const px=-dirY,py=dirX,head=12,half=5;
 c.beginPath();c.moveTo(ex,ey);
 c.lineTo(ex-dirX*head+px*half,ey-dirY*head+py*half);
 c.lineTo(ex-dirX*head-px*half,ey-dirY*head-py*half);
 c.closePath();c.fill();
 c.fillStyle="#e8fbff";c.font="bold 12px Segoe UI";c.textAlign="left";
 c.fillText("ANGLE "+(this.aimAngle>=0?"+":"")+this.aimAngle+"°",ex+12,ey-7);
 c.fillStyle="rgba(66,232,255,.7)";c.font="9px Segoe UI";
 c.fillText("0° → · +90° ↑ · −90° ↓ · ±180° ←",ex+12,ey+8);c.restore();
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