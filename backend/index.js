const express = require('express'), cors = require('cors');
const dotenv = require('dotenv'); dotenv.config();
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors(), express.json());
app.use('/api/auth', authRoutes);

sequelize.sync().then(() => {
  console.log('✅ DB connected');
  app.listen(process.env.PORT, () => console.log(`⚡️ Server on :${process.env.PORT}`));
});
