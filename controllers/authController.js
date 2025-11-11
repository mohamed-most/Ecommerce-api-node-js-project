const User = require("../models/User");
// const CustomAPIError = require("../errors/custom-api");
const BadRequestError = require("../errors/bad-request");
const { StatusCodes } = require("http-status-codes");
const UnauthenticatedError = require("../errors/unauthenticated");
const { attachCookiesToResponse } = require("../utils/jwt");

// login controller
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid Credentials");
  }
  const tokenUser = {
    userId: user._id,
    name: user.name,
    role: user.role,
  };
  attachCookiesToResponse({ res, payload: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
}

// logout controller
async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
}

// register controller
async function register(req, res) {
  // extract name, email, password from request body
  const { name, email, password } = req.body;

  // validate input
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name, email, and password");
  }

  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  // Password hashing is handled in Mongoose pre-save hook
  const user = await User.create({ name, email, password });

  // create token user payload
  const tokenUser = {
    userId: user._id,
    name: user.name,
    role: user.role,
  };

  //attach cookie to response
  attachCookiesToResponse({ res, payload: tokenUser });

  // send response
  res.status(StatusCodes.CREATED).json({
    user: {
      ...tokenUser,
    },
  });
}

// export controllers
module.exports = {
  login,
  logout,
  register,
};
