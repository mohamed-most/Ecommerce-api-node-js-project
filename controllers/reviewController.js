const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request");
const NotFoundError = require("../errors/not-found");
const { checkPermissions } = require("../utils/checkPermissions");
const notFound = require("../middleware/not-found");
const createReview = async (req, res) => {
  console.log(req.body);
  // attach user id to review
  req.body.user = req.user.userId;

  const { product } = req.body;
  // check product exists
  const isValidProduct = await Product.findById(product);
  if (!isValidProduct) {
    throw new NotFoundError("No product with that id");
  }

  // check only one review per user
  const isAlreadySubmitted = await Review.findOne({
    product: product,
    user: req.user.userId,
  });

  if (isAlreadySubmitted) {
    throw new BadRequestError("one user only make one review per product");
  }

  // create review
  const review = await Review.create(req.body);

  // remove sensitive fields manually
  const reviewResponse = review.toObject();
  delete reviewResponse.user;
  delete reviewResponse.product;

  res.status(StatusCodes.CREATED).json(reviewResponse);
};
const getAllReviews = async (req, res) => {
  const allReviews = await Review.find({})
    .populate({
      path: "product",
      select: "name price company",
    })
    .populate({
      path: "user",
      select: "name ",
    });
  if (!allReviews) {
    throw new NotFoundError("No Reviews Found");
  }
  res
    .status(StatusCodes.OK)
    .json({ reviews: allReviews, count: allReviews.length });
};

const getSingleReview = async (req, res) => {
  const requestedReview = await Review.findOne({ _id: req.params.id });
  if (!requestedReview) {
    throw new NotFoundError("No review with this id ");
  }
  res.status(StatusCodes.OK).json({ review: requestedReview });
};
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  console.log(reviewId);
  // find review
  const review = await Review.findById(reviewId);
  console.log(review);
  if (!review) {
    throw new NotFoundError("This review not found");
  }

  // check authorization
  checkPermissions(req.user, review.user);

  // delete review
  await review.deleteOne();

  res.status(StatusCodes.OK).json({
    msg: "Resource deleted successfully",
  });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError("This review not found");
  }

  checkPermissions(req.user, review.user.toString());

  const { rating, title, comment } = req.body;

  // Only update fields that exist in req.body
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({
    review,
  });
};

const getProductReview = async (req, res) => {
  const { id } = req.params;

  const reviewsOfProduct = await Review.find({ product: id });
  res.status(StatusCodes.OK).json(reviewsOfProduct);
};

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getSingleReview,
  getProductReview,
};
