const Economy = {

    getRocketBonus(rocket) {
        if (!rocket) {
            return {
                creditBonus: 1,
                novaBase: 0
            };
        }

        return {
            creditBonus: rocket.creditBonus || 1,
            novaBase: rocket.novaBase || 0
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


    getCreditMultiplier(player, rocket) {

        const rocketBonus =
            this.getRocketBonus(rocket).creditBonus;

        const collectorBonus =
            1 + this.getTechnologyBonus(
                player,
                "collector"
            );

        return rocketBonus * collectorBonus;
    },


    calculateDistanceReward(
        distance,
        player,
        rocket
    ) {

        if (distance <= 0) {
            return 0;
        }

        const multiplier =
            this.getCreditMultiplier(
                player,
                rocket
            );

        return (
            distance *
            CONFIG.DISTANCE_CREDIT_RATE *
            multiplier
        );
    },


    calculateNovaPerSecond(
        player,
        rocket
    ) {

        if (!rocket) {
            return 0;
        }

        const baseNova =
            rocket.novaBase || 0;

        const novaTechnology =
            1 + this.getTechnologyBonus(
                player,
                "novaTech"
            );

        return baseNova * novaTechnology;
    },


    addCredits(player, amount) {

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        player.credits =
            (player.credits || 0) + amount;
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

        const novaPerSecond =
            this.calculateNovaPerSecond(
                player,
                rocket
            );

        const generated =
            novaPerSecond * deltaSeconds;

        this.addNova(
            player,
            generated
        );

        return generated;
    },


    getFormattedNova(value) {

        if (!Number.isFinite(value)) {
            return "0";
        }

        if (value === 0) {
            return "0";
        }

        return value.toFixed(
            CONFIG.NOVA_DECIMALS
        );
    },


    getFormattedNovaPerSecond(value) {

        if (!Number.isFinite(value)) {
            return "0";
        }

        return value.toFixed(
            CONFIG.NOVA_DECIMALS
        );
    },


    getFormattedCredits(value) {

        if (!Number.isFinite(value)) {
            return "0";
        }

        return Math.floor(value)
            .toLocaleString("fr-FR");
    }
};
