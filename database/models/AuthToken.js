module.exports = function (sequelize, DataTypes) {
    const AuthToken =  sequelize.define("AuthToken", {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        selector: {
            type: DataTypes.CHAR(12),
            allowNull: false,
        },
        token: {
            type: DataTypes.CHAR(64),
            allowNull: false,
        },
        created_date: {
            type: DataTypes.STRING(15),
            allowNull: false,
        }
    }, {
        tableName: 'auth_tokens',
        timestamps: false,
    });

    
    return AuthToken;
}