function calculateStatistics(accidents) {
    const currentYear = new Date().getFullYear(); 
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const currentYearAccidents = accidents.filter(accident => {
        const crashDate = new Date(accident.crash_date);
        return crashDate >= startOfYear && crashDate <= endOfYear;
    });

    if (currentYearAccidents.length === 0) {
        return {
            message: `Aucun accident trouvé pour l'année ${currentYear}.`,
            totalAccidents: 0,
            accidentsByZone: {}
        };
    }

    const stats = {
        totalAccidents: currentYearAccidents.length,
        totalInjured: 0,
        totalKilled: 0,
        accidentsByZone: {}
    };

    currentYearAccidents.forEach(accident => {
        const injured = accident.number_of_persons_injured || 0;
        const killed = accident.number_of_persons_killed || 0;

        stats.totalInjured += injured;
        stats.totalKilled += killed;

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

        const zoneStats = stats.accidentsByZone[zone];
        zoneStats.totalAccidents += 1;
        zoneStats.totalInjured += injured;
        zoneStats.totalKilled += killed;
    });

    return stats;
}

function calculateRiskIndex(statsByZone, totalAccidents) {
    const riskStats = {};

    if (totalAccidents === 0) {
        return riskStats;
    }

    for (const zone in statsByZone) {
        const zoneData = statsByZone[zone];
        riskStats[zone] = {
            ...zoneData,
            riskIndex: zoneData.totalAccidents + (zoneData.totalInjured * 2) + (zoneData.totalKilled * 5),
            indice_de_risque: 0 // Initialize, will be updated later
        };
    }

    return riskStats;
}

function rankZonesByRisk(accidentsByZone) {
    // Calculate min and max risk indices for normalization
    const indices = Object.values(accidentsByZone).map(zone => zone.riskIndex);
    const maxIndex = Math.max(...indices);
    const minIndex = Math.min(...indices);
    const range = maxIndex - minIndex || 1; // Avoid division by zero

    const rankedZones = Object.entries(accidentsByZone)
        .map(([zone, data]) => ({
            zone,
            ...data,
            indice_de_risque: range ? ((data.riskIndex - minIndex) / range) * 100 : 0 // Normalize to 0-100%
        }))
        .sort((a, b) => b.indice_de_risque - a.indice_de_risque);

    return rankedZones;
}

function analyzeCurrentYearAccidentsByZone(accidents) {
    const stats = calculateStatistics(accidents);
    if (stats.totalAccidents === 0) {
        return stats;
    }

    // Calculate risk indices
    stats.accidentsByZone = calculateRiskIndex(stats.accidentsByZone, stats.totalAccidents);

    // Rank zones and update accidentsByZone with normalized indices
    const rankedZones = rankZonesByRisk(stats.accidentsByZone);
    stats.rankedZones = rankedZones;

    // Update accidentsByZone with normalized indices
    rankedZones.forEach(({ zone, indice_de_risque }) => {
        if (stats.accidentsByZone[zone]) {
            stats.accidentsByZone[zone].indice_de_risque = indice_de_risque;
        }
    });

    return stats;
}

module.exports = analyzeCurrentYearAccidentsByZone;