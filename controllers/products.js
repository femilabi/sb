const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { models } = require("../database/index");
const { Product } = models;

router.get("/", async (req, res) => {
    // Number of rows to be displayed per page
    const limit = 25;
    req.App.assignData("list_per_page", limit);
    // Current page to be dislayed
    const page =
        typeof req.query.page == "string" && Number(req.query.page) > 0
            ? req.query.page
            : 1;
    // Calculate the number of columns to skip before starting query
    const offset = (page - 1) * limit;
    const filterFields = ["deleted"];
    const searchFields = ["name"];
    const where = {};

    // Build Filters
    if (req.query.filter) {
        for (const column in req.query.filter) {
            if (
                Object.hasOwnProperty.call(req.query.filter, column) &&
                req.query.filter[column] &&
                filterFields.includes(column) &&
                /^[a-z0-9_]+$/.test(column)
            ) {
                where[column] = req.query.filter[column];
                req.App.assignData(`filter_${column}`, req.query.filter[column]);
            }
        }
    }

    // Build Search
    if (req.query.search && searchFields) {
        let sqlSearch = [];
        searchFields.forEach((column) => {
            sqlSearch.push({
                [column]: {
                    [Op.like]: `%${req.query.search}%`,
                },
            });
        });
        where[Op.or] = sqlSearch;
        req.App.assignData("search_str_original", req.query.search);
    }

    // Fetch data
    const products = await Product.findAll({
        where,
        limit,
        offset,
        order: [["id", "DESC"]],
    }).catch(console.trace);

    // Total available results
    const total_products = await Product.count({ where }).catch(console.trace);
    req.App
        .assignData("products", products)
        .assignData("total_results", total_products)
        .assignData("pager_current_page", Number(page))
        .assignData("pager_total_pages", Math.ceil(total_products / limit))
        .setMsg("success", "success")
        .send();
});

module.exports = router;
