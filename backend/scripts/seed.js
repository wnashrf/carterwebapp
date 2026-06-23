const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const CartItemHistory = require('../models/CartItemHistory');
const RedeemedVoucher = require('../models/RedeemedVoucher');

async function seedDatabase() {
  try {
    await connectDB();

    // Clean existing data sets entirely
    await Promise.all([
      Category.deleteMany({}),
      Voucher.deleteMany({}),
      User.deleteMany({}),
      CartItem.deleteMany({}),
      CartItemHistory.deleteMany({}),
      RedeemedVoucher.deleteMany({})
    ]);

    const categories = await Category.insertMany([
      { name: 'Food & Beverage' },
      { name: 'Shopping' },
      { name: 'Travel' },
      { name: 'Entertainment' },
      { name: 'Electronics' },
      { name: 'Home & Garden' }
    ]);

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});

    await Voucher.insertMany([
      // --- Food & Beverage ---
      {
        title: 'Starbucks RM10 Cash Voucher',
        description: 'Get RM10 off your favorite handcrafted beverage or pastry at any Starbucks outlet in Malaysia.',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
        points: 1000,
        category_id: categoryMap['Food & Beverage']
      },
      {
        title: 'Tealive Regular Drink Pass',
        description: 'Redeemable for any one standard-sized Signature Brown Sugar Pearl Milk Tea or beverage value.',
        image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&q=80',
        points: 650,
        category_id: categoryMap['Food & Beverage']
      },
      {
        title: 'Nando\'s 1/4 Chicken Combo',
        description: 'Enjoy a classic 1/4 flame-grilled PERi-PERi chicken accompanied by two regular sides.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
        points: 2400,
        category_id: categoryMap['Food & Beverage']
      },

      // --- Shopping ---
      {
        title: 'Shopee RM50 Gift Card',
        description: 'Valid sitewide on the Shopee App with no minimum spend threshold required.',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
        points: 5000,
        category_id: categoryMap['Shopping']
      },
      {
        title: 'GrabFood RM20 Discount Pass',
        description: 'Save RM20 on your next meal order delivery. Applicable across all preferred merchant partners.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
        points: 2000,
        category_id: categoryMap['Shopping']
      },
      {
        title: 'Uniqlo RM100 E-Voucher',
        description: 'Refresh your wardrobe style. Redeemable at any physical Uniqlo storefront nationwide.',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
        points: 9800,
        category_id: categoryMap['Shopping']
      },

      // --- Travel ---
      {
        title: 'Klook RM50 Activity Credit',
        description: 'Apply toward local staycations, theme park passes, attraction tickets, or transport booking rentals.',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
        points: 4800,
        category_id: categoryMap['Travel']
      },

      // --- Entertainment ---
      {
        title: 'GSC Movie Ticket Voucher',
        description: 'Valid for one standard 2D movie seat admission ticket at any Golden Screen Cinemas location.',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        points: 1800,
        category_id: categoryMap['Entertainment']
      },

      // --- Electronics ---
      {
        title: 'Baseus 65W GaN Fast Charger',
        description: 'High-speed multi-port desktop power adapter suitable for both laptops and smartphones.',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        points: 12000,
        category_id: categoryMap['Electronics']
      },

      // --- Home & Garden ---
      {
        title: 'Smart Wi-Fi LED Light Bulb',
        description: 'Adjust RGB accent illumination ambiances remotely via voice controls or mobile devices.',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
        points: 3500,
        category_id: categoryMap['Home & Garden']
      }
    ]);

    const demoUser = await User.create({
      email: 'demo@example.com',
      username: 'demoUser',
      password: 'Password123',
      points: 15000,
    });

    const activeVouchers = await Voucher.find({}).limit(2);
    await CartItem.insertMany(
      activeVouchers.map(v => ({ user: demoUser._id, voucher: v._id, quantity: 1 }))
    );

    console.log('Database seeding completed successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();