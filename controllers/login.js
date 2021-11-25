const express = require("express");
const router = express.Router();
const { createToken } = require("../services/jsonwebtoken");
const { pickData, getClientIp, config } = require("../utils/mainUtils");
const { models } = require("../database/index");
const { User } = models;

router
  .use(function (req, res, next) {
    req.App.setTemplate("dashboard/auth").setTitle("Login");
    if (req.isAuthenticated == true) {
      req.App.assignData("auth", true)
        .setRedirectURI("/dashboard")
        .setMsg("You are already logged in!", "success")
        .send();
    } else {
      next();
    }
  })
  .get("/", function (req, res) {
    req.App.send();
  })
  .post("/", async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) {
      return req.App.setMsg(
        "Please supply your valid login credentials! (Username & Password)",
        "error"
      ).send();
    }

    User.login(email, password)
      .then(function (user) {
        // Check if username is found in the database
        if (!user) {
          return req.App.setMsg(
            "These credentials do not match our records!",
            "error"
          ).send();
        }

        // Check if user is activated or not
        if (!(user.active == 1)) {
          return req.App.setRedirectURI(
            "/register/account-activate/?email=" + user.email
          )
            .setMsg("Your account needs activation!", "warning")
            .send();
        }

        // Update user last IP
        user.update({ last_ip: getClientIp(req) }).catch(console.trace);

        // Create session or jwt for user
        const user_data = pickData(user, ["id", "email"]);
        let auth_token = createToken(user_data);
        req.App.assignData("auth", true)
          .assignData("auth_token", auth_token)
          .setMsg("You have been successfully logged in!", "success")
          .send();
      })
      .catch(function (err) {
        console.trace(err);
        req.App.setMsg(
          "Server side error occurred! Please try again later!",
          "error"
        ).send();
      });
  });
module.exports = router;
