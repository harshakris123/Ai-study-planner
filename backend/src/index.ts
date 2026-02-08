import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import topicRoutes from './routes/topic.routes';
import preferencesRoutes from './routes/preferences.routes'; // ADD
import sessionRoutes from './routes/session.routes'; // ADD

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/preferences', preferencesRoutes); // ADD
app.use('/api/sessions', sessionRoutes); // ADD

// Basic test route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'AI Study Planner API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      subjects: '/api/subjects',
      topics: '/api/topics',
      preferences: '/api/preferences', // ADD
      sessions: '/api/sessions', // ADD
    }
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});