const cleanAccidentData = async (rawData) => {
    const cleanedData = [];
    const streetnamesSet = new Set(); // Utiliser un Set pour éviter les doublons

    for (const accident of rawData) {
        try {
            const { on_street_name, borough, crash_date, crash_time, collision_id } = accident;

            // Vérifier si l'identifiant est présent
            if (!collision_id) {
                console.warn(" collision_id manquant, accident ignoré");
                continue;
            }

            let nameStreet = "";
            let latitude = null;
            let longitude = null;

            // Si des coordonnées GPS sont fournies
            if (accident.latitude && accident.longitude) {
                latitude = parseFloat(accident.latitude);
                longitude = parseFloat(accident.longitude);
                nameStreet = accident.borough?.trim() || accident.on_street_name?.trim();
            } 
            // Si on a un nom de rue, on l'ajoute
            else if (on_street_name) {
                nameStreet = on_street_name.trim();
                //streetnamesSet.add(nameStreet); // Ajoute uniquement les noms uniques
            }

            cleanedData.push({
                collision_id,
                crash_date: crash_date ? new Date(crash_date) : null,
                crash_time: crash_time || "00:00",
                on_street_name: nameStreet,
                number_of_persons_injured: isNaN(parseInt(accident.number_of_persons_injured)) ? 0 : parseInt(accident.number_of_persons_injured),
                number_of_persons_killed: isNaN(parseInt(accident.number_of_persons_killed)) ? 0 : parseInt(accident.number_of_persons_killed),
                contributing_factor_vehicle_1: accident.contributing_factor_vehicle_1?.trim() || "Non précisé",
                vehicle_type_code1: accident.vehicle_type_code1?.trim() || "Non précisé",
                latitude, 
                longitude
            });
        } catch (error) {
            console.warn(` Erreur lors du traitement d'un accident (collision_id: ${accident.collision_id || "N/A"}) : ${error.message}`);
        }
    }

    return { cleanedData, streetnames: [...streetnamesSet] }; // Convertir le Set en tableau
};

module.exports = cleanAccidentData;
