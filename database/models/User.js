const {
  verifyPassword,
  hashPassword,
  randomString,
  Base64,
  config,
} = require("../../utils/mainUtils");

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    "User",
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      middlename: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      role_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      blocked: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      blocked_memo: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      active: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      activation_sent: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      activation_method: {
        type: DataTypes.ENUM("email", "phone"),
        allowNull: true,
      },
      final_activation_method: {
        type: DataTypes.ENUM("email", "phone"),
        allowNull: true,
      },
      reg_ip: {
        type: DataTypes.STRING(20),
      },
      last_ip: {
        type: DataTypes.STRING(20),
      },
      meta: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "users",
      indexes: [
        { fields: ["username"], unique: true },
        { fields: ["email"], unique: true },
      ],
      hooks: {
        beforeCreate: async function (user, options) {
          if (user.password && user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
        beforeUpdate: async function (user, options) {
          if (user.password && user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );

  // Model Methods
  User.associate = function (models) {
    User.hasOne(models.ActivationHash, {
      foreignKey: "user_id",
    });
    User.hasOne(models.Role, {
      foreignKey: "id",
      sourceKey: "role_id",
      constraints: false,
    });
  };

  User.search = function (column, value) {
    return User.findOne({
      where: {
        [column]: value,
      },
    });
  };

  User.findByEmail = function (value) {
    return User.search("email", value);
  };

  User.findByUsername = function (value) {
    return User.search("username", value);
  };

  User.login = async function (uid, password) {
    let user = await User.findByEmail(uid);
    if (!user) user = await User.findByUsername(uid);

    if (user && user.verifyPassword(password)) {
      return user;
    } else {
      return null;
    }
  };

  User.getUniqueRefId = async function () {
    let ref_id = randomString(8);
    let ref_exists = await User.search("ref_id", ref_id);

    if (!ref_exists) return ref_id;
    else return User.getUniqueRefId();
  };

  // Instance Methods
  User.prototype.verifyPassword = function (password) {
    return verifyPassword(password, this.password);
  };

  User.prototype.changePassword = async function (
    password,
    changer_password,
    changer_id
  ) {
    let _user = this;
    if (!(changer_id == this.id)) {
      _user = await User.findByPk(changer_id);
    }

    if (
      _user &&
      _user.verifyPassword(changer_password) &&
      (_user.get("role") == "admin" || _user.get("id") == this.id)
    ) {
      await this.update({ password });
      return true;
    } else {
      return false;
    }
  };

  User.prototype.getPermissions = function () {
    let permissions = this?.Role?.meta;
    if (permissions) return JSON.parse(permissions);
  }

  User.prototype.hasPermission = function (permission) {
    if (!this.permissions) {
      this.permissions = this.getPermissions();
    }

    if (this.permissions && this.permissions.includes(permission)) {
      return true;
    } else {
      return false;
    }
  };

  User.prototype.activate = async function () {
    let user = await this.update({ active: 1 });
    return user.active;
  };

  return User;
};
