const TECHNOLOGIES = {
    engine: {
        id: "engine",
        name: "MOTEUR",
        icon: "🔥",
        description: "Augmente l'accélération de toutes les fusées.",
        baseCost: 100,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 0.05
    },

    propulsion: {
        id: "propulsion",
        name: "PROPULSION",
        icon: "⚡",
        description: "Augmente la vitesse maximale.",
        baseCost: 150,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 0.05
    },

    shield: {
        id: "shield",
        name: "BOUCLIER",
        icon: "🛡️",
        description: "Augmente la résistance aux collisions.",
        baseCost: 200,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 1
    },

    maneuver: {
        id: "maneuver",
        name: "MANŒUVRE",
        icon: "🎯",
        description: "Améliore la précision et la maniabilité.",
        baseCost: 125,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 0.05
    },

    collector: {
        id: "collector",
        name: "COLLECTEUR",
        icon: "✦",
        description: "Augmente les NOVA gagnées par kilomètre.",
        baseCost: 175,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 0.06
    },

    novaTech: {
        id: "novaTech",
        name: "NOVA TECH",
        icon: "✦",
        description: "Augmente la production passive de NOVA/minute.",
        baseCost: 250,
        costMultiplier: 1.22,
        maxLevel: 50,
        effectPerLevel: 0.07
    },
    risk: {
        id: "risk",
        name: "RISQUE",
        icon: "⚡",
        description: "Débloque des multiplicateurs de risque temporaires.",
        baseCost: 100,
        costMultiplier: 1,
        maxLevel: 8,
        effectPerLevel: 0
    }
};


const TECHNOLOGY_ORDER = [
    "engine",
    "propulsion",
    "shield",
    "maneuver",
    "collector",
    "novaTech",
    "risk"
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

    if (technologyId === "risk") {
        return [100, 200, 300, 400, 500, 600, 750, 1000][level];
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


function getTechnologyMultiplier(technologyId, level) {
    return 1 + getTechnologyEffect(
        technologyId,
        level
    );
}


function getRiskConfig(level) {
    const configs = [
        { multiplier: 1.5, duration: 60, cooldown: 60 },
        { multiplier: 2, duration: 50, cooldown: 75 },
        { multiplier: 2.5, duration: 45, cooldown: 90 },
        { multiplier: 3, duration: 40, cooldown: 105 },
        { multiplier: 3.5, duration: 35, cooldown: 120 },
        { multiplier: 4, duration: 30, cooldown: 135 },
        { multiplier: 4.5, duration: 25, cooldown: 150 },
        { multiplier: 5, duration: 20, cooldown: 180 }
    ];
    return configs[level - 1] || null;
}

function getTechnologyDisplayText(technologyId, level) {
    if (technologyId === "risk") {
        if (level <= 0) return "Aucun risque débloqué";
        const risk = getRiskConfig(level);
        return "Niveau " + level + " → ×" + risk.multiplier + " · " +
            risk.duration + " s d'utilisation · " +
            risk.cooldown + " s de recharge";
    }

    const multiplier =
        getTechnologyMultiplier(
            technologyId,
            level
        );

    if (technologyId === "shield") {
        return `Niveau ${level} → +${level} coque`;
    }

    const labels = {
        engine: "accélération",
        propulsion: "vitesse max",
        maneuver: "maniabilité",
        collector: "NOVA/km",
        novaTech: "NOVA/min"
    };

    const label =
        labels[technologyId] || "bonus";

    return `Niveau ${level} → ×${multiplier.toFixed(2).replace(".", ",")} ${label}`;
}
