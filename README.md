# Hashnode Clone

A full-stack blogging platform built using the MERN Stack (MongoDB, Express.js, React.js and Node.js).

## Project Overview

Hashnode Clone is a blogging application where users can register, log in, create articles, edit their posts, manage drafts and publish articles. Users can also explore published articles and filter them using tags.

## Technologies Used

### Frontend
- React.js
- Vite
- CSS
- Axios
- React Router DOM
- React Markdown
- React Syntax Highlighter

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Main Features

- User Registration and Login
- Secure Password Hashing
- JWT Authentication
- Protected Routes
- Create and Publish Articles
- Save Articles as Drafts
- Edit and Delete Articles
- Markdown Editor and Preview
- Code Syntax Highlighting
- Article Tags and Filtering
- User Profile
- Personal Dashboard

## Project Structure

```text
Hashnode-Clone/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       └── App.jsx
│
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown by Vite in your browser.

## Database

MongoDB is used to store user accounts, articles and tags.

## Authentication

JWT is used for user authentication and protected API routes. Passwords are hashed using bcryptjs.

## Future Enhancements

- Social interactions such as likes and comments
- Follow and unfollow authors
- Article bookmarking
- Rich profile customization
- Cloud-based image uploads

## Developer

Developed as a MERN Stack Full-Stack Web Development Project.