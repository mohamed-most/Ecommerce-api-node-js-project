const createUserToken = (user) => {
  return {
    userId: user._id,
    name: user.name,
    role: user.role,
  };
};
module.exports = createUserToken;
