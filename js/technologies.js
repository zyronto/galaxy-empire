const TECHNOLOGIES={
 speed:{id:"speed",name:"PROPULSION",icon:"⚡",description:"Réduit le temps de trajet des navettes de 12 % par niveau.",baseCost:100,costMultiplier:1.55,maxLevel:10,effectPerLevel:.12},
 fleet:{id:"fleet",name:"RENDEMENT",icon:"🛰️",description:"Augmente la production de NOVA du réseau de 5 % par niveau.",baseCost:250,costMultiplier:1.7,maxLevel:8,effectPerLevel:.05},
 navigation:{id:"navigation",name:"NAVIGATION",icon:"🧭",description:"Optimise les trajectoires et augmente la production de 10 % par niveau.",baseCost:400,costMultiplier:1.65,maxLevel:10,effectPerLevel:.1},
 fuel:{id:"fuel",name:"AUTONOMIE",icon:"⛽",description:"Améliore l'efficacité opérationnelle et augmente la production de 5 % par niveau.",baseCost:300,costMultiplier:1.6,maxLevel:10,effectPerLevel:.05}
};
const TECHNOLOGY_ORDER=["speed","fleet","navigation","fuel"];
function getTechnology(id){return TECHNOLOGIES[id]||null}
function getTechnologyCost(id,level){const t=getTechnology(id);if(!t||level>=t.maxLevel)return Infinity;return Math.floor(t.baseCost*Math.pow(t.costMultiplier,level))}
function getTechnologyEffect(id,level){const t=getTechnology(id);return t?level*t.effectPerLevel:0}