const jwt = require("jsonwebtoken");

//creation
const createJWT = (_id) => {
  const token = jwt.sign({ id: _id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const decodeJWT = (token) => {
  const JWT_SECRET = process.env.JWT_KEY;
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Handle invalid token or other errors
      console.error("JWT verification failed:", err);
    } else {
      // `decoded` will contain the payload, which includes the `id` field
      const userId = decoded.id;
      console.log("User ID:", userId);
    }
  });
};

module.exports = { createJWT, decodeJWT };
