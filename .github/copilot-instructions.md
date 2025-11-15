# E-Commerce API - Copilot Instructions

## Architecture Overview

This is a Node.js/Express REST API for e-commerce with MongoDB. The project follows an **MVC-inspired layer pattern** with clear separation:
- **Routes** (`/routes`) - Define endpoints and middleware chains
- **Controllers** (`/controllers`) - Handle business logic and HTTP responses
- **Models** (`/models`) - Mongoose schemas with validation and hooks
- **Middleware** (`/middleware`) - Authentication, error handling, authorization
- **Utils** (`/utils`) - Shared JWT and utility functions
- **Errors** (`/errors`) - Custom error classes extending from base `CustomAPIError`

### Key Design Pattern: Error-Centric Architecture

The app uses **throw-based error handling** via `express-async-errors`:
- Controllers throw custom error classes (e.g., `BadRequestError`, `UnauthenticatedError`)
- Global error handler (`middleware/error-handler.js`) catches all errors and formats responses
- Never use `res.status().json()` for errors—always throw

## Critical Workflows

### Starting the Development Server
```bash
npm start
```
Runs `nodemon app.js` for hot-reload. Server listens on `PORT` (default 3000).

### Environment Setup
Required `.env` variables (read by `require('dotenv').config()` in `app.js`):
```
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<random_string>
JWT_LIFETIME=1d
PORT=3000
NODE_ENV=development
```

### Authentication Flow
1. User calls `/api/v1/auth/register` or `/api/v1/auth/login`
2. Controller validates credentials, calls `attachCookiesToResponse()` to set signed JWT cookie
3. Subsequent requests use `authenticateUser` middleware to verify signed cookie
4. Middleware extracts token from `req.signedCookies.token` and attaches user to `req.user`

## Project-Specific Conventions

### Request/Response Patterns
- **All responses** include a `msg` field for errors, wrapped data for success:
  - Error: `{ msg: "Error description" }`
  - Success: `{ product: {...}, products: [...], user: {...} }`
- **Status codes** imported from `http-status-codes` package (e.g., `StatusCodes.OK`, `StatusCodes.CREATED`)
- **Extract from req.params** using destructuring: `const { id: productId } = req.params`

### Model Patterns
- **Validation** happens in schema (e.g., `validator.isEmail`, `validator.isStrongPassword`)
- **Pre-save hooks** for derived data (e.g., password hashing in User model with bcrypt)
- **Instance methods** for computed behavior (e.g., `comparePassword()` on User)
- **Compound unique indexes** for constraints like "one review per product per user": `reviewsScheme.index({ product: 1, user: 1 }, { unique: true })`

### Authorization Pattern
- Routes use **middleware chaining**: `router.delete('/id', authenticateUser, authorizePermissions('admin'), deleteProduct)`
- `authorizePermissions` accepts rest parameters for roles: `authorizePermissions('admin')` or `authorizePermissions('admin', 'user')`
- Role defaults to 'user' in User model; admin role is explicitly set during registration or by admin update

### File Upload Pattern
- Use `express-fileupload` with `useTempFiles: true` and `/tmp/` temp directory (see `app.js`)
- Controller checks `req.files.image` existence and mimetype, then moves to `./public/uploads/`
- Return image path as `/uploads/filename`

## Cross-Component Communication

### User → Product → Review Relations
- `Product` references `User` via `user` field (creator)
- `Review` references both `Product` and `User` (author)
- One-review-per-user-per-product constraint ensures no duplicate reviews
- Populate related data in queries: `Product.findById(id).populate('user')` if needed

### Authentication Token Structure
Token payload includes only minimal user data:
```javascript
{ userId, name, role }
```
This is created by `createTokenUser()` utility from the full User model.

## Common Pitfalls & Solutions

1. **Forgetting to throw errors**: Don't use `if (error) return res.status(400).json()`. Always throw custom errors.
2. **Password hashing**: Handled automatically in User pre-save hook—never manually hash; ensure strong password validation in schema.
3. **JWT verification failures**: If token fails verification, catch in `authenticateUser` and re-throw as `UnauthenticatedError`.
4. **Admin-only routes**: Always wrap with `authenticateUser` first, then `authorizePermissions('admin')`.
5. **Mongoose validation errors**: Error handler transforms `ValidationError` name into user-friendly messages from `err.errors` object.

## Important Files & Exemplars

- `app.js` - Entry point, middleware setup, route registration
- `middleware/error-handler.js` - Centralized error transformation; handles Mongoose `ValidationError`, `CastError`, duplicate key errors
- `models/User.js` - Exemplar: password hashing pre-hook, instance method, email/password validation
- `models/Review.js` - Exemplar: compound unique index, references to other models
- `controllers/authController.js` - Exemplar: token attachment, basic auth flow
- `controllers/productController.js` - Exemplar: CRUD patterns, file upload handling
- `utils/jwt.js` - Token creation/verification; cookie attachment with httpOnly, secure, signed flags
