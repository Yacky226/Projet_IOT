const { RandomForestRegression } = require('ml-random-forest');


function calculateStatistics(accidents, yearsBack) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack + 1;
    const startOfPeriod = new Date(`${startYear}-01-01T00:00:00.000Z`);
    const endOfPeriod = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const periodAccidents = accidents.filter(accident => {
        const crashDate = new Date(accident.crash_date);
        return crashDate >= startOfPeriod && crashDate <= endOfPeriod;
    });

    if (periodAccidents.length === 0) return { totalAccidents: 0, accidentsByZone: {} };

    const stats = { totalAccidents: periodAccidents.length, accidentsByZone: {} };
    periodAccidents.forEach(accident => {
        const zone = accident.on_street_name || "Zone non spécifiée";
        if (!stats.accidentsByZone[zone]) {
            stats.accidentsByZone[zone] = {
                totalAccidents: 0,
                totalInjured: 0,
                totalKilled: 0,
                longitude: accident.longitude,
                latitude: accident.latitude
            };
        }
        stats.accidentsByZone[zone].totalAccidents += 1;
        stats.accidentsByZone[zone].totalInjured += accident.number_of_persons_injured || 0;
        stats.accidentsByZone[zone].totalKilled += accident.number_of_persons_killed || 0;
    });
    return stats;
}

// New ML-based analysis function
async function analyzeWithML(accidents, yearsBack) {
    const stats = calculateStatistics(accidents, yearsBack);
    if (stats.totalAccidents === 0) return { totalAccidents: 0, predictions: [] };

    // Prepare training data
    const X = []; // Features
    const y = []; // Target (riskIndex)
    const zones = [];

    for (const [zone, data] of Object.entries(stats.accidentsByZone)) {
        const features = [
            data.totalAccidents,
            data.totalInjured,
            data.totalKilled,
            data.latitude || 0, // Fallback if missing
            data.longitude || 0
        ];
        const riskIndex = data.totalAccidents + (data.totalInjured * 2) + (data.totalKilled * 5);
        
        X.push(features);
        y.push(riskIndex);
        zones.push(zone);
    }

    // Train Random Forest model
    const options = { maxFeatures: 5, nEstimators: 100 }; // Tune these as needed
    const rf = new RandomForestRegression(options);
    rf.train(X, y);

    // Predict risk for each zone
    const predictions = rf.predict(X);
    const results = zones.map((zone, i) => ({
        zone,
        predictedRiskIndex: predictions[i],
        totalAccidents: stats.accidentsByZone[zone].totalAccidents,
        totalInjured: stats.accidentsByZone[zone].totalInjured,
        totalKilled: stats.accidentsByZone[zone].totalKilled,
        longitude: stats.accidentsByZone[zone].longitude,
        latitude: stats.accidentsByZone[zone].latitude
    }));

    // Sort by predicted risk and take top N
    return results.sort((a, b) => b.predictedRiskIndex - a.predictedRiskIndex);
}

function getTopNDangerousZoneswithMl(predictions, n) {
    return predictions.slice(0, n).map(data => ({
        zone: data.zone,
        totalAccidents: data.totalAccidents,
        totalInjured: data.totalInjured,
        totalKilled: data.totalKilled,
        predictedRiskIndex: Number(data.predictedRiskIndex.toFixed(2))
    }));
}

module.exports ={analyzeWithML, getTopNDangerousZoneswithMl};