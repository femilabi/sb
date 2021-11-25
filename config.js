module.exports = {
  APP_NAME: "",
  HOME_DIR: "http://localhost:9000/", // Development
  VIEW_DIR: "http://localhost:9000/", // Development
  // HOME_DIR: "https://domain.xyz/", // Production
  // VIEW_DIR: "https://domain.xyz/", // Production
  RESPONSE_TYPE: "JSON", // HTML | JSON,
  TITLE_SUFFIX: " | sb Ass.",
  DB_CONF: {
    PREFIX: "sb_",
    NAME: "sbss", // Development
    USERNAME: "root", // Development
    PASSWORD: "", // Development
    HOST: "localhost", // Development
    PORT: 3306, // Development
    // NAME: "paminmbe_sb", // Production
    // USERNAME: "paminmbe_sb", // Production
    // PASSWORD: "V^}K6a#j+)B%", // Production
    // HOST: "localhost", // Production
    // PORT: 3306, // Production
    DIALECT: "mysql",
  },
  MAIL_CONF: {
    ALLOW: 1,
    ADMIN_NAME: "sb Assignment",
    ADMIN_EMAIL: "...",
    SMTP_HOST: "...",
    SMTP_PORT: 465,
    SMTP_SECURE: true,
    SMTP_USERNAME: "...",
    SMTP_PASSWORD: "...",
  },
  RECAPTCHA: {
    PUB_KEY: "...",
    PRIV_KEY: "...",
  },
  USER_SESSION_HOLDER: "ebank_user"
};
