// migrations/20260708_add_dealRate_and_outcome_to_Leads.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Leads', 'dealRate', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Leads', 'expectedCloseDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Leads', 'dealOutcome', {
      type: Sequelize.ENUM('pending', 'won', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Leads', 'dealRate');
    await queryInterface.removeColumn('Leads', 'expectedCloseDate');
    await queryInterface.removeColumn('Leads', 'dealOutcome');
  },
};
