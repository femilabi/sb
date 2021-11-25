module.exports = function (sequelize, DataTypes) {
    const Permission =  sequelize.define("Permission", {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        }
    }, {
        tableName: 'permissions',
        timestamps: false,
    });

    return Permission;
}