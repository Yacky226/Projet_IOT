const express = require('express');
const { Accident, Street } = require('../models/Accident');
const fetchNYCAccidentData = require('../services/fetchNYCData');
const cleanAccidentData = require('../services/cleanData');
const calculateRiskByZone = require('../services/riskByZone');
const getMostDangerousZones = require('../services/dangerousZones');
const calculateRiskByHourAndZone = require('../services/riskByHourAndZone');
const processStreets = require('../services/geocode');
const Traffic = require('../models/Traffic');
const fetchTrafficData = require('../services/fetchTraffic');
const cleanTrafficData = require('../services/cleanTraffic');
const crash_current=require('../services/CrashperPeriod');
const topZone=require('../services/Topdangerous');
const { analyzeWithML, getTopNDangerousZoneswithMl } = require('../services/riskbyml');
const router = express.Router();

// Routes GET spécifiques d'abord
router.get('/risk-by-zone', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByZone = calculateRiskByZone(accidents);
        res.status(200).json(riskByZone);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du risque par zone", error: err.message });
    }
});

router.get('/crash-per-period',async(req,res)=>{
    try{
        const accidents=await Accident.find();
        const crashPerPeriod=crash_current(accidents);
        res.status(200).json(crashPerPeriod);
    }
    catch(err){
        res.status(500).json({message:"Erreur lors du calcul du crash par période",error:err.message});
    }
});


router.get('/top-dangerous-zones', async (req, res) => {
    try {
        const accidents=await Accident.find();
        const crashPerPeriod=crash_current(accidents);
        
        // Récupère le top 5 des zones les plus dangereuses
        const topZones = topZone(crashPerPeriod.accidentsByZone, 5); 

        res.status(200).json(topZones);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du top des zones les plus dangereuses", error: err.message });
    }
});

router.get('/most-dangerous-zones', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByZone = calculateRiskByZone(accidents);
        const mostDangerousZones = getMostDangerousZones(riskByZone, 2);
        console.log(mostDangerousZones);
        res.status(200).json(mostDangerousZones);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'obtention des zones dangereuses", error: err.message });
    }
});

router.get('/risk-by-hour-and-zone', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByHourAndZone = calculateRiskByHourAndZone(accidents);
        res.status(200).json(riskByHourAndZone);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du risque par heure et zone", error: err.message });
    }
});

router.get('/top-dangerous-zones-ml', async (req, res) => {
    try {
        const yearsBack = parseInt(req.query.years) || 1;
        if (yearsBack < 1) {
            return res.status(400).json({ message: "Le nombre d'années doit être supérieur ou égal à 1" });
        }

        const accidents = await Accident.find();
        const predictions = await analyzeWithML(accidents, yearsBack);

        if (predictions.length === 0) {
            return res.status(200).json([]);
        }

        const topZones = getTopNDangerousZoneswithMl(predictions, 5);
        res.status(200).json({
            period: `${new Date().getFullYear() - yearsBack + 1} - ${new Date().getFullYear()}`,
            topZones
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Erreur lors de l'analyse ML des zones dangereuses", 
            error: err.message 
        });
    }
});
// Autres routes
router.get('/', async (req, res) => {
    try {
        const accidents = await Accident.find().sort({ crash_date: -1 });
        res.status(200).json(accidents);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
    }
});

