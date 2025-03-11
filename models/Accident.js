const mongoose = require('mongoose');

const AccidentSchema = new mongoose.Schema({
    crash_date: { type: Date, required: true },
    crash_time: { type: String, default: "00:00" }, // Ajout d'une valeur par défaut
    on_street_name: { type: String, required: true }, // Ajout de required si le champ est essentiel
    number_of_persons_injured: { type: Number, default: 0 },
    number_of_persons_killed: { type: Number, default: 0 },
    contributing_factor_vehicle_1: { type: String, default: "Unknown" },
    vehicle_type_code1: { type: String, default: "Unknown" },
    collision_id: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
}, { timestamps: true }); // Ajoute automatiquement createdAt et updatedAt

// Index sur on_street_name pour optimiser les requêtes
AccidentSchema.index({ on_street_name: 1 });

const StreetSchema = new mongoose.Schema({
    on_street_name: { type: String, required: true, unique: true }
}, { timestamps: true });

// Exportation des modèles
module.exports = {
    Accident: mongoose.model('Accident', AccidentSchema),
    Street: mongoose.model('Street', StreetSchema)
};
