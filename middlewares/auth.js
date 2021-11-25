const { models } = require("../database/index");
const { validateToken } = require("../services/jsonwebtoken/index");

module.exports = {
  checkAuth: async function (req, res, next) {
    let uid = null;
    let token = req.headers?.authorization?.split(" ")[1];
    let token_data = validateToken(token);
    if (token_data) uid = token_data.id;

    if (uid != null) {
      req.User = await models.User.findByPk(uid, {
        include: ["Role"]
      });
    }

    if (req?.User?.blocked) {
      req.App.assignData("blocked_memo", req.User.blocked_memo)
        .setPage("blocked")
        .setMsg("Your account has been flagged!", "error")
        .send();
    } else {
      req.isAuthenticated = req?.User?.id ? true : false;
      next();
    }
  },

  requireAuth: async function (req, res, next) {
    if (!(req.User && req.User instanceof models.User && req.isAuthenticated)) {
      // req.App.doCustom(function (req, res) {
      //   if (req.session) {
      //     req.session.lastURI = req.App.getCurrentURI();
      //     req.session.save();
      //   }
      // });
      req.App.assignData("auth", false)
        .setRedirectURI("/login")
        .setMsg(
          "Authentication failed! Please login to continue request.",
          "error"
        )
        .send();
    } else {
      next();
    }
  },

  requirePermission: function (permission) {
    return async function (req, res, next) {
      if (req.User.hasPermission(permission)) {
        next();
      } else {
        req.App.setRedirectURI("/").setMsg("Permission denied", "error").send();
      }
    };
  }
};
