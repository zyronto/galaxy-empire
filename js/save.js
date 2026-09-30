const SAVE_KEY="galaxy_empire_v3_save";
const SaveSystem={
 createDefaultPlayer(){return{version:CONFIG.VERSION,nova:CONFIG.STARTING_NOVA,currentRocket:CONFIG.STARTING_ROCKET,unlockedRockets:["explorer"],technologies:{speed:0,fleet:0,navigation:0,fuel:0,gravity:0},totalDistance:0,missions:0,lastSaveTime:Date.now()}},
 load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return this.createDefaultPlayer();const s=JSON.parse(raw),d=this.createDefaultPlayer();return{...d,...s,nova:Number.isFinite(s.nova)?s.nova:d.nova,technologies:{...d.technologies,...(s.technologies||{})},unlockedRockets:Array.isArray(s.unlockedRockets)?s.unlockedRockets:d.unlockedRockets}}catch(e){console.error(e);return this.createDefaultPlayer()}},
 save(p){try{p.lastSaveTime=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(p));return true}catch(e){console.error(e);return false}},
 reset(){localStorage.removeItem(SAVE_KEY);return this.createDefaultPlayer()}
};