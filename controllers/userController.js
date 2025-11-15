const UnauthenticatedError = require("../errors/unauthenticated");
const NotFoundError = require("../errors/not-found");
// const { isTokenValid } = require("../utils/jwt");
const { attachCookiesToResponse } = require("../utils/jwt");
const createTokenUser = require("../utils/createTokenUser");
const BadRequestError = require("../errors/bad-request");
const { checkPermissions } = require("../utils/checkPermissions");
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
    throw new BadRequestError("Authentication invalid");
  }

  // check permissions
  checkPermissions(req.user, id);
  // proceed to get single user
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id :${id}`);
  }
  // respond with user data
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  //1) check name and email are provided
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Please provide name and email");
  }
  //2) find user with the id from req.user
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    { new: true, runValidators: true }
  ).select("-password");
  if (!updatedUser) {
    throw new NotFoundError(`No user with id :${req.user.userId}`);
  }

  //4 make new token in cookies
  const tokenUser = createTokenUser(updatedUser);
  attachCookiesToResponse({ res, payload: tokenUser });
  //5) respond with updated user
  res.status(StatusCodes.OK).json({ user: updatedUser });
};

const updateUserPassword = async (req, res) => {
  // extract userId from req.user
  const { userId, name, role } = req.user;

  // extract oldPassword and newPassword from request body
  const { oldPassword, newPassword } = req.body;

  // validate input
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide old and new password");
  }

  // find user in database
  const currentUser = await User.findOne({ _id: userId });
  if (!currentUser) {
    throw new NotFoundError(`No user with id :${userId}`);
  }
  // compare old password
  const isPasswordCorrect = await currentUser.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid Credentials");
  }

  // update to new password
  currentUser.password = newPassword;
  await currentUser.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
