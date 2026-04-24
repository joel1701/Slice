const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { scheduleMonthlySummary, sendMonthlySummaries } = require('./services/montlySummary');
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sliceapp-pi.vercel.app',    // your exact Vercel URL
    'https://sliceapp.vercel.app',       // add any aliases too
  ],
  credentials: true,
}));
app.get('/', (req, res) => {
  res.json({ message: 'Slice API running', timestamp: new Date().toISOString() });
});
// TEMPORARY TEST ROUTE — remove before deploying
app.get('/test-monthly-email', async (req, res) => {
  try {
    const result = await sendMonthlySummaries();
    res.json({ message: 'Monthly summary job completed', result });
  } catch (error) {
    console.error('Manual monthly summary trigger failed:', error);
    res.status(500).json({ message: 'Monthly summary job failed', error: error.message });
  }
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/groups',   require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  // handle multer file size error specifically
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);

  // start the monthly summary cron job after server boots
  scheduleMonthlySummary();
});