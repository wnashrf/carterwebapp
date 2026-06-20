// controllers/voucherController.js
const Voucher = require('../models/Voucher');

// CREATE
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ all (with optional category filter and category populated)
exports.getVouchers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category_id = req.query.category;
    const list = await Voucher.find(filter).populate('category_id');
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ one
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('category_id');
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateVoucher = async (req, res) => {
  try {
    const updated = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Voucher not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteVoucher = async (req, res) => {
  try {
    const deleted = await Voucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};