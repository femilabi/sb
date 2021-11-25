const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { models } = require("../database/index");
const {
    productCategoryValidator,
    validate,
} = require("../middlewares/formValidators");
const { getValidTableSlug } = require("../utils/blogUtils");
const { uploadFile } = require("../utils/fileUploader");
const { pickData, randomNumbers } = require("../utils/mainUtils");

router
    .post("/create", validate(productCategoryValidator(), true), async function (req, res) {
        // Get Product category slug
        req.body.slug = await getValidTableSlug(req.body.name, "ProductCategory", randomNumbers(6));

        models.ProductCategory
            .create(pickData(req.body, ["name", "slug"]))
            .then((category) => {
                if (category) {
                    req.App
                        .assignData("category", category)
                        .setMsg("Product category created successfully", "success")
                        .send();
                } else {
                    req.App
                        .setMsg("Upload failed. Please try again.", "error")
                        .send();
                }
            })
            .catch((err) => {
                console.trace(err);
                req.App
                    .setMsg("Product category creation failed.", "error")
                    .send();
            });
    })
    .put("/edit/:category_id", validate(productCategoryValidator(), true), async function (req, res) {
        const { category_id } = req.params;
        const product_category = await models.ProductCategory.findByPk(category_id).catch(console.trace);
        if (product_category && product_category.deleted == 0) {
            // Get product slug
            if (req.body.name && req.body.name != product_category.name) {
                req.body.slug = await getValidTableSlug(req.body.name, "Product", randomNumbers(6));
            } else {
                delete req.body.slug;
            }

            product_category
                .update(
                    pickData(req.body, ["name", "slug"])
                )
                .then((product_category) => {
                    req.App
                        .assignData("category", product_category)
                        .setMsg("Product category has been successfully updated.", "success")
                        .send();
                }).catch((err) => {
                    console.trace(err);
                    req.App
                        .setMsg("Product category update failed.", "error")
                        .send();
                })
        } else {
            req.App
                .setMsg("Product category does not exists", "error")
                .send();
        }
    })
    .delete("/delete/:category_id", async function (req, res) {
        // Set delete on the product table to one
        models.ProductCategory.update(
            {
                deleted: 1
            },
            {
                where: {
                    id: req.params.category_id
                }
            }).then(() => {
                req.App
                    .setMsg("Product category has been successfully deleted", "success")
                    .send();
            }).catch((err) => {
                console.trace(err);
                req.App
                    .setMsg("Product category deletion failed.", "error")
                    .send();
            });
    })

module.exports = router;
