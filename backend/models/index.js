const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// Initialize Sequelize with enhanced configuration
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], {
      ...config,
      dialectOptions: config.dialectOptions,
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      },
      benchmark: true,
      retry: {
        max: 3,
        timeout: 3000
      }
    })
  : new Sequelize(config.database, config.username, config.password, config);

// Model loader with error handling
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.js')
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } catch (error) {
      console.error(`Error loading model ${file}:`, error);
    }
  });

// Association setup
Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Add instance methods
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Connection test (optional)
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Connection error:', err));

module.exports = db;