// Add these if they are missing in server.js
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/banks', require('./routes/bankRoutes'));