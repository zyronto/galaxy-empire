const TECHNOLOGIES={
 speed:{id:"speed",name:"PROPULSION",icon:"⚡",description:"Augmente la vitesse de toutes les fusées.",baseCost:100,costMultiplier:1.55,maxLevel:20,effectPerLevel:.1},
 fleet:{id:"fleet",name:"FLOTTE ACTIVE",icon:"🛰️",description:"Augmente le nombre de fusées pouvant voyager simultanément.",baseCost:250,costMultiplier:1.65,maxLevel:8,effectPerLevel:1},
 navigation:{id:"navigation",name:"NAVIGATION",icon:"🧭",description:"Améliore les corrections automatiques de trajectoire.",baseCost:400,costMultiplier:1.7,maxLevel:10,effectPerLevel:.08},
 fuel:{id:"fuel",name:"RÉSERVOIR",icon:"⛽",description:"Augmente l'autonomie disponible pendant un voyage.",baseCost:300,costMultiplier:1.6,maxLevel:10,effectPerLevel:.1},
 gravity:{id:"gravity",name:"DYNAMIQUE GRAVITATIONNELLE",icon:"🌀",description:"Améliore les manœuvres autour des corps célestes.",baseCost:800,costMultiplier:1.8,maxLevel:10,effectPerLevel:.08}
};
const TECHNOLOGY_ORDER=["speed","fleet","navigation","fuel","gravity"];
function getTechnology(id){return TECHNOLOGIES[id]||null}
function getTechnologyCost(id,level){const t=getTechnology(id);if(!t||level>=t.maxLevel)return Infinity;return Math.floor(t.baseCost*Math.pow(t.costMultiplier,level))}
function getTechnologyEffect(id,level){const t=getTechnology(id);return t?level*t.effectPerLevel:0}