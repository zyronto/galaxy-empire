class GalaxyGame {

    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.player = player;

        this.running = false;
        this.lastTime = 0;

        this.distance = 0;
        this.voyageCredits = 0;
        this.voyageTime = 0;

        this.rocketX = 0;
        this.rocketY = 0;

        this.keys = {
            left: false,
            right: false
        };

        this.obstacles = [];
        this.stars = [];

        this.spawnTimer = 0;
        this.starTimer = 0;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.createStars();

        this.setupKeyboard();
    }


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.canvas.width =
            Math.max(320, Math.floor(rect.width));

        this.canvas.height =
            Math.max(300, Math.floor(rect.height));

        this.rocketX =
            this.canvas.width / 2;

        this.rocketY =
            this.canvas.height - 90;
    }


    createStars() {

        this.stars = [];

        const count = 100;

        for (let i = 0; i < count; i++) {

            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 80 + 30,
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }


    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "ArrowLeft" ||
                    event.key.toLowerCase() === "a"
                ) {
                    this.keys.left = true;
                    event.preventDefault();
                }

                if (
                    event.key === "ArrowRight" ||
                    event.key.toLowerCase() === "d"
                ) {
                    this.keys.right = true;
                    event.preventDefault();
                }
            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                if (
                    event.key === "ArrowLeft" ||
                    event.key.toLowerCase() === "a"
                ) {
                    this.keys.left = false;
                }

                if (
                    event.key === "ArrowRight" ||
                    event.key.toLowerCase() === "d"
                ) {
                    this.keys.right = false;
                }
            }
        );
    }


    start() {

        if (this.running) {
            return;
        }

        this.running = true;

        this.distance = 0;
        this.voyageCredits = 0;
        this.voyageTime = 0;

        this.obstacles = [];

        this.rocketX =
            this.canvas.width / 2;

        this.lastTime =
            performance.now();

        this.startTime =
            this.lastTime;

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    }


    stop() {

        this.running = false;

        this.player.bestDistance =
            Math.max(
                this.player.bestDistance || 0,
                this.distance
            );

        this.player.totalDistance =
            (this.player.totalDistance || 0)
            + this.distance;

        Economy.addCredits(
            this.player,
            this.voyageCredits
        );

        SaveSystem.save(
            this.player
        );
    }


    loop(timestamp) {

        if (!this.running) {
            return;
        }

        let delta =
            (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        delta =
            Math.min(delta, 0.05);

        this.update(delta);

        this.draw();

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    }


    update(delta) {

        const rocket =
            getRocket(
                this.player.currentRocket
            );

        // Accélération progressive du voyage : départ calme,
        // puis montée en vitesse comme dans un runner.
        const elapsedSeconds =
            Math.max(0, (performance.now() - this.startTime) / 1000);

        const engineMultiplier =
            Economy.getTechnologyBonus(
                this.player,
                "engine"
            ) + 1;

        const propulsionMultiplier =
            Economy.getTechnologyBonus(
                this.player,
                "propulsion"
            ) + 1;

        // MOTEUR : accélère la montée vers la vitesse maximale
        // sans augmenter la vitesse maximale à lui seul.
        const effectiveRampSeconds =
            CONFIG.SPEED_RAMP_SECONDS /
            engineMultiplier;

        const rampProgress =
            Math.min(
                1,
                elapsedSeconds / effectiveRampSeconds
            );

        // PROPULSION : augmente la vitesse maximale atteignable.
        const effectiveMaxMultiplier =
            CONFIG.SPEED_MAX_MULTIPLIER *
            propulsionMultiplier;

        const speedMultiplier =
            CONFIG.SPEED_START_MULTIPLIER +
            (effectiveMaxMultiplier - CONFIG.SPEED_START_MULTIPLIER) *
            Math.pow(rampProgress, CONFIG.SPEED_RAMP_POWER);

        const speed =
            CONFIG.SCROLL_BASE *
            rocket.speed *
            speedMultiplier;


        /* =====================
           DÉPLACEMENT
        ===================== */

        const maneuver =
            rocket.maneuver *
            (
                1 +
                Economy.getTechnologyBonus(
                    this.player,
                    "maneuver"
                )
            );

        const moveSpeed =
            420 * maneuver;


        if (this.keys.left) {

            this.rocketX -=
                moveSpeed * delta;
        }


        if (this.keys.right) {

            this.rocketX +=
                moveSpeed * delta;
        }


        const margin = 35;

        this.rocketX =
            Math.max(
                margin,
                Math.min(
                    this.canvas.width - margin,
                    this.rocketX
                )
            );


        /* =====================
           DISTANCE
        ===================== */

        // La distance dépend directement de la vitesse réelle de la fusée.
        this.distance +=
            rocket.speed *
            speedMultiplier *
            CONFIG.DISTANCE_PER_SECOND *
            delta;

        // Chrono réel du voyage.
        this.voyageTime += delta;


        this.player.distance =
            this.distance;


        /* =====================
           CRÉDITS
        ===================== */

        this.voyageCredits =
            Economy.calculateDistanceReward(
                this.distance,
                this.player,
                rocket
            );


        /* =====================
           ÉTOILES
        ===================== */

        for (const star of this.stars) {

            star.y +=
                star.speed *
                rocket.speed *
                delta;

            if (
                star.y >
                this.canvas.height
            ) {

                star.y = -5;

                star.x =
                    Math.random() *
                    this.canvas.width;
            }
        }


        /* =====================
           OBSTACLES
        ===================== */

        this.spawnTimer += delta;

        const difficulty =
            Math.min(
                2.5,
                1 +
                this.distance *
                CONFIG.DIFFICULTY_PER_KM
            );

        const spawnInterval =
            Math.max(
                CONFIG.SPAWN_MIN_INTERVAL,
                CONFIG.SPAWN_BASE_INTERVAL /
                difficulty
            );


        if (
            this.spawnTimer >=
            spawnInterval
        ) {

            this.spawnTimer = 0;

            this.spawnObstacle();
        }


        for (
            let i = this.obstacles.length - 1;
            i >= 0;
            i--
        ) {

            const obstacle =
                this.obstacles[i];

            obstacle.y +=
                speed *
                delta;


            if (
                obstacle.y >
                this.canvas.height + 80
            ) {

                this.obstacles.splice(
                    i,
                    1
                );

                continue;
            }


            if (
                this.checkCollision(
                    obstacle
                )
            ) {

                this.handleCollision();

                this.obstacles.splice(
                    i,
                    1
                );
            }
        }
    }


    spawnObstacle() {

        const types = [
            "meteor",
            "debris",
            "energy"
        ];

        const type =
            types[
                Math.floor(
                    Math.random() *
                    types.length
                )
            ];


        const size =
            Math.random() *
            20 + 18;


        this.obstacles.push({

            type,

            x:
                Math.random() *
                (this.canvas.width - 70)
                + 35,

            y:
                -60,

            size
        });
    }


    checkCollision(obstacle) {

        const dx =
            this.rocketX -
            obstacle.x;

        const dy =
            this.rocketY -
            obstacle.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        return distance <
            obstacle.size + 20;
    }


    handleCollision() {

        const shieldLevel =
            this.player.technologies?.shield || 0;


        const rocket =
            getRocket(
                this.player.currentRocket
            );


        const maxHull =
            rocket.hull +
            shieldLevel;


        if (!this.player.currentHull) {

            this.player.currentHull =
                maxHull;
        }


        this.player.currentHull--;


        if (
            this.player.currentHull <= 0
        ) {

            this.stop();

            this.showGameOver();

        } else {

            this.showHitEffect();
        }
    }


    showHitEffect() {

        this.canvas.classList.add(
            "hit-effect"
        );

        setTimeout(() => {

            this.canvas.classList.remove(
                "hit-effect"
            );

        }, 180);
    }


    showGameOver() {

        const overlay =
            document.getElementById(
                "gameOverlay"
            );

        if (!overlay) {
            return;
        }


        overlay.innerHTML = `

            <div class="overlay-content">

                <div class="big-icon">
                    💥
                </div>

                <h2>
                    VOYAGE TERMINÉ
                </h2>

                <p>
                    Distance :
                    <strong>
                        ${this.distance.toFixed(1)} km
                    </strong>
                </p>

                <p>
                    Temps :
                    <strong>
                        ${this.formatTime(this.voyageTime)}
                    </strong>
                </p>

                <p>
                    Crédits gagnés :
                    <strong>
                        ${Math.floor(this.voyageCredits)}
                    </strong>
                </p>

                <button
                    id="restartGameButton"
                    class="primary-button"
                >
                    🚀 REPARTIR
                </button>

            </div>
        `;


        overlay.style.display =
            "flex";


        const button =
            document.getElementById(
                "restartGameButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                () => {

                    overlay.style.display =
                        "none";

                    this.resetHull();

                    this.start();
                }
            );
        }
    }


    formatTime(seconds) {

        const totalSeconds =
            Math.max(0, Math.floor(seconds));

        const minutes =
            Math.floor(totalSeconds / 60);

        const remainingSeconds =
            totalSeconds % 60;

        return String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0");
    }


    resetHull() {

        const rocket =
            getRocket(
                this.player.currentRocket
            );

        const shieldLevel =
            this.player.technologies?.shield || 0;

        this.player.currentHull =
            rocket.hull +
            shieldLevel;
    }


    draw() {

        const ctx =
            this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;


        /* =====================
           FOND
        ===================== */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );

        gradient.addColorStop(
            0,
            "#020617"
        );

        gradient.addColorStop(
            0.5,
            "#071426"
        );

        gradient.addColorStop(
            1,
            "#020617"
        );


        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /* =====================
           ÉTOILES
        ===================== */

        for (const star of this.stars) {

            ctx.globalAlpha =
                star.alpha;

            ctx.fillStyle =
                "#ffffff";

            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.globalAlpha = 1;


        /* =====================
           LIGNES DE VITESSE
        ===================== */

        ctx.strokeStyle =
            "rgba(0,243,255,0.08)";

        ctx.lineWidth = 1;

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const x =
                (i / 12) *
                width;

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x - 100,
                height
            );

            ctx.stroke();
        }


        /* =====================
           OBSTACLES
        ===================== */

        for (const obstacle of this.obstacles) {

            this.drawObstacle(
                obstacle
            );
        }


        /* =====================
           FUSÉE
        ===================== */

        this.drawRocket();


        /* =====================
           HUD
        ===================== */

        this.drawHUD();
    }


    drawRocket() {

        const ctx =
            this.ctx;

        const x =
            this.rocketX;

        const y =
            this.rocketY;


        ctx.save();

        ctx.translate(
            x,
            y
        );


        /* FLAMME */

        const flame =
            20 +
            Math.random() * 12;


        const flameGradient =
            ctx.createLinearGradient(
                0,
                20,
                0,
                50
            );

        flameGradient.addColorStop(
            0,
            "#ffffff"
        );

        flameGradient.addColorStop(
            0.4,
            "#00f3ff"
        );

        flameGradient.addColorStop(
            1,
            "rgba(0,243,255,0)"
        );


        ctx.fillStyle =
            flameGradient;


        ctx.beginPath();

        ctx.moveTo(
            -8,
            25
        );

        ctx.lineTo(
            0,
            25 + flame
        );

        ctx.lineTo(
            8,
            25
        );

        ctx.closePath();

        ctx.fill();


        /* CORPS */

        const bodyGradient =
            ctx.createLinearGradient(
                -20,
                0,
                20,
                0
            );

        bodyGradient.addColorStop(
            0,
            "#64748b"
        );

        bodyGradient.addColorStop(
            0.5,
            "#f8fafc"
        );

        bodyGradient.addColorStop(
            1,
            "#475569"
        );


        ctx.fillStyle =
            bodyGradient;


        ctx.beginPath();

        ctx.moveTo(
            0,
            -30
        );

        ctx.lineTo(
            15,
            15
        );

        ctx.lineTo(
            8,
            25
        );

        ctx.lineTo(
            -8,
            25
        );

        ctx.lineTo(
            -15,
            15
        );

        ctx.closePath();

        ctx.fill();


        /* COCKPIT */

        ctx.fillStyle =
            "#00f3ff";

        ctx.beginPath();

        ctx.arc(
            0,
            -10,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* AILES */

        ctx.fillStyle =
            "#1e293b";


        ctx.beginPath();

        ctx.moveTo(
            -10,
            10
        );

        ctx.lineTo(
            -27,
            25
        );

        ctx.lineTo(
            -10,
            22
        );

        ctx.closePath();

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(
            10,
            10
        );

        ctx.lineTo(
            27,
            25
        );

        ctx.lineTo(
            10,
            22
        );

        ctx.closePath();

        ctx.fill();


        ctx.restore();
    }


    drawObstacle(obstacle) {

        const ctx =
            this.ctx;


        ctx.save();

        ctx.translate(
            obstacle.x,
            obstacle.y
        );


        if (
            obstacle.type ===
            "meteor"
        ) {

            ctx.fillStyle =
                "#78350f";

            ctx.strokeStyle =
                "#fb923c";

            ctx.lineWidth = 2;

            ctx.beginPath();

            const points = 9;

            for (
                let i = 0;
                i < points;
                i++
            ) {

                const angle =
                    (
                        i / points
                    ) *
                    Math.PI *
                    2;

                const radius =
                    obstacle.size *
                    (
                        0.75 +
                        Math.random() *
                        0.3
                    );

                const x =
                    Math.cos(angle) *
                    radius;

                const y =
                    Math.sin(angle) *
                    radius;

                if (i === 0) {
                    ctx.moveTo(
                        x,
                        y
                    );
                } else {
                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }

            ctx.closePath();

            ctx.fill();

            ctx.stroke();
        }


        else if (
            obstacle.type ===
            "debris"
        ) {

            ctx.fillStyle =
                "#64748b";

            ctx.strokeStyle =
                "#cbd5e1";

            ctx.lineWidth = 2;

            ctx.rotate(
                performance.now() / 1000
            );

            ctx.fillRect(
                -obstacle.size / 2,
                -obstacle.size / 2,
                obstacle.size,
                obstacle.size
            );

            ctx.strokeRect(
                -obstacle.size / 2,
                -obstacle.size / 2,
                obstacle.size,
                obstacle.size
            );
        }


        else {

            ctx.strokeStyle =
                "#00f3ff";

            ctx.lineWidth = 4;

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                "#00f3ff";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                obstacle.size,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        ctx.restore();
    }


    drawHUD() {

        const ctx =
            this.ctx;


        ctx.save();


        ctx.fillStyle =
            "rgba(2,6,23,0.65)";

        ctx.fillRect(
            15,
            15,
            190,
            65
        );


        ctx.fillStyle =
            "#94a3b8";

        ctx.font =
            "11px Segoe UI";

        ctx.fillText(
            "DISTANCE",
            28,
            38
        );


        ctx.fillStyle =
            "#00f3ff";

        ctx.font =
            "bold 20px Consolas";

        ctx.fillText(
            `${this.distance.toFixed(1)} km`,
            28,
            62
        );


        ctx.restore();
    }
}
