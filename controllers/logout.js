const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.isAuthenticated == true) {
    req.session.destroy();
  }
  
  req.App
    .setMsg("You have been successfully logged out", "info")
    .setRedirectURI("/login")
    .send();
});

module.exports = router;
