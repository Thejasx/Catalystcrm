module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Leads', 'hotLead', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Leads', 'hotLead');
  },
};
