import express from 'express';
import connectDB from './db.js';
import notesRouter from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Standard middleware
app.use(express.json());

// Simple request logging middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---
app.use('/api/notes', notesRouter);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
