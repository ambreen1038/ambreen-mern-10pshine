const fs = require('fs'), path = require('path'), { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
});
const db = { sequelize, Sequelize };
fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js')
  .forEach(f => {
    const model = require(path.join(__dirname, f))(sequelize, DataTypes);
    db[model.name] = model;
  });
Object.values(db).forEach(model => model.associate?.(db));
module.exports = db;
