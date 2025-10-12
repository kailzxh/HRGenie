# Migration Guide: From Next.js to a React SPA + Express API

This guide provides a comprehensive, step-by-step process to convert a Next.js application into a standard client-side React Single-Page Application (SPA) using Vite, while preserving the existing backend logic by extracting it into a standalone Node.js and Express.js server.

## Phase 1: Frontend Conversion

### 1. Project Setup

First, create a new React project using Vite.

```bash
npm create vite@latest onboarding-react -- --template react-ts
cd onboarding-react
npm install
```

### 2. Component Migration

Copy the existing React components from the Next.js `/components` directory into the new React project's `/src/components` folder. You may need to adjust imports, especially for Next.js specific features.

### 3. Routing Conversion (from Next.js Pages Router to React Router)

Install `react-router-dom`:

```bash
npm install react-router-dom
```

**Before (Next.js):** File-based routing in `pages/posts/[id].js`.

```javascript
// pages/posts/[id].js
import { useRouter } from 'next/router';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;

  return <p>Post: {id}</p>;
};

export default Post;
```

**After (React Router):** Set up routes in `src/App.tsx`.

```typescriptreact
// src/App.tsx
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<Post />} />
      </Routes>
    </BrowserRouter>
  );
}

// src/pages/Post.tsx
import { useParams } from 'react-router-dom';

const Post = () => {
  const { id } = useParams();
  return <p>Post: {id}</p>;
};

export default App;
```

### 4. Links

Replace Next.js's `<Link>` with React Router's `<Link>`.

**Before (Next.js):**

```javascript
import Link from 'next/link';

<Link href="/about">
  <a>About</a>
</Link>
```

**After (React Router):**

```typescriptreact
import { Link } from 'react-router-dom';

<Link to="/about">About</Link>
```

### 5. Data Fetching Refactoring

**Before (Next.js `getServerSideProps`):**

```javascript
// pages/posts.js
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return { props: { posts } };
}

function Posts({ posts }) {
  // render posts
}
```

**After (React `useEffect`):**

```typescriptreact
// src/pages/Posts.tsx
import { useState, useEffect } from 'react';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching posts.</p>;

  // render posts
}
```

### 6. Replacing Next.js Specific Components & Hooks

*   **`next/head`**: Replace with `react-helmet-async`.
    *   `npm install react-helmet-async`
    *   Wrap your app in `<HelmetProvider>`.
    *   Use `<Helmet>` to manage head tags.
*   **`next/image`**: Replace with the standard `<img>` tag. You will lose automatic image optimization.
*   **`next/router`**: Replace `useRouter` with hooks from `react-router-dom`:
    *   `useNavigate` for programmatic navigation.
    *   `useParams` to access URL parameters.
    *   `useLocation` to access the location object.

## Phase 2: Backend Extraction and Isolation

### 1. Set Up a New Express Server

Create a new directory for the backend (e.g., `/server`) and initialize a `package.json`.

```bash
mkdir server
cd server
npm init -y
npm install express cors
```

### 2. Migrate API Route Logic

**Before (Next.js API Route):**

```javascript
// pages/api/posts/[id].js
export default function handler(req, res) {
  const { id } = req.query;
  res.status(200).json({ id, title: `Post ${id}` });
}
```

**After (Express Route Handler):**

Create a `server.js` file in the `/server` directory.

```javascript
// server/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({ id, title: `Post ${id}` });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```

### 3. Update Frontend API Calls

Update `fetch` calls in your React components to point to the new Express server.

**Before:**

```javascript
fetch('/api/posts/123');
```

**After:**

```javascript
fetch('http://localhost:3001/api/posts/123');
```

It is recommended to use environment variables for the API base URL.

### 4. Environment Variables

Rename `.env.local` variables from the `NEXT_PUBLIC_` prefix to the `VITE_` prefix for use in the new React frontend.

**Before (Next.js `.env.local`):**

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**After (Vite `.env`):**

```
VITE_API_URL=http://localhost:3001/api
```

Access it in your code with `import.meta.env.VITE_API_URL`.
