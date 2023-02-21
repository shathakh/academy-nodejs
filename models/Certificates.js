const { DataTypes } = require("sequelize");
const Sequelize = require("../db/config/connection");

const certificates = Sequelize.define("certificates", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  to: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  
});

module.exports = certificates;
