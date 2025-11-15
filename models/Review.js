const e = require("express");
const { required } = require("joi");
const Mongoose = require("mongoose");

//create scheme for reviews

const reviewsScheme = Mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please provide review title"],
    },
    comment: {
      type: String,
      required: [true, "Please provide a comment "],
    },
    user: {
      ref: "User",
      type: Mongoose.Types.ObjectId,
      required: true,
    },
    product: {
      ref: "Product",
      type: Mongoose.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

reviewsScheme.index({ product: 1, user: 1 }, { unique: true });

reviewsScheme.statics.calculateAverage = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }

  console.log(result);
  return result;
};

reviewsScheme.post("save", async function () {
  await this.constructor.calculateAverage(this.product);
  console.log(" post save");
});

reviewsScheme.post("remove", async function () {
  await this.constructor.calculateAverage(this.product);
  console.log(" post remove");
});
module.exports = Mongoose.model("Review", reviewsScheme);
