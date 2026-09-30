class SpaceSimulation{
constructor(canvas,player){
this.canvas=canvas;this.ctx=canvas.getContext("2d");this.player=player;this.time=0;this.last=performance.now();this.selected=null;this.rockets=[];this.stars=[];this.camera={x:0,y:0,zoom:1};
this.bodies=[
{id:"sun",name:"Soleil",type:"star",x:0,y:0,mass:120000,radius:14,color:"#ffd166"},
{id:"earth",name:"Terre",type:"planet",x:150,y:0,mass:1,radius:5,color:"#4cc9f0",base:true},
{id:"moon",name:"Lune",type:"moon",x:153.8,y:0,mass:.012,radius:2,color:"#cbd5e1"},
{id:"mars",name:"Mars",type:"planet",x:228,y:0,mass:.8,radius:4.3,color:"#ef8354",base:true},
{id:"jupiter",name:"Jupiter",type:"planet",x:390,y:0,mass:317,radius:9,color:"#d6a36a",base:true}];
this.bodies.forEach(b=>{b.vx=0;b.vy=0});
this.bodies[1].vy=Math.sqrt(this.G(this.bodies[0],this.bodies[1])/this.bodies[1].x);
this.bodies[2].vy=this.bodies[1].vy+Math.sqrt(this.G(this.bodies[1],this.bodies[2])/3.8);
this.bodies[3].vy=Math.sqrt(this.G(this.bodies[0],this.bodies[3])/this.bodies[3].x);
this.bodies[4].vy=Math.sqrt(this.G(this.bodies[0],this.bodies[4])/this.bodies[4].x);
this.resize();addEventListener("resize",()=>this.resize());this.makeStars();requestAnimationFrame(this.frame.bind(this));
}
G(a,b){return CONFIG.GRAVITY_SCALE*a.mass*b.mass}
resize(){this.canvas.width=Math.max(1,this.canvas.clientWidth);this.canvas.height=Math.max(1,this.canvas.clientHeight)}
makeStars(){for(let i=0;i<180;i++)this.stars.push({x:Math.random()*2-1,y:Math.random()*2-1,r:Math.random()*1.5+.2,a:Math.random()*.7+.25})}
tech(id){return this.player.technologies[id]||0}
maxRockets(){return CONFIG.BASE_MAX_ACTIVE_ROCKETS+this.tech("fleet")}
speedMultiplier(){return 1+this.tech("speed")*.1}
navigationStrength(){return .0025*(1+this.tech("navigation")*.08)}
launch(originId,destinationId,angle){
if(this.rockets.filter(r=>r.active).length>=this.maxRockets())return{ok:false,message:"Limite de fusées atteinte."};
if(originId===destinationId)return{ok:false,message:"Choisis une destination différente."};
const o=this.bodies.find(b=>b.id===originId),d=this.bodies.find(b=>b.id===destinationId);if(!o||!d)return{ok:false,message:"Destination invalide."};
const a=angle*Math.PI/180,dx=d.x-o.x,dy=d.y-o.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux,base=CONFIG.ROCKET_SPEED_BASE*this.speedMultiplier();
const r={id:String(Date.now()+Math.random()),origin:originId,destination:destinationId,x:o.x+ux*(o.radius+2),y:o.y+uy*(o.radius+2),vx:o.vx+ux*base*Math.cos(a)+nx*base*Math.sin(a),vy:o.vy+uy*base*Math.cos(a)+ny*base*Math.sin(a),fuel:100,path:[],distance:0,age:0,active:true};
this.rockets.push(r);this.selected=r;this.player.missions=(this.player.missions||0)+1;return{ok:true,rocket:r};
}
physics(dt){
const bodies=this.bodies;
for(const b of bodies){let ax=0,ay=0;for(const o of bodies){if(o===b)continue;const dx=o.x-b.x,dy=o.y-b.y,d2=dx*dx+dy*dy+CONFIG.SOFTENING,d=Math.sqrt(d2),f=CONFIG.GRAVITY_SCALE*o.mass/d2;ax+=f*dx/d;ay+=f*dy/d}b.vx+=ax*dt;b.vy+=ay*dt;b.x+=b.vx*dt;b.y+=b.vy*dt}
for(const r of this.rockets){if(!r.active)continue;const target=bodies.find(b=>b.id===r.destination);if(!target)continue;let ax=0,ay=0;
for(const b of bodies){const dx=b.x-r.x,dy=b.y-r.y,d2=dx*dx+dy*dy+CONFIG.SOFTENING,d=Math.sqrt(d2),f=CONFIG.GRAVITY_SCALE*b.mass/d2;ax+=f*dx/d;ay+=f*dy/d}
const dx=target.x-r.x,dy=target.y-r.y,d=Math.hypot(dx,dy)||1,steer=this.navigationStrength();ax+=dx/d*steer;ay+=dy/d*steer;
const maxSpeed=CONFIG.ROCKET_SPEED_BASE*this.speedMultiplier(),current=Math.hypot(r.vx,r.vy)||1;
if(current<maxSpeed){r.vx+=ax*dt;r.vy+=ay*dt}else{r.vx+=ax*dt*.35;r.vy+=ay*dt*.35;const s=Math.hypot(r.vx,r.vy);r.vx=r.vx/s*maxSpeed;r.vy=r.vy/s*maxSpeed}
r.x+=r.vx*dt;r.y+=r.vy*dt;r.age+=dt;r.distance+=Math.hypot(r.vx,r.vy)*dt;r.fuel-=dt*(.02/(1+this.tech("fuel")*.1));r.path.push({x:r.x,y:r.y});if(r.path.length>260)r.path.shift();
if(d<CONFIG.ARRIVAL_DISTANCE+target.radius){r.active=false;r.arrived=true;r.x=target.x;r.y=target.y;Economy.addNova(this.player,Math.max(1,Math.round(r.distance)));this.player.totalDistance=(this.player.totalDistance||0)+r.distance}
if(r.fuel<=0){r.active=false;r.failed=true}}
}
update(dt){const simDt=dt*CONFIG.SIMULATION_SPEED,steps=Math.min(8,Math.max(1,Math.ceil(simDt/120)));for(let i=0;i<steps;i++)this.physics(simDt/steps/60);this.time+=simDt}
frame(now){const dt=Math.min(.05,(now-this.last)/1000);this.last=now;this.update(dt);this.draw(now);requestAnimationFrame(this.frame.bind(this))}
worldToScreen(x,y){return{x:this.canvas.width/2+(x-this.camera.x)*this.camera.zoom,y:this.canvas.height/2+(y-this.camera.y)*this.camera.zoom}}
screenToWorld(x,y){return{x:(x-this.canvas.width/2)/this.camera.zoom+this.camera.x,y:(y-this.canvas.height/2)/this.camera.zoom+this.camera.y}}
draw(now){
const c=this.ctx,w=this.canvas.width,h=this.canvas.height,g=c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.7);g.addColorStop(0,"#0a1530");g.addColorStop(.5,"#030817");g.addColorStop(1,"#010208");c.fillStyle=g;c.fillRect(0,0,w,h);
for(const s of this.stars){c.globalAlpha=s.a*(.7+.3*Math.sin(now*.001+s.x*9));c.fillStyle="#dff7ff";c.beginPath();c.arc((s.x+.5)*w,(s.y+.5)*h,s.r,0,Math.PI*2);c.fill()}c.globalAlpha=1;
const focus=this.selected&&this.selected.active?this.selected:this.bodies[0];if(focus){this.camera.x+=(focus.x-this.camera.x)*.035;this.camera.y+=(focus.y-this.camera.y)*.035}
this.drawOrbits();for(const b of this.bodies)this.drawBody(b);for(const r of this.rockets)this.drawRocket(r)
}
drawOrbits(){const c=this.ctx,s=this.worldToScreen(0,0);for(const b of this.bodies.filter(x=>x.id!=="sun")){const rad=Math.max(12,Math.abs(b.x-this.bodies[0].x)*this.camera.zoom);c.strokeStyle="rgba(148,163,184,.09)";c.beginPath();c.ellipse(s.x,s.y,rad,rad*.72,0,0,Math.PI*2);c.stroke()}}
drawBody(b){const c=this.ctx,p=this.worldToScreen(b.x,b.y),r=Math.max(2,b.radius*this.camera.zoom);if(p.x<-80||p.x>this.canvas.width+80||p.y<-80||p.y>this.canvas.height+80)return;c.save();c.shadowBlur=r*1.7;c.shadowColor=b.color;
if(b.type==="star"){const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r*4);g.addColorStop(0,"rgba(255,244,180,.9)");g.addColorStop(.35,"rgba(255,177,70,.35)");g.addColorStop(1,"rgba(255,150,40,0)");c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,r*4,0,Math.PI*2);c.fill();c.fillStyle="#fff1a8";c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill()}else{const g=c.createRadialGradient(p.x-r*.3,p.y-r*.4,1,p.x,p.y,r);g.addColorStop(0,"#fff");g.addColorStop(.15,b.color);g.addColorStop(1,"#111827");c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();if(b.base){c.strokeStyle="rgba(66,232,255,.55)";c.beginPath();c.arc(p.x,p.y,r+4,0,Math.PI*2);c.stroke()}}c.restore();c.fillStyle="#cbd5e1";c.font="10px Segoe UI";c.textAlign="center";c.fillText(b.name,p.x,p.y+r+14)}
drawRocket(r){const c=this.ctx,p=this.worldToScreen(r.x,r.y),a=Math.atan2(r.vy,r.vx);c.save();c.translate(p.x,p.y);c.rotate(a);c.shadowBlur=14;c.shadowColor="#42e8ff";c.fillStyle="#42e8ff";c.beginPath();c.moveTo(-11,0);c.lineTo(-23,-4);c.lineTo(-18,0);c.lineTo(-23,4);c.closePath();c.fill();c.fillStyle="#f8fafc";c.beginPath();c.moveTo(9,0);c.lineTo(-7,-5);c.lineTo(-5,5);c.closePath();c.fill();c.fillStyle="#42e8ff";c.beginPath();c.arc(1,0,2.3,0,Math.PI*2);c.fill();c.restore();if(r.path.length>2){c.save();c.strokeStyle="rgba(66,232,255,.32)";c.lineWidth=1.2;c.beginPath();r.path.forEach((q,i)=>{const s=this.worldToScreen(q.x,q.y);if(i)c.lineTo(s.x,s.y);else c.moveTo(s.x,s.y)});c.stroke();c.restore()}}
handleClick(x,y){const p=this.screenToWorld(x,y),hits=this.bodies.map(b=>({b,d:Math.hypot(p.x-b.x,p.y-b.y)})).filter(x=>x.d<Math.max(8,x.b.radius+5)).sort((a,b)=>a.d-b.d);if(hits[0]){this.selected=hits[0].b;return hits[0].b}return null}
}