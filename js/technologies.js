const TECHNOLOGIES = {
    engine: {
        id: "engine",
        name: "MOTEUR",
        icon: "🔥",
        description: "Augmente l'accélération de toutes les fusées.",
        baseCost: 250,
        costMultiplier: 1.45,
        maxLevel: 50,
        effectPerLevel: 0.025
    },

    propulsion: {
        id: "propulsion",
        name: "PROPULSION",
        icon: "⚡",
        description: "Augmente la vitesse maximale.",
        baseCost: 350,
        costMultiplier: 1.48,
        maxLevel: 50,
        effectPerLevel: 0.02
    },

    shield: {
        id: "shield",
        name: "BOUCLIER",
        icon: "🛡️",
        description: "Augmente la résistance aux collisions.",
        baseCost: 500,
        costMultiplier: 1.50,
        maxLevel: 50,
        effectPerLevel: 1
    },

    maneuver: {
        id: "maneuver",
        name: "MANŒUVRE",
        icon: "🎯",
        description: "Améliore la précision et la maniabilité.",
        baseCost: 300,
        costMultiplier: 1.46,
        maxLevel: 50,
        effectPerLevel: 0.025
    },

    collector: {
        id: "collector",
        name: "COLLECTEUR",
        icon: "💰",
        description: "Augmente les crédits gagnés pendant les voyages.",
        baseCost: 450,
        costMultiplier: 1.50,
        maxLevel: 50,
        effectPerLevel: 0.03
    },

    novaTech: {
        id: "novaTech",
        name: "NOVA TECH",
        icon: "✦",
        description: "Augmente progressivement la production de NOVA/s.",
        baseCost: 750,
        costMultiplier: 1.55,
        maxLevel: 50,
        effectPerLevel: 0.035
    }
};


const TECHNOLOGY_ORDER = [
    "engine",
    "propulsion",
    "shield",
    "maneuver",
    "collector",
    "novaTech"
];


function getTechnology(technologyId) {
    return TECHNOLOGIES[technologyId] || null;
}


function getTechnologyCost(technologyId, level) {
    const technology = getTechnology(technologyId);

    if (!technology) {
        return Infinity;
    }

    if (level >= technology.maxLevel) {
        return Infinity;
    }

    return Math.floor(
        technology.baseCost *
        Math.pow(technology.costMultiplier, level)
    );
}


function getTechnologyEffect(technologyId, level) {
    const technology = getTechnology(technologyId);

    if (!technology || level <= 0) {
        return 0;
    }

    return technology.effectPerLevel * level;
}
