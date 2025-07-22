module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
  });
  Note.associate = db => Note.belongsTo(db.User, { foreignKey: 'userId' });
  return Note;
};
