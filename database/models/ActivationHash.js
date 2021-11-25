const {
  randomString,
  randomNumbers,
  getCurrentTime,
} = require("../../utils/mainUtils");

module.exports = function (sequelize, DataTypes) {
  const ActivationHash = sequelize.define(
    "ActivationHash",
    {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        // allowNull: true,
        // unique: true,
        // defaultValue: 'green'
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
      tableName: "activation_hash",
      timestamps: false,
      indexes: [
        { fields: ["user_id"], unique: true },
        { fields: ["hash"], unique: true },
      ],
    }
  );

  // Model Methods
  ActivationHash.search = function (column, value) {
    return ActivationHash.findOne({
      where: {
        [column]: value,
      },
    });
  };

  ActivationHash.generateNewHash = function () {
    let hash = randomString();
    return ActivationHash.search("hash", hash).then((found_hash) => {
      return found_hash ? ActivationHash.generateNewHash() : hash;
    });
  };

  ActivationHash.createNew = async function (user_id) {
    let hash = await ActivationHash.generateNewHash();
    // console.log(hash);
    let code = randomNumbers();
    return ActivationHash.create({
      user_id,
      hash,
      sms_code: code,
      expiry_date: getCurrentTime(),
      activated: 0,
    }).then((code_hash) => {
      return code_hash ? code_hash : ActivationHash.createNew();
    });
  };

  ActivationHash.associate = function (models) {
    // console.log(models);
    ActivationHash.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return ActivationHash;
};
