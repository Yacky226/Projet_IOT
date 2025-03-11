const mongoose = require('mongoose');

const TrafficSchema = new mongoose.Schema({
   id: { type: Number, required: true },
   speed: { type: Number, required: true },
   travel_time: { type: Number, required: true }, 
   data_as_of: { type: Date, required: true },
   locations: [{
       lat: { type: Number, required: true },
       lon: { type: Number, required: true }
   }],
   link_id: { type: Number, required: true },
   link_name: { type: String, required: true },
   borough: { type: String, required: true },
   status: { type: Number, required: true }, 
}, { timestamps: true });

const Traffic = mongoose.model('Traffic', TrafficSchema);

module.exports = Traffic;
