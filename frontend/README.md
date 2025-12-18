# Blog Frontend

A modern React + TypeScript + TailwindCSS frontend for the Blog application.

## Features

- 🔐 Authentication (Login/Register)
- 📝 View, Create, Edit, and Delete Posts (based on user role)
- 💬 Comments (Viewers only)
- 👍 Voting/Likes (Viewers only)
- 🔍 Search posts
- 📱 Responsive design with TailwindCSS

## User Roles

- **Admin**: Can create, edit, and delete any post
- **Blog Writer**: Can create and edit their own posts
- **Viewer**: Can comment and vote on posts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port).

## Backend Connection

The frontend is configured to connect to the backend API at `http://localhost:5000`. Make sure your backend is running on port 5000.

To change the API URL, update the `API_BASE_URL` in `src/services/api.ts`.

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.
