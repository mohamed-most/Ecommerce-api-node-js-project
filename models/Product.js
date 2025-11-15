const Mongoose = require("mongoose");

const productSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [100, "Product name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [
        1000,
        "Product description can not be more than 1000 characters",
      ],
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: {
        values: ["ikea", "liddy", "marcos", "caressa", "office", "bedroom"],
        message: "{VALUE} is not supported",
      },
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    company: {
      type: String,
      required: [true, "Please provide product company"],
    },
    colors: {
      type: [String],
      default: ["#000000"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: Mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
  // , toJSON: { virtuals: true }, toObject: { virtuals: true }
);
// productSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

//also remove all reviews depend on this product
productSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
  next();
});

module.exports = Mongoose.model("Product", productSchema);
