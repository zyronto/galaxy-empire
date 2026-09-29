let player;
let game;


function updateInterface() {

    const novaElement =
        document.getElementById("nova");

    const novaPerMinuteElement =
        document.getElementById("novaPerMinute");

    const distanceElement =
        document.getElementById("distance");

    const bestDistanceElement =
        document.getElementById("bestDistance");

    const voyageNovaElement =
        document.getElementById("voyageNova");

    const voyageTimerElement =
        document.getElementById("voyageTimer");

    const rocketElement =
        document.getElementById("currentRocket");

    if (novaElement) {
        novaElement.textContent =
            Economy.getFormattedNova(
                player.nova
            );
    }


    const rocket =
        getRocket(
            player.currentRocket
        );


    const novaPerMinute =
        Economy.calculateNovaPerMinute(
            player,
            rocket
        );

    if (novaPerMinuteElement) {
        novaPerMinuteElement.textContent =
            Economy.getFormattedNovaPerMinute(
                novaPerMinute
            );
    }


    if (distanceElement && game) {
        distanceElement.textContent =
            game.distance.toFixed(1);
    }


    if (bestDistanceElement) {
        bestDistanceElement.textContent =
            (player.bestDistance || 0).toFixed(1);
    }


    if (voyageNovaElement && game) {
        voyageNovaElement.textContent =
            Economy.getFormattedNova(
                game.voyageNova
            );
    }


    updateRiskInterface();

    if (voyageTimerElement && game) {
        voyageTimerElement.textContent =
            game.formatTime(
                game.voyageTime
            );
    }


    if (rocketElement) {
        rocketElement.textContent =
            `${rocket.icon} ${rocket.name}`;
    }


    updateProfile();
}


function updateProfile() {

    const username =
        document.getElementById(
            "profileUsername"
        );

    const level =
        document.getElementById(
            "profileLevel"
        );

    const totalDistance =
        document.getElementById(
            "totalDistance"
        );


    if (username) {
        username.textContent =
            player.username ||
            "Joueur";
    }


    if (level) {
        level.textContent =
            player.level || 1;
    }


    if (totalDistance) {
        totalDistance.textContent =
            (
                player.totalDistance || 0
            ).toFixed(1);
    }
}


function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-button"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    showPage(page);

                }
            );

        }
    );
}


function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    const buttons =
        document.querySelectorAll(
            ".nav-button"
        );


    pages.forEach(
        (page) => {

            page.classList.remove(
                "active"
            );

        }
    );


    buttons.forEach(
        (button) => {

            button.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            `page-${pageName}`
        );


    const button =
        document.querySelector(
            `.nav-button[data-page="${pageName}"]`
        );


    if (target) {
        target.classList.add(
            "active"
        );
    }


    if (button) {
        button.classList.add(
            "active"
        );
    }


    if (pageName === "technologies") {
        renderTechnologies();
    }


    if (pageName === "rockets") {
        renderRockets();
    }
}


