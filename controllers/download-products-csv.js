const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");
const { models } = require("../database/index");

router
    .get("/", async (req, res) => {
        // Product data
        let products = models.Product.findAll();

        // Fields
        const fields = [
            {
                label: 'Id',
                value: 'id'
            },
            {
                label: 'Name',
                value: 'name'
            },
            {
                label: 'Price',
                value: 'price'
            },
            {
                label: 'slug',
                value: 'slug'
            }
        ];

        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(products);
        console.log(csv);
        res.header('Content-Type', 'text/csv');
        res.attachment(`products-${Date.now()}.csv`);
        res.send(csv);
    });

module.exports = router;
