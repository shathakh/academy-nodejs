const { DataTypes } = require("sequelize");
const sequelize = require("../db/config/connection");

const ParentStudent = sequelize.define("ParentStudent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = ParentStudent;