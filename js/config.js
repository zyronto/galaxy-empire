const CONFIG={
 APP_NAME:"GALAXY EMPIRE",
 VERSION:"4.5.0",
 STARTING_NOVA:500,
 NOVA_DECIMALS:0,
 GAME_TICK_MS:16,

 // Physique : 1 unité de distance = 1 000 km.
 // Cela permet de conserver les vrais rayons et les vraies distances
 // (Terre-Lune, Terre-Soleil, etc.) dans la même unité.
 // 1 seconde réelle de jeu = 24 heures simulées.
 DISTANCE_SCALE_METERS:1e6,
 TIME_SCALE_SECONDS:3600,
 GRAVITATIONAL_CONSTANT:6.67430e-11,
 SPEED_OF_LIGHT:299792458,

 DISTANCE_NOVA_RATE:1,
 STARTING_ROCKET:"explorer",
 BASE_MAX_ACTIVE_ROCKETS:1,

 // ≈ 15,3 km/s au niveau de l'unité physique choisie.
 // La direction de lancement est volontairement exacte et indépendante de l’orbite de la planète.
 ROCKET_SPEED_BASE:55,
 DISPLAY_SPEED_FACTOR:1,
 SIMULATION_SPEED:24,

 ARRIVAL_DISTANCE:7,
 ROCKET_FUEL_START:100,
 FUEL_CONSUMPTION:.12,
 MAX_TRAIL_POINTS:360
};