const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    let result = 1;
    for (let i = 2; i <= 13; i++) {
        result = result * i;
    }

    req.App
        .assignData("factorial_result", result)
        .setMsg(`Factorial of 13 is ${result}`, "success")
        .send();
});

module.exports = router;
