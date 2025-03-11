function calculateRiskByZone(accidents) {
    // Supposons que le nom de la rue soit utilisé pour la zone
    const riskByZone = accidents.reduce((acc, accident) => {
        const zone = accident.on_street_name;
        const injuries=accident.injuries;
        const deaths= accident.deaths;
        
        // const longitude=accident.longitude;
        // const latitude=accident.latitude;
        // if(!latitude || !longitude)
        // {
        //     console.log(`Zone non traité manque de coordonnées${zone}`);
        //     return acc;
        // }
        
        // Si la zone n'existe pas encore, initialisez-la
        if (!acc[zone]) {
           
            acc[zone] = { accidentsCount: 0, risque: 0 ,injuries:0,deaths:0,rate_gravity:0,indice_de_rosque:0};
            // acc[zone] = { accidentsCount: 0, risque: 0 ,injuries:0,deaths:0,lon:longitude,lat:latitude};
        }
        
        // Incrémenter le nombre d'accidents dans la zone
        acc[zone].accidentsCount += 1;
        acc[zone].injuries+=accident.number_of_persons_injured;
        acc[zone].deaths+=accident.number_of_persons_killed;

        return acc;
    }, {});

    // Calcul du risque par zone (en pourcentage par rapport au total des accidents)
    const totalAccidents = accidents.length;
    Object.keys(riskByZone).forEach(zone => {
        riskByZone[zone].risque = (riskByZone[zone].accidentsCount+riskByZone[zone].injuries*2 +riskByZone[zone].deaths*5);
        riskByZone[zone].risque = (riskByZone[zone].accidentsCount+riskByZone[zone].injuries*2 +riskByZone[zone].deaths*5)
    });

    return riskByZone;
}

module.exports = calculateRiskByZone;
