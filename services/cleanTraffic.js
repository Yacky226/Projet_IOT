const cleanTraffic = async (Trafficdata) => {
    const cleanedData = [];

    for (const traffic of Trafficdata) {
        try {
            // Correction du nom de travel_time
            const { id, borough, travel_time, data_as_of, link_id, link_name, status, link_points } = traffic;

            // Vérification des données obligatoires
            if (!id || !link_points) {
                console.warn(`ID ou link_points manquant, traffic ignoré (id: ${id || "N/A"})`);
                continue;
            }

            // Transformation des coordonnées GPS en un tableau d'objets {lat, lon}
            let locations = [];
            if (link_points) {
                const points = link_points.split(' '); // Récupérer un tableau de points
                locations = points.map(point => {
                    const [lat, lon] = point.split(',');
                    return {
                        lat: parseFloat(lat) || null,
                        lon: parseFloat(lon) || null
                    };
                }).filter(loc => loc.lat !== null && loc.lon !== null); // Filtrer les points invalides
            }

            // Ajout des données nettoyées
            cleanedData.push({
                id,
                speed: isNaN(parseInt(traffic.speed)) ? 0 : parseInt(traffic.speed),
                travel_time: isNaN(parseInt(travel_time)) ? 0 : parseInt(travel_time),
                data_as_of: data_as_of ? new Date(data_as_of) : null,
                locations,
                link_id,
                link_name,
                borough,
                status
            });

        } catch (error) {
            console.warn(`Erreur lors du traitement d'un traffic (id: ${traffic.id || "N/A"}) : ${error.message}`);
        }
    }

    return cleanedData;
};

module.exports = cleanTraffic;