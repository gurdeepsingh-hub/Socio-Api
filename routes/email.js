const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const credString = `smtps://${process.env.EMAIL_USER}%40gmail.com:${process.env.EMAIL_PASS}@smtp.gmail.com`;
let transport = async () => {
  const creds = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
  const transporter = await nodemailer.createTransport(creds);
  console.log(transporter);
  return transporter;
};
const transporter = transport();
// transporter.verify(function (error, success) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });
// const emailController = async (req, res) => {
//   const { email } = req.body;
//   try {

//     transporter
//       .sendMail(req.body.message)
//       .then(() => {
//         return res.status(201).json({ info: "email send sucessfully" });
//       })
//       .catch((e) => {
//         return res.status(500).json(e);
//       });
//   } catch {
//     (error) => {
//       console.log("Error in sending mail");
//     };
//   }
// };

const testemailController = async (req, res) => {
  const testAcc = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAcc.user,
      pass: testAcc.pass,
    },
  });

  let message = {
    from: '"Fred Foo 👻" <anjalishrma024@gmail.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  };

  transporter
    .sendMail(message)
    .then((info) => {
      return res.status(201).json({
        msg: "you should recieve an email",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
};

module.exports = transporter;
