module.exports = function (sequelize, DataTypes) {
    const ProductCategory = sequelize.define("ProductCategory", {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        deleted: {
            type: DataTypes.TINYINT(1),
            defaultValue: 0
        }
    }, {
        tableName: 'product_categories'
    });

    ProductCategory.associate = function (models) {
      ProductCategory.hasMany(models.Product, {
        foreignKey: "category_id"
      });
    };

    return ProductCategory;
}