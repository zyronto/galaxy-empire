class GalaxyGame {

    constructor(canvas, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.player = player;

        this.running = false;
        this.paused = false;
        this.lastTime = 0;

        this.distance = 0;
        this.voyageNova = 0;
        this.voyageTime = 0;
        this.lastRewardDistance = 0;

        this.rocketX = 0;
        this.rocketY = 0;

        this.keys = {
            left: false,
            right: false
        };

        // Les flèches tactiles utilisent une vitesse réduite
        // pour permettre des déplacements beaucoup plus précis.
        this.touchControlActive = false;
        this.touchMoveMultiplier = 0.55;

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
        this.setupTouchControls();
    }


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        const mobileMode =
            document.body.classList.contains("mobile-mode");

        this.canvas.width =
            mobileMode
                ? Math.max(1, Math.floor(rect.width))
                : Math.max(320, Math.floor(rect.width));

        this.canvas.height =
            mobileMode
                ? Math.max(1, Math.floor(rect.height))
                : Math.max(300, Math.floor(rect.height));

        this.rocketX =
            this.canvas.width / 2;

        this.rocketY =
            document.body.classList.contains("mobile-mode")
                ? this.canvas.height - 135
                : this.canvas.height - 90;
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


    setupTouchControls() {

        // Le pilotage tactile se fait uniquement avec les deux flèches.
        // Aucun glissement sur la fenêtre de jeu.
        return;
    }


    start() {

        if (this.running) {
            return;
        }

        this.running = true;
        this.paused = false;

        this.distance = 0;
        this.voyageNova = 0;
        this.voyageTime = 0;
        this.lastRewardDistance = 0;

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


    pause() {

        if (!this.running || this.paused) {
            return;
        }

        this.paused = true;
    }


    resume() {

        if (!this.running || !this.paused) {
            return;
        }

        this.paused = false;
        this.lastTime = performance.now();
    }


    stop() {

        this.running = false;
        this.paused = false;

        this.player.bestDistance =
            Math.max(
                this.player.bestDistance || 0,
                this.distance
            );

        this.player.totalDistance =
            (this.player.totalDistance || 0)
            + this.distance;

        Economy.addNova(
            this.player,
            this.voyageNova
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

        if (this.paused) {
            this.draw();
            requestAnimationFrame(
                (time) => this.loop(time)
            );
            return;
        }

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
            (engineMultiplier * rocket.acceleration);

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
            420 *
            maneuver *
            (this.touchControlActive
                ? this.touchMoveMultiplier
                : 1);


        if (this.keys.left) {

            this.rocketX -=
                moveSpeed * delta;
        }


        if (this.keys.right) {

            this.rocketX +=
                moveSpeed * delta;
        }


        const mobileMode =
            document.body.classList.contains("mobile-mode");

        const margin =
            mobileMode
                ? Math.min(48, this.canvas.width * 0.14)
                : 35;

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
           NOVA GAGNÉES PAR DISTANCE
        ===================== */

        const distanceDelta =
            Math.max(0, this.distance - this.lastRewardDistance);

        if (distanceDelta > 0) {
            const baseReward =
                distanceDelta *
                CONFIG.DISTANCE_NOVA_RATE *
                (rocket.novaBonus || 1) *
                (1 + Economy.getTechnologyBonus(this.player, "collector"));

            this.voyageNova +=
                baseReward *
                Economy.getRiskMultiplier(this.player);

            this.lastRewardDistance = this.distance;
        }

        if (this.player.riskState?.activeUntil &&
            Date.now() >= this.player.riskState.activeUntil) {
            this.player.riskState.activeUntil = 0;
            this.player.riskState.activeMultiplier = 1;
        }


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


        const safeMargin =
            Math.max(42, size + 8);

        const availableWidth =
            Math.max(
                20,
                this.canvas.width - safeMargin * 2
            );

        this.obstacles.push({

            type,

            x:
                safeMargin +
                Math.random() * availableWidth,

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
                        ${Math.floor(this.voyageNova).toLocaleString("fr-FR")}
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
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const now = performance.now() / 1000;

        this.drawSpaceBackground(now);
        this.drawStarfield(now);
        this.drawSpeedLines(now);

        for (const obstacle of this.obstacles) {
            this.drawObstacle(obstacle, now);
        }

        this.drawRocket(now);
        this.drawHUD();

        if (this.paused) {
            this.drawPauseOverlay();
        }
    }

    drawSpaceBackground(now) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, "#02030a");
        bg.addColorStop(0.45, "#071124");
        bg.addColorStop(1, "#01030a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        const nebulae = [
            { x: width * 0.18, y: height * 0.18, r: Math.min(width, height) * 0.34, c: "rgba(35,90,255,0.16)" },
            { x: width * 0.78, y: height * 0.34, r: Math.min(width, height) * 0.30, c: "rgba(155,55,255,0.13)" },
            { x: width * 0.48, y: height * 0.82, r: Math.min(width, height) * 0.42, c: "rgba(0,210,255,0.09)" }
        ];

        for (const n of nebulae) {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, n.c);
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);
        }

        // Horizon glow giving the scene depth.
        const horizon = ctx.createLinearGradient(0, height * 0.55, 0, height);
        horizon.addColorStop(0, "rgba(0,0,0,0)");
        horizon.addColorStop(0.65, "rgba(0,10,30,0.15)");
        horizon.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = horizon;
        ctx.fillRect(0, 0, width, height);

        // Very subtle grid / navigation lanes.
        ctx.save();
        ctx.strokeStyle = "rgba(83,190,255,0.045)";
        ctx.lineWidth = 1;
        const laneCount = width < 650 ? 7 : 11;
        for (let i = 0; i <= laneCount; i++) {
            const x = (i / laneCount) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + (x - width / 2) * 0.18, height);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawStarfield(now) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (const star of this.stars) {
            const twinkle = 0.72 + Math.sin(now * (1.2 + star.size) + star.x) * 0.18;
            ctx.globalAlpha = Math.max(0.15, Math.min(1, star.alpha * twinkle));

            if (star.size > 1.7) {
                ctx.fillStyle = "#dff8ff";
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#57ddff";
            } else {
                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            if (star.size > 1.8) {
                ctx.globalAlpha *= 0.35;
                ctx.fillRect(star.x - 3, star.y - 0.5, 6, 1);
                ctx.fillRect(star.x - 0.5, star.y - 3, 1, 6);
            }
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    drawSpeedLines(now) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const compact = width < 650;
        const count = compact ? 16 : 24;

        ctx.save();
        for (let i = 0; i < count; i++) {
            const seed = i * 47.17;
            const x = ((seed * 13.7) % width);
            const phase = ((now * (95 + (i % 5) * 18) + seed * 3) % (height + 160)) - 80;
            const length = compact ? 10 + (i % 4) * 5 : 16 + (i % 5) * 7;
            const alpha = 0.025 + (i % 4) * 0.012;

            const g = ctx.createLinearGradient(x, phase, x, phase + length);
            g.addColorStop(0, "rgba(85,210,255,0)");
            g.addColorStop(0.5, "rgba(85,210,255," + alpha + ")");
            g.addColorStop(1, "rgba(85,210,255,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, phase);
            ctx.lineTo(x, phase + length);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawRocket(now) {
        const ctx = this.ctx;
        const x = this.rocketX;
        const y = this.rocketY;
        const pulse = 0.85 + Math.sin(now * 9) * 0.15;
        const tilt = (this.keys.left ? -0.06 : 0) + (this.keys.right ? 0.06 : 0);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);

        // Engine aura
        const aura = ctx.createRadialGradient(0, 28, 2, 0, 28, 42);
        aura.addColorStop(0, "rgba(255,255,255,0.32)");
        aura.addColorStop(0.2, "rgba(0,220,255,0.28)");
        aura.addColorStop(1, "rgba(0,220,255,0)");
        ctx.fillStyle = aura;
        ctx.fillRect(-42, -5, 84, 85);

        // Exhaust, layered for a richer flame.
        const flameLength = 27 + pulse * 18 + Math.random() * 8;
        const outer = ctx.createLinearGradient(0, 20, 0, 20 + flameLength);
        outer.addColorStop(0, "#fff7c2");
        outer.addColorStop(0.22, "#ffbd38");
        outer.addColorStop(0.55, "#22d3ee");
        outer.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.moveTo(-12, 19);
        ctx.quadraticCurveTo(-8, 35, 0, 20 + flameLength);
        ctx.quadraticCurveTo(8, 35, 12, 19);
        ctx.closePath();
        ctx.fill();

        const inner = ctx.createLinearGradient(0, 20, 0, 20 + flameLength * 0.72);
        inner.addColorStop(0, "#ffffff");
        inner.addColorStop(0.35, "#fff4a3");
        inner.addColorStop(1, "rgba(255,145,0,0)");
        ctx.fillStyle = inner;
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.quadraticCurveTo(-4, 34, 0, 18 + flameLength * 0.72);
        ctx.quadraticCurveTo(4, 34, 6, 18);
        ctx.closePath();
        ctx.fill();

        // Shadow / silhouette behind the hull.
        ctx.fillStyle = "#07101d";
        ctx.beginPath();
        ctx.moveTo(-20, 16);
        ctx.lineTo(-31, 29);
        ctx.lineTo(-11, 25);
        ctx.lineTo(0, 33);
        ctx.lineTo(11, 25);
        ctx.lineTo(31, 29);
        ctx.lineTo(20, 16);
        ctx.closePath();
        ctx.fill();

        // Main hull.
        const hull = ctx.createLinearGradient(-18, 0, 18, 0);
        hull.addColorStop(0, "#334155");
        hull.addColorStop(0.18, "#e2e8f0");
        hull.addColorStop(0.5, "#ffffff");
        hull.addColorStop(0.78, "#cbd5e1");
        hull.addColorStop(1, "#475569");
        ctx.fillStyle = hull;
        ctx.strokeStyle = "#7dd3fc";
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.quadraticCurveTo(11, -24, 15, 8);
        ctx.lineTo(10, 24);
        ctx.lineTo(-10, 24);
        ctx.lineTo(-15, 8);
        ctx.quadraticCurveTo(-11, -24, 0, -38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nose highlight.
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -33);
        ctx.quadraticCurveTo(-7, -18, -8, 8);
        ctx.stroke();

        // Wings.
        const wing = ctx.createLinearGradient(-30, 8, 30, 8);
        wing.addColorStop(0, "#172033");
        wing.addColorStop(0.5, "#4b5563");
        wing.addColorStop(1, "#172033");
        ctx.fillStyle = wing;
        ctx.strokeStyle = "#38bdf8";

        ctx.beginPath();
        ctx.moveTo(-10, 7);
        ctx.lineTo(-29, 27);
        ctx.lineTo(-10, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, 7);
        ctx.lineTo(29, 27);
        ctx.lineTo(10, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit glass.
        const cockpit = ctx.createRadialGradient(-2, -12, 1, 0, -9, 10);
        cockpit.addColorStop(0, "#d9fbff");
        cockpit.addColorStop(0.28, "#5ee7ff");
        cockpit.addColorStop(0.7, "#087ea4");
        cockpit.addColorStop(1, "#032c42");
        ctx.fillStyle = cockpit;
        ctx.strokeStyle = "#a5f3fc";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, -10, 7.5, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Small reactor lights.
        ctx.shadowBlur = 9;
        ctx.shadowColor = "#22d3ee";
        ctx.fillStyle = "#67e8f9";
        ctx.beginPath();
        ctx.arc(-6, 13, 2, 0, Math.PI * 2);
        ctx.arc(6, 13, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawObstacle(obstacle, now) {
        const ctx = this.ctx;
        const x = obstacle.x;
        const y = obstacle.y;
        const s = obstacle.size;

        ctx.save();
        ctx.translate(x, y);

        if (obstacle.type === "meteor") {
            ctx.rotate((now * 0.65 + x) % (Math.PI * 2));

            const glow = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 1.5);
            glow.addColorStop(0, "rgba(255,170,80,0.16)");
            glow.addColorStop(1, "rgba(255,80,30,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2);
            ctx.fill();

            const rock = ctx.createRadialGradient(-s * 0.35, -s * 0.45, 2, 0, 0, s);
            rock.addColorStop(0, "#9a6846");
            rock.addColorStop(0.5, "#4b3026");
            rock.addColorStop(1, "#160f12");
            ctx.fillStyle = rock;
            ctx.strokeStyle = "#c27b52";
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            const points = 10;
            for (let i = 0; i < points; i++) {
                const a = i / points * Math.PI * 2;
                const r = s * (0.72 + ((Math.sin(i * 8.31 + x) + 1) * 0.14));
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "rgba(20,10,8,0.65)";
            for (let i = 0; i < 3; i++) {
                const a = i * 2.1;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * s * 0.35, Math.sin(a) * s * 0.3, s * (0.08 + i * 0.015), 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (obstacle.type === "debris") {
            ctx.rotate(now * 0.9 + x * 0.01);

            const metal = ctx.createLinearGradient(-s, -s, s, s);
            metal.addColorStop(0, "#dbeafe");
            metal.addColorStop(0.25, "#64748b");
            metal.addColorStop(0.65, "#1e293b");
            metal.addColorStop(1, "#0b1220");
            ctx.fillStyle = metal;
            ctx.strokeStyle = "#93c5fd";
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.moveTo(-s * 0.8, -s * 0.55);
            ctx.lineTo(s * 0.45, -s * 0.85);
            ctx.lineTo(s * 0.85, -s * 0.05);
            ctx.lineTo(s * 0.55, s * 0.8);
            ctx.lineTo(-s * 0.65, s * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(-s * 0.45, -s * 0.18, s * 0.9, 2);
        } else {
            const pulse = 0.85 + Math.sin(now * 5 + x) * 0.15;
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#22d3ee";

            const ring = ctx.createRadialGradient(0, 0, s * 0.25, 0, 0, s);
            ring.addColorStop(0, "rgba(255,255,255,0.08)");
            ring.addColorStop(0.7, "rgba(34,211,238,0.08)");
            ring.addColorStop(1, "rgba(34,211,238,0)");
            ctx.fillStyle = ring;
            ctx.beginPath();
            ctx.arc(0, 0, s * 1.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(103,232,249," + pulse + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.strokeStyle = "#cffafe";
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#67e8f9";
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawHUD() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const compact = width < 650;
        const gap = compact ? 6 : 9;
        const margin = compact ? 9 : 13;
        const columns = compact ? 2 : 4;
        const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
        const cardHeight = compact ? 56 : 62;

        const stats = [
            {
                label: "DISTANCE",
                value: this.distance.toFixed(1) + " km",
                accent: "#67e8f9"
            },
            {
                label: "RECORD",
                value: (this.player.bestDistance || 0).toFixed(1) + " km",
                accent: "#a5b4fc"
            },
            {
                label: "NOVA GAGNÉES",
                value: Math.floor(this.voyageNova).toLocaleString("fr-FR"),
                accent: "#facc15"
            },
            {
                label: "CHRONO",
                value: this.formatTime(this.voyageTime),
                accent: "#c4b5fd"
            }
        ];

        ctx.save();
        ctx.textBaseline = "middle";

        stats.forEach((stat, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const x = margin + column * (cardWidth + gap);
            const y = margin + row * (cardHeight + gap);

            ctx.fillStyle = "rgba(3,8,22,0.78)";
            ctx.strokeStyle = "rgba(148,163,184,0.18)";
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.roundRect(x, y, cardWidth, cardHeight, compact ? 10 : 12);
            ctx.fill();
            ctx.stroke();

            // Accent bar
            ctx.fillStyle = stat.accent;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.roundRect(x, y, 3, cardHeight, 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = "#94a3b8";
            ctx.font = "700 " + (compact ? 8 : 9) + "px Segoe UI";
            ctx.fillText(stat.label, x + 12, y + 15);

            ctx.fillStyle = stat.accent;
            ctx.font = "800 " + (compact ? 15 : 18) + "px Segoe UI";
            ctx.fillText(stat.value, x + 12, y + 40);
        });

        // Hull indicator
        const rocket = getRocket(this.player.currentRocket);
        const maxHull = rocket.hull + (this.player.technologies?.shield || 0);
        const hull = Math.max(0, this.player.currentHull ?? maxHull);
        const hullY = margin + (compact ? 2 * (cardHeight + gap) : cardHeight + gap) + 7;

        if (hullY < this.canvas.height - 20) {
            const barWidth = Math.min(220, width * 0.42);
            const barHeight = 8;
            const bx = margin;
            const by = hullY;

            ctx.fillStyle = "rgba(2,6,23,0.8)";
            ctx.strokeStyle = "rgba(148,163,184,0.16)";
            ctx.beginPath();
            ctx.roundRect(bx, by, barWidth, 24, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#94a3b8";
            ctx.font = "700 8px Segoe UI";
            ctx.fillText("COQUE", bx + 10, by + 8);

            const ratio = maxHull > 0 ? hull / maxHull : 0;
            ctx.fillStyle = ratio <= 0.35 ? "#fb7185" : "#22d3ee";
            ctx.beginPath();
            ctx.roundRect(bx + 54, by + 8, Math.max(2, (barWidth - 68) * ratio), barHeight, 4);
            ctx.fill();

            ctx.fillStyle = "#e2e8f0";
            ctx.font = "800 9px Segoe UI";
            ctx.fillText(hull + "/" + maxHull, bx + barWidth - 30, by + 8);
        }

        ctx.restore();
    }

    drawPauseOverlay() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.save();
        ctx.fillStyle = "rgba(1,4,12,0.42)";
        ctx.fillRect(0, 0, width, height);

        const boxW = Math.min(310, width - 40);
        const boxH = 112;
        const x = (width - boxW) / 2;
        const y = (height - boxH) / 2;

        ctx.fillStyle = "rgba(4,10,25,0.92)";
        ctx.strokeStyle = "rgba(103,232,249,0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#67e8f9";
        ctx.font = "900 13px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("VOYAGE EN PAUSE", width / 2, y + 36);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 11px Segoe UI";
        ctx.fillText("Appuie sur REPRENDRE pour continuer", width / 2, y + 64);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "800 20px Segoe UI";
        ctx.fillText("Ⅱ", width / 2, y + 91);

        ctx.restore();
    }
}
