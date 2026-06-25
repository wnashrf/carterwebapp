require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.get('/api/vouchers/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const safePattern = /^VOUCHER_[A-Z0-9]{6,8}_\d+\.pdf$/i;
  if (!safePattern.test(filename)) {
    return res.status(400).send('Invalid file format request.');
  }

  const filePath = path.resolve(__dirname, 'vouchers', filename);
  res.download(filePath, filename, (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('Voucher file not found.');
    }
  });
});
app.use('/vouchers', express.static(path.join(__dirname, 'vouchers')));

app.use('/api/categories', categoryRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});