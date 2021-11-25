const express = require("express");
const { Op } = require("sequelize");
const faker = require("faker");
const router = express.Router();
const { models } = require("../database/index");
const {
    productValidator,
    validate,
} = require("../middlewares/formValidators");
const { getValidTableSlug } = require("../utils/blogUtils");
const { pickData, randomNumbers, randomIntFromInterval } = require("../utils/mainUtils");

router.get("/", async (req, res) => {
    let product_count = 0;
    let category_ids = [];

    // Upload 5 unique product category
    do {
        let name = faker.commerce.productName();
        let slug = await getValidTableSlug(name, "ProductCategory", randomNumbers(6));
        let category = await models.ProductCategory.create({
            name,
            slug
        }).catch(console.trace);
        if (category) category_ids.push(category.id);
    } while (category_ids.length < 5);


    // Upload 50 unique products
    do {
        let name = faker.commerce.productMaterial();
        let slug = await getValidTableSlug(name, "Product", randomNumbers(6));
        let product = await models.Product.create({
            name,
            slug,
            price: faker.commerce.price(1000, 99000),
            image: faker.image.imageUrl(50, 50, "nature", true),
            category_id: category_ids[randomIntFromInterval(0, 4)]
        }).catch(console.trace);
        if (product) product_count++;
    } while (product_count < 50);

    req.App
        .setMsg("Dummy products have been successfully uploaded", "success")
        .send();
});

module.exports = router;
