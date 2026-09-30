const ROCKET_CATALOG={
 explorer:{id:"explorer",name:"EXPLORER",icon:"🚀",unlockCost:0,speed:1,acceleration:1,hull:1,novaBonus:1,novaPerMinute:.5,description:"Fusée de départ polyvalente."},
 titan:{id:"titan",name:"TITAN",icon:"🛰️",unlockCost:1000,speed:1.18,acceleration:1.1,hull:2,novaBonus:1.1,novaPerMinute:1,description:"Coque renforcée et moteur plus puissant."},
 orion:{id:"orion",name:"ORION",icon:"✨",unlockCost:2500,speed:1.38,acceleration:1.22,hull:2,novaBonus:1.25,novaPerMinute:2,description:"Vaisseau rapide pour les voyages lointains."},
 nova:{id:"nova",name:"NOVA",icon:"💫",unlockCost:6000,speed:1.62,acceleration:1.35,hull:3,novaBonus:1.45,novaPerMinute:4,description:"Propulsion avancée et forte production."},
 quantum:{id:"quantum",name:"QUANTUM",icon:"⚛️",unlockCost:12000,speed:1.9,acceleration:1.5,hull:3,novaBonus:1.7,novaPerMinute:7,description:"Technologie de propulsion de nouvelle génération."},
 galaxy:{id:"galaxy",name:"GALAXY",icon:"🌌",unlockCost:25000,speed:2.25,acceleration:1.7,hull:4,novaBonus:2,novaPerMinute:12,description:"Croiseur interplanétaire."},
 infinity:{id:"infinity",name:"INFINITY",icon:"♾️",unlockCost:50000,speed:2.7,acceleration:2,hull:5,novaBonus:2.4,novaPerMinute:20,description:"Fusée ultime pour les systèmes complexes."}
};
function getRocket(id){return ROCKET_CATALOG[id]||ROCKET_CATALOG.explorer}