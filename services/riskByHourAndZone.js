function calculateRiskByHourAndZone(accidents) {
    const riskByHourAndZone = {};

    accidents.forEach(accident => {
        const hour = new Date(accident.crash_date).getHours(); // Heure de l'accident
        const zone = accident.on_street_name;

        if (!riskByHourAndZone[hour]) {
            riskByHourAndZone[hour] = {};
        }

        if (!riskByHourAndZone[hour][zone]) {
            riskByHourAndZone[hour][zone] = {
                totalAccidents: 0,
                totalInjuries: 0,
                totalDeaths: 0
            };
        }

        riskByHourAndZone[hour][zone].totalAccidents++;
        riskByHourAndZone[hour][zone].totalInjuries += accident.number_of_persons_injured;
        riskByHourAndZone[hour][zone].totalDeaths += accident.number_of_persons_killed;
    });

    // Calculer le score de risque par heure et zone
    Object.keys(riskByHourAndZone).forEach(hour => {
        Object.keys(riskByHourAndZone[hour]).forEach(zone => {
            const risk = riskByHourAndZone[hour][zone];
            const severityScore = (risk.totalAccidents * 2) + (risk.totalInjuries * 1.5) + (risk.totalDeaths * 3);
            riskByHourAndZone[hour][zone].riskScore = severityScore;
        });
    });

    return riskByHourAndZone;
}

module.exports = calculateRiskByHourAndZone;
