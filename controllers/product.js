const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { models } = require("../database/index");
const {
    productValidator,
    validate,
} = require("../middlewares/formValidators");
const { getValidTableSlug } = require("../utils/blogUtils");
const { uploadFile } = require("../utils/fileUploader");
const { pickData, randomNumbers } = require("../utils/mainUtils");

router
    .post("/create", validate(productValidator(), true), async function (req, res) {
        // Avoid user injected image path from here
        req.body.image = null;

        // Validate product category
        const category_exists = await models.ProductCategory.findOne({
            where: {
                id: req.body.category_id
            }
        }).catch(console.trace);
        if (!category_exists) {
            return req.App.setMsg("Product category does not exists.", "error").send();
        }

        // Handle image file upload and its validation
        let upload = await uploadFile("image", "product_images")(req, res).catch(
            console.trace
        );
        if (upload && upload?.status == "success") {
            req.body.image = upload.file.filename;
        } else if (upload && upload?.status == "error") {
            return req.App.setMsg("Product image file upload failed.", "error").send();
        }

        // Get product slug
        req.body.slug = await getValidTableSlug(req.body.name, "Product", randomNumbers(6));

        models.Product
            .create(pickData(req.body, ["name", "image", "category_id", "slug", "price"]))
            .then((product) => {
                if (product) {
                    req.App
                        .assignData("product", product)
                        .setMsg("Product created successfully", "success")
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
                    .setMsg("Product creation failed.", "error")
                    .send();
            });
    })
    .put("/edit/:product_id", validate(productValidator(), true), async function (req, res) {
        const { product_id } = req.params;
        const product = await models.Product.findByPk(product_id).catch(console.trace);
        if (product && product.deleted == 0) {
            // Validate product category
            if (req.body.category_id && req.body.category_id != product.category_id) {
                const product_category_exists = await models.ProductCategory.findOne({
                    where: {
                        id: req.body.category_id
                    }
                }).catch(console.trace);
                if (!product_category_exists) {
                    return req.App.setMsg("Product category does not exists.", "error").send();
                }
            }

            // Handle image file upload and its validation
            let upload = await uploadFile("image", "product_images")(req, res).catch(
                console.trace
            );
            if (upload && upload?.status == "success") {
                req.body.image = upload.file.filename;
            } else if (upload && upload?.status == "error") {
                return req.App.setMsg("File upload failed.", "error").send();
            } else {
                delete req.body.image;
            }

            // Get product slug
            if (req.body.name && req.body.name != product.name) {
                req.body.slug = await getValidTableSlug(req.body.name, "Product", randomNumbers(6));
            } else {
                delete req.body.slug;
            }

            product
                .update(
                    pickData(req.body, ["name", "slug", "image", "category_id", "price"])
                )
                .then((product) => {
                    req.App
                        .assignData("product", product)
                        .setMsg("Product has been successfully updated.", "success")
                        .send();
                }).catch((err) => {
                    console.trace(err);
                    req.App.setMsg("Product update failed.", "error").send();
                })
        } else {
            req.App.setMsg("Product does not exists", "error");
        }
    })
    .delete("/delete/:product_id", async function (req, res) {
        // Set delete on the product table to one
        models.Product.update(
            {
                deleted: 1
            },
            {
                where: {
                    id: req.params.product_id
                }
            }).then(() => {
                req.App.setMsg("Product has been successfully deleted", "success").send();
            }).catch((err) => {
                console.trace(err);
                req.App.setMsg("Product deletion failed.", "error").send();
            });
    })

module.exports = router;
