module.exports = function (sequelize, DataTypes) {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      meta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "roles",
    }
  );
  return Role;
};
