const TECHNOLOGIES={
 speed:{id:"speed",name:"PROPULSION",icon:"⚡",description:"Augmente la vitesse maximale des fusées de 12 % par niveau.",baseCost:100,costMultiplier:1.55,maxLevel:10,effectPerLevel:.12},
 fleet:{id:"fleet",name:"FLOTTE",icon:"🛰️",description:"Ajoute une fusée active supplémentaire par niveau.",baseCost:250,costMultiplier:1.7,maxLevel:8,effectPerLevel:1},
 navigation:{id:"navigation",name:"NAVIGATION",icon:"🧭",description:"Renforce le pilote automatique et les corrections de trajectoire.",baseCost:400,costMultiplier:1.65,maxLevel:10,effectPerLevel:.1},
 fuel:{id:"fuel",name:"AUTONOMIE",icon:"⛽",description:"Réduit la consommation de carburant pendant les voyages.",baseCost:300,costMultiplier:1.6,maxLevel:10,effectPerLevel:.1}
};
const TECHNOLOGY_ORDER=["speed","fleet","navigation","fuel"];
function getTechnology(id){return TECHNOLOGIES[id]||null}
function getTechnologyCost(id,level){const t=getTechnology(id);if(!t||level>=t.maxLevel)return Infinity;return Math.floor(t.baseCost*Math.pow(t.costMultiplier,level))}
function getTechnologyEffect(id,level){const t=getTechnology(id);return t?level*t.effectPerLevel:0}