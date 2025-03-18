const express = require('express');
const router = express.Router();
const Accident = require('./models/Accident');

// Updated route with ML
router.get('/top-dangerous-zones-ml', async (req, res) => {
    try {
        const yearsBack = parseInt(req.query.years) || 1;
        if (yearsBack < 1) {
            return res.status(400).json({ message: "Le nombre d'années doit être supérieur ou égal à 1" });
        }

        const accidents = await Accident.find();
        const predictions = await analyzeWithML(accidents, yearsBack);

        if (predictions.length === 0) {
            return res.status(200).json([]);
        }

        const topZones = getTopNDangerousZones(predictions, 5);
        res.status(200).json({
            period: `${new Date().getFullYear() - yearsBack + 1} - ${new Date().getFullYear()}`,
            topZones
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Erreur lors de l'analyse ML des zones dangereuses", 
            error: err.message 
        });
    }
});

module.exports = router;