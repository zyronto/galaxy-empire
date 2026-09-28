const SAVE_KEY = "galaxy_empire_v2_save";


const SaveSystem = {

    createDefaultPlayer() {

        return {
            version: CONFIG.VERSION,

            nova: CONFIG.STARTING_NOVA,

            currentRocket: CONFIG.STARTING_ROCKET,

            unlockedRockets: [
                CONFIG.STARTING_ROCKET
            ],

            technologies: {
                engine: 0,
                propulsion: 0,
                shield: 0,
                maneuver: 0,
                collector: 0,
                novaTech: 0
            },

            distance: 0,
            bestDistance: 0,
            totalDistance: 0,

            level: 1,

            lastSaveTime: Date.now()
        };
    },


    load() {

        try {

            const raw =
                localStorage.getItem(SAVE_KEY);

            if (!raw) {
                return this.createDefaultPlayer();
            }

            const saved =
                JSON.parse(raw);

            const defaultPlayer =
                this.createDefaultPlayer();

            return {
                ...defaultPlayer,
                ...saved,

                // Les anciens crédits sont supprimés.
                // La nouvelle version utilise uniquement les NOVA.
                credits: undefined,

                nova:
                    Number.isFinite(saved.nova)
                        ? saved.nova
                        : 0,

                technologies: {
                    ...defaultPlayer.technologies,
                    ...(saved.technologies || {})
                },

                unlockedRockets:
                    Array.isArray(saved.unlockedRockets)
                        ? saved.unlockedRockets
                        : defaultPlayer.unlockedRockets
            };

        } catch (error) {

            console.error(
                "Erreur lors du chargement de la sauvegarde :",
                error
            );

            return this.createDefaultPlayer();
        }
    },


    save(player) {

        if (!player) {
            return false;
        }

        try {

            player.lastSaveTime =
                Date.now();

            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(player)
            );

            return true;

        } catch (error) {

            console.error(
                "Erreur lors de la sauvegarde :",
                error
            );

            return false;
        }
    },


    reset() {

        localStorage.removeItem(
            SAVE_KEY
        );

        return this.createDefaultPlayer();
    },


    exportSave(player) {

        return JSON.stringify(
            player,
            null,
            2
        );
    },


    importSave(json) {

        try {

            const imported =
                JSON.parse(json);

            if (
                !imported ||
                typeof imported !== "object"
            ) {
                return null;
            }

            const defaultPlayer =
                this.createDefaultPlayer();

            return {
                ...defaultPlayer,
                ...imported,

                credits: undefined,

                nova:
                    Number.isFinite(imported.nova)
                        ? imported.nova
                        : 0,

                technologies: {
                    ...defaultPlayer.technologies,
                    ...(imported.technologies || {})
                }
            };

        } catch (error) {

            console.error(
                "Sauvegarde invalide :",
                error
            );

            return null;
        }
    }
};