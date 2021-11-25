const express = require("express");
const router = express.Router();
const {
  registerValidator,
  validate,
} = require("../middlewares/formValidators");
const {
  getClientIp,
  pickData,
  config,
  getCurrentTime,
} = require("../utils/mainUtils");
const { logActivity } = require("../utils/dbUtils");
const { sendEmailTemplate } = require("../services/email/mailer");
const { models } = require("../database/index");
const { User, ActivationHash } = models;

router
  .use(function (req, res, next) {
    req.App.setTemplate("dashboard/auth").setTitle("Create An Account");
    next();
  })
  .get("/", function (req, res) {
    req.App.send();
  })
  .post("/", validate(registerValidator(), true), async (req, res) => {
    let { email, username } = req.body;

    let username_exists = await User.findByUsername(username);
    if (username_exists) {
      return req.App.setMsg(
        "Username already exists, Please choose a different username to continue.",
        "error"
      ).send();
    }

    let email_exists = await User.findByEmail(email);
    if (email_exists) {
      return req.App.setMsg(
        "The email you provided has already been used by another user. Please choose a different email to continue. If you are the owner of the email try to login with the email or click the forgot password link to retrieve your account password.",
        "error"
      ).send();
    }

    // Search for user referral
    let referrer_id = 0;
    if (req.query.ref) {
      let referrer = await User.findOne({
        where: {
          ref_id: req.query.ref
        }
      });
      if (referrer) {
        referrer_id = referrer.id;
      }
    }

    // Generate unique referral ID for user
    let ref_id = await User.getUniqueRefId();
    let req_body = {
      ...req.body,
      active: 0,
      blocked: 0,
      role: "user",
      role_id: 1,
      activation_sent: 0,
      referrer_id,
      ref_id,
      reg_ip: getClientIp(req),
    };

    User.build(req_body)
      .save({
        fields: [
          "email",
          "username",
          "phone",
          "password",
          "role",
          "role_id",
          "firstname",
          "middlename",
          "lastname",
          "fullname",
          "referrer_id",
          "ref_id",
          "reg_ip",
          "last_ip",
          "activation_sent",
          "blocked",
          "active",
          "reg_ip",
        ],
      })
      .then((user) => {
        if (user) {
          req.App.setRedirectURI(
            "/register/account-activate/?email=" + user.email + "&send_email=1"
          )
            .setMsg("Account registration is successful!", "success")
            .send();
        } else {
          req.App.setMsg(
            "Request failed, server side issue detected. Try again.",
            "error"
          ).send();
        }

        // Log user actions
        logActivity(user.id, `You joined us || ${new Date()}.`).catch(
          console.trace
        );
      })
      .catch(function (err) {
        console.log(err);
        req.App.setMsg(
          "Server side error occurred, Please try again later.",
          "error"
        ).send();
      });
  })
  .get("/account-activate", async (req, res) => {
    req.App.setPage("account-activate");

    const { send_email, resend_email, email } = req.query;

    User.findByEmail(email)
      .then(async (user) => {
        if (user && user.get("active") == 0) {
          if (
            getCurrentTime() >=
            Number(user.getMeta("last_activation_email_time")) + 60 * 15
          ) {
            let activation_method = "email";
            let hash = await user.getActivationHash();
            if (!hash) hash = await ActivationHash.createNew(user.get("id"));

            user
              .update({
                activation_sent: 1,
                activation_method,
              })
              .catch(console.trace);

            let replacements = {
              ...pickData(user, ["firstname", "email", "username"]),
              activation_link:
                config("view_dir") + "register/account-activate/" + hash.hash,
              sms_code: hash.sms_code,
            };
            if (activation_method == "phone") {
              //send sms here
            } else {
              sendEmailTemplate(user.get("email"), "activation", {
                replacements,
              });
            }

            // Update last email time
            user.setMeta("last_activation_email_time", getCurrentTime());
          }

          req.App.assignData("email", user.get("email"))
            .setMsg(
              "Your activation link has been sent! Please check your email box now including your spam folder. If you are still unable to get the activation email, please contact support.",
              "success"
            )
            .send();
        } else {
          req.App.setRedirectURI("/login")
            .setMsg(
              "Your account is active already! Please login to continue",
              "info"
            )
            .send();
        }
      })
      .catch(function (err) {
        console.log(err);
        return req.App.setMsg("Server side error occurred!", "error").send();
      });
  })
  .get("/account-activate/:hash", async (req, res) => {
    let { hash } = req.params;
    ActivationHash.findOne({
      where: { hash },
      include: User,
    })
      .then(async function (hash) {
        if (hash && hash.activated == 0) {
          const user = hash.User;
          if (user && user.active == 0) {
            let activated = await user.activate().catch(console.trace);
            if (activated) {
              hash.update({ activated }).catch(console.trace);
              user
                .update({ final_activation_method: "email" })
                .catch(console.trace);

              let replacements = {
                ...pickData(user, ["email", "username", "firstname"]),
              };
              req.App.setRedirectURI("/login")
                .setMsg(
                  "Your account has been successfully activated! Proceed to login",
                  "success"
                )
                .send();

              // Send success email to user on his/her account activation
              sendEmailTemplate(user.get("email"), "activated", {
                replacements,
              });

              // Log user actions
              logActivity(user.id, `You activated your account || ${new Date()}`).catch(
                console.trace
              );
            } else {
              req.App.setRedirectURI("/login")
                .setMsg(
                  "Error occurred while activating your account! Please contact support team",
                  "error"
                )
                .send();
            }
          } else {
            req.App.setRedirectURI("/login")
              .setMsg(
                "Account has already been activated! Please login to continue",
                "info"
              )
              .send();
          }
        } else {
          req.App.setRedirectURI("/login")
            .setMsg(
              "Invalid activation link! Please check your email again or proceed to login to know if your account is activated",
              "error"
            )
            .send();
        }
      })
      .catch(function (err) {
        console.log(err);
        req.App.setMsg(
          "Server side error occurred! Please try again later",
          "error"
        ).send();
      });
  });

module.exports = router;
