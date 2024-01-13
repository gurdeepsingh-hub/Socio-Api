const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const mailer = (message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("MAILER CONNECTION VERIFIED");
    }
  });

  const info = transporter
    .sendMail(message)
    .then((info) => {
      return {
        status: 201,
        msg: "you should recieve an email",
        info: info.messageId,
      };
    })
    .catch((err) => {
      return { status: 500, ...err };
    });
  return info;
};

module.exports = mailer;
