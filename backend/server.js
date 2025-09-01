require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');
const userRoutes = require('./routes/users');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Connect DB and sync models
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync(); // auto-create tables
  })
  .then(() => console.log('✅ Models synced'))
  .catch(err => console.error('❌ DB Error:', err));

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
