const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    required: true,
  },
  name: {
    type: DataTypes.STRING,
    required: true,
  },
  password: {
    type: DataTypes.STRING,
    required: true,
  },
});

module.exports = Admin;
