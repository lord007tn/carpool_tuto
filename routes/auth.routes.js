const router = require("express").Router();
const User = require("../models/user.models");
const Address = require("../models/address.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(403).json("Email/Password is wrong");
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(403).json("Email/Password is wrong");
    }
    const token = jwt.sign(
      { _id: user._id, isDriver: user.isDriver, isActive: user.isActive },
      "azerty",
      {
        expiresIn: "2 days",
      }
    );
    return res.status(200).json({ token: token, user: user });
  } catch (err) {
    return res.status(500).json(err);
  }
});
router.post("/register", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) return res.status(422).json("Email already exist");
    const newAddress = new Address({
      city: req.body.city,
      street: req.body.street,
      zipCode: req.body.zipCode,
    });
    const savedAddress = await newAddress.save();
    const salt = await bcrypt.genSalt(16);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      identityNumber: req.body.identityNumber,
      phoneNumber: req.body.phoneNumber,
      address: savedAddress._id,
    });
    const savedUser = await newUser.save();
    return res.status(200).json({ user: savedUser });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
