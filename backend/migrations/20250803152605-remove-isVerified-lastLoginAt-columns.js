'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove both columns
    await queryInterface.removeColumn('users', 'isVerified');
    await queryInterface.removeColumn('users', 'lastLoginAt');
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: add columns back if you ever revert the migration
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('users', 'lastLoginAt', {
      type: Sequelize.DATE,
    });
  }
};
