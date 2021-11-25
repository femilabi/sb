const express = require("express");
const router = express.Router();
const { models } = require("../database/index");
const { User, PasswordHash } = models;
const { sendEmail, sendEmailTemplate } = require("../services/email/mailer");
const { pickData, config, getCurrentTime } = require("../utils/mainUtils");
const { logActivity } = require("../utils/dbUtils");

router
  .use(function (req, res, next) {
    req.App.setTemplate("dashboard/auth").setTitle("Password Recovery");
    next();
  })
  .get("/", function (req, res) {
    req.App.send();
  })
  .post("/", async (req, res) => {
    const { email, action } = req.body;
    if (email && action == "generate") {
      let user = await User.findByEmail(email);
      if (user) {
        if (
          getCurrentTime() >=
          Number(user.getMeta("last_recovery_email_time")) + 60 * 15
        ) {
          const hash = await PasswordHash.createNew(user.get("id")).catch(
            console.log
          );
          let user_data = pickData(user, ["username", "email", "firstname"]);
          let replacements = {
            ...user_data,
            recovery_link: `${config("view_dir")}recover-password/${hash}/`,
          };
          sendEmailTemplate(user.get("email"), "password_recovery", {
            replacements,
          });
        }

        // Update last email time
        user.setMeta("last_recovery_email_time", getCurrentTime());

        req.App.setRedirectURI("/login")
          .setMsg("Recovery link has been sent to your email", "success")
          .send();
      } else {
        req.App.setMsg("User does not exists", "error").send();
      }
    } else {
      req.App.setMsg("Action not specified", "error").send();
    }
  })
  .use("/:hash", async (req, res) => {
    const { hash } = req.params;
    PasswordHash.findOne({
      where: { hash },
    })
      .then(async (password_hash) => {
        if (!(password_hash && password_hash.activated == 0)) {
          return req.App.setRedirectURI("/login")
            .setMsg("Invalid recovery link", "error")
            .send();
        }

        let user = await User.findByPk(password_hash.user_id);
        if (user) {
          req.App.setPage("change-password");
          const { action, password, confirm_password } = req.body;

          if (password && confirm_password && action == "change_password") {
            // Change password
            let password_match = password && password == confirm_password;
            if (password_match) {
              user.update({ password }).catch(console.trace);
              password_hash.update({ activated: 1 }).catch(console.trace);

              req.App.setRedirectURI("/login")
                .setMsg(
                  "Your password was changed successfully! Please login to continue",
                  "success"
                )
                .send();

              // Log user actions
              logActivity(
                user.id,
                `You did password recovery || ${new Date()}`
              ).catch(console.trace);
            } else {
              req.App.setMsg(
                "Password supplied does not match",
                "error"
              ).send();
            }
          } else {
            req.App.assignData(
              "user",
              pickData(user, ["username", "email", "fullname", "secure_q"])
            )
              .setMsg("You are now required to change your password", "success")
              .send();
          }
        } else {
          req.App.setRedirectURI("/login")
            .setMsg("Invalid Recovery Link", "error")
            .send();
        }
      })
      .catch((err) => {
        console.trace(err);
        req.App.setMsg(
          "Error while processing your request. Please try again later",
          "error"
        ).send();
      });
  });

module.exports = router;
