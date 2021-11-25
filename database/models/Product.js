module.exports = function (sequelize, DataTypes) {
    const Product = sequelize.define("Product", {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE(),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING("100"),
            allowNull: true,
        },
        deleted: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0
        }
    }, {
        tableName: 'products',
        indexes: [
            { fields: ["slug"], unique: true },
        ]
    });

    Product.associate = function (models) {
        Product.belongsTo(models.ProductCategory, {
            foreignKey: "id",
            sourceKey: "user_id",
            constraints: false,
        });
    };

    return Product;
}