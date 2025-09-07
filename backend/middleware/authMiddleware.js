const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {  // verify token function
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    req.user = decoded; // You can now access req.user in controller if needed
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" }); // return error message
  }
};

module.exports = verifyToken;