router.get('/traffic',async(req,res)=>{
    try{
        const traffic=await Traffic.find().sort({data_as_of:-1});
        res.status(200).json(traffic);
    }
    catch(err){
        res.status(500).json({message:"Erreur lors de la récupération",error:err.message});
    }
}   );
// Route générique pour obtenir un accident par ID
router.get('/:id', async (req, res) => {
    try {
        const accident = await Accident.findById(req.params.id);
        if (!accident) {
            return res.status(404).json({ message: "Accident non trouvé" });
        }
        res.status(200).json(accident);
    } catch (err) {
        res.status(500).json({ message: "Erreur de récupération", error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const rawData = await fetchNYCAccidentData();
        const { cleanedData, streetnames } = await cleanAccidentData(rawData);

        // Filtrer les noms de rue uniques avant insertion
        const uniqueStreetnames = [...new Set(streetnames)].map(name => ({ on_street_name: name }));

        // Insérer les données dans MongoDB
        await Accident.insertMany(cleanedData);
       // await Street.insertMany(uniqueStreetnames);

        res.status(201).json({ 
            message: 'Accidents importés et traités avec succès', 
            accidentCount: cleanedData.length, 
            streetCount: uniqueStreetnames.length 
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'importation", error: err.message });
    }
});

router.post('/traffic',async(req,res)=>{
    try{
        const rawData=await fetchTrafficData();
        const cleanedData=await cleanTrafficData(rawData);
        await Traffic.insertMany(cleanedData);
        res.status(201).json({message:"Traffic importé et traité avec succès",trafficCount:cleanedData.length});
    }
    catch(err){
        res.status(500).json({message:"Erreur lors de l'importation",error:err.message});
    }
});


router.post('/update', async (req, res) => {
    try {
        const existingIds = new Set(await Accident.distinct("collision_id"));

        const rawData = await fetchNYCAccidentData();
        const { cleanedData, streetnames } = await cleanAccidentData(rawData);

        // Filtrer uniquement les nouveaux accidents à insérer
        const newAccidents = cleanedData.filter(accident => 
            accident.collision_id && !existingIds.has(accident.collision_id)
        );

        if (newAccidents.length === 0) {
            return res.status(200).json({ message: "Aucun nouvel accident à ajouter" });
        }

        // Filtrer les noms de rue uniques avant insertion
        const uniqueStreetnames = [...new Set(streetnames)];

        // Vérifier si les rues existent déjà dans la collection Street
        const existingStreetnames = await Street.find({ on_street_name: { $in: uniqueStreetnames } })
            .distinct("on_street_name");

        // Filtrer les noms de rue qui n'existent pas encore
        const newStreetnames = uniqueStreetnames.filter(name => !existingStreetnames.includes(name));
        const streetnamesToInsert = newStreetnames.map(name => ({ on_street_name: name }));

        // Insérer les nouveaux accidents et les nouvelles rues
        await Accident.insertMany(newAccidents);
        if (streetnamesToInsert.length > 0) {
            await Street.insertMany(streetnamesToInsert);
        }

        res.status(201).json({ 
            message: "Mise à jour terminée", 
            newAccidentsCount: newAccidents.length, 
            newStreetsCount: streetnamesToInsert.length 
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
});

router.post('/update-traffic',async(req,res)=>{
    try{
        const existingIds=new Set(await Traffic.distinct("id"));
        const rawData=await fetchTrafficData();
        const cleanedData=await cleanTrafficData(rawData);
        const newTraffic=cleanedData.filter(traffic=>traffic.id && !existingIds.has(traffic.id));
        if(newTraffic.length===0){
            return res.status(200).json({message:"Aucun nouveau traffic à ajouter"});
        }
        await Traffic.insertMany(newTraffic);
        res.status(201).json({message:"Mise à jour terminée",newTrafficCount:newTraffic.length});
    }
    catch(err){
        res.status(500).json({message:"Erreur lors de la mise à jour",error:err.message});
    }
});
router.post('/geocode', async (req, res) => {
    try {
        await processStreets();  // Utilisation de processStreets pour géocoder les rues
        res.status(200).json({ message: "Géocodage terminé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du géocodage", error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const accident = await Accident.findByIdAndDelete(req.params.id);
        if (!accident) {
            return res.status(404).json({ message: "Accident non trouvé" });
        }
        res.status(200).json({ message: "Accident supprimé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur de suppression", error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedAccident = await Accident.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAccident) {
            return res.status(404).json({ message: "Accident non trouvé" });
        }
        res.status(200).json({ message: "Accident mis à jour", data: updatedAccident });
    } catch (err) {
        res.status(500).json({ message: "Erreur de mise à jour", error: err.message });
    }
});

module.exports = router;
