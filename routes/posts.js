const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).send("post updated");
    } else {
      res
        .status(401)
        .json({ message: "You are not authorized to edit other's post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).send("post deleted");
    } else {
      res
        .status(401)
        .json({ message: "You are not authorized to delete other's post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("the post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("the post has been unliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//add a comment
router.put("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    await post.updateOne({
      $push: {
        comments: {
          userId: req.body.userId,
          comment: req.body.comment,
          virtId: req.body.virtId,
          commentTime: new Date(),
        },
      },
    });
    res.status(200).json("comment posted");
  } catch (err) {
    res.status(500).json(err);
  }
});
//Delete a comment
router.put("/:id/del-comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    await post.updateOne({
      $pull: {
        comments: {
          userId: req.body.userId,
          comment: req.body.comment,
        },
      },
    });
    res.status(200).json("comment deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendsPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get profile posts
router.get("/profile/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
