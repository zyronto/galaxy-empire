const Economy = {

    getRocketBonus(rocket) {
        if (!rocket) {
            return {
                novaBonus: 1,
                novaPerMinute: 0
            };
        }

        return {
            novaBonus: rocket.novaBonus || 1,
            novaPerMinute: rocket.novaPerMinute || 0
        };
    },


    getTechnologyBonus(player, technologyId) {
        const level =
            player.technologies?.[technologyId] || 0;

        return getTechnologyEffect(
            technologyId,
            level
        );
    },


    getNovaMultiplier(player, rocket) {
        const rocketBonus =
            this.getRocketBonus(rocket).novaBonus;

        const collectorBonus =
            1 + this.getTechnologyBonus(
                player,
                "collector"
            );

        return rocketBonus * collectorBonus;
    },


    calculateDistanceReward(distance, player, rocket) {
        if (distance <= 0) {
            return 0;
        }

        return (
            distance *
            CONFIG.DISTANCE_NOVA_RATE *
            this.getNovaMultiplier(player, rocket)
        );
    },


    calculateNovaPerMinute(player, rocket) {
        if (!rocket) {
            return 0;
        }

        const baseNovaPerMinute =
            this.getRocketBonus(rocket).novaPerMinute;

        const novaTechnology =
            1 + this.getTechnologyBonus(
                player,
                "novaTech"
            );

        return baseNovaPerMinute * novaTechnology;
    },


    calculateNovaPerSecond(player, rocket) {
        return this.calculateNovaPerMinute(player, rocket) / 60;
    },


    addNova(player, amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        player.nova =
            (player.nova || 0) + amount;
    },


    processNovaTick(player, rocket, deltaSeconds) {
        if (deltaSeconds <= 0) {
            return 0;
        }

        // Production passive : le taux est défini en NOVA/minute.
        // On convertit explicitement le temps écoulé en minutes.
        const deltaMinutes =
            deltaSeconds / 60;

        const generated =
            this.calculateNovaPerMinute(player, rocket) *
            deltaMinutes;

        this.addNova(player, generated);

        return generated;
    },


    getFormattedNova(value) {
        if (!Number.isFinite(value)) {
            return "0";
        }

        return value.toFixed(
            CONFIG.NOVA_DECIMALS
        );
    },


    getFormattedNovaPerMinute(value) {
        if (!Number.isFinite(value)) {
            return "0";
        }

        return value.toFixed(
            CONFIG.NOVA_DECIMALS
        );
    }
};