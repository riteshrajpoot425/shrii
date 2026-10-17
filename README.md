# Shri Automobile - Full Stack Website

## Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- HTML/CSS/JavaScript

## Features

### Customer
- Responsive website
- Service listing
- Online booking
- Contact form
- WhatsApp button

### Admin
- Secure login
- Booking statistics
- View bookings
- Confirm/reject/complete booking
- Delete booking
- View and delete contact messages

## Setup

1. Install Node.js.
2. Open this folder in VS Code.
3. Copy `.env.example` to `.env`.
4. Put your MongoDB Atlas connection string in `.env`.
5. Set a strong `JWT_SECRET`.
6. Set admin email/password.

Install dependencies:

```bash
npm install
```

Create the admin account:

```bash
npm run seed
```

Start:

```bash
npm start
```

Open:

http://localhost:5000

Admin:

http://localhost:5000/admin

## Development

```bash
npm run dev
```

## MongoDB Atlas

Create a MongoDB Atlas cluster and use a database named:

`shri_automobile`

Example connection:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/shri_automobile?retryWrites=true&w=majority
```

Never commit `.env` to GitHub.

## Before production

Replace the placeholder phone number, WhatsApp number, address and email in `public/index.html`.

Use a strong admin password and JWT secret.

Deploy the Node.js application to a Node-compatible hosting provider and add the same environment variables in the hosting dashboard.
