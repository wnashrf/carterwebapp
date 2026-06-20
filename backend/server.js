require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
// Mount route modules
const categoryRoutes = require('./routes/categoryRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
 
const app = express();
 
// Database Connection
connectDB();
 
// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});