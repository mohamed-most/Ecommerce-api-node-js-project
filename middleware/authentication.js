const {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../errors/index");
const { isTokenValid } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  // extract token from signed cookies
  const token = req.signedCookies.token;
  // check if token exists
  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  console.log(token + " i am at auth middleware");
  try {
    // verify token
    const payload = isTokenValid(token);
    // attach the user info to the request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
    };
    console.log(req.user + " i am at auth middleware after attaching");
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

const authorizePermissions = (...rest) => {
  return (req, res, next) => {
    if (!rest.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    console.log("i am at authorize permissions middleware");
    next();
  };
};

// const authorizePermissions = async (req, res, next) => {};
module.exports = { authenticateUser, authorizePermissions };
