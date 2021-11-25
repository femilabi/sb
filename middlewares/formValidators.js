// This method creates custom express validator using middleware
const { validationResult, body } = require("express-validator");

exports.validationErrs = (req) => {
  const messages = [];
  if (!validationResult(req).isEmpty()) {
    const errors = validationResult(req).array();
    for (const i of errors) {
      messages.push(i);
    }
  }
  return messages;
};

exports.validate = (validations, validate_all = false) => {
  return async (req, res, next) => {
    if (req.body && !req?.body?.username) req.body.username = req.body.phone;

    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length && validate_all == false) break;
    }
    let fieldErrs = {};
    let errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    } else {
      errors = errors.array();
      for (let i = 0; i < errors.length; i++) {
        const err = errors[i];
        fieldErrs[err.param] = err.msg;
        req.App.setError(err.param, err.msg);
      }
      // errors.forEach((err) => {
      //   const formFields = err.param.split(".");
      //   const field = formFields[formFields.length - 1];
      //   fieldErrs[field] = err.msg;
      // });
    }
    return req.App.send();
  };
};

exports.registerValidator = () => {
  return [
    body("email").isEmail().withMessage("Invalid E-mail supplied"),
    body("username").matches(/^[a-zA-Z0-9._]+$/).withMessage("Invalid Username supplied"),
    body("firstname").escape().notEmpty().withMessage("Firstname is required"),
    body("lastname").escape().notEmpty().withMessage("Lastname is required"),
    body("phone").escape().notEmpty().withMessage("Phone Number is required"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 8 })
      .withMessage("password must be 8 characters"),
  ];
};

exports.loginValidator = () => {
  return [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

exports.passwordValidator = () => {
  return [
    body("password").notEmpty().withMessage("Old password field cannot be empty."),
    body("new_password")
      .notEmpty()
      .withMessage("New password field cannot be empty.")
      .isLength({ min: 6 })
      .withMessage(
        "New password field is required to be minimum of six(6) characters"
      ),
    body("confirm_password")
      .notEmpty()
      .withMessage("Confirm password field cannot be empty.")
      .isLength({ min: 6 })
      .withMessage(
        "Confirm password field is required to be minimum of six(6) characters."
      ),
  ];
};

exports.productValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 50 })
      .withMessage("Product name is required to be maximum of 50 characters"),
    body("category_id")
      .notEmpty()
      .withMessage("Product category is required")
      .matches(/^[0-9]+$/)
      .withMessage("Transaction PIN must be numeric"),
  ];
}

exports.productCategoryValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product category name is required")
      .isLength({ max: 50 })
      .withMessage("Product category name is required to be maximum of 50 characters"),
  ];
}

exports.body = body;
