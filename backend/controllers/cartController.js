const CartItem = require('../models/CartItem');

// Add voucher to cart (or increment quantity if exists)
exports.addToCart = async (req, res) => {
  try {
    const { user, voucher, quantity } = req.body;
    if (!user || !voucher) return res.status(400).json({ message: 'user and voucher are required' });

    let item = await CartItem.findOne({ user, voucher });
    if (item) {
      item.quantity = item.quantity + (quantity || 1);
      await item.save();
      return res.status(200).json(item);
    }

    item = await CartItem.create({ user, voucher, quantity: quantity || 1 });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get cart items for a user
exports.getCartForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const items = await CartItem.find({ user: userId }).populate({ path: 'voucher', populate: { path: 'category_id' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ message: 'quantity is required' });
    const item = await CartItem.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete from cart
exports.deleteFromCart = async (req, res) => {
  try {
    const deleted = await CartItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cart item not found' });
    res.json({ message: 'Cart item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
