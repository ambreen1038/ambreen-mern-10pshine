const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING, email: { type: DataTypes.STRING, unique: true }, password: DataTypes.STRING
  });
  User.beforeCreate(u => u.password = bcrypt.hashSync(u.password, 10));
  User.associate = db => User.hasMany(db.Note, { foreignKey: 'userId' });
  return User;
};