function renderTechnologies() {

    const container =
        document.getElementById(
            "technologiesList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    TECHNOLOGY_ORDER.forEach(
        (technologyId) => {

            const technology =
                getTechnology(
                    technologyId
                );


            if (!technology) {
                return;
            }


            const level =
                player.technologies[
                    technologyId
                ] || 0;


            const cost =
                getTechnologyCost(
                    technologyId,
                    level
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <h3>
                    ${technology.icon}
                    ${technology.name}
                </h3>

                <p>
                    ${technology.description}
                </p>

                <p>
                    Niveau :
                    <strong>
                        ${level}/${technology.maxLevel}
                    </strong>
                </p>

                <p class="technology-effect">
                    ${getTechnologyDisplayText(
                        technologyId,
                        level
                    )}
                </p>

                <div style="margin-top:12px;padding:12px;border:1px solid #00f3ff;border-radius:10px;background:rgba(0,243,255,0.08);color:#ffffff;">
                    <strong style="color:#00f3ff;">PROCHAIN NIVEAU</strong>
                    <br>
                    <span style="color:#ffffff;">
                        ${level >= technology.maxLevel
                            ? "NIVEAU MAX"
                            : getTechnologyDisplayText(
                                technologyId,
                                level + 1
                            )}
                    </span>
                </div>

                <br>

                ${
                    level >= technology.maxLevel
                    ? `
                        <button
                            class="primary-button"
                            disabled
                        >
                            NIVEAU MAX
                        </button>
                    `
                    : `
                        <button
                            class="primary-button"
                            data-tech="${technologyId}"
                        >
                            AMÉLIORER — ${cost} NOVA
                        </button>
                    `
                }

            `;


            container.appendChild(
                card
            );


            const upgradeButton =
                card.querySelector(
                    `[data-tech="${technologyId}"]`
                );


            if (upgradeButton) {

                upgradeButton.addEventListener(
                    "click",
                    () => {

                        upgradeTechnology(
                            technologyId
                        );

                    }
                );

            }

        }
    );
}


function upgradeTechnology(
    technologyId
) {

    const level =
        player.technologies[
            technologyId
        ] || 0;


    const technology =
        getTechnology(
            technologyId
        );


    if (!technology) {
        return;
    }


    if (
        level >=
        technology.maxLevel
    ) {
        return;
    }


    const cost =
        getTechnologyCost(
            technologyId,
            level
        );


    if (
        player.nova <
        cost
    ) {

        alert(
            "Pas assez de NOVA."
        );

        return;
    }


    player.nova -= cost;

    player.technologies[
        technologyId
    ] = level + 1;


    SaveSystem.save(
        player
    );


    renderTechnologies();

    updateInterface();
}


function renderRockets() {

    const container =
        document.getElementById(
            "rocketsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    ROCKET_ORDER.forEach(
        (rocketId) => {

            const rocket =
                getRocket(
                    rocketId
                );


            const unlocked =
                player.unlockedRockets
                    .includes(
                        rocketId
                    );


            const equipped =
                player.currentRocket ===
                rocketId;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            let action = "";


            if (equipped) {

                action = `
                    <button
                        class="primary-button"
                        disabled
                    >
                        ÉQUIPÉE
                    </button>
                `;

            } else if (unlocked) {

                action = `
                    <button
                        class="primary-button"
                        data-equip="${rocketId}"
                    >
                        ÉQUIPER
                    </button>
                `;

            } else {

                action = `
                    <button
                        class="primary-button"
                        data-unlock="${rocketId}"
                    >
                        DÉBLOQUER — ${rocket.unlockCost} ✦
                    </button>
                `;
            }


            card.innerHTML = `

                <h3>
                    ${rocket.icon}
                    ${rocket.name}
                </h3>

                <p>
                    ${rocket.description}
                </p>

                <br>

                <p>
                    ⚡ Vitesse :
                    ×${rocket.speed.toFixed(2)}
                </p>

                <p>
                    🔥 Accélération :
                    ×${rocket.acceleration.toFixed(2)}
                </p>

                <p>
                    🎯 Maniabilité :
                    ×${rocket.maneuver.toFixed(2)}
                </p>

                <p>
                    🛡️ Coque :
                    ${rocket.hull}
                </p>

                <p>
                    💰 Bonus NOVA/km :
                    +${Math.round(
                        (rocket.novaBonus - 1) * 100
                    )}%
                </p>

                <p>
                    ✦ NOVA/min :
                    ${Economy.getFormattedNovaPerMinute(rocket.novaPerMinute)}
                </p>

                <br>

                ${action}

            `;


            container.appendChild(
                card
            );


            const equipButton =
                card.querySelector(
                    `[data-equip="${rocketId}"]`
                );


            if (equipButton) {

                equipButton.addEventListener(
                    "click",
                    () => {

                        player.currentRocket =
                            rocketId;

                        SaveSystem.save(
                            player
                        );

                        renderRockets();

                        updateInterface();

                    }
                );

            }


            const unlockButton =
                card.querySelector(
                    `[data-unlock="${rocketId}"]`
                );


            if (unlockButton) {

                unlockButton.addEventListener(
                    "click",
                    () => {

                        unlockRocket(
                            rocketId
                        );

                    }
                );

            }

        }
    );
}


function unlockRocket(
    rocketId
) {

    const rocket =
        getRocket(
            rocketId
        );


    if (
        player.unlockedRockets
            .includes(rocketId)
    ) {
        return;
    }


    if (
        player.nova <
        rocket.unlockCost
    ) {

        alert(
            "Pas assez de NOVA."
        );

        return;
    }


    player.nova -=
        rocket.unlockCost;


    player.unlockedRockets.push(
        rocketId
    );


    player.currentRocket =
        rocketId;


    SaveSystem.save(
        player
    );


    renderRockets();

    updateInterface();
}


function setupPauseButton() {

    const button =
        document.getElementById(
            "pauseGameButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            if (!game || !game.running) {
                return;
            }

            if (game.paused) {
                game.resume();
                button.textContent = "⏸ PAUSE";
                button.classList.remove("pause-active");
            } else {
                game.pause();
                button.textContent = "▶ REPRENDRE";
                button.classList.add("pause-active");
            }
        }
    );
}


function setupStartButton() {

    const button =
        document.getElementById(
            "startGameButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const overlay =
                document.getElementById(
                    "gameOverlay"
                );


            if (overlay) {
                overlay.style.display =
                    "none";
            }


            game.resetHull();

            game.start();

        }
    );
}


function setupNovaLoop() {

    let lastTime =
        performance.now();


    function tick(now) {

        const delta =
            Math.min(
                (now - lastTime) / 1000,
                1
            );


        lastTime = now;


        const rocket =
            getRocket(
                player.currentRocket
            );


        Economy.processNovaTick(
            player,
            rocket,
            delta
        );


        updateInterface();


        requestAnimationFrame(
            tick
        );
    }


    requestAnimationFrame(
        tick
    );
}


function setupAutoSave() {

    setInterval(
        () => {

            SaveSystem.save(
                player
            );

        },
        CONFIG.AUTO_SAVE_INTERVAL_SEC * 1000
    );
}


function init() {

    console.log(
        "🌌 GALAXY EMPIRE V2"
    );


    player =
        SaveSystem.load();


    const canvas =
        document.getElementById(
            "gameCanvas"
        );


    if (!canvas) {

        console.error(
            "Canvas du jeu introuvable."
        );

        return;
    }


    game =
        new GalaxyGame(
            canvas,
            player
        );


    setupNavigation();
    setupDeviceMode();
    setupMobileControls();

    setupStartButton();
    setupPauseButton();

    setupNovaLoop();

    setupAutoSave();

    renderTechnologies();

    renderRockets();

    updateInterface();


    console.log(
        "🚀 GALAXY EMPIRE prêt."
    );
}


document.addEventListener(
    "DOMContentLoaded",
    init
);


function setupDeviceMode() {

    const buttons = document.querySelectorAll("[data-device-mode]");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            setDeviceMode(button.dataset.deviceMode);
        });
    });

    setDeviceMode("computer");
}


function setDeviceMode(mode) {

    const isPhone = mode === "phone";

    document.body.classList.toggle("mobile-mode", isPhone);

    document.querySelectorAll("[data-device-mode]").forEach((button) => {
        button.classList.toggle("selected", button.dataset.deviceMode === mode);
    });

    const status = document.getElementById("deviceModeStatus");

    if (status) {
        status.innerHTML = isPhone
            ? "Mode actuel : <strong>📱 TÉLÉPHONE</strong> — commandes tactiles activées"
            : "Mode actuel : <strong>🖥️ ORDINATEUR</strong> — clavier activé";
    }

    if (game) {
        game.keys.left = false;
        game.keys.right = false;
    }
}


function setupMobileControls() {

    const left = document.getElementById("touchLeft");
    const right = document.getElementById("touchRight");

    if (!left || !right) return;

    const bind = (button, direction) => {

        const press = (event) => {
            if (!document.body.classList.contains("mobile-mode")) return;

            game.touchControlActive = true;
            game.keys.left = direction === "left";
            game.keys.right = direction === "right";
            event.preventDefault();
        };

        const release = (event) => {
            game.keys.left = false;
            game.keys.right = false;
            game.touchControlActive = false;
            event.preventDefault();
        };

        button.addEventListener("pointerdown", press);
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("pointerleave", release);
    };

    bind(left, "left");
    bind(right, "right");
}


function updateRiskInterface() {
    const container = document.getElementById("riskControls");
    if (!container || !player) return;

    const level = player.technologies?.risk || 0;
    const now = Date.now();
    const active = player.riskState?.activeUntil > now;
    const activeMultiplier = player.riskState?.activeMultiplier || 1;

    if (level <= 0) {
        container.innerHTML = '<div class="risk-locked">⚡ Débloque RISQUE I dans TECHNOLOGIES pour utiliser le système.</div>';
        return;
    }

    container.innerHTML = '';
    for (let i = 1; i <= level; i++) {
        const cfg = getRiskConfig(i);
        const cooldownUntil = player.riskState?.cooldowns?.[i] || 0;
        const cooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
        const button = document.createElement("button");
        button.className = "risk-button";
        button.disabled = active || cooldown > 0;
        button.innerHTML = active && activeMultiplier === cfg.multiplier
            ? "⚡ ×" + cfg.multiplier + " · " + Math.max(0, Math.ceil((player.riskState.activeUntil-now)/1000)) + "s"
            : "⚡ ×" + cfg.multiplier + (cooldown > 0 ? " · 🔒 " + cooldown + "s" : " · " + cfg.duration + "s");
        button.addEventListener("click", () => activateRisk(i));
        container.appendChild(button);
    }
}

function activateRisk(level) {
    const cfg = getRiskConfig(level);
    if (!cfg || !player.riskState) return;
    if (!game || !game.running || game.paused) return;
    const now = Date.now();
    if ((player.technologies?.risk || 0) < level) return;
    if (player.riskState.activeUntil > now) return;
    if ((player.riskState.cooldowns?.[level] || 0) > now) return;

    player.riskState.activeMultiplier = cfg.multiplier;
    player.riskState.activeUntil = now + cfg.duration * 1000;
    player.riskState.cooldowns[level] = now + (cfg.duration + cfg.cooldown) * 1000;
    SaveSystem.save(player);
    updateRiskInterface();
}
