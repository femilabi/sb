const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: {
    status: {
      type: "error",
      msg: "Too many accounts created from this IP, please try again after an hour",
    },
  },
});

module.exports = {
  generalLimiter,
  createAccountLimiter,
};
