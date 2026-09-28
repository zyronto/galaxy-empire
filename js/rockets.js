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
        novaBonus: 1.00,
        novaPerMinute: 0.5,
        description: "Prototype fiable. Idéal pour apprendre le vide."
    },

    titan: {
        id: "titan",
        name: "TITAN",
        icon: "🛰️",
        unlockCost: 1000,
        speed: 1.15,
        acceleration: 1.10,
        hull: 2,
        maneuver: 1.08,
        novaBonus: 1.15,
        novaPerMinute: 1,
        description: "Coque renforcée et meilleures performances."
    },

    orion: {
        id: "orion",
        name: "ORION",
        icon: "✨",
        unlockCost: 2500,
        speed: 1.30,
        acceleration: 1.22,
        hull: 2,
        maneuver: 1.18,
        novaBonus: 1.30,
        novaPerMinute: 2,
        description: "Chasseur d'étoiles, bon équilibre vitesse / contrôle."
    },

    nova: {
        id: "nova",
        name: "NOVA",
        icon: "💫",
        unlockCost: 6000,
        speed: 1.45,
        acceleration: 1.35,
        hull: 3,
        maneuver: 1.28,
        novaBonus: 1.45,
        novaPerMinute: 4,
        description: "Collecteur de flux. Bonus économique marqué."
    },

    quantum: {
        id: "quantum",
        name: "QUANTUM",
        icon: "⚛️",
        unlockCost: 12000,
        speed: 1.62,
        acceleration: 1.50,
        hull: 3,
        maneuver: 1.40,
        novaBonus: 1.65,
        novaPerMinute: 7,
        description: "Sauts de phase : accélération élevée."
    },

    galaxy: {
        id: "galaxy",
        name: "GALAXY",
        icon: "🌌",
        unlockCost: 25000,
        speed: 1.82,
        acceleration: 1.65,
        hull: 4,
        maneuver: 1.55,
        novaBonus: 1.90,
        novaPerMinute: 12,
        description: "Croiseur de secteur. Endurant et rentable."
    },

    infinity: {
        id: "infinity",
        name: "INFINITY",
        icon: "♾️",
        unlockCost: 50000,
        speed: 2.05,
        acceleration: 1.85,
        hull: 5,
        maneuver: 1.70,
        novaBonus: 2.20,
        novaPerMinute: 20,
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
