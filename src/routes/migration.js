const { Router } = require('express');
const { migrationScript } = require('../utils/migration.js');
const { logger } = require('../logger.js');

const router = Router();

router.post("/", async (req,res)=> {
    try {
        logger.info("Iniciando migración...");
        await migrationScript();
        logger.info("Migración exitosa");
    } catch (error) {
        logger.error("Error en la migración: " + error.message);
        return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: "Migración exitosa" });
})

module.exports = router;