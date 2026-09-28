let player;
let game;


function updateInterface() {

    const creditsElement =
        document.getElementById("credits");

    const novaElement =
        document.getElementById("nova");

    const novaPerSecondElement =
        document.getElementById("novaPerSecond");

    const distanceElement =
        document.getElementById("distance");

    const bestDistanceElement =
        document.getElementById("bestDistance");

    const voyageCreditsElement =
        document.getElementById("voyageCredits");

    const voyageTimerElement =
        document.getElementById("voyageTimer");

    const rocketElement =
        document.getElementById("currentRocket");


    if (creditsElement) {
        creditsElement.textContent =
            Economy.getFormattedCredits(
                player.credits
            );
    }


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


    const novaPerSecond =
        Economy.calculateNovaPerSecond(
            player,
            rocket
        );


    if (novaPerSecondElement) {
        novaPerSecondElement.textContent =
            Economy.getFormattedNovaPerSecond(
                novaPerSecond
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


    if (voyageCreditsElement && game) {
        voyageCreditsElement.textContent =
            Math.floor(
                game.voyageCredits
            );
    }


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

                                <p class="technology-next-effect">
                    Après amélioration :<br>
                    ${getTechnologyDisplayText(
                        technologyId,
                        level + 1
                    )}
                </p>

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
                            AMÉLIORER — ${cost} 💰
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
        player.credits <
        cost
    ) {

        alert(
            "Pas assez de crédits."
        );

        return;
    }


    player.credits -= cost;

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
                        DÉBLOQUER — ${rocket.unlockCost} 💰
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
                    ${rocket.speed.toFixed(2)}
                </p>

                <p>
                    🔥 Accélération :
                    ${rocket.acceleration.toFixed(2)}
                </p>

                <p>
                    🛡️ Coque :
                    ${rocket.hull}
                </p>

                <p>
                    💰 Bonus crédits :
                    +${Math.round(
                        (rocket.creditBonus - 1) * 100
                    )}%
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
        player.credits <
        rocket.unlockCost
    ) {

        alert(
            "Pas assez de crédits."
        );

        return;
    }


    player.credits -=
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

    setupStartButton();

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
