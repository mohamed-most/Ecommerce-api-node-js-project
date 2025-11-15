const Product = require("../models/Product");
const BadRequestError = require("../errors/bad-request");
const NotFoundError = require("../errors/not-found");
const { StatusCodes } = require("http-status-codes");

const createProduct = async (req, res) => {
  //1) admin only can create product - handled in route middleware
  //2) get userId from req.user and attach to req.body
  req.body.user = req.user.userId;
  //3) create product
  const product = await Product.create(req.body);
  if (!product) {
    throw new BadRequestError("Product creation failed");
  }
  res.status(StatusCodes.CREATED).json({ product });
};

getAllProducts = async (req, res) => {
  //1) get all products
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};

getSingleProduct = async (req, res) => {
  //1) extract product id from req.params
  const { id: productId } = req.params;
  //2) find product by id
  const product = await Product.findById({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id :${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

updateProduct = async (req, res) => {
  //admin only - handled in route middleware
  //1) extract product id from req.params
  const { id: productId } = req.params;
  //2) find and update product
  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new NotFoundError(`No product with id :${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  // This triggers productSchema.pre("remove") !!
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully" });
};

uploadImage = async (req, res) => {
  //1) check if file is provided
  if (!req.files) {
    throw new BadRequestError("No file uploaded");
  }
  const productImage = req.files.image;
  console.log(productImage);
  //2) check if file is an image
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please upload image file");
  }

  //3) upload file to public/uploads folder
  const imagePath = `/uploads/${productImage.name}`;
  await productImage.mv(`./public${imagePath}`);

  res.status(StatusCodes.OK).json({ image: imagePath });
};
module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
