require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const accidentRoutes = require('./routes/accidents');
const cron = require('node-cron');
const axios = require('axios');

// Initialiser Express
const app = express();

//  traiter les requêtes JSON
app.use(express.json());
app.use('/accidents', accidentRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log(" Connecté à MongoDB"))
  .catch(err => console.error(" Erreur de connexion à MongoDB", err));

// Définir une route simple pour tester le serveur
app.get('/', (req, res) => {
  res.send('Serveur Express en marche !');
});

//  Automatiser la mise à jour des accidents toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log(" Mise à jour automatique des accidents...");
  try {
    const response = await axios.post('http://localhost:5000/accidents/update');
   // const response1= await axios.post('http://localhost:5000/accidents/update-traffic');
    console.log("Mise à jour terminée :", response.data.message);
    //console.log("Mise à jour terminée :", response1.data.message);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error.message);
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
