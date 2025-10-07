// server/index.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/auth';
import authRoutes from './routes/auth'; // Supabase auth routes
import employeeRoutes from './routes/employees'; // Supabase employee routes

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// CORS configuration
// If frontend is on localhost:3000
app.use(
  cors({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true, // allow cookies/auth headers
  })
);

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
