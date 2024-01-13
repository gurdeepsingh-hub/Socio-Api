const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId == req.params.id || req.body.isAdmin) {
    console.log(req.body);
    if (req.body.password) {
      try {
        console.log("before salt gen");
        const salt = await bcrypt.genSalt(10);
        console.log("after salt gen");
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can update only your account!");
  }
});
//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("account has been Deleted sucessfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json(
        "you can delete only your account! " +
          req.body.userId +
          " " +
          req.params.id
      );
  }
});

//Search a user
router.get("/:identifier/search", async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const regex = new RegExp(identifier, "i");

    const users = await User.find({
      $or: [{ username: regex }, { firstName: regex }],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const result = users.map((user) => {
      const { password, updatedAt, ...other } = user._doc;
      return other;
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res.status(200).json("user followed successfully");
      } else {
        res.status(403).json("you already followed this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).send("you can't follow yourself");
  }
});
//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json("user unfollwed successfully");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).send("you can't unfollow yourself");
  }
});

module.exports = router;
