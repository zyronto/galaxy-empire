const ROCKET_CATALOG = {
    explorer: {
        id: "explorer",
        name: "EXPLORER",
        icon: "🚀",
        unlockCost: 0,
        speed: 1.00,
        acceleration: 1.00,
        hull: 1,
        maneuver: 1.00,
        creditBonus: 1.00,
        novaBase: 0.000000001200,
        description: "Prototype fiable. Idéal pour apprendre le vide."
    },

    titan: {
        id: "titan",
        name: "TITAN",
        icon: "🛰️",
        unlockCost: 1500,
        speed: 1.08,
        acceleration: 1.05,
        hull: 2,
        maneuver: 0.98,
        creditBonus: 1.08,
        novaBase: 0.000000002400,
        description: "Coque renforcée, un peu moins vive."
    },

    orion: {
        id: "orion",
        name: "ORION",
        icon: "✨",
        unlockCost: 4000,
        speed: 1.16,
        acceleration: 1.12,
        hull: 2,
        maneuver: 1.10,
        creditBonus: 1.16,
        novaBase: 0.000000004800,
        description: "Chasseur d'étoiles, bon équilibre vitesse / contrôle."
    },

    nova: {
        id: "nova",
        name: "NOVA",
        icon: "💫",
        unlockCost: 10000,
        speed: 1.24,
        acceleration: 1.18,
        hull: 3,
        maneuver: 1.14,
        creditBonus: 1.24,
        novaBase: 0.000000009000,
        description: "Collecteur de flux. Bonus économique marqué."
    },

    quantum: {
        id: "quantum",
        name: "QUANTUM",
        icon: "⚛️",
        unlockCost: 25000,
        speed: 1.34,
        acceleration: 1.28,
        hull: 3,
        maneuver: 1.22,
        creditBonus: 1.32,
        novaBase: 0.000000016000,
        description: "Sauts de phase : accélération élevée."
    },

    galaxy: {
        id: "galaxy",
        name: "GALAXY",
        icon: "🌌",
        unlockCost: 60000,
        speed: 1.46,
        acceleration: 1.36,
        hull: 4,
        maneuver: 1.28,
        creditBonus: 1.42,
        novaBase: 0.000000028000,
        description: "Croiseur de secteur. Endurant et rentable."
    },

    infinity: {
        id: "infinity",
        name: "INFINITY",
        icon: "♾️",
        unlockCost: 150000,
        speed: 1.60,
        acceleration: 1.48,
        hull: 5,
        maneuver: 1.36,
        creditBonus: 1.55,
        novaBase: 0.000000048000,
        description: "Vaisseau-amiral. Meilleures statistiques du hangar."
    }
};


const ROCKET_ORDER = [
    "explorer",
    "titan",
    "orion",
    "nova",
    "quantum",
    "galaxy",
    "infinity"
];


function getRocket(rocketId) {
    return ROCKET_CATALOG[rocketId] || ROCKET_CATALOG.explorer;
}
