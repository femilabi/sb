const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    let states = [
        "Abia",
        "Adamawa",
        "Akwa Ibom",
        "Anambra",
        "Bauchi",
        "Bayelsa",
        "Benue",
        "Borno",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Ekiti",
        "Enugu",
        "FCT - Abuja",
        "Gombe",
        "Imo",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Lagos",
        "Nasarawa",
        "Niger",
        "Ogun",
        "Ondo",
        "Osun",
        "Oyo",
        "Plateau",
        "Rivers",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara"
    ];

    let sorted_states = states.sort(function (a, b) {
        return a.length - b.length || a.localeCompare(b);
    }).reverse();

    req.App
        .assignData("fifth_state", sorted_states[4])
        .setMsg(`Fifth state resolved successfully.`, "success")
        .send();
});

module.exports = router;
