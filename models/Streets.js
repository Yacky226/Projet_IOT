const mongoose = require('mongoose');

const StreetSchema = new mongoose.Schema({
    on_street_name: { type: String, required: true, unique: true },
    latitude: { type: Number },
    longitude: { type: Number }
});

const StreetCoordinates = mongoose.model('StreetCoordinates', StreetSchema);

module.exports = StreetCoordinates;