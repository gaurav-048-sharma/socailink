const express = require("express")
const router = express.Router();
const passport = require("passport");
const authController = require("../controller/authcontroller.js")
const checkBlacklist = require("../middlewares/checkBlacklist.js")

// Initialize Passport
require('../config/passport.js');

// Microsoft OAuth route
router.get(
  "/microsoft",
  passport.authenticate("microsoft", {
    scope: ["user.read"],
    prompt: "select_account",
  })
);
// Microsoft OAuth callback route
router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Successful authentication, redirect home with token
    res.redirect(`${process.env.CLIENT_URL}/auth/microsoft?token=${req.user.token}`);
  }
);  
// Google OAuth route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Successful authentication, redirect home with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google?token=${req.user.token}`);
  }
);


router.post("/google-login", authController.googleLogin); // New API endpoint
router.post('/microsoft-login', authController.microsoftLogin);
router.post("/logout", checkBlacklist, authController.logout);

module.exports = router;