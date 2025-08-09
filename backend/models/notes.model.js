module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title cannot be empty' },
        len: {
          args: [3, 100],
          msg: 'Title must be 3-100 characters',
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Content cannot be empty' },
        len: {
          args: [10, 10000],
          msg: 'Content must be 10-10000 characters',
        },
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    pinned: {
      type: DataTypes.BOOLEAN,   // Use DataTypes.BOOLEAN here
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'notes',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['userId'], // Index for frequent queries
        name: 'notes_userId_idx',
      },
      {
        fields: ['title'], // Full-text search index
        type: 'FULLTEXT',  // Make sure your DB supports this
      },
    ],
  });

  Note.associate = (models) => {
    Note.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
      onDelete: 'CASCADE',
    });
  };

  // Instance methods
  Note.prototype.summarize = function() {
    return {
      id: this.id,
      title: this.title,
      preview: this.content.substring(0, 100) + '...',
    };
  };

  return Note;
};
