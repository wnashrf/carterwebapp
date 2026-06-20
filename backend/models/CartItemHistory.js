// models/CartItemHistory.js 
const mongoose = require('mongoose');

const cartHistorySchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  quantity:{ type: Number, min: 1 },
  timestamp:{ type: Date, default: Date.now }   // when it was purchased
});
module.exports = mongoose.model('CartItemHistory', cartHistorySchema);
