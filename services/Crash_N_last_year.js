function analyzeLastNYearsAccidentsByZone(accidents, n) {
    // Vérifier que n est valide
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("Le paramètre n doit être un entier positif.");
    }
  
    // Définir l'année courante et les limites temporelles
    const currentYear = new Date().getFullYear(); // 2025 aujourd'hui
    const startYear = currentYear - n + 1; // Ex: si n=3, startYear = 2023
    const startOfPeriod = new Date(`${startYear}-01-01T00:00:00.000Z`);
    const endOfPeriod = new Date(`${currentYear}-12-31T23:59:59.999Z`);
  
    // Filtrer les accidents des n dernières années
    const lastNYearsAccidents = accidents.filter(accident => {
      const crashDate = new Date(accident.crash_date);
      return crashDate >= startOfPeriod && crashDate <= endOfPeriod;
    });
  
    // Si aucun accident n'est trouvé
    if (lastNYearsAccidents.length === 0) {
      return {
        message: `Aucun accident trouvé pour les ${n} dernières années (de ${startYear} à ${currentYear}).`,
        totalAccidents: 0
      };
    }
  
    // Initialiser les statistiques
    const stats = {
      totalAccidents: lastNYearsAccidents.length,
      totalInjured: 0,
      totalKilled: 0,
      accidentsByYear: {}
    };
  
    // Analyser chaque accident
    lastNYearsAccidents.forEach(accident => {
      // Somme globale des blessés et tués
      stats.totalInjured += accident.number_of_persons_injured || 0;
      stats.totalKilled += accident.number_of_persons_killed || 0;
  
      // Extraire l'année de l'accident
      const crashYear = new Date(accident.crash_date).getFullYear();
      if (!stats.accidentsByYear[crashYear]) {
        stats.accidentsByYear[crashYear] = {
          totalAccidents: 0,
          totalInjured: 0,
          totalKilled: 0,
          accidentsByZone: {}
        };
      }
  
      // Mettre à jour les stats par année
      const yearStats = stats.accidentsByYear[crashYear];
      yearStats.totalAccidents += 1;
      yearStats.totalInjured += accident.number_of_persons_injured || 0;
      yearStats.totalKilled += accident.number_of_persons_killed || 0;
  
      // Zone
      const zone = accident.on_street_name || "Zone non spécifiée";
      if (!yearStats.accidentsByZone[zone]) {
        yearStats.accidentsByZone[zone] = {
          totalAccidents: 0,
          totalInjured: 0,
          totalKilled: 0,
          longitude: accident.longitude,
          latitude: accident.latitude
        };
      }
  
      // Mettre à jour les stats par zone dans l'année
      const zoneStats = yearStats.accidentsByZone[zone];
      zoneStats.totalAccidents += 1;
      zoneStats.totalInjured += accident.number_of_persons_injured || 0;
      zoneStats.totalKilled += accident.number_of_persons_killed || 0;
    });
  
    return stats;
  }
  
  
  
  module.exports = analyzeLastNYearsAccidentsByZone;