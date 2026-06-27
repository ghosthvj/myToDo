import express from 'express';
import cors from 'cors';
import { listsRouter } from './routes/lists';
import { tasksRouter } from './routes/tasks';
import { statsRouter } from './routes/stats';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.use('/api/lists', listsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/stats', statsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
