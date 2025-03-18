function calculateRiskByZone(accidents) {
    // Supposons que le nom de la rue soit utilisé pour la zone
    const riskByZone = accidents.reduce((acc, accident) => {
        const zone = accident.on_street_name;
        
        
        // const longitude=accident.longitude;
        // const latitude=accident.latitude;
        // if(!latitude || !longitude)
        // {
        //     console.log(`Zone non traité manque de coordonnées${zone}`);
        //     return acc;
        // }
        
        // Si la zone n'existe pas encore, initialisez-la
        if (!acc[zone]) {
           
            acc[zone] = { accidentsCount: 0, risque: 0 ,injuries:0,deaths:0,rate_gravity:0,indice_de_risque:0,latitude:accident.latitude,longitude:accident.longitude,freq:0};
            // acc[zone] = { accidentsCount: 0, risque: 0 ,injuries:0,deaths:0,lon:longitude,lat:latitude};
        }
        
        // Incrémenter le nombre d'accidents dans la zone
        acc[zone].accidentsCount += 1;
        acc[zone].injuries+=accident.number_of_persons_injured;
        acc[zone].deaths+=accident.number_of_persons_killed;

        return acc;
    }, {});

    // Calcul du risque par zone (en pourcentage par rapport au total des accidents)

    let totalAccidents = 0;
    Object.keys(riskByZone).forEach(zone => {
        totalAccidents += riskByZone[zone].accidentsCount;
    });
  
    Object.keys(riskByZone).forEach(zone => {
        riskByZone[zone].freq=(riskByZone[zone].accidentsCount/totalAccidents);
        riskByZone[zone].indice_de_risque = (riskByZone[zone].accidentsCount+riskByZone[zone].injuries*2 +riskByZone[zone].deaths*3/totalAccidents);
        riskByZone[zone].risque = (riskByZone[zone].accidentsCount+riskByZone[zone].injuries*2 +riskByZone[zone].deaths*3);
        riskByZone[zone].rate_gravity = (riskByZone[zone].risque*1.5);
    });

    return riskByZone;
}

module.exports = calculateRiskByZone;
