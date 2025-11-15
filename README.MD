# E-Commerce API

**Hosted URL:** [E-Commerce API on Render](https://node-course-e-commerce.onrender.com/)

---

## Project Overview

This is a **full-featured E-Commerce REST API** built with **Node.js, Express, and MongoDB**.  
It provides secure user authentication, role-based authorization, and full CRUD functionality for products, reviews, and orders. The project follows best practices for scalable and maintainable backend development.

---

## Features

### User Management

- User registration, login, and logout with JWT authentication
- Password hashing with bcrypt
- Role-based access control for admins and users
- Update user profile and password
- Middleware for authentication and permission checks

### Product Management

- CRUD operations for products
- Public endpoints for product listing and details
- Admin-only endpoints for creation, update, and deletion
- Product metadata: categories, colors, featured products, shipping options
- Image upload support

### Review System

- Users can create, update, and delete reviews linked to products
- Public endpoints to fetch all reviews or reviews per product
- Middleware ensures users can only modify their own reviews

### Order Management

- Users can create orders, with subtotal, tax, and shipping fee calculations
- Admin-only endpoints to fetch all orders and single order details
- Users can view their own orders securely
- Payment tracking and order status management

### Database

- MongoDB with Mongoose schemas for Users, Products, Reviews, and Orders
- Schema design includes timestamps, virtuals, and aggregation pipelines for analytics

### Security & Best Practices

- Input validation and sanitization using `validator` and `express-mongo-sanitize`
- Security middleware: `helmet`, `xss-clean`, `cors`, `express-rate-limit`
- Centralized error handling and 404 middleware
- Logging with Morgan
- Async error handling using `express-async-errors`

### Utilities

- JWT helpers for token generation and cookie attachment
- Organized controllers, routes, and middleware for maintainable code
- API documentation Postman export

---
