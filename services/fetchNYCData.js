const axios = require('axios');

async function fetchNYCAccidentData() {
    try {
        const batchSize = 500000; // Nombre total de données à récupérer
        const chunkSize = 10000; // Taille de chaque requête
        let requests = [];

        for (let offset = 0; offset < batchSize; offset += chunkSize) {
            requests.push(
                axios.get('https://data.cityofnewyork.us/resource/h9gi-nx95.json', {
                    params: {
                        $limit: chunkSize,
                        $offset: offset
                    }
                })
            );
        }

        // Exécuter toutes les requêtes en parallèle
        const responses = await Promise.all(requests);

        // Extraire et concaténer les données de chaque réponse
        const allData = responses.flatMap(response => response.data);

        return allData;
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        throw error;
    }
}

module.exports = fetchNYCAccidentData;
