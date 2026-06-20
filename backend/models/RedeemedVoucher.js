// models/RedeemedVoucher.js
const mongoose = require('mongoose');

const redeemedVoucherSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voucher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  uniqueCode:  { type: String, required: true, unique: true }, 
  isUsed:      { type: Boolean, default: false },
  redeemedAt:  { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('RedeemedVoucher', redeemedVoucherSchema);