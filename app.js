require("dotenv").config();
require("express-async-errors");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const express = require("express");

// logging library
const morgan = require("morgan");

const mongoose = require("mongoose");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// mongoose strict query setting
mongoose.set("strictQuery", false);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" } // 'a' means append
);

// database connection
const connectDB = require("./db/connect");

const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
// express app
const app = express();

// middleware
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
// routes
app.get("/", (req, res) => {
  res.send("ecommerce api");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
//errors handling middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB");
    app.listen(PORT, console.log(`Server is listening on port ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
