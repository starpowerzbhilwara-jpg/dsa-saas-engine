const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Application = require('./models/Application');
const BankConfig = require('./models/BankConfig');

const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const payoutRoutes = require('./routes/payoutRoutes');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Connect DB & Middlewares
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes Middleware
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payouts', payoutRoutes);
const smRoutes = require('./routes/smRoutes');
app.use('/api/sm', smRoutes);

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Advanced DSA Engine Running on http://localhost:${PORT}`);
});