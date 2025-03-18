function getTopNDangerousZones(accidentsByZone, n) {
    const sortedZones = Object.entries(accidentsByZone)
        .sort(([, a], [, b]) => (b.indice_de_risque || 0) - (a.indice_de_risque || 0)) // Fallback to 0 if undefined
        .slice(0, n);

    return sortedZones.map(([zone, data]) => ({
        zone,
        totalAccidents: data.totalAccidents,
        totalInjured: data.totalInjured,
        totalKilled: data.totalKilled,
        riskIndex: data.riskIndex,
        riskPercentage: Number((data.indice_de_risque || 0).toFixed(2)) // Fallback to 0 if undefined
    }));
}

module.exports = getTopNDangerousZones;