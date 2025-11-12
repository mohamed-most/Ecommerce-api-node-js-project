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
        values: ["ikea", "liddy", "marcos", "caressa", "office"],
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
    user: {
      type: Mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("Product", productSchema);
