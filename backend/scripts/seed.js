require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');

// Models
const Category = require('../models/Category');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const CartItemHistory = require('../models/CartItemHistory');
const RedeemedVoucher = require('../models/RedeemedVoucher');

async function seedDatabase() {
  try {
    // Connect to DB
    await connectDB();

    // Clean existing data
    await Promise.all([
      Category.deleteMany({}),
      Voucher.deleteMany({}),
      User.deleteMany({}),
      CartItem.deleteMany({}),
      CartItemHistory.deleteMany({}),
      RedeemedVoucher.deleteMany({})
    ]);

    // Seed categories
    const categories = await Category.insertMany([
      { name: 'Electronics' },
      { name: 'Books' },
      { name: 'Home & Garden' }
    ]);
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});

    // Seed vouchers
    await Voucher.insertMany([
      {
        title: 'Wireless Headphones',
        description: 'Redeem for a premium pair of wireless headphones.',
        image: 'https://example.com/images/headphones.png',
        points: 150,
        category_id: categoryMap['Electronics']
      },
      {
        title: 'E-Book Gift Card',
        description: 'Use on your next digital book purchase.',
        image: 'https://example.com/images/ebook.png',
        points: 50,
        category_id: categoryMap['Books']
      },
      {
        title: 'Smart Light Bulb',
        description: 'Save energy with a Wi‑Fi enabled smart bulb.',
        image: 'https://example.com/images/lightbulb.png',
        points: 120,
        category_id: categoryMap['Home & Garden']
      },
      {
        title: 'Coffee Maker Discount',
        description: 'Redeem for a discount on a popular coffee maker.',
        image: 'https://example.com/images/coffeemaker.png',
        points: 200,
        category_id: categoryMap['Home & Garden']
      },
      {
        title: 'Novel Bundle',
        description: 'Pick up a curated bundle of bestselling novels.',
        image: 'https://example.com/images/novel-bundle.png',
        points: 80,
        category_id: categoryMap['Books']
      }
    ]);

    // Seed a demo user
    const demoUser = await User.create({
      email: 'demo@example.com',
      username: 'demoUser',
      password: 'DemoPass123' // Note: password will be hashed by pre‑save hook
    });

    // Seed a few cart items for the demo user
    const sampleVouchers = await Voucher.find({}).limit(2);
    await CartItem.insertMany(
      sampleVouchers.map(v => ({ user: demoUser._id, voucher: v._id, quantity: 1 }))
    );

    console.log('✅ Database seeding completed successfully');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    // Close the connection gracefully
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
