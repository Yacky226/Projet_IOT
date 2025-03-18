const axios = require('axios');

async function fetchNYCAccidentData() {
    try {
        const batchSize = 100000; // Nombre total de données à récupérer
        const chunkSize = 10000; // Taille de chaque requête
        let requests = [];

        for (let offset = 0; offset < batchSize; offset += chunkSize) {
            requests.push(
                axios.get('https://data.cityofnewyork.us/resource/h9gi-nx95.json', {
                    params: {
                        $limit: chunkSize,
                        $offset: offset,
                        $where: "crash_date >= '2022-01-01T00:00:00.000'", // Filtre depuis 2021
                        $order: "crash_date DESC" // Trie du plus récent au plus ancien
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
