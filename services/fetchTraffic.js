const axios = require('axios');
require('dotenv').config(); 

const TRAFFIC_API_URL = process.env.TRAFFIC_API_URL;

async function fetchTrafficData() {
    try {
        console.log(`Fetching traffic data from: ${TRAFFIC_API_URL}`);
        const response = await axios.get(TRAFFIC_API_URL);
        
        if (!response.data || response.data.length === 0) {
            console.warn("Aucune donnée reçue !");
            return [];
        }

        console.log(`Données récupérées : ${response.data.length} entrées`);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`Erreur API (${error.response.status}): ${error.response.statusText}`);
        } else if (error.request) {
            console.error("Erreur de connexion à l'API, aucune réponse reçue !");
        } else {
            console.error("Erreur lors de la récupération des données :", error.message);
        }
        throw error;
    }
}

module.exports = fetchTrafficData;
