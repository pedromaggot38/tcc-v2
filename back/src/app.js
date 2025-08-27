import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import cors from 'cors';

import globalErrorHandler from './controllers/admin/errorController.js';
import publicArticleRouter from './routes/public/articleRoutes.js';
import publicDoctorRouter from './routes/public/doctorRoutes.js';
import articleRouter from './routes/admin/articleRoutes.js';
import doctorRouter from './routes/admin/doctorRoutes.js';
import authRoutes from './routes/admin/authRoutes.js';
import userRouter from './routes/admin/userRoutes.js';
import AppError from './utils/appError.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  }),
);

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip. Please try again in an hour',
});
app.use('/api/v0/admin', limiter);

app.use(cookieParser());

app.use(express.json({ limit: '10kb' }));

app.use(express.static(`${__dirname}/public`));

app.use('/api/v0/admin/auth', authRoutes);
app.use('/api/v0/admin/users', userRouter);
app.use('/api/v0/admin/doctors', doctorRouter);
app.use('/api/v0/admin/articles', articleRouter);

app.use('/api/v0/public/articles', publicArticleRouter);
app.use('/api/v0/public/doctors', publicDoctorRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Não é possível encontrar ${req.originalUrl} neste servidor`,
      404,
    ),
  );
});

app.use(globalErrorHandler);

export default app;
