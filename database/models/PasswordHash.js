const { randomString, getCurrentTime } = require("../../utils/mainUtils");

module.exports = function (sequelize, DataTypes) {
  const PasswordHash = sequelize.define(
    "PasswordHash",
    {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      hash: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      sms_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      activated: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
    },
    {
      tableName: "password_hash",
      timestamps: false,
      indexes: [{ fields: ["hash"], unique: true }],
    }
  );

  PasswordHash.search = function (column, value) {
    return PasswordHash.findOne({
      where: {
        [column]: value,
      },
    });
  };

  PasswordHash.generateNewHash = function () {
    let hash = randomString();
    return PasswordHash.search("hash", hash).then((found_hash) => {
      return found_hash ? PasswordHash.generateNewHash() : hash;
    });
  };

  PasswordHash.createNew = async function (user_id) {
    let hash = await PasswordHash.generateNewHash();
    return PasswordHash.create({
      user_id,
      hash,
      activated: 0,
      expiry_date: getCurrentTime(),
    }).then((pass_hash) => {
      return pass_hash.hash ? pass_hash.hash : PasswordHash.createNew();
    });
  };
  return PasswordHash;
};
