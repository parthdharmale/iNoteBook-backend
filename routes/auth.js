const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "parthi$";
// ROUTE 1 - Create a User using : POST "/api/auth/createuser". No Login Required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password should be minimum 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // If there are errors, return bad request and  send the error details in response.
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email id already exists" });
      }
      // Create a new user
      const salt = await bcrypt.genSalt(10);

      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      // .then(user => res.json(user))
      // .catch(err=> {console.log(err)
      // res.json({error: 'Please enter a unique email', message: err.message})});
      // res.send(req.body);

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      //   console.log(jwtData);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      // Catch errors

      console.error(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);

// ROUTE 2 - Authenticate a User using : POST "/api/auth/createuser"
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // If there are errors, return bad request and  send the error details in response.
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please login with correct credentials" });
      }
      // const success = true;
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "The entered password is incorrect" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      let name = user.name;
      res.json({ success, authtoken , name});
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Some error occurred" });
    }
  }
);

// ROUTE 3 - Get Logged in User Details using : POST "/api/auth/getuser". Login Required

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
    // res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
