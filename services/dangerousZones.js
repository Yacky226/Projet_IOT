function getMostDangerousZones(riskByZone, topN = 5) {
    // Trier les zones par score de risque décroissant
    const sortedZones = Object.entries(riskByZone)
        .sort((a, b) => b[1].risque - a[1].risque)
        .slice(0, topN);

    // Retourner les N zones les plus dangereuses
    return sortedZones.map(([zone, data]) => ({
        zone: zone,
        riskScore: data.risque,
        accidents: data.accidentsCount,
        injuries: data.injuries,
        deaths: data.deaths
    }));
}

module.exports = getMostDangerousZones;
