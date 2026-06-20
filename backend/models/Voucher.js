// models/Voucher.js
const mongoose = require('mongoose');
 
const voucherSchema = new mongoose.Schema({
  title:       { type: String, required:true },
  description: { type: String },
  image:       { type: String },                 // image URL
  points:      { type: Number, required:true,min: 0 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required:true }, // FK
  isAvailable: { type: Boolean, default: true },
  expiryDate:  { type: Date }
}, {timestamps:true });
 
module.exports = mongoose.model('Voucher',voucherSchema);