const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
// const transporter = require("./email.js");
const { createJWT } = require("../assets/jsonWebTokenMethods");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const mailer = require("../assets/email.js");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate a new decrypted password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const fName =
      req.body.firstName.charAt(0).toUpperCase() +
      req.body.firstName.slice(1).toLowerCase();
    const lName =
      req.body.lastName.charAt(0).toUpperCase() +
      req.body.lastName.slice(1).toLowerCase();
    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: fName,
      lastName: lName,
      dob: req.body.dob,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//check username avail
router.get("/check-username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (user) {
      // Username is taken
      res.status(200).json({ isTaken: true });
    } else {
      // Username is available
      res.status(200).json({ isTaken: false });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//check email avail
router.get("/check-email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (user) {
      // email is taken
      res.status(200).json({ isTaken: true });
    } else {
      // email is available
      res.status(200).json({ isTaken: false });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(404).json({ status: "user not found" });
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ status: "invalid credentials" });
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//relogin
router.post("/relogin", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(404).json({ status: "user not found" });
    }

    const validPassword = req.body.password == user.password;
    if (!validPassword) {
      return res.status(400).json({ status: "invalid credentials" });
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Forgot password sending email for resetting password using Smtp server
router.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({
    email: req.body.Email,
  });
  if (!user) {
    return res.status(501).json({ status: "user not found" });
  }

  const token = createJWT(user._id);

  const message = {
    from: process.env.EMAIL_USER,
    to: req.body.Email,
    subject: "Socio Password Reset",
    text: "",
    html: `<h3>Hi ${
      user?.name ? `${user.name}` : `User`
    }</h3> As your rquest for password Reset. you can rest your password by <a href="
        http://localhost:3000/reset-password/${token}
        ">clicking here.</a>`,
  };

  const response = await mailer(message);
  return res.status(response.status).send(response);
});

module.exports = router;
