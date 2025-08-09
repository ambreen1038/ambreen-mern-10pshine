module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name cannot be empty' },
          len: [2, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          name: 'users_email',
          msg: 'Email already in use',
        },
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Uncomment if used in scopes
      /*
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      */
    },
    {
      tableName: 'users',
      paranoid: true,
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: [
            'passwordHash',
            'resetToken',
            'resetTokenExpiry',
            'lastLoginAt',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
        },
      },
      scopes: {
        withSensitive: {
          attributes: { include: ['passwordHash', 'resetToken'] },
        },
        withResetToken: {
          attributes: { include: ['resetToken', 'resetTokenExpiry'] },
        },
        withPassword: {
          attributes: { include: ['id', 'name', 'email', 'passwordHash'] },
        },
        withoutPassword: {
          attributes: { exclude: ['passwordHash', 'resetToken', 'resetTokenExpiry'] },
        },
      },
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Note, {
      foreignKey: 'userId',
      as: 'notes',
      onDelete: 'CASCADE',
    });
  };

  return User;
};
