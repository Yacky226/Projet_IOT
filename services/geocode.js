const { Accident, Street } = require('../models/Accident');
const StreetCoordinates = require('../models/Streets');
require("dotenv").config(); 

// Fonction pour appeler l’API Nominatim (OpenStreetMap)
const geocodeAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, { headers: { "User-Agent": "my_unique_app_name" } });
        
        // Handle rate limit
        const remainingRequests = response.headers.get('X-RateLimit-Remaining');
        if (remainingRequests && remainingRequests === "0") {
            const resetTime = response.headers.get('X-RateLimit-Reset');
            const waitTime = (resetTime - Math.floor(Date.now() / 1000)) + 1; // wait for the reset time
            console.log(`Rate limit exceeded. Waiting for ${waitTime} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            return geocodeAddress(address); // Retry after waiting
        }

        const data = await response.json();

        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Erreur lors du géocodage de ${address}:`, error);
        return null;
    }
};

// Fonction principale pour récupérer les rues et les géocoder
const processStreets = async () => {
    const streets = await Street.distinct("on_street_name"); // Récupérer les noms de rue uniques

    for (let i = 0; i < streets.length; i++) {
        const street = streets[i];
        if (!street) continue;

        console.log(` Géocodage de : ${street}`);

        // Vérifier si les coordonnées existent déjà dans StreetCoordinates
        const existingCoordinates = await StreetCoordinates.findOne({ on_street_name: street });

        if (existingCoordinates) {
            console.log(` Coordonnées déjà présentes pour : ${street} → ${existingCoordinates.latitude}, ${existingCoordinates.longitude}`);
            continue; // Passer à la prochaine rue si les coordonnées existent déjà
        }

        // Si les coordonnées n'existent pas, procéder au géocodage
        const result = await geocodeAddress(street + ", NYC"); // Ajouter NYC pour plus de précision

        if (result) {
            console.log(` ${street} → ${result.lat}, ${result.lon}`);

            // Sauvegarder les coordonnées dans MongoDB 
            await StreetCoordinates.updateOne(
                { on_street_name: street },
                { $set: { latitude: result.lat, longitude: result.lon } },
                { upsert: true }
            );
        } else {
            console.log(` Adresse non trouvée : ${street}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause de 1s entre les requêtes
    }

    console.log(" Géocodage terminé !");
};


module.exports = processStreets;