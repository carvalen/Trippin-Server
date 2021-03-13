const User = require("../models/user.model");
const bcrypt = require("bcryptjs");




exports.signup = async (req, res) => {
  try {
    console.log("usuarioooo", req.body);
    const { username, password, email } = req.body;
    const hasMissingCredentials = !username || !password || !email;
    console.log("body", req.body)
    if (hasMissingCredentials) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // if (!hasCorrectPasswordFormat(password)) {
    //   return res.status(400).json({ message: "Incorrect password format" });
    // }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ username, email, password: hashedPassword });

    // req.session.userId = newUser._id;

    return res.status(200).json({ user: newUser.email, id: newUser._id });
  } catch (e) {
    if (isMongooseErrorValidation(e)) {
      return res.status(400).json({ message: "Incorrect email format" });
    }
    if (isMongoError(e)) {
      return res.status(400).json({ message: "Duplicate field" });
    }
    return res.status(400).json({ message: "Wrong request" });
  }
};

exports.login = async (req, res) => {
  try {
    
    const { password, email } = req.body;
    const hasMissingCredentials = !password || !email;
    if (hasMissingCredentials) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // if (!hasCorrectPasswordFormat(password)) {
    //   return res.status(400).json({ message: "Incorrect password format" });
    // }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    
    const hasCorrectPassword = await bcrypt.compare(
      password,
      user.password
    );
    
    if (!hasCorrectPassword) {
      return res.status(401).json({ message: "Unauthorize" });
    }
    console.log("login", req.session);
    req.session.userId = user._id;
    
    return res.status(200).json(user);
  } catch (e) {
    
    return res.status(400).json({ message: "Wrong request" });
  }
};

exports.logout = async (req, res) => {
  await req.session.destroy();
  res.status(200).json({ message: "logout" });
};

  exports.getUser = async (req, res) => {
    const { userId } = req.session;
    const { email, _id } = await User.findOne(userId);
   res.status(200).json({ id: _id, email });
  };