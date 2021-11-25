const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { config } = require("../../utils/mainUtils");
const models = require("../../database/index").models;
const { EmailTemplate } = models;

async function sendTestMail() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  var testAccount = await nodemailer.createTestAccount();
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
  // send mail with defined transport object
  var info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "oderinwalefemi150@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

async function sendEmail(
  recipients,
  subject,
  msg,
  msg_html = "",
  reply_to = ""
) {
  var transporter = nodemailer.createTransport({
    host: config("mail_conf.smtp_host"),
    port: config("mail_conf.smtp_port"),
    secure: config("mail_conf.smtp_secure"), // true for 465, false for other ports
    auth: {
      user: config("mail_conf.smtp_username"),
      pass: config("mail_conf.smtp_password"),
    },
  });

  var to = typeof recipients == Array ? recipients.join(", ") : recipients;

  var info = await transporter
    .sendMail({
      from: config("mail_conf.admin_email"), // sender address
      to, // list of receivers
      replyTo: reply_to,
      subject, // Subject line
      text: msg, // plain text body
      html: msg_html, // html body
    })
    .catch(console.trace);
  return info;
}

async function sendEmailTemplate(recipients, template, replacements) {
  let mail_template = await EmailTemplate.findOne({
    where: { title: template },
  });
  if (!mail_template?.id) return console.trace("Email Template not found!");

  // Form replace data
  let replace_data = {
    config,
    APP_NAME: config("app_name"),
    HOME_DIR: config("home_dir"),
    VIEW_DIR: config("view_dir"),
    ...replacements,
  };
  ejs.renderFile(
    path.join(__dirname, "templates", mail_template.message_html),
    replace_data,
    {},
    function (err, msg_html) {
      if (err) return console.trace(err);
      sendEmail(
        recipients,
        mail_template.subject,
        mail_template.msg,
        msg_html
      ).catch(console.trace);
    }
  );
}

module.exports = {
  sendTestMail,
  sendEmail,
  sendEmailTemplate,
};
