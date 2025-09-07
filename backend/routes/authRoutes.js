const express = require("express"); // import express
const router = express.Router(); // create router

const authController = require("../controllers/authController"); // import auth controller

router.post("/register", authController.register); // register route
router.post("/login", authController.login); // login route

module.exports = router;
