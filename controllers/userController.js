const UnauthenticatedError = require("../errors/unauthenticated");
const NotFoundError = require("../errors/not-found");
const { isTokenValid } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
// admin features only
const getAllUsers = async (req, res) => {
  // extract token from signed cookies
  const token = req.signedCookies.token;
  console.log(token + " i am at user controller");
  // check if token exists
  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  const Users = await User.find({ role: "user" }).select("-password");
  if (!Users) {
    throw new NotFoundError("No users found");
  }
  // proceed to get all users
  res.status(StatusCodes.OK).json({ Users });
};

const getSingleUser = async (req, res) => {
  // extract user id from request params
  const { id } = req.params;

  // extract token from signed cookies
  const token = req.signedCookies.token;

  // check if token exists
  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  if (req.user.userId !== id) {
    throw new UnauthenticatedError("Unauthorized to access this route");
  }
  // proceed to get single user
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id :${id}`);
  }
  // respond with user data
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = (req, res) => {
  res.send("show current user");
};

const updateUser = (req, res) => {
  res.send("update user");
};

const updateUserPassword = (req, res) => {
  res.send("update user password");
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
