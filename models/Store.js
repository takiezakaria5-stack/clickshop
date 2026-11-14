const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true, unique: true },
  domainSlug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, required: true },
  ownerName: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', storeSchema);
