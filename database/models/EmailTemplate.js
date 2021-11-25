module.exports = function (sequelize, DataTypes) {
  const EmailTemplate = sequelize.define(
    "EmailTemplate",
    {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      message_html: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "email_templates",
      timestamps: false,
    }
  );
  return EmailTemplate;
};
