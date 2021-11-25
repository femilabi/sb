const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    let { nums, target_val } = req.body;

    req.App
        .assignData("target", nums.indexOf(target_val))
        .setMsg("Resolved successfully", "success")
        .send();
});

module.exports = router;
